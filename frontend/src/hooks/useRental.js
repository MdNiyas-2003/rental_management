import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).trim().replace(/\s+/g, "").replace(/\/+$/, "");

const initialPickupForm = {
    pickupOdometer: "",
    pickupFuelLevel: "100%",
    pickupCondition: "Good",
    pickupNotes: "",
};

const initialReturnForm = {
    returnOdometer: "",
    returnFuelLevel: "100%",
    returnCondition: "Good",
    returnNotes: "",
    fuelCharges: "0",
    lateCharges: "0",
    damageCharges: "0",
    discount: "0",
    tax: "0",
    paymentAmount: "0",
    paymentMethod: "Cash",
    paymentReference: "",
};

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false) {
        throw new Error(result.message || "Request failed.");
    }
    return result;
}

const getData = (result) => result?.data ?? [];

const mapBooking = (booking) => ({
    ...booking,
    customerName: booking.customer?.user?.name || "Unknown Customer",
    customerEmail: booking.customer?.user?.email || "",
    customerPhone: booking.customer?.phone || "",
    vehicleName: booking.vehicle?.name || "Unknown Vehicle",
    vehicleNumber: booking.vehicle?.number || "",
    totalAmount: Number(booking.totalAmount || 0),
    advanceAmount: Number(booking.advanceAmount || 0),
    dailyRate: Number(booking.dailyRate || 0),
});

const mapRental = (rental) => {
    const booking = rental.booking || {};
    const mappedBooking = mapBooking(booking);

    return {
        ...rental,
        booking: mappedBooking,
        bookingCode: booking.bookingId || "",
        customerName: mappedBooking.customerName,
        customerEmail: mappedBooking.customerEmail,
        customerPhone: mappedBooking.customerPhone,
        vehicleName: mappedBooking.vehicleName,
        vehicleNumber: mappedBooking.vehicleNumber,
        pickupDate: booking.pickupDate,
        expectedReturnDate: booking.returnDate,
        totalDays: Number(booking.totalDays || 1),
        rentalAmount: Number(booking.totalAmount || 0),
        advanceAmount: Number(booking.advanceAmount || 0),
        pickupOdometer: Number(rental.pickupOdometer || 0),
        pickupFuelLevel: rental.pickupFuelLevel || "—",
    };
};

const mapInvoice = (invoice) => {
    const rental = invoice.rental || {};
    const booking = rental.booking || {};
    const customer = booking.customer || {};
    const vehicle = booking.vehicle || {};

    return {
        ...invoice,
        invoiceNumber: invoice.invoiceNumber || "",
        invoiceDate: invoice.invoiceDate || invoice.createdAt || null,
        bookingCode: booking.bookingId || "",
        customerName: customer.user?.name || "Unknown Customer",
        customerEmail: customer.user?.email || "",
        customerPhone: customer.phone || "",
        vehicleName: vehicle.name || "",
        vehicleNumber: vehicle.number || "",
        rentalId: rental.rentalId || "",
        subtotal: Number(invoice.subtotal || 0),
        totalAmount: Number(invoice.totalAmount || 0),
        paidAmount: Number(invoice.paidAmount || 0),
        balanceAmount: Number(invoice.balanceAmount || 0),
        status: invoice.status || "Unpaid",
        payments: (invoice.payments || []).map((payment) => ({
            ...payment,
            amount: Number(payment.amount || 0),
        })),
    };
};

export default function useRental() {
    const [pickupBookings, setPickupBookings] = useState([]);
    const [activeRentals, setActiveRentals] = useState([]);
    const [invoices, setInvoices] = useState([]);

    const [invoiceSearch, setInvoiceSearch] = useState("");
    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("All");
    const [invoiceDateFilter, setInvoiceDateFilter] = useState("All");

    const [selectedBookingId, setSelectedBookingId] = useState("");
    const [selectedRentalId, setSelectedRentalId] = useState("");

    const [pickupForm, setPickupForm] = useState(initialPickupForm);
    const [returnForm, setReturnForm] = useState(initialReturnForm);

    const [loading, setLoading] = useState(true);
    const [submittingPickup, setSubmittingPickup] = useState(false);
    const [submittingReturn, setSubmittingReturn] = useState(false);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState(null);

    const notify = useCallback((message, type = "success") => {
        setNotification({ message, type });
    }, []);

    const dismissNotification = useCallback(() => {
        setNotification(null);
    }, []);

    useEffect(() => {
        if (!notification) return undefined;
        const timeoutId = window.setTimeout(() => setNotification(null), 3000);
        return () => window.clearTimeout(timeoutId);
    }, [notification]);

   const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
        const [bookingResult, rentalResult, invoiceResult] = await Promise.all([
            apiRequest(`${API_URL}/rentals/pickup-bookings`),
            apiRequest(`${API_URL}/rentals/active`),
            apiRequest(`${API_URL}/invoices`),
        ]);

        setPickupBookings(getData(bookingResult).map(mapBooking));
        setActiveRentals(getData(rentalResult).map(mapRental));
        setInvoices(getData(invoiceResult).map(mapInvoice));
    } catch (err) {
        const message = err.message || "Unable to load rental data.";

        setError(message);
        notify(message, "error");

        console.error("Rental data loading error:", err);
    } finally {
        setLoading(false);
    }
}, [notify]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const selectedBooking = useMemo(
        () => pickupBookings.find((booking) => booking.id === selectedBookingId) || null,
        [pickupBookings, selectedBookingId]
    );

    const selectedRental = useMemo(
        () => activeRentals.find((rental) => rental.id === selectedRentalId) || null,
        [activeRentals, selectedRentalId]
    );

    const updatePickupForm = (event) => {
        const { name, value } = event.target;
        setPickupForm((previous) => ({ ...previous, [name]: value }));
    };

    const updateReturnForm = (event) => {
        const { name, value } = event.target;
        setReturnForm((previous) => ({ ...previous, [name]: value }));
    };

    const submitPickup = async (event) => {
        event.preventDefault();

        if (!selectedBooking) {
            notify("Please select a confirmed booking.", "error");
            return;
        }

        const odometer = Number(pickupForm.pickupOdometer);
        if (!Number.isInteger(odometer) || odometer < 0) {
            notify("Enter a valid pickup odometer.", "error");
            return;
        }

        setSubmittingPickup(true);
        try {
            await apiRequest(`${API_URL}/rentals/${selectedBooking.id}/pickup`, {
                method: "POST",
                body: JSON.stringify(pickupForm),
            });

            notify("Vehicle pickup submitted successfully.");
            setSelectedBookingId("");
            setPickupForm(initialPickupForm);
            await loadData();
        } catch (err) {
            notify(err.message, "error");
        } finally {
            setSubmittingPickup(false);
        }
    };

    const distanceTravelled = selectedRental
        ? Math.max(0, Number(returnForm.returnOdometer || 0) - selectedRental.pickupOdometer)
        : 0;

    const includedKm = selectedRental ? Math.max(1, selectedRental.totalDays) * 100 : 0;
    const extraKm = Math.max(0, distanceTravelled - includedKm);
    const extraKmRate = 10;
    const extraKmCharge = extraKm * extraKmRate;

    const fuelCharges = Number(returnForm.fuelCharges || 0);
    const lateCharges = Number(returnForm.lateCharges || 0);
    const damageCharges = Number(returnForm.damageCharges || 0);
    const discount = Number(returnForm.discount || 0);
    const tax = Number(returnForm.tax || 0);
    const paymentAmount = Number(returnForm.paymentAmount || 0);

    const subtotal = selectedRental
        ? selectedRental.rentalAmount + extraKmCharge + fuelCharges + lateCharges + damageCharges
        : 0;

    const finalAmount = Math.max(0, subtotal - discount + tax);
    const advanceAmount = selectedRental ? selectedRental.advanceAmount : 0;
    const remainingBeforePayment = Math.max(0, finalAmount - advanceAmount);
    const balanceAmount = Math.max(0, remainingBeforePayment - paymentAmount);

    const submitReturn = async (event) => {
        event.preventDefault();

        if (!selectedRental) {
            notify("Please select an active rental.", "error");
            return;
        }

        const returnKm = Number(returnForm.returnOdometer);
        if (!Number.isInteger(returnKm) || returnKm < selectedRental.pickupOdometer) {
            notify("Return odometer must be equal to or greater than pickup odometer.", "error");
            return;
        }

        const chargeValues = [fuelCharges, lateCharges, damageCharges, discount, tax];
        if (
            chargeValues.some((value) => !Number.isFinite(value) || value < 0) ||
            discount > subtotal
        ) {
            notify("Please check the additional charges.", "error");
            return;
        }

        // A zero-value invoice must never be generated.
        if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
            notify("Invoice amount is ₹0.00. Add a valid rental charge before completing the return. No invoice was generated.", "error");
            return;
        }

        if (!Number.isFinite(paymentAmount) || paymentAmount < 0) {
            notify("Enter a valid payment amount.", "error");
            return;
        }

        if (paymentAmount > remainingBeforePayment) {
            notify("Payment amount cannot exceed the outstanding balance.", "error");
            return;
        }

        if (
            paymentAmount > 0 &&
            ["UPI", "Card"].includes(returnForm.paymentMethod) &&
            !String(returnForm.paymentReference || "").trim()
        ) {
            notify(`Enter the ${returnForm.paymentMethod} transaction reference.`, "error");
            return;
        }

        setSubmittingReturn(true);
        try {
            const payload = {
                ...returnForm,
                returnOdometer: returnKm,
                fuelCharges,
                lateCharges,
                damageCharges,
                discount,
                tax,
                paymentAmount,
                paymentMethod: returnForm.paymentMethod || "Cash",
                paymentReference: String(returnForm.paymentReference || "").trim() || null,
            };

            const result = await apiRequest(`${API_URL}/rentals/${selectedRental.id}/return`, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const invoice = result.data?.invoice;
            notify(
                invoice
                    ? `Return completed. Invoice ${invoice.invoiceNumber} generated.`
                    : "Vehicle return completed."
            );

            setSelectedRentalId("");
            setReturnForm(initialReturnForm);
            await loadData();
        } catch (err) {
            notify(err.message, "error");
        } finally {
            setSubmittingReturn(false);
        }
    };

    const filteredInvoices = useMemo(() => {
        const searchText = invoiceSearch.toLowerCase().trim();
        const now = new Date();

        return invoices.filter((invoice) => {
            const searchableFields = [
                invoice.invoiceNumber,
                invoice.bookingCode,
                invoice.customerName,
                invoice.customerEmail,
                invoice.customerPhone,
                invoice.vehicleName,
                invoice.vehicleNumber,
            ];

            const matchesSearch =
                searchText === "" ||
                searchableFields.some((value) =>
                    String(value || "").toLowerCase().includes(searchText)
                );

            const matchesStatus =
                invoiceStatusFilter === "All" || invoice.status === invoiceStatusFilter;

            const invoiceDate = invoice.invoiceDate ? new Date(invoice.invoiceDate) : null;
            let matchesDate = true;

            if (invoiceDateFilter === "Today") {
                matchesDate =
                    invoiceDate &&
                    !Number.isNaN(invoiceDate.getTime()) &&
                    invoiceDate.toDateString() === now.toDateString();
            } else if (invoiceDateFilter === "This Month") {
                matchesDate =
                    invoiceDate &&
                    !Number.isNaN(invoiceDate.getTime()) &&
                    invoiceDate.getMonth() === now.getMonth() &&
                    invoiceDate.getFullYear() === now.getFullYear();
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [invoices, invoiceSearch, invoiceStatusFilter, invoiceDateFilter]);

    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((invoice) => invoice.status === "Paid").length;
    const partialInvoices = invoices.filter((invoice) => invoice.status === "Partially Paid").length;
    const unpaidInvoices = invoices.filter((invoice) => invoice.status === "Unpaid").length;
    const totalCollected = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
    const totalOutstanding = invoices.reduce((sum, invoice) => sum + invoice.balanceAmount, 0);
    const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);

    return {
        pickupBookings,
        selectedBookingId,
        setSelectedBookingId,
        selectedBooking,
        activeRentals,
        selectedRentalId,
        setSelectedRentalId,
        selectedRental,
        pickupForm,
        updatePickupForm,
        submitPickup,
        returnForm,
        updateReturnForm,
        submitReturn,
        distanceTravelled,
        includedKm,
        extraKm,
        extraKmRate,
        extraKmCharge,
        fuelCharges,
        lateCharges,
        damageCharges,
        discount,
        tax,
        subtotal,
        finalAmount,
        advanceAmount,
        remainingBeforePayment,
        paymentAmount,
        balanceAmount,
        invoices,
        filteredInvoices,
        invoiceSearch,
        setInvoiceSearch,
        invoiceStatusFilter,
        setInvoiceStatusFilter,
        invoiceDateFilter,
        setInvoiceDateFilter,
        totalInvoices,
        paidInvoices,
        partialInvoices,
        unpaidInvoices,
        totalCollected,
        totalOutstanding,
        totalInvoiceAmount,
        loading,
        submittingPickup,
        submittingReturn,
        error,
        notification,
        notify,
        dismissNotification,
        refresh: loadData,
    };
}
