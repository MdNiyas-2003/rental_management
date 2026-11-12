const express = require("express");

const {
getAllMaintenance,
getMaintenanceById,
createMaintenance,
updateMaintenance,
deleteMaintenance,
} = require("../controllers/maintenanceController");

const router = express.Router();

// GET all maintenance records
router.get("/", getAllMaintenance);

// GET maintenance by ID
router.get("/:id", getMaintenanceById);

// CREATE maintenance
router.post("/", createMaintenance);

// UPDATE maintenance
router.put("/:id", updateMaintenance);

// DELETE maintenance
router.delete("/:id", deleteMaintenance);

module.exports = router;
