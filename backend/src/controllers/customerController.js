
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

// FORMAT CUSTOMER RESPONSE
const formatCustomer = (customer) => ({
    id: customer.id,
    userId: customer.userId,
    name: customer.user.name,
    email: customer.user.email,
    phone: customer.phone,
    licenseNumber: customer.licenseNumber,
    address: customer.address,
    city: customer.city,
    state: customer.state,
    status: customer.user.isActive ? "Active" : "Inactive",
    createdAt: customer.createdAt,
});

// CREATE CUSTOMER (Admin / Staff)
const createCustomer = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            licenseNumber,
            address,
            city,
            state,
            status,
        } = req.body;

        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedLicense = licenseNumber?.trim().toUpperCase() || null;

        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        if (normalizedLicense) {
            const existingLicense = await prisma.customer.findUnique({
                where: { licenseNumber: normalizedLicense },
            });

            if (existingLicense) {
                return res.status(409).json({
                    success: false,
                    message: "Driving license number already exists",
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const customer = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: name.trim(),
                    email: normalizedEmail,
                    password: hashedPassword,
                    role: "CUSTOMER",
                    isActive: status !== "Inactive",
                },
            });

            const customerRecord = await tx.customer.create({
                data: {
                    userId: user.id,
                    phone: phone?.trim() || null,
                    licenseNumber: normalizedLicense,
                    address: address?.trim() || null,
                    city: city?.trim() || null,
                    state: state?.trim() || null,
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

            return customerRecord;
        });

        return res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: formatCustomer(customer),
        });

    } catch (error) {
        console.error("Create customer error:", error);

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Email or license number already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create customer",
        });
    }
};

// GET ALL CUSTOMERS
const getAllCustomers = async (req, res) => {
    try {
        const customers = await prisma.customer.findMany({
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

        res.status(200).json({
            success: true,
            data: customers.map(formatCustomer),
        });

    } catch (error) {
        console.error("Get customers error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch customers",
        });
    }
};

// GET CUSTOMER BY ID
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await prisma.customer.findUnique({
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

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        res.status(200).json({
            success: true,
            data: formatCustomer(customer),
        });

    } catch (error) {
        console.error("Get customer error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch customer",
        });
    }
};

// UPDATE CUSTOMER
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            password,
            phone,
            licenseNumber,
            address,
            city,
            state,
            status,
        } = req.body;

        const existingCustomer = await prisma.customer.findUnique({
            where: { id },
        });

        if (!existingCustomer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        const userData = {};
        const customerData = {};

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Customer name cannot be empty",
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

            if (emailOwner && emailOwner.id !== existingCustomer.userId) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists",
                });
            }

            userData.email = normalizedEmail;
        }

        if (password !== undefined) {
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
                    message: "Invalid customer status",
                });
            }

            userData.isActive = status === "Active";
        }

        if (phone !== undefined) {
            customerData.phone = phone?.trim() || null;
        }

        if (licenseNumber !== undefined) {
            const normalizedLicense =
                licenseNumber?.trim().toUpperCase() || null;

            if (normalizedLicense) {
                const licenseOwner = await prisma.customer.findUnique({
                    where: { licenseNumber: normalizedLicense },
                });

                if (licenseOwner && licenseOwner.id !== id) {
                    return res.status(409).json({
                        success: false,
                        message: "Driving license number already exists",
                    });
                }
            }

            customerData.licenseNumber = normalizedLicense;
        }

        if (address !== undefined) {
            customerData.address = address?.trim() || null;
        }

        if (city !== undefined) {
            customerData.city = city?.trim() || null;
        }

        if (state !== undefined) {
            customerData.state = state?.trim() || null;
        }

        const updatedCustomer = await prisma.$transaction(async (tx) => {
            if (Object.keys(userData).length > 0) {
                await tx.user.update({
                    where: { id: existingCustomer.userId },
                    data: userData,
                });
            }

            return tx.customer.update({
                where: { id },
                data: customerData,
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

        res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: formatCustomer(updatedCustomer),
        });

    } catch (error) {
        console.error("Update customer error:", error);

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Email or license number already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update customer",
        });
    }
};

// DELETE CUSTOMER
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await prisma.customer.findUnique({
            where: { id },
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        await prisma.$transaction(async (tx) => {
            await tx.customer.delete({
                where: { id },
            });

            await tx.user.delete({
                where: { id: customer.userId },
            });
        });

        res.status(200).json({
            success: true,
            message: "Customer deleted successfully",
        });

    } catch (error) {
        console.error("Delete customer error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete customer",
        });
    }
};

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
};