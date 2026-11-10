

import {
CarFront,
Users,
CalendarDays,
IndianRupee,
CheckCircle,
Wrench,
} from "lucide-react";

export const statistics = [
{
title: "Total Vehicles",
value: "128",
change: "+12.5%",
positive: true,
icon: CarFront,
color: "blue",
description: "Compared to last month",
},
{
title: "Active Bookings",
value: "42",
change: "+8.2%",
positive: true,
icon: CalendarDays,
color: "purple",
description: "Compared to last month",
},
{
title: "Total Customers",
value: "856",
change: "+15.3%",
positive: true,
icon: Users,
color: "green",
description: "Compared to last month",
},
{
title: "Total Revenue",
value: "₹4,80,000",
change: "-2.4%",
positive: false,
icon: IndianRupee,
color: "orange",
description: "Compared to last month",
},
];

export const revenueData = [
{ month: "Jan", height: 45 },
{ month: "Feb", height: 65 },
{ month: "Mar", height: 50 },
{ month: "Apr", height: 80 },
{ month: "May", height: 60 },
{ month: "Jun", height: 90 },
{ month: "Jul", height: 70 },
{ month: "Aug", height: 85 },
{ month: "Sep", height: 60 },
{ month: "Oct", height: 95 },
{ month: "Nov", height: 75 },
{ month: "Dec", height: 40 },
];

export const vehicleAvailability = {
total: 128,
available: 76,
rented: 42,
maintenance: 10,
};

export const bookings = [
{
id: 1,
bookingId: "BK-1001",
customer: "Arun Kumar",
vehicle: "Hyundai Creta",
date: "09 Nov 2026",
amount: "₹4,500",
status: "Confirmed",
},
{
id: 2,
bookingId: "BK-1002",
customer: "Rahul S",
vehicle: "Kia Seltos",
date: "09 Nov 2026",
amount: "₹5,000",
status: "Pending",
},
{
id: 3,
bookingId: "BK-1003",
customer: "Mohammed Ali",
vehicle: "Swift Dzire",
date: "08 Nov 2026",
amount: "₹3,000",
status: "Completed",
},
{
id: 4,
bookingId: "BK-1004",
customer: "Praveen Kumar",
vehicle: "Toyota Innova",
date: "08 Nov 2026",
amount: "₹6,500",
status: "Confirmed",
},
];

export const activities = [
{
id: 1,
icon: CheckCircle,
title: "New booking confirmed",
description: "Booking BK-1001 confirmed",
time: "10 minutes ago",
color: "green",
},
{
id: 2,
icon: Users,
title: "New customer registered",
description: "Arun Kumar joined DriveFlow",
time: "30 minutes ago",
color: "blue",
},
{
id: 3,
icon: Wrench,
title: "Vehicle maintenance",
description: "Honda City sent for service",
time: "1 hour ago",
color: "orange",
},
];

import { useState } from "react";

