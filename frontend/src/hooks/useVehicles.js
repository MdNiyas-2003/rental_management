import { useEffect, useMemo, useState } from "react";
import { emptyVehicleForm } from "../data/vehicleData";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function useVehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);

    const [notification, setNotification] = useState(null);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [viewVehicle, setViewVehicle] = useState(null);
    const [deleteVehicle, setDeleteVehicle] = useState(null);

    const [form, setForm] = useState({ ...emptyVehicleForm });

    // Compact top notification
    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
    };

    const dismissNotification = () => {
        setNotification(null);
    };

    useEffect(() => {
        if (!notification) return;

        const timer = setTimeout(() => {
            setNotification(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [notification]);

    // Common API request
    const apiRequest = async (url, options = {}) => {
        const response = await fetch(`${API_URL}${url}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Something went wrong");
        }

        return result;
    };

    // GET all vehicles
    const fetchVehicles = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await apiRequest("/vehicles");
            setVehicles(result.data || []);

            return true;
        } catch (error) {
            setError(error.message);
            showNotification(error.message || "Failed to load vehicles", "error");

            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    // Search and filters
    const filteredVehicles = useMemo(() => {
        return vehicles.filter((vehicle) => {
            const searchText = search.toLowerCase();

            const matchesSearch =
                vehicle.name.toLowerCase().includes(searchText) ||
                vehicle.number.toLowerCase().includes(searchText);

            const matchesCategory =
                categoryFilter === "All" ||
                vehicle.category === categoryFilter;

            const matchesStatus =
                statusFilter === "All" ||
                vehicle.status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [vehicles, search, categoryFilter, statusFilter]);

    // Summary counts
    const availableCount = vehicles.filter(
        (v) => v.status === "Available"
    ).length;

    const rentedCount = vehicles.filter(
        (v) => v.status === "Rented"
    ).length;

    const maintenanceCount = vehicles.filter(
        (v) => v.status === "Maintenance"
    ).length;

    // Add vehicle
    const openAddModal = () => {
        setEditingVehicle(null);
        setForm({ ...emptyVehicleForm });
        setError("");
        setIsModalOpen(true);
    };

    // Edit vehicle
    const openEditModal = (vehicle) => {
        setEditingVehicle(vehicle);
        setForm({ ...vehicle });
        setError("");
        setIsModalOpen(true);
    };

    // Close form modal
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
        setError("");
    };

    // Form changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // CREATE / UPDATE
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const vehicleData = {
                name: form.name.trim(),
                number: form.number.trim().toUpperCase(),
                category: form.category,
                fuel: form.fuel,
                seats: Number(form.seats),
                price: Number(form.price),
                status: form.status,
            };

            const isEditing = Boolean(editingVehicle);

            if (isEditing) {
                await apiRequest(`/vehicles/${editingVehicle.id}`, {
                    method: "PUT",
                    body: JSON.stringify(vehicleData),
                });
            } else {
                await apiRequest("/vehicles", {
                    method: "POST",
                    body: JSON.stringify(vehicleData),
                });
            }

            await fetchVehicles();
            closeModal();

            showNotification(
                isEditing
                    ? "Vehicle updated successfully"
                    : "Vehicle added successfully"
            );
        } catch (error) {
            setError(error.message);
            showNotification(error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    // Open delete confirmation
    const handleDelete = (vehicle) => {
        setDeleteVehicle(vehicle);
        setError("");
    };

    // Cancel delete
    const cancelDelete = () => {
        if (deleting) return;
        setDeleteVehicle(null);
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (!deleteVehicle || deleting) return;

        try {
            setDeleting(true);
            setError("");

            await apiRequest(`/vehicles/${deleteVehicle.id}`, {
                method: "DELETE",
            });

            setVehicles((previous) =>
                previous.filter(
                    (vehicle) => vehicle.id !== deleteVehicle.id
                )
            );

            if (viewVehicle?.id === deleteVehicle.id) {
                setViewVehicle(null);
            }

            setDeleteVehicle(null);
            showNotification("Vehicle deleted successfully");
        } catch (error) {
            setError(error.message);
            showNotification(error.message, "error");
        } finally {
            setDeleting(false);
        }
    };

    return {
        vehicles,
        filteredVehicles,

        search,
        setSearch,

        categoryFilter,
        setCategoryFilter,

        statusFilter,
        setStatusFilter,

        availableCount,
        rentedCount,
        maintenanceCount,

        loading,
        saving,
        error,
        setError,
        fetchVehicles,

        notification,
        showNotification,
        dismissNotification,

        isModalOpen,
        editingVehicle,
        viewVehicle,
        setViewVehicle,
        deleteVehicle,

        form,

        openAddModal,
        openEditModal,
        closeModal,
        handleChange,
        handleSubmit,

        handleDelete,
        confirmDelete,
        cancelDelete,
        deleting,
    };
}

export default useVehicles;