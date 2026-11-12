const express = require("express");

const {
createStaff,
getAllStaff,
getStaffById,
updateStaff,
deleteStaff,
} = require("../controllers/staffController");

const router = express.Router();

router.get("/", getAllStaff);
router.get("/:id", getStaffById);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);

module.exports = router;