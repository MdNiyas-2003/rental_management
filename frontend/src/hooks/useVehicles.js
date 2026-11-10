import { useMemo, useState } from "react";

import {
    initialVehicles,
    emptyVehicleForm,
} from "../data/vehicleData";

function useVehicles() {
    const [vehicles, setVehicles] = useState(initialVehicles);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [viewVehicle, setViewVehicle] = useState(null);

    const [form, setForm] = useState(emptyVehicleForm);

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
        (vehicle) => vehicle.status === "Available"
    ).length;

    const rentedCount = vehicles.filter(
        (vehicle) => vehicle.status === "Rented"
    ).length;

    const maintenanceCount = vehicles.filter(
        (vehicle) => vehicle.status === "Maintenance"
    ).length;

    // Add vehicle
    const openAddModal = () => {
        setEditingVehicle(null);
        setForm({ ...emptyVehicleForm });
        setIsModalOpen(true);
    };

    // Edit vehicle
    const openEditModal = (vehicle) => {
        setEditingVehicle(vehicle);
        setForm({ ...vehicle });
        setIsModalOpen(true);
    };

    // Close form modal
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
    };

    // Form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Save or update
    const handleSubmit = (e) => {
        e.preventDefault();

        const vehicleData = {
            ...form,
            seats: Number(form.seats),
            price: Number(form.price),
        };

        if (editingVehicle) {
            setVehicles((previous) =>
                previous.map((vehicle) =>
                    vehicle.id === editingVehicle.id
                        ? { ...vehicleData, id: editingVehicle.id }
                        : vehicle
                )
            );
        } else {
            const newVehicle = {
                ...vehicleData,
                id: Date.now(),
            };

            setVehicles((previous) => [newVehicle, ...previous]);
        }

        closeModal();
    };

    // Delete vehicle
    const handleDelete = (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this vehicle?"
        );

        if (!confirmed) return;

        setVehicles((previous) =>
            previous.filter((vehicle) => vehicle.id !== id)
        );
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

        isModalOpen,
        editingVehicle,
        viewVehicle,
        setViewVehicle,

        form,

        openAddModal,
        openEditModal,
        closeModal,
        handleChange,
        handleSubmit,
        handleDelete,
    };
}

export default useVehicles;
