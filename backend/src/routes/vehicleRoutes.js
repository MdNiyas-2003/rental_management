const express = require("express");

const {
getAllVehicles,
getAvailableVehicles,
getVehicleById,
createVehicle,
updateVehicle,
deleteVehicle,
} = require("../controllers/vehicleController");

const router = express.Router();

// GET all vehicles
router.get("/", getAllVehicles);

router.get("/available", getAvailableVehicles);

// GET vehicle by ID
router.get("/:id", getVehicleById);

// CREATE vehicle
router.post("/", createVehicle);

// UPDATE vehicle
router.put("/:id", updateVehicle);

// DELETE vehicle
router.delete("/:id", deleteVehicle);

module.exports = router;
