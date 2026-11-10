import { useMemo, useState } from "react";
import {
    availableBookings,
    initialRentalRecords,
} from "../data/rentalData";

function useInvoices() {
    const [activeTab, setActiveTab] = useState("pickup");

    const [bookings, setBookings] = useState(availableBookings);
    const [records, setRecords] = useState(initialRentalRecords);

    const [selectedBookingId, setSelectedBookingId] = useState("");
    const [selectedRecordId, setSelectedRecordId] = useState("");

    const [pickupForm, setPickupForm] = useState({
        pickupOdometer: "",
        pickupFuel: "100",
        estimatedAmount: "",
        paidAmount: "0",
        paymentMethod: "Cash",
        paymentReference: "",
        condition: "Good",
        notes: "",
    });

    const [returnForm, setReturnForm] = useState({
        returnOdometer: "",
        returnFuel: "100",
        extraCharges: "0",
        lateCharges: "0",
        damageCharges: "0",
        discount: "0",
        taxAmount: "0",
        notes: "",
    });

    const [paymentRecord, setPaymentRecord] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [paymentReference, setPaymentReference] = useState("");

    const [viewRecord, setViewRecord] = useState(null);

    const formatCurrency = (amount) =>
`₹${ Number(amount || 0).toLocaleString("en-IN") } `;

// Available confirmed bookings
const pickupBookings = bookings.filter(
(booking) =>
booking.status === "Confirmed" &&
!records.some((record) => record.bookingId === booking.bookingId)
);

// Active rentals
const activeRentals = records.filter(
(record) => record.rentalStatus === "Pickup"
);

const selectedBooking = pickupBookings.find(
(booking) => booking.bookingId === selectedBookingId
);

const selectedRental = activeRentals.find(
(record) => String(record.id) === String(selectedRecordId)
);

// Pickup form changes
const handlePickupChange = (e) => {
const { name, value } = e.target;

setPickupForm((previous) => ({
...previous,
[name]: value,
}));
};

// Return form changes
const handleReturnChange = (e) => {
const { name, value } = e.target;

setReturnForm((previous) => ({
...previous,
[name]: value,
}));
};

// Pickup calculation
const pickupTotal = selectedBooking
? Number(pickupForm.estimatedAmount) ||
selectedBooking.dailyRate *
Math.max(
1,
Math.ceil(
(
new Date(`${selectedBooking.returnDate}T00:00:00`) - new Date(`${selectedBooking.pickupDate}T00:00:00`)
) /
86400000
)
)
: 0;

const pickupBalance = Math.max(
0,
pickupTotal - Number(pickupForm.paidAmount || 0)
);

// Submit vehicle pickup
const submitPickup = (e) => {
e.preventDefault();

if (!selectedBooking) {
alert("Please select a booking.");
return;
}

const odometer = Number(pickupForm.pickupOdometer);
const fuel = Number(pickupForm.pickupFuel);
const paid = Number(pickupForm.paidAmount);

if (
!Number.isFinite(odometer) ||
odometer < 0 ||
fuel < 0 ||
fuel > 100 ||
paid < 0 ||
paid > pickupTotal
) {
alert("Please enter valid pickup and payment details.");
return;
}

const invoiceId = `INV-${Date.now()}`;

    const newRecord = {
        id: Date.now(),
        bookingId: selectedBooking.bookingId,
        customer: selectedBooking.customer,
        phone: selectedBooking.phone,
        email: selectedBooking.email,
        vehicle: selectedBooking.vehicle,
        registrationNumber: selectedBooking.registrationNumber,

        pickupDate: selectedBooking.pickupDate,
        expectedReturnDate: selectedBooking.returnDate,

        pickupOdometer: odometer,
        pickupFuel: fuel,
        returnOdometer: null,
        returnFuel: null,
        distanceTravelled: 0,

        estimatedAmount: pickupTotal,
        finalAmount: null,

        paidAmount: paid,
        balanceAmount: pickupTotal - paid,

        paymentStatus:
            paid === pickupTotal
                ? "Paid"
                : paid > 0
                    ? "Partial"
                    : "Unpaid",

        rentalStatus: "Pickup",
        invoiceNumber: invoiceId,

        pickupCondition: pickupForm.condition,
        notes: pickupForm.notes,

        paymentHistory: paid > 0
            ? [{
                id: Date.now(),
                amount: paid,
                method: pickupForm.paymentMethod,
                reference: pickupForm.paymentReference,
                date: new Date().toISOString(),
            }]
            : [],
    };

    setRecords((previous) => [newRecord, ...previous]);

    setBookings((previous) =>
        previous.map((booking) =>
            booking.bookingId === selectedBooking.bookingId
                ? { ...booking, status: "Active" }
                : booking
        )
    );

    setSelectedBookingId("");
    setPickupForm({
        pickupOdometer: "",
        pickupFuel: "100",
        estimatedAmount: "",
        paidAmount: "0",
        paymentMethod: "Cash",
        paymentReference: "",
        condition: "Good",
        notes: "",
    });

    alert("Vehicle pickup saved successfully.");
};

// Return calculations
const distanceTravelled = selectedRental
    ? Math.max(
        0,
        Number(returnForm.returnOdometer || 0) -
        selectedRental.pickupOdometer
    )
    : 0;

const includedKm = selectedRental
    ? Math.max(
        1,
        Math.ceil(
            (
                new Date(`${ selectedRental.expectedReturnDate }T00:00:00`) - new Date(`${ selectedRental.pickupDate }T00:00:00`)
            ) /
            86400000
        )
    ) * 100
    : 0;

const extraKm = Math.max(0, distanceTravelled - includedKm);

const extraKmRate = 10;
const extraKmAmount = extraKm * extraKmRate;

const fuelDifference = selectedRental
    ? selectedRental.pickupFuel - Number(returnForm.returnFuel || 0)
    : 0;

const extraCharges = Number(returnForm.extraCharges || 0);
const lateCharges = Number(returnForm.lateCharges || 0);
const damageCharges = Number(returnForm.damageCharges || 0);
const discount = Number(returnForm.discount || 0);
const taxAmount = Number(returnForm.taxAmount || 0);

const rentalAmount = selectedRental
    ? selectedRental.estimatedAmount
    : 0;

const returnTotal = Math.max(
    0,
    rentalAmount +
    extraKmAmount +
    extraCharges +
    lateCharges +
    damageCharges -
    discount +
    taxAmount
);

const additionalBalance = selectedRental
    ? Math.max(0, returnTotal - selectedRental.paidAmount)
    : 0;

// Submit vehicle return and generate final invoice
const submitReturn = (e) => {
    e.preventDefault();

    if (!selectedRental) {
        alert("Please select an active rental.");
        return;
    }

    const returnKm = Number(returnForm.returnOdometer);
    const returnFuel = Number(returnForm.returnFuel);

    if (
        !Number.isFinite(returnKm) ||
        returnKm <= selectedRental.pickupOdometer ||
        !Number.isFinite(returnFuel) ||
        returnFuel < 0 ||
        returnFuel > 100 ||
        [extraCharges, lateCharges, damageCharges, discount, taxAmount]
            .some((value) => !Number.isFinite(value) || value < 0) ||
        discount > rentalAmount + extraKmAmount + extraCharges +
        lateCharges + damageCharges + taxAmount
    ) {
        alert("Please check your return details and charges.");
        return;
    }

    const updatedRecord = {
        ...selectedRental,
        returnOdometer: returnKm,
        returnFuel,
        distanceTravelled,
        extraKm,
        extraKmAmount,
        fuelDifference,
        extraCharges,
        lateCharges,
        damageCharges,
        discount,
        taxAmount,
        finalAmount: returnTotal,
        balanceAmount: Math.max(0, returnTotal - selectedRental.paidAmount),
        paymentStatus:
            selectedRental.paidAmount >= returnTotal
                ? "Paid"
                : selectedRental.paidAmount > 0
                    ? "Partial"
                    : "Unpaid",
        rentalStatus: "Return",
        invoiceNumber:
            selectedRental.invoiceNumber ||`INV - ${ Date.now()
}`,
returnNotes: returnForm.notes,
invoiceDate: new Date().toISOString(),
};

setRecords((previous) =>
previous.map((record) =>
record.id === selectedRental.id ? updatedRecord : record
)
);

setBookings((previous) =>
previous.map((booking) =>
booking.bookingId === selectedRental.bookingId
? { ...booking, status: "Completed" }
: booking
)
);

setSelectedRecordId("");
setReturnForm({
returnOdometer: "",
returnFuel: "100",
extraCharges: "0",
lateCharges: "0",
damageCharges: "0",
discount: "0",
taxAmount: "0",
notes: "",
});

alert("Vehicle returned and final invoice generated successfully.");
setActiveTab("invoices");
};

// Record payment
const openPayment = (record) => {
setPaymentRecord(record);
setPaymentAmount("");
setPaymentMethod("UPI");
setPaymentReference("");
};

const closePayment = () => {
setPaymentRecord(null);
};

const submitPayment = (e) => {
e.preventDefault();

if (!paymentRecord) return;

const amount = Number(paymentAmount);
const balance = paymentRecord.balanceAmount;

if (
!Number.isFinite(amount) ||
amount <= 0 ||
amount > balance
) {
alert(`Enter an amount between ₹0.01 and${formatCurrency(balance)}.`);
return;
}

if (!paymentReference.trim()) {
    alert("Please enter the payment reference.");
    return;
}

setRecords((previous) =>
    previous.map((record) => {
        if (record.id !== paymentRecord.id) return record;

        const paid = record.paidAmount + amount;
        const total =
            record.finalAmount ?? record.estimatedAmount;
        const remaining = Math.max(0, total - paid);

        return {
            ...record,
            paidAmount: paid,
            balanceAmount: remaining,
            paymentStatus:
                remaining === 0
                    ? "Paid"
                    : "Partial",
            paymentHistory: [
                ...record.paymentHistory,
                {
                    id: Date.now(),
                    amount,
                    method: paymentMethod,
                    reference: paymentReference,
                    date: new Date().toISOString(),
                },
            ],
        };
    })
);

closePayment();
};

// Invoice list search
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("All");
const [paymentFilter, setPaymentFilter] = useState("All");

const filteredRecords = useMemo(() => {
    return records.filter((record) => {
        const text = search.toLowerCase().trim();

        const matchesSearch =
            record.invoiceNumber?.toLowerCase().includes(text) ||
            record.bookingId.toLowerCase().includes(text) ||
            record.customer.toLowerCase().includes(text) ||
            record.vehicle.toLowerCase().includes(text);

        const matchesStatus =
            statusFilter === "All" ||
            record.rentalStatus === statusFilter;

        const matchesPayment =
            paymentFilter === "All" ||
            record.paymentStatus === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
    });
}, [records, search, statusFilter, paymentFilter]);

const totalInvoices = records.length;

const paidCount = records.filter(
    (record) => record.paymentStatus === "Paid"
).length;

const partialCount = records.filter(
    (record) => record.paymentStatus === "Partial"
).length;

const unpaidCount = records.filter(
    (record) => record.paymentStatus === "Unpaid"
).length;

const totalCollected = records.reduce(
    (sum, record) => sum + record.paidAmount,
    0
);

const totalOutstanding = records.reduce(
    (sum, record) =>
        sum + (
            record.finalAmount !== null
                ? record.balanceAmount
                : record.balanceAmount
        ),
    0
);

return {
    activeTab,
    setActiveTab,

    bookings,
    pickupBookings,
    activeRentals,
    selectedBooking,
    selectedRental,
    selectedBookingId,
    setSelectedBookingId,
    selectedRecordId,
    setSelectedRecordId,

    pickupForm,
    handlePickupChange,
    pickupTotal,
    pickupBalance,
    submitPickup,

    returnForm,
    handleReturnChange,
    distanceTravelled,
    includedKm,
    extraKm,
    extraKmRate,
    extraKmAmount,
    fuelDifference,
    returnTotal,
    additionalBalance,
    submitReturn,

    records,
    filteredRecords,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,

    totalInvoices,
    paidCount,
    partialCount,
    unpaidCount,
    totalCollected,
    totalOutstanding,

    viewRecord,
    setViewRecord,
    paymentRecord,
    paymentAmount,
    setPaymentAmount,
    paymentMethod,
    setPaymentMethod,
    paymentReference,
    setPaymentReference,
    openPayment,
    closePayment,
    submitPayment,

    formatCurrency,
};
}

export default useInvoices;
