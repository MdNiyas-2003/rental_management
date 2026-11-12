
const prisma = require("../config/prisma");
const { randomUUID } = require("crypto");

const EXTRA_KM_RATE = 10;
const INCLUDED_KM_PER_DAY = 100;

const number = (value) => Number(value ?? 0);

const invoiceNumber = () =>
    `INV-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;

const paymentStatus = (paid, total) => {
    if (paid >= total) return "Paid";
    if (paid > 0) return "Partially Paid";
    return "Unpaid";
};

const customerVehicleInclude = {
    customer: {
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    },
    vehicle: true,
};

// GET /api/rentals/pickup-bookings
const getPickupBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                status: "Confirmed",
                rental: { is: null },
            },
            include: customerVehicleInclude,
            orderBy: { pickupDate: "asc" },
        });

        return res.json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        console.error("getPickupBookings:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load confirmed bookings.",
        });
    }
};

// POST /api/rentals/:bookingId/pickup
const submitPickup = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const {
            pickupOdometer,
            pickupFuelLevel,
            pickupCondition,
            pickupNotes,
        } = req.body;

        const odometer = Number(pickupOdometer);

        if (!Number.isInteger(odometer) || odometer < 0) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid pickup odometer.",
            });
        }

        if (
            pickupFuelLevel === undefined ||
            pickupFuelLevel === null ||
            String(pickupFuelLevel).trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Select the pickup fuel level.",
            });
        }

        const rental = await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findFirst({
                where: {
                    OR: [
                        { id: bookingId },
                        { bookingId },
                    ],
                },
                include: {
                    ...customerVehicleInclude,
                    rental: true,
                },
            });

            if (!booking) throw new Error("BOOKING_NOT_FOUND");

            if (booking.status !== "Confirmed") {
                throw new Error("BOOKING_NOT_CONFIRMED");
            }

            if (booking.rental) {
                throw new Error("RENTAL_ALREADY_EXISTS");
            }

            const vehicleClaim = await tx.vehicle.updateMany({
                where: {
                    id: booking.vehicleId,
                    status: "Available",
                },
                data: {
                    status: "Rented",
                },
            });

            if (vehicleClaim.count !== 1) {
                throw new Error("VEHICLE_NOT_AVAILABLE");
            }

            const bookingClaim = await tx.booking.updateMany({
                where: {
                    id: booking.id,
                    status: "Confirmed",
                },
                data: {
                    status: "Active",
                },
            });

            if (bookingClaim.count !== 1) {
                throw new Error("BOOKING_ALREADY_PROCESSED");
            }

            return tx.rental.create({
                data: {
                    rentalId: `RNT-${Date.now()}-${randomUUID().slice(0, 5)}`,
                    bookingId: booking.id,
                    pickupOdometer: odometer,
                    pickupFuelLevel: String(pickupFuelLevel),
                    pickupCondition: pickupCondition || null,
                    pickupNotes: pickupNotes || null,
                    status: "Active",
                },
                include: {
                    booking: {
                        include: customerVehicleInclude,
                    },
                },
            });
        });

        return res.status(201).json({
            success: true,
            message: "Vehicle pickup submitted successfully.",
            data: rental,
        });
    } catch (error) {
        console.error("submitPickup:", error);

        const errors = {
            BOOKING_NOT_FOUND: [404, "Booking not found."],
            BOOKING_NOT_CONFIRMED: [400, "Only confirmed bookings can be picked up."],
            RENTAL_ALREADY_EXISTS: [409, "Rental already exists for this booking."],
            VEHICLE_NOT_AVAILABLE: [409, "Vehicle is no longer available."],
            BOOKING_ALREADY_PROCESSED: [409, "Booking has already been processed."],
        };

        const known = errors[error.message];

        return res.status(known?.[0] || 500).json({
            success: false,
            message: known?.[1] || "Unable to submit vehicle pickup.",
        });
    }
};

// GET /api/rentals/active
const getActiveRentals = async (req, res) => {
    try {
        const rentals = await prisma.rental.findMany({
            where: { status: "Active" },
            include: {
                booking: {
                    include: customerVehicleInclude,
                },
            },
            orderBy: { actualPickupDate: "desc" },
        });

        return res.json({
            success: true,
            data: rentals,
        });
    } catch (error) {
        console.error("getActiveRentals:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load active rentals.",
        });
    }
};

// POST /api/rentals/:rentalId/return
const submitReturn = async (req, res) => {
    try {
        const { rentalId } = req.params;

        const {
            returnOdometer,
            returnFuelLevel,
            returnCondition,
            returnNotes,
            lateCharges = 0,
            damageCharges = 0,
            fuelCharges = 0,
            discount = 0,
            tax = 0,
            paymentAmount = 0,
            paymentMethod = "Cash",
            paymentReference = null,
        } = req.body;

        const returnKm = Number(returnOdometer);
        const payment = Number(paymentAmount);

        const chargeValues = {
            lateCharges: Number(lateCharges),
            damageCharges: Number(damageCharges),
            fuelCharges: Number(fuelCharges),
            discount: Number(discount),
            tax: Number(tax),
        };

        if (
            !Number.isInteger(returnKm) ||
            returnKm < 0 ||
            Object.values(chargeValues).some(
                (value) => !Number.isFinite(value) || value < 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter valid return readings and charges.",
            });
        }

        if (
            returnFuelLevel === undefined ||
            returnFuelLevel === null ||
            String(returnFuelLevel).trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Select the return fuel level.",
            });
        }

        if (!Number.isFinite(payment) || payment < 0) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid payment amount.",
            });
        }

        const allowedMethods = ["Cash", "UPI", "Card"];

        if (
            payment > 0 &&
            !allowedMethods.includes(paymentMethod)
        ) {
            return res.status(400).json({
                success: false,
                message: "Select a valid payment method.",
            });
        }

        if (
            payment > 0 &&
            ["UPI", "Card"].includes(paymentMethod) &&
            !String(paymentReference || "").trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter the payment reference.",
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            const rental = await tx.rental.findUnique({
                where: { id: rentalId },
                include: {
                    booking: {
                        include: {
                            vehicle: true,
                        },
                    },
                    invoice: true,
                },
            });

            if (!rental) throw new Error("RENTAL_NOT_FOUND");

            if (rental.status !== "Active") {
                throw new Error("RENTAL_NOT_ACTIVE");
            }

            if (rental.invoice) {
                throw new Error("INVOICE_ALREADY_EXISTS");
            }

            if (returnKm < rental.pickupOdometer) {
                throw new Error("INVALID_ODOMETER");
            }

            const distance = returnKm - rental.pickupOdometer;

            const includedKm =
                Math.max(1, rental.booking.totalDays) *
                INCLUDED_KM_PER_DAY;

            const extraKm = Math.max(0, distance - includedKm);
            const extraKmCharge = extraKm * EXTRA_KM_RATE;

            const rentalAmount = number(rental.booking.totalAmount);

            const subtotal =
                rentalAmount +
                extraKmCharge +
                chargeValues.lateCharges +
                chargeValues.damageCharges +
                chargeValues.fuelCharges;

            if (chargeValues.discount > subtotal) {
                throw new Error("DISCOUNT_TOO_HIGH");
            }

            const finalAmount =
                subtotal - chargeValues.discount + chargeValues.tax;

            // Previously collected booking advance
            const advance = number(rental.booking.advanceAmount);

            // Remaining balance after advance
            const remainingBeforePayment = Math.max(
                0,
                finalAmount - advance
            );

            // Do not accept payment above the remaining balance
            if (payment > remainingBeforePayment) {
                throw new Error("PAYMENT_EXCEEDS_BALANCE");
            }

            // Advance + payment collected during return
            const paidAmount = Math.min(
                finalAmount,
                advance + payment
            );

            const balanceAmount = Math.max(
                0,
                finalAmount - paidAmount
            );

            const invoiceStatus = paymentStatus(
                paidAmount,
                finalAmount
            );

            // Complete rental
            const claimed = await tx.rental.updateMany({
                where: {
                    id: rental.id,
                    status: "Active",
                },
                data: {
                    actualReturnDate: new Date(),
                    returnOdometer: returnKm,
                    returnFuelLevel: String(returnFuelLevel),
                    returnCondition: returnCondition || null,
                    returnNotes: returnNotes || null,
                    totalDistance: distance,
                    extraKm,
                    extraKmCharge,
                    lateCharges: chargeValues.lateCharges,
                    damageCharges: chargeValues.damageCharges,
                    fuelCharges: chargeValues.fuelCharges,
                    discount: chargeValues.discount,
                    tax: chargeValues.tax,
                    finalAmount,
                    status: "Completed",
                },
            });

            if (claimed.count !== 1) {
                throw new Error("RENTAL_ALREADY_RETURNED");
            }

            // Generate final invoice
            const invoice = await tx.invoice.create({
                data: {
                    invoiceNumber: invoiceNumber(),
                    rentalId: rental.id,
                    subtotal,
                    totalAmount: finalAmount,
                    paidAmount,
                    balanceAmount,
                    status: invoiceStatus,
                },
            });

            // Save return payment transaction
            if (payment > 0) {
                await tx.payment.create({
                    data: {
                        invoiceId: invoice.id,
                        amount: payment,
                        method: paymentMethod,
                        reference: paymentReference?.trim() || null,
                    },
                });
            }

            // Complete booking
            await tx.booking.update({
                where: { id: rental.bookingId },
                data: { status: "Completed" },
            });

            // Check whether the vehicle must remain in maintenance
            const maintenance = await tx.maintenance.findFirst({
                where: {
                    vehicleId: rental.booking.vehicleId,
                    OR: [
                        { status: "In Progress" },
                        {
                            status: "Scheduled",
                            serviceDate: { lte: new Date() },
                        },
                    ],
                },
            });

            // Update vehicle status
            await tx.vehicle.update({
                where: { id: rental.booking.vehicleId },
                data: {
                    status: maintenance ? "Maintenance" : "Available",
                },
            });

            return {
                rental: {
                    id: rental.id,
                    rentalId: rental.rentalId,
                    distance,
                    includedKm,
                    extraKm,
                    extraKmCharge,
                    finalAmount,
                },
                invoice: {
                    ...invoice,
                    paidAmount,
                    balanceAmount,
                    status: invoiceStatus,
                },
                payment: payment > 0
                    ? {
                        amount: payment,
                        method: paymentMethod,
                        reference: paymentReference?.trim() || null,
                    }
                    : null,
            };
        });

        return res.json({
            success: true,
            message: "Vehicle returned and invoice generated successfully.",
            data: result,
        });
    } catch (error) {
        console.error("submitReturn:", error);

        const errors = {
            RENTAL_NOT_FOUND: [404, "Rental not found."],
            RENTAL_NOT_ACTIVE: [400, "Rental is not active."],
            INVOICE_ALREADY_EXISTS: [409, "Invoice already exists."],
            INVALID_ODOMETER: [400, "Return odometer cannot be below pickup odometer."],
            DISCOUNT_TOO_HIGH: [400, "Discount cannot exceed the subtotal."],
            PAYMENT_EXCEEDS_BALANCE: [400, "Payment amount cannot exceed the remaining balance."],
            RENTAL_ALREADY_RETURNED: [409, "Rental has already been returned."],
        };

        const known = errors[error.message];

        return res.status(known?.[0] || 500).json({
            success: false,
            message: known?.[1] || "Unable to submit vehicle return.",
        });
    }
};

module.exports = {
    getPickupBookings,
    submitPickup,
    getActiveRentals,
    submitReturn,
};
