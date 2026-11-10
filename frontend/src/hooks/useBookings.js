import { useMemo, useState } from "react";
import {
    initialBookings,
    emptyBookingForm,
} from "../data/bookingData";

function useBookings() {
    const [bookings, setBookings] = useState(initialBookings);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [paymentFilter, setPaymentFilter] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [viewBooking, setViewBooking] = useState(null);

    const [form, setForm] = useState({ ...emptyBookingForm });

    // Search and filter bookings
    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                booking.bookingId.toLowerCase().includes(searchText) ||
                booking.customer.toLowerCase().includes(searchText) ||
                booking.vehicle.toLowerCase().includes(searchText) ||
                booking.registrationNumber.toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "All" ||
                booking.status === statusFilter;

            const matchesPayment =
                paymentFilter === "All" ||
                booking.paymentStatus === paymentFilter;

            return matchesSearch && matchesStatus && matchesPayment;
        });
    }, [bookings, search, statusFilter, paymentFilter]);

    // Summary counts
    const totalCount = bookings.length;

    const pendingCount = bookings.filter(
        (booking) => booking.status === "Pending"
    ).length;

    const confirmedCount = bookings.filter(
        (booking) => booking.status === "Confirmed"
    ).length;

    const activeCount = bookings.filter(
        (booking) => booking.status === "Active"
    ).length;

    const cancellationCount = bookings.filter(
        (booking) => booking.status === "Cancellation Requested"
    ).length;

    // Open Add Modal
    const openAddModal = () => {
        setEditingBooking(null);
        setForm({ ...emptyBookingForm });
        setIsModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (booking) => {
        setEditingBooking(booking);
        setForm({ ...booking });
        setIsModalOpen(true);
    };

    // Close Modal
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBooking(null);
    };

    // Form changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Calculate rental days
    const calculateDays = (pickupDate, returnDate) => {
        if (!pickupDate || !returnDate) return 0;

        const pickup = new Date(`${ pickupDate }T00:00:00`); const returned = new Date(`${ returnDate }T00:00:00`);

        const difference = returned - pickup;

        return difference > 0
            ? Math.ceil(difference / (1000 * 60 * 60 * 24))
            : 0;
    };

    // Save booking
    const handleSubmit = (e) => {
        e.preventDefault();

        const totalDays = calculateDays(
            form.pickupDate,
            form.returnDate
        );

        if (totalDays <= 0) {
            alert("Return date must be after pickup date.");
            return;
        }

        const bookingData = {
            ...form,
            totalDays,
            totalAmount: Number(form.totalAmount),
        };

        if (editingBooking) {
            setBookings((previous) =>
                previous.map((booking) =>
                    booking.id === editingBooking.id
                        ? { ...bookingData, id: editingBooking.id }
                        : booking
                )
            );
        } else {
            setBookings((previous) => [
                {
                    ...bookingData,
                    id: Date.now(),
                    bookingId: `BK - ${ Date.now() }`,
},
...previous,
 ]);
}

closeModal();
};

// Delete booking
const handleDelete = (id) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this booking?"
    );

    if (!confirmed) return;

    setBookings((previous) =>
        previous.filter((booking) => booking.id !== id)
    );
};

// Update booking status
const updateBookingStatus = (id, newStatus) => {
    setBookings((previous) =>
        previous.map((booking) =>
            booking.id === id
                ? { ...booking, status: newStatus }
                : booking
        )
    );
};

// Admin cancellation approval
const approveCancellation = (id) => {
    const confirmed = window.confirm(
        "Are you sure you want to approve this cancellation?"
    );

    if (!confirmed) return;

    updateBookingStatus(id, "Cancelled");
};

return {
    bookings,
    filteredBookings,

    search,
    setSearch,

    statusFilter,
    setStatusFilter,

    paymentFilter,
    setPaymentFilter,

    totalCount,
    pendingCount,
    confirmedCount,
    activeCount,
    cancellationCount,

    isModalOpen,
    editingBooking,
    viewBooking,
    setViewBooking,

    form,
    openAddModal,
    openEditModal,
    closeModal,
    handleChange,
    handleSubmit,
    handleDelete,
    updateBookingStatus,
    approveCancellation,
};
}

export default useBookings;
