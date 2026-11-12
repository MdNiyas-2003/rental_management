




const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

// FORMAT STAFF RESPONSE
const formatStaff = (staff) => ({
    id: staff.id,
    userId: staff.userId,
    name: staff.user.name,
    email: staff.user.email,
    employeeId: staff.employeeId,
    designation: staff.designation,
    phone: staff.phone,
    status: staff.user.isActive ? "Active" : "Inactive",
    createdAt: staff.createdAt,
});

// CREATE STAFF
const createStaff = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            employeeId,
            designation,
            phone,
            status,
        } = req.body;

        if (
            !name?.trim() ||
            !email?.trim() ||
            !password ||
            !employeeId?.trim() ||
            !designation?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password, employee ID and designation are required",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedEmployeeId = employeeId.trim().toUpperCase();

        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        const existingStaff = await prisma.staff.findUnique({
            where: { employeeId: normalizedEmployeeId },
        });

        if (existingStaff) {
            return res.status(409).json({
                success: false,
                message: "Employee ID already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const staff = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: name.trim(),
                    email: normalizedEmail,
                    password: hashedPassword,
                    role: "STAFF",
                    isActive: status !== "Inactive",
                },
            });

            return tx.staff.create({
                data: {
                    userId: user.id,
                    employeeId: normalizedEmployeeId,
                    designation: designation.trim(),
                    phone: phone?.trim() || null,
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            isActive: true,
                        },
                    },
                },
            });
        });

        return res.status(201).json({
            success: true,
            message: "Staff created successfully",
            data: formatStaff(staff),
        });

    } catch (error) {
        console.error("Create staff error:", error);

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Email or employee ID already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create staff",
        });
    }
};

// GET ALL STAFF
const getAllStaff = async (req, res) => {
    try {
        const staff = await prisma.staff.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        isActive: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            data: staff.map(formatStaff),
        });

    } catch (error) {
        console.error("Get staff error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch staff",
        });
    }
};

// GET STAFF BY ID
const getStaffById = async (req, res) => {
    try {
        const { id } = req.params;

        const staff = await prisma.staff.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        isActive: true,
                    },
                },
            },
        });

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: formatStaff(staff),
        });

    } catch (error) {
        console.error("Get staff error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch staff",
        });
    }
};

// UPDATE STAFF
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            password,
            employeeId,
            designation,
            phone,
            status,
        } = req.body;

        const existingStaff = await prisma.staff.findUnique({
            where: { id },
        });

        if (!existingStaff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found",
            });
        }

        const userData = {};
        const staffData = {};

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Staff name cannot be empty",
                });
            }

            userData.name = name.trim();
        }

        if (email !== undefined) {
            const normalizedEmail = email.trim().toLowerCase();

            if (!normalizedEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email cannot be empty",
                });
            }

            const emailOwner = await prisma.user.findUnique({
                where: { email: normalizedEmail },
            });

            if (emailOwner && emailOwner.id !== existingStaff.userId) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists",
                });
            }

            userData.email = normalizedEmail;
        }

        if (password !== undefined && password !== "") {
            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 8 characters",
                });
            }

            userData.password = await bcrypt.hash(password, 12);
        }

        if (status !== undefined) {
            if (!["Active", "Inactive"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid staff status",
                });
            }

            userData.isActive = status === "Active";
        }

        if (employeeId !== undefined) {
            const normalizedEmployeeId = employeeId.trim().toUpperCase();

            if (!normalizedEmployeeId) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID cannot be empty",
                });
            }

            const employeeOwner = await prisma.staff.findUnique({
                where: { employeeId: normalizedEmployeeId },
            });

            if (employeeOwner && employeeOwner.id !== id) {
                return res.status(409).json({
                    success: false,
                    message: "Employee ID already exists",
                });
            }

            staffData.employeeId = normalizedEmployeeId;
        }

        if (designation !== undefined) {
            if (!designation.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Designation cannot be empty",
                });
            }

            staffData.designation = designation.trim();
        }

        if (phone !== undefined) {
            staffData.phone = phone?.trim() || null;
        }

        const updatedStaff = await prisma.$transaction(async (tx) => {
            if (Object.keys(userData).length > 0) {
                await tx.user.update({
                    where: { id: existingStaff.userId },
                    data: userData,
                });
            }

            return tx.staff.update({
                where: { id },
                data: staffData,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            isActive: true,
                        },
                    },
                },
            });
        });

        return res.status(200).json({
            success: true,
            message: "Staff updated successfully",
            data: formatStaff(updatedStaff),
        });

    } catch (error) {
        console.error("Update staff error:", error);

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Email or employee ID already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update staff",
        });
    }
};

// DELETE STAFF
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;

        const staff = await prisma.staff.findUnique({
            where: { id },
        });

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found",
            });
        }

        await prisma.$transaction(async (tx) => {
            await tx.staff.delete({
                where: { id },
            });

            await tx.user.delete({
                where: { id: staff.userId },
            });
        });

        return res.status(200).json({
            success: true,
            message: "Staff deleted successfully",
        });

    } catch (error) {
        console.error("Delete staff error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete staff",
        });
    }
};

module.exports = {
    createStaff,
    getAllStaff,
    getStaffById,
    updateStaff,
    deleteStaff,
};