
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
            },
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "User account not found or inactive",
            });
        }

        req.user = user;

        next();

    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token",
            });
        }

        console.error("Authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};

module.exports = authMiddleware;