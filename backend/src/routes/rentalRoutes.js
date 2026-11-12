const express = require("express");

const {
    getPickupBookings,
    submitPickup,
    getActiveRentals,
    submitReturn,
} = require("../controllers/rentalController");

const router = express.Router();

router.get("/pickup-bookings", getPickupBookings);
router.post("/:bookingId/pickup", submitPickup);

router.get("/active", getActiveRentals);
router.post("/:rentalId/return", submitReturn);

module.exports = router;