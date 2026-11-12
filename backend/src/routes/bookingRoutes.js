const express = require("express");

const {
getAllBookings,
getBookingById,
createBooking,
updateBooking,
updateBookingStatus,
deleteBooking,
} = require("../controllers/bookingController");

const router = express.Router();

router.get("/", getAllBookings);
router.get("/:id", getBookingById);

router.post("/", createBooking);

router.put("/:id", updateBooking);
router.patch("/:id/status", updateBookingStatus);

router.delete("/:id", deleteBooking);

module.exports = router;
