
const prisma = require("../config/prisma");

// GET ALL VEHICLES
const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            success: true,
            data: vehicles,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch vehicles",
        });
    }
};

const getAvailableVehicles = async (req, res) => {
    try {
        const { pickupDate, returnDate } = req.query;

        let maintenanceCondition;

        if (pickupDate && returnDate) {
            const pickup = new Date(pickupDate);
            const returning = new Date(returnDate);

            if (
                isNaN(pickup.getTime()) ||
                isNaN(returning.getTime()) ||
                pickup > returning
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid pickup or return date",
                });
            }

            maintenanceCondition = {
                none: {
                    OR: [
                        { status: "In Progress" },
                        {
                            status: "Scheduled",
                            serviceDate: {
                                gte: pickup,
                                lte: returning,
                            },
                        },
                    ],
                },
            };
        } else {
            maintenanceCondition = {
                none: {
                    OR: [
                        { status: "In Progress" },
                        {
                            status: "Scheduled",
                            serviceDate: {
                                lte: new Date(),
                            },
                        },
                    ],
                },
            };
        }

        const vehicles = await prisma.vehicle.findMany({
            where: {
                status: "Available",
                maintenanceRecords: maintenanceCondition,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            success: true,
            data: vehicles,
        });
    } catch (error) {
        console.error("Available vehicles error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch available vehicles",
        });
    }
};
// GET VEHICLE BY ID
const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        res.status(200).json({
            success: true,
            data: vehicle,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch vehicle",
        });
    }
};

// CREATE VEHICLE
const createVehicle = async (req, res) => {
    try {
        const {
            name,
            number,
            category,
            fuel,
            seats,
            price,
            status,
        } = req.body;

        if (
            !name?.trim() ||
            !number?.trim() ||
            !category ||
            !fuel ||
            seats === undefined ||
            price === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required vehicle details",
            });
        }

        const parsedSeats = Number(seats);
        const parsedPrice = Number(price);

        if (
            !Number.isInteger(parsedSeats) ||
            parsedSeats <= 0 ||
            !Number.isFinite(parsedPrice) ||
            parsedPrice < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid seats or price",
            });
        }

        const vehicle = await prisma.vehicle.create({
            data: {
                name: name.trim(),
                number: number.trim().toUpperCase(),
                category,
                fuel,
                seats: parsedSeats,
                price: parsedPrice,
                status: status || "Available",
            },
        });

        res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: vehicle,
        });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Vehicle registration number already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create vehicle",
        });
    }
};

// UPDATE VEHICLE
const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            number,
            category,
            fuel,
            seats,
            price,
            status,
        } = req.body;

        const data = {};

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Vehicle name cannot be empty",
                });
            }
            data.name = name.trim();
        }

        if (number !== undefined) {
            if (!number.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Registration number cannot be empty",
                });
            }
            data.number = number.trim().toUpperCase();
        }

        if (category !== undefined) data.category = category;
        if (fuel !== undefined) data.fuel = fuel;
        if (status !== undefined) data.status = status;

        if (seats !== undefined) {
            const parsedSeats = Number(seats);

            if (!Number.isInteger(parsedSeats) || parsedSeats <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid seat count",
                });
            }

            data.seats = parsedSeats;
        }

        if (price !== undefined) {
            const parsedPrice = Number(price);

            if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid vehicle price",
                });
            }

            data.price = parsedPrice;
        }

        const vehicle = await prisma.vehicle.update({
            where: { id },
            data,
        });

        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: vehicle,
        });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Registration number already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update vehicle",
        });
    }
};

// DELETE VEHICLE
const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.vehicle.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully",
        });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to delete vehicle",
        });
    }
};

module.exports = {
    getAllVehicles,
    getAvailableVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
};