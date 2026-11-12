
const prisma = require("../config/prisma");

// GET ALL MAINTENANCE RECORDS
const getAllMaintenance = async (req, res) => {
    try {
        const records = await prisma.maintenance.findMany({
            include: {
                vehicle: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            success: true,
            data: records,
        });
    } catch (error) {
        console.error("Get maintenance error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch maintenance records",
        });
    }
};

// GET MAINTENANCE BY ID
const getMaintenanceById = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await prisma.maintenance.findUnique({
            where: { id },
            include: {
                vehicle: true,
            },
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found",
            });
        }

        res.status(200).json({
            success: true,
            data: record,
        });
    } catch (error) {
        console.error("Get maintenance error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch maintenance record",
        });
    }
};

// CREATE MAINTENANCE
const createMaintenance = async (req, res) => {
    try {
        const {
            vehicleId,
            serviceType,
            serviceDate,
            nextServiceDate,
            odometer,
            serviceProvider,
            cost,
            status,
            description,
        } = req.body;

        if (
            !vehicleId ||
            !serviceType ||
            !serviceDate ||
            !serviceProvider?.trim() ||
            odometer === undefined ||
            cost === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required maintenance details",
            });
        }

        const parsedOdometer = Number(odometer);
        const parsedCost = Number(cost);

        if (
            !Number.isInteger(parsedOdometer) ||
            parsedOdometer < 0 ||
            !Number.isFinite(parsedCost) ||
            parsedCost < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid odometer or cost",
            });
        }

        const parsedServiceDate = new Date(serviceDate);
        const parsedNextServiceDate = nextServiceDate
            ? new Date(nextServiceDate)
            : null;

        if (
            Number.isNaN(parsedServiceDate.getTime()) ||
            (parsedNextServiceDate &&
                Number.isNaN(parsedNextServiceDate.getTime()))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid service date",
            });
        }

        if (
            parsedNextServiceDate &&
            parsedNextServiceDate < parsedServiceDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Next service date cannot be before service date",
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

        const maintenanceId = `MNT - ${ Date.now()
    }`;

    const record = await prisma.maintenance.create({
        data: {
            maintenanceId,
            vehicleId,
            serviceType,
            serviceDate: parsedServiceDate,
            nextServiceDate: parsedNextServiceDate,
            odometer: parsedOdometer,
            serviceProvider: serviceProvider.trim(),
            cost: parsedCost,
            status: status || "Scheduled",
            description: description?.trim() || null,
        },
        include: {
            vehicle: true,
        },
    });

    res.status(201).json({
        success: true,
        message: "Maintenance record created successfully",
        data: record,
    });
} catch (error) {
    console.error("Create maintenance error:", error);

    res.status(500).json({
        success: false,
        message: "Failed to create maintenance record",
    });
}
};

// UPDATE MAINTENANCE
const updateMaintenance = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            vehicleId,
            serviceType,
            serviceDate,
            nextServiceDate,
            odometer,
            serviceProvider,
            cost,
            status,
            description,
        } = req.body;

        const data = {};

        if (vehicleId !== undefined) {
            const vehicle = await prisma.vehicle.findUnique({
                where: { id: vehicleId },
            });

            if (!vehicle) {
                return res.status(404).json({
                    success: false,
                    message: "Vehicle not found",
                });
            }

            data.vehicleId = vehicleId;
        }

        if (serviceType !== undefined) data.serviceType = serviceType;
        if (status !== undefined) data.status = status;
        if (description !== undefined) {
            data.description = description?.trim() || null;
        }

        if (serviceProvider !== undefined) {
            if (!serviceProvider.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Service provider cannot be empty",
                });
            }

            data.serviceProvider = serviceProvider.trim();
        }

        if (serviceDate !== undefined) {
            const parsed = new Date(serviceDate);

            if (Number.isNaN(parsed.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid service date",
                });
            }

            data.serviceDate = parsed;
        }

        if (nextServiceDate !== undefined) {
            if (!nextServiceDate) {
                data.nextServiceDate = null;
            } else {
                const parsed = new Date(nextServiceDate);

                if (Number.isNaN(parsed.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid next service date",
                    });
                }

                data.nextServiceDate = parsed;
            }
        }

        if (odometer !== undefined) {
            const parsed = Number(odometer);

            if (!Number.isInteger(parsed) || parsed < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid odometer",
                });
            }

            data.odometer = parsed;
        }

        if (cost !== undefined) {
            const parsed = Number(cost);

            if (!Number.isFinite(parsed) || parsed < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid maintenance cost",
                });
            }

            data.cost = parsed;
        }

        const current = await prisma.maintenance.findUnique({
            where: { id },
        });

        if (!current) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found",
            });
        }

        const finalServiceDate = data.serviceDate || current.serviceDate;
        const finalNextServiceDate =
            data.nextServiceDate !== undefined
                ? data.nextServiceDate
                : current.nextServiceDate;

        if (
            finalNextServiceDate &&
            finalNextServiceDate < finalServiceDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Next service date cannot be before service date",
            });
        }

        const record = await prisma.maintenance.update({
            where: { id },
            data,
            include: {
                vehicle: true,
            },
        });

        res.status(200).json({
            success: true,
            message: "Maintenance record updated successfully",
            data: record,
        });
    } catch (error) {
        console.error("Update maintenance error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update maintenance record",
        });
    }
};

// DELETE MAINTENANCE
const deleteMaintenance = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.maintenance.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: "Maintenance record deleted successfully",
        });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found",
            });
        }

        console.error("Delete maintenance error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete maintenance record",
        });
    }
};

module.exports = {
    getAllMaintenance,
    getMaintenanceById,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
};