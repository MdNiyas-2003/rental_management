const prisma = require("../config/prisma");

const paymentStatus = (paid, total) => {
    if (paid >= total) return "Paid";
    if (paid > 0) return "Partially Paid";
    return "Unpaid";
};

// GET /api/invoices
const getAllInvoices = async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            include: {
                rental: {
                    include: {
                        booking: {
                            include: {
                                customer: {
                                    include: {
                                        user: {
                                            select: { name: true, email: true },
                                        },
                                    },
                                },
                                vehicle: true,
                            },
                        },
                    },
                },
                payments: {
                    orderBy: { paidAt: "desc" },
                },
            },
            orderBy: { invoiceDate: "desc" },
        });

        return res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        console.error("getAllInvoices:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to load invoices.",
        });
    }
};

// GET /api/invoices/:id
const getInvoiceById = async (req, res) => {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: req.params.id },
            include: {
                rental: {
                    include: {
                        booking: {
                            include: {
                                customer: {
                                    include: {
                                        user: {
                                            select: { name: true, email: true },
                                        },
                                    },
                                },
                                vehicle: true,
                            },
                        },
                    },
                },
                payments: {
                    orderBy: { paidAt: "desc" },
                },
            },
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found.",
            });
        }

        return res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        console.error("getInvoiceById:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to load invoice details.",
        });
    }
};

// POST /api/invoices/:id/payments
// Adds a payment transaction; it never changes the invoice total.
const addInvoicePayment = async (req, res) => {
    try {
        const { amount, method = "Cash", reference = null } = req.body;
        const paymentAmount = Number(amount);
        const allowedMethods = ["Cash", "UPI", "Card", "Bank Transfer"];

        if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Payment amount must be greater than ₹0.",
            });
        }

        if (!allowedMethods.includes(method)) {
            return res.status(400).json({
                success: false,
                message: "Select a valid payment method.",
            });
        }

        if (["UPI", "Card"].includes(method) && !String(reference || "").trim()) {
            return res.status(400).json({
                success: false,
                message: "Transaction reference is required for UPI or Card payments.",
            });
        }

        const invoice = await prisma.$transaction(async (tx) => {
            const currentInvoice = await tx.invoice.findUnique({
                where: { id: req.params.id },
            });

            if (!currentInvoice) {
                throw new Error("INVOICE_NOT_FOUND");
            }

            const currentPaid = Number(currentInvoice.paidAmount || 0);
            const currentBalance = Number(currentInvoice.balanceAmount || 0);

            if (paymentAmount > currentBalance) {
                throw new Error("PAYMENT_EXCEEDS_BALANCE");
            }

            const newPaidAmount = Number((currentPaid + paymentAmount).toFixed(2));
            const newBalanceAmount = Number(
                Math.max(0, Number(currentInvoice.totalAmount) - newPaidAmount).toFixed(2)
            );

            await tx.payment.create({
                data: {
                    invoiceId: currentInvoice.id,
                    amount: paymentAmount,
                    method,
                    reference: String(reference || "").trim() || null,
                },
            });

            return tx.invoice.update({
                where: { id: currentInvoice.id },
                data: {
                    paidAmount: newPaidAmount,
                    balanceAmount: newBalanceAmount,
                    status: paymentStatus(
                        newPaidAmount,
                        Number(currentInvoice.totalAmount)
                    ),
                },
                include: {
                    rental: {
                        include: {
                            booking: {
                                include: {
                                    customer: {
                                        include: {
                                            user: {
                                                select: { name: true, email: true },
                                            },
                                        },
                                    },
                                    vehicle: true,
                                },
                            },
                        },
                    },
                    payments: {
                        orderBy: { paidAt: "desc" },
                    },
                },
            });
        });

        return res.status(200).json({
            success: true,
            message: "Payment recorded successfully.",
            data: invoice,
        });
    } catch (error) {
        console.error("addInvoicePayment:", error);

        if (error.message === "INVOICE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Invoice not found.",
            });
        }

        if (error.message === "PAYMENT_EXCEEDS_BALANCE") {
            return res.status(400).json({
                success: false,
                message: "Payment amount cannot exceed the outstanding balance.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to record payment.",
        });
    }
};

module.exports = {
    getAllInvoices,
    getInvoiceById,
    addInvoicePayment,
};
