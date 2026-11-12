const express = require("express");

const {
    getAllInvoices,
    getInvoiceById,
    addInvoicePayment,
} = require("../controllers/invoiceController");

const router = express.Router();

router.get("/", getAllInvoices);
router.get("/:id", getInvoiceById);
router.post("/:id/payments", addInvoicePayment);

module.exports = router;
