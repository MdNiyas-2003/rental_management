const express =require("express");
const cors =require("cors");
require("dotenv").config();

const app=express();
const prisma=require("./src/config/prisma");
const vehicleRoutes=require("./src/routes/vehicleRoutes");
const maintenanceRoutes=require("./src/routes/maintenanceRoutes");
const customerRoutes=require("./src/routes/customerRoutes");
const authRoutes = require("./src/routes/authRoutes");
const staffRoutes = require("./src/routes/staffRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const rentalRoutes = require("./src/routes/rentalRoutes");
const invoiceRoutes = require("./src/routes/invoiceRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/maintenance",maintenanceRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.get("/api/health",(req,res)=>{
    res.status(200).json({
        success: true,
        message:"DriveFlow Backend Running Successfully"
    });
});

app.get("/api/db-test", async(req,res)=>{
    try{
        await prisma.$connect();

        res.json({
            success: true,
            message:"Postgres connected successfully"
        });
    
    }
    catch{
        res.status(500).json({
            success: false,
            message:error.message,
        });
    }
});

const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`DriveFlow server running on port ${PORT}`);
})