

export const availableBookings = [
    {
        id: 1,
        bookingId: "BK-1001",
        customer: "Arun Kumar",
        phone: "9876543210",
        email: "arun@gmail.com",
        vehicle: "Toyota Innova Crysta",
        registrationNumber: "TN 01 AB 1234",
        pickupDate: "2026-11-12",
        returnDate: "2026-11-15",
        dailyRate: 3500,
        includedKmPerDay: 100,
        extraKmRate: 10,
        status: "Confirmed",
    },
    {
        id: 2,
        bookingId: "BK-1002",
        customer: "Rahul Kumar",
        phone: "9876543211",
        email: "rahul@gmail.com",
        vehicle: "Hyundai Creta",
        registrationNumber: "TN 09 CD 5678",
        pickupDate: "2026-11-13",
        returnDate: "2026-11-16",
        dailyRate: 2800,
        includedKmPerDay: 100,
        extraKmRate: 10,
        status: "Confirmed",
    },
];

export const initialRentalRecords = [
    {
        id: 1,
        bookingId: "BK-1006",
        customer: "Arun Kumar",
        vehicle: "Toyota Innova Crysta",
        registrationNumber: "TN 01 AB 1234",

        pickupDate: "2026-11-08",
        expectedReturnDate: "2026-11-10",

        pickupOdometer: 25000,
        pickupFuel: 100,

        returnOdometer: null,
        returnFuel: null,
        distanceTravelled: 0,

        estimatedAmount: 7000,
        finalAmount: null,

        paidAmount: 3000,
        balanceAmount: 4000,

        paymentStatus: "Partial",
        rentalStatus: "Pickup",

        invoiceNumber: null,
        paymentHistory: [
            {
                id: 1,
                amount: 3000,
                method: "UPI",
                reference: "UPI-DEMO-1001",
                date: "2026-11-08",
            },
        ],
    },
];