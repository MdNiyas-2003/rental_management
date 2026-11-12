


const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// GENERATE JWT TOKEN
const generateToken = (user) => {
    return jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );
};

// CUSTOMER SELF REGISTRATION
const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            city,
            state,
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

        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name: name.trim(),
                    email: normalizedEmail,
                    password: hashedPassword,
                    role: "CUSTOMER",
                },
            });

            await tx.customer.create({
                data: {
                    userId: newUser.id,
                    phone: phone?.trim() || null,
                    address: address?.trim() || null,
                    city: city?.trim() || null,
                    state: state?.trim() || null,
                },
            });

            return newUser;
        });

        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Registration failed",
        });
    }
};

// COMMON LOGIN (ADMIN / STAFF / CUSTOMER)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};

module.exports = {
    register,
    login,
};