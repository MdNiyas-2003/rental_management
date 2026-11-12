


const prisma = require("../config/prisma");

const ACTIVE_BOOKING_STATUSES = [
    "Pending",
    "Confirmed",
    "Active",
];

const calculateDays = (pickupDate, returnDate) => {
    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    return Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
};

const generateBookingId = () => {
    return `BK - ${Date.now()}`;
};

// GET ALL BOOKINGS
const getAllBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
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
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        console.error("Get bookings error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
        });
    }
};

// GET BOOKING BY ID
const getBookingById = async (req, res) => {
    try {
        const booking = await prisma.booking.findUnique({
            where: {
                id: req.params.id,
            },
            include: {
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
            },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        console.error("Get booking error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch booking",
        });
    }
};

// CHECK VEHICLE AVAILABILITY
const checkVehicleAvailability = async (
    vehicleId,
    pickupDate,
    returnDate,
    excludeBookingId = null
) => {
    const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
    });

    if (!vehicle) {
        return {
            available: false,
            message: "Vehicle not found",
        };
    }

    if (vehicle.status !== "Available") {
        return {
            available: false,
            message: "Vehicle is not available",
        };
    }

    const conflictingBooking = await prisma.booking.findFirst({
        where: {
            vehicleId,
            status: {
                in: ACTIVE_BOOKING_STATUSES,
            },
            pickupDate: {
                lt: new Date(returnDate),
            },
            returnDate: {
                gt: new Date(pickupDate),
            },
            ...(excludeBookingId
                ? { id: { not: excludeBookingId } }
                : {}),
        },
    });

    if (conflictingBooking) {
        return {
            available: false,
            message: "Vehicle already has a booking during these dates",
        };
    }

    // Maintenance date conflict
    const maintenanceConflict = await prisma.maintenance.findFirst({
        where: {
            vehicleId,
            OR: [
                {
                    status: "In Progress",
                },
                {
                    status: "Scheduled",
                    serviceDate: {
                        gte: new Date(pickupDate),
                        lt: new Date(returnDate),
                    },
                },
            ],
        },
    });

    if (maintenanceConflict) {
        return {
            available: false,
            message: "Vehicle has a maintenance conflict",
        };
    }

    return {
        available: true,
        message: "Vehicle is available",
    };
};

// CREATE BOOKING
const createBooking = async (req, res) => {
    try {
        const {
            customerId,
            vehicleId,
            pickupDate,
            returnDate,
            pickupLocation,
            dropoffLocation,
            advanceAmount = 0,
            bookingSource = "ADMIN",
            createdBy,
            notes,
        } = req.body;

        if (
            !customerId ||
            !vehicleId ||
            !pickupDate ||
            !returnDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Customer, vehicle, pickup date and return date are required",
            });
        }

        const start = new Date(pickupDate);
        const end = new Date(returnDate);
        const days = calculateDays(start, end);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            days <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Return date must be after pickup date",
            });
        }

        const advance = Number(advanceAmount);

        if (!Number.isFinite(advance) || advance < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid advance amount",
            });
        }

        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        const availability = await checkVehicleAvailability(
            vehicleId,
            start,
            end
        );

        if (!availability.available) {
            return res.status(409).json({
                success: false,
                message: availability.message,
            });
        }

        const dailyRate = Number(vehicle.price);
        const totalAmount = dailyRate * days;

        if (advance > totalAmount) {
            return res.status(400).json({
                success: false,
                message: "Advance amount cannot exceed total amount",
            });
        }

        const booking = await prisma.booking.create({
            data: {
                bookingId: generateBookingId(),
                customerId,
                vehicleId,
                pickupDate: start,
                returnDate: end,
                pickupLocation,
                dropoffLocation,
                totalDays: days,
                dailyRate,
                totalAmount,
                advanceAmount: advance,
                bookingSource,
                createdBy: createdBy || null,
                notes,
                status: "Pending",
            },
            include: {
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
            },
        });

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking,
        });
    } catch (error) {
        console.error("Create booking error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create booking",
        });
    }
};

// UPDATE BOOKING
const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const existingBooking = await prisma.booking.findUnique({
            where: { id },
        });

        if (!existingBooking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        const {
            customerId,
            vehicleId,
            pickupDate,
            returnDate,
            pickupLocation,
            dropoffLocation,
            advanceAmount,
            notes,
        } = req.body;

        const nextCustomerId = customerId || existingBooking.customerId;
        const nextVehicleId = vehicleId || existingBooking.vehicleId;
        const nextPickupDate = pickupDate
            ? new Date(pickupDate)
            : existingBooking.pickupDate;
        const nextReturnDate = returnDate
            ? new Date(returnDate)
            : existingBooking.returnDate;

        const days = calculateDays(nextPickupDate, nextReturnDate);

        if (
            Number.isNaN(nextPickupDate.getTime()) ||
            Number.isNaN(nextReturnDate.getTime()) ||
            days <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid pickup or return date",
            });
        }

        const customer = await prisma.customer.findUnique({
            where: { id: nextCustomerId },
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        const vehicle = await prisma.vehicle.findUnique({
            where: { id: nextVehicleId },
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        const availability = await checkVehicleAvailability(
            nextVehicleId,
            nextPickupDate,
            nextReturnDate,
            id
        );

        if (!availability.available) {
            return res.status(409).json({
                success: false,
                message: availability.message,
            });
        }

        const dailyRate = Number(vehicle.price);
        const totalAmount = dailyRate * days;
        const advance = advanceAmount !== undefined
            ? Number(advanceAmount)
            : Number(existingBooking.advanceAmount);

        if (!Number.isFinite(advance) || advance < 0 || advance > totalAmount) {
            return res.status(400).json({
                success: false,
                message: "Invalid advance amount",
            });
        }

        const booking = await prisma.booking.update({
            where: { id },
            data: {
                customerId: nextCustomerId,
                vehicleId: nextVehicleId,
                pickupDate: nextPickupDate,
                returnDate: nextReturnDate,
                pickupLocation,
                dropoffLocation,
                totalDays: days,
                dailyRate,
                totalAmount,
                advanceAmount: advance,
                notes,
            },
            include: {
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
            },
        });

        res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            data: booking,
        });
    } catch (error) {
        console.error("Update booking error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update booking",
        });
    }
};

// UPDATE BOOKING STATUS
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid status. Active and Completed are managed through Rental Pickup and Return.",
            });
        }

        const existingBooking = await prisma.booking.findUnique({
            where: { id },
        });

        if (!existingBooking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        if (["Active", "Completed", "Cancelled"].includes(existingBooking.status)) {
            return res.status(400).json({
                success: false,
                message: "This booking status cannot be changed.",
            });
        }

        if (status === "Confirmed") {
            const availability = await checkVehicleAvailability(
                existingBooking.vehicleId,
                existingBooking.pickupDate,
                existingBooking.returnDate,
                id
            );

            if (!availability.available) {
                return res.status(409).json({
                    success: false,
                    message: availability.message,
                });
            }
        }

        const booking = await prisma.booking.update({
            where: { id },
            data: { status },
        });

        return res.status(200).json({
            success: true,
            message: "Booking status updated successfully.",
            data: booking,
        });
    } catch (error) {
        console.error("Update booking status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update booking status.",
        });
    }
};

// DELETE BOOKING
const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await prisma.booking.findUnique({
            where: { id },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (booking.status === "Active") {
            return res.status(400).json({
                success: false,
                message: "Active bookings cannot be deleted",
            });
        }

        await prisma.booking.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
        });
    } catch (error) {
        console.error("Delete booking error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete booking",
        });
    }
};

module.exports = {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
};