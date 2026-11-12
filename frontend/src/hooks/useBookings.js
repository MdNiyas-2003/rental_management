
import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
);

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
        throw new Error(result.message || "Something went wrong");
    }

    return result;
}

const getData = (result) =>
    Array.isArray(result?.data) ? result.data : [];

const calculateDays = (pickup, returned) => {
    if (!pickup || !returned) return 0;

    const start = new Date(`${pickup}T00:00:00`); const end = new Date(`${returned}T00:00:00`);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return 0;
    }

    const difference = end.getTime() - start.getTime();

    return Math.max(
        0,
        Math.ceil(difference / (1000 * 60 * 60 * 24))
    );
};
const formatDateInput = (date) => {
    if (!date) return "";

    const value = String(date);

    // API ISO date: 2026-11-12T00:00:00.000Z
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.substring(0, 10);
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) return "";

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const mapBooking = (booking) => ({
    ...booking,
    customerName: booking.customer?.user?.name || "Unknown Customer",
    customerEmail: booking.customer?.user?.email || "",
    customerPhone: booking.customer?.phone || "",
    vehicleName: booking.vehicle?.name || "Unknown Vehicle",
    vehicleNumber: booking.vehicle?.number || "",
    pickupDateInput: formatDateInput(booking.pickupDate),
    returnDateInput: formatDateInput(booking.returnDate),
    totalAmount: Number(booking.totalAmount || 0),
    advanceAmount: Number(booking.advanceAmount || 0),
    dailyRate: Number(booking.dailyRate || 0),
});

const initialForm = {
    customerId: "",
    vehicleId: "",
    pickupDate: "",
    returnDate: "",
    pickupLocation: "",
    dropoffLocation: "",
    advanceAmount: "0",
    notes: "",
};

export default function useBookings() {
    const [bookings, setBookings] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [notification, setNotification] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [viewingBooking, setViewingBooking] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [form, setForm] = useState(initialForm);

    const showNotification = useCallback((message, type = "success") => {
        setNotification({ message, type });
    }, []);

    const dismissNotification = useCallback(() => {
        setNotification(null);
    }, []);

    useEffect(() => {
        if (!notification) return;

        const timer = window.setTimeout(() => {
            setNotification(null);
        }, 3000);

        return () => window.clearTimeout(timer);
    }, [notification]);

    const fetchBookings = useCallback(async () => {
        const result = await request(`${API_URL}/bookings`);
        setBookings(getData(result).map(mapBooking));
    }, []);

    const fetchCustomers = useCallback(async () => {
        const result = await request(`${API_URL}/customers`);
        setCustomers(getData(result));
    }, []);

    const fetchVehicles = useCallback(async () => {
        const result = await request(`${API_URL}/vehicles`);
        setVehicles(getData(result));
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            await Promise.all([
                fetchBookings(),
                fetchCustomers(),
                fetchVehicles(),
            ]);
        } catch (err) {
            setError(err.message);
            showNotification(err.message, "error");
        } finally {
            setLoading(false);
        }
    }, [
        fetchBookings,
        fetchCustomers,
        fetchVehicles,
        showNotification,
    ]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredBookings = useMemo(() => {
        const query = search.trim().toLowerCase();

        return bookings.filter((booking) => {
            const matchesSearch =
                !query ||
                booking.bookingId?.toLowerCase().includes(query) ||
                booking.customerName?.toLowerCase().includes(query) ||
                booking.customerEmail?.toLowerCase().includes(query) ||
                booking.vehicleName?.toLowerCase().includes(query) ||
                booking.vehicleNumber?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "All" ||
                booking.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [bookings, search, statusFilter]);

    const summary = useMemo(() => ({
        total: bookings.length,
        pending: bookings.filter((b) => b.status === "Pending").length,
        confirmed: bookings.filter((b) => b.status === "Confirmed").length,
        active: bookings.filter((b) => b.status === "Active").length,
        completed: bookings.filter((b) => b.status === "Completed").length,
    }), [bookings]);

    const totalDays = calculateDays(form.pickupDate, form.returnDate);

    const selectedVehicle = vehicles.find(
        (vehicle) => vehicle.id === form.vehicleId
    ) || null;

    const dailyRate = Number(selectedVehicle?.price || 0);
    const totalAmount = totalDays * dailyRate;

    const setField = (field, value) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const openCreateModal = () => {
        setEditingBooking(null);
        setViewingBooking(null);
        setForm(initialForm);
        setModalOpen(true);
    };

    const openEditModal = (booking) => {
        if (["Completed", "Cancelled", "Active"].includes(booking.status)) {
            showNotification(
                "This booking cannot be edited in its current status.",
                "error"
            );
            return;
        }

        setEditingBooking(booking);
        setViewingBooking(null);

        setForm({
            customerId: booking.customerId,
            vehicleId: booking.vehicleId,
            pickupDate: booking.pickupDateInput,
            returnDate: booking.returnDateInput,
            pickupLocation: booking.pickupLocation || "",
            dropoffLocation: booking.dropoffLocation || "",
            advanceAmount: String(booking.advanceAmount || 0),
            notes: booking.notes || "",
        });

        setModalOpen(true);
    };

    const openViewModal = (booking) => {
        setViewingBooking(booking);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingBooking(null);
        setViewingBooking(null);
        setForm(initialForm);
    };

    const saveBooking = async (event) => {
        event?.preventDefault();

        if (
            !form.customerId ||
            !form.vehicleId ||
            !form.pickupDate ||
            !form.returnDate
        ) {
            showNotification("Please fill all required fields.", "error");
            return;
        }

        const days = calculateDays(form.pickupDate, form.returnDate);

        if (days <= 0) {
            showNotification(
                "Return date must be after pickup date.",
                "error"
            );
            return;
        }

        const advance = Number(form.advanceAmount);

        if (!Number.isFinite(advance) || advance < 0) {
            showNotification("Enter a valid advance amount.", "error");
            return;
        }

        if (advance > totalAmount) {
            showNotification(
                "Advance cannot exceed the total booking amount.",
                "error"
            );
            return;
        }

        const payload = {
            customerId: form.customerId,
            vehicleId: form.vehicleId,
            pickupDate: form.pickupDate,
            returnDate: form.returnDate,
            pickupLocation: form.pickupLocation,
            dropoffLocation: form.dropoffLocation,
            advanceAmount: advance,
            notes: form.notes,
        };

        setSaving(true);

        try {
            if (editingBooking) {
                await request(
                    `${API_URL}/bookings/${editingBooking.id} `,
                    {
                        method: "PUT",
                        body: JSON.stringify(payload),
                    }
                );

                showNotification("Booking updated successfully.");
            } else {
                await request(`${API_URL}/bookings`, {
                    method: "POST",
                    body: JSON.stringify({
                        ...payload,
                        bookingSource: "ADMIN",
                    }),
                });

                showNotification("Booking created successfully.");
            }

            closeModal();
            await fetchBookings();
        } catch (err) {
            showNotification(err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (booking, status) => {
        if (
            status === "Cancelled" &&
            !window.confirm("Are you sure you want to cancel this booking?")
        ) {
            return;
        }

        try {
            await request(
                `${API_URL}/bookings/${booking.id}/status`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ status }),
                }
            );

            showNotification(
                `Booking ${status.toLowerCase()} successfully.`
            );

            await fetchBookings();
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);

        try {
            await request(
                `${API_URL}/bookings/${deleteTarget.id}`,
                { method: "DELETE" }
            );

            setBookings((current) =>
                current.filter((b) => b.id !== deleteTarget.id)
            );

            setDeleteTarget(null);
            showNotification("Booking deleted successfully.");
        } catch (err) {
            showNotification(err.message, "error");
        } finally {
            setDeleting(false);
        }
    };

    const availableVehicles = useMemo(
        () =>
            vehicles.filter((vehicle) =>
                vehicle.status === "Available" ||
                vehicle.id === editingBooking?.vehicleId
            ),
        [vehicles, editingBooking]
    );

    return {
        bookings,
        filteredBookings,
        customers,
        vehicles,
        availableVehicles,
        selectedVehicle,

        loading,
        saving,
        deleting,
        error,
        notification,

        search,
        setSearch,
        statusFilter,
        setStatusFilter,

        summary,
        form,
        setField,
        totalDays,
        dailyRate,
        totalAmount,

        modalOpen,
        editingBooking,
        viewingBooking,
        deleteTarget,
        setDeleteTarget,

        openCreateModal,
        openEditModal,
        openViewModal,
        closeModal,
        saveBooking,
        updateStatus,
        confirmDelete,
        loadData,
        dismissNotification,
    };
}