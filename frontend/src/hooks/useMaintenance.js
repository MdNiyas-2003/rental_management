
import { useEffect, useMemo, useState } from "react";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
);

const initialForm = {
    vehicleId: "",
    serviceType: "Periodic Service",
    serviceDate: "",
    nextServiceDate: "",
    odometer: "",
    serviceProvider: "",
    cost: "",
    status: "Scheduled",
    description: "",
};

const mapRecord = (record) => ({
    ...record,
    vehicle: record.vehicle?.name || "",
    registrationNumber: record.vehicle?.number || "",
    serviceDate: record.serviceDate?.slice(0, 10) || "",
    nextServiceDate: record.nextServiceDate?.slice(0, 10) || "",
    cost: Number(record.cost || 0),
});

export default function useMaintenance() {
    const [records, setRecords] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const [notification, setNotification] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [serviceFilter, setServiceFilter] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [form, setForm] = useState({ ...initialForm });
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [deleteRecord, setDeleteRecord] = useState(null);

    // NOTIFICATION
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

    // API RESPONSE HANDLER
    const readResponse = async (response) => {
        const text = await response.text();

        let result;

        try {
            result = JSON.parse(text);
        } catch {
            throw new Error(
                "Invalid API response. Please check backend API URL."
            );
        }

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Request failed");
        }

        return result;
    };

    // FETCH MAINTENANCE AND VEHICLES
    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [maintenanceResponse, vehicleResponse] =
                await Promise.all([
                    fetch(`${API_URL}/maintenance`), fetch(`${API_URL}/vehicles`),
                ]);

            const maintenanceResult = await readResponse(
                maintenanceResponse
            );

            const vehicleResult = await readResponse(vehicleResponse);

            setRecords(
                (maintenanceResult.data || []).map(mapRecord)
            );

            setVehicles(vehicleResult.data || []);
        } catch (err) {
            console.error("Maintenance fetch error:", err);

            setError(err.message || "Unable to load maintenance records");

            showNotification(
                err.message || "Unable to load maintenance records",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // SEARCH AND FILTER
    const filteredRecords = useMemo(() => {
        return records.filter((record) => {
            const searchText = search.toLowerCase();

            const matchesSearch =
                (record.maintenanceId || "")
                    .toLowerCase()
                    .includes(searchText) ||
                (record.vehicle || "")
                    .toLowerCase()
                    .includes(searchText) ||
                (record.registrationNumber || "")
                    .toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "All" ||
                record.status === statusFilter;

            const matchesService =
                serviceFilter === "All" ||
                record.serviceType === serviceFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesService
            );
        });
    }, [records, search, statusFilter, serviceFilter]);

    // SUMMARY COUNTS
    const totalRecords = records.length;

    const scheduledCount = records.filter(
        (record) => record.status === "Scheduled"
    ).length;

    const inProgressCount = records.filter(
        (record) => record.status === "In Progress"
    ).length;

    const completedCount = records.filter(
        (record) => record.status === "Completed"
    ).length;

    const totalCost = records.reduce(
        (total, record) => total + Number(record.cost || 0),
        0
    );

    // ADD MODAL
    const openAddModal = () => {
        setModalMode("add");
        setForm({ ...initialForm });
        setSelectedRecord(null);
        setIsModalOpen(true);
    };

    // EDIT MODAL
    const openEditModal = (record) => {
        setModalMode("edit");

        setForm({
            vehicleId: record.vehicleId,
            serviceType: record.serviceType,
            serviceDate: record.serviceDate,
            nextServiceDate: record.nextServiceDate || "",
            odometer: String(record.odometer),
            serviceProvider: record.serviceProvider,
            cost: String(record.cost),
            status: record.status,
            description: record.description || "",
        });

        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    // VIEW MODAL
    const openViewModal = (record) => {
        setSelectedRecord(record);
        setModalMode("view");
        setIsModalOpen(true);
    };

    // CLOSE MODAL
    const closeModal = () => {
        if (saving) return;

        setIsModalOpen(false);
        setSelectedRecord(null);
    };

    // FORM CHANGE
    const handleChange = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    // CREATE / UPDATE
    const submitMaintenance = async (event) => {
        event.preventDefault();

        if (
            !form.vehicleId ||
            !form.serviceDate ||
            !form.serviceProvider.trim() ||
            form.odometer === "" ||
            form.cost === ""
        ) {
            showNotification(
                "Please fill all required fields.",
                "error"
            );
            return;
        }

        if (
            !Number.isInteger(Number(form.odometer)) ||
            Number(form.odometer) < 0 ||
            !Number.isFinite(Number(form.cost)) ||
            Number(form.cost) < 0
        ) {
            showNotification(
                "Enter valid odometer and service cost.",
                "error"
            );
            return;
        }

        if (
            form.nextServiceDate &&
            form.nextServiceDate < form.serviceDate
        ) {
            showNotification(
                "Next service date cannot be before service date.",
                "error"
            );
            return;
        }

        const payload = {
            ...form,
            odometer: Number(form.odometer),
            cost: Number(form.cost),
            nextServiceDate: form.nextServiceDate || null,
        };

        try {
            setSaving(true);
            setError("");

            const isEdit = modalMode === "edit";

            const url = isEdit
                ? `${API_URL}/maintenance/${selectedRecord.id}` : `${API_URL}/maintenance`;

            const response = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await readResponse(response);
            const savedRecord = mapRecord(result.data);

            if (isEdit) {
                setRecords((previous) =>
                    previous.map((record) =>
                        record.id === savedRecord.id
                            ? savedRecord
                            : record
                    )
                );

                showNotification(
                    "Maintenance record updated successfully."
                );
            } else {
                setRecords((previous) => [
                    savedRecord,
                    ...previous,
                ]);

                showNotification(
                    "Maintenance record created successfully."
                );
            }

            setIsModalOpen(false);
            setSelectedRecord(null);
        } catch (err) {
            console.error("Save maintenance error:", err);

            showNotification(
                err.message || "Failed to save maintenance record.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    // DELETE CONFIRMATION
    const handleDelete = (record) => {
        setDeleteRecord(record);
    };

    const cancelDelete = () => {
        if (deleting) return;
        setDeleteRecord(null);
    };

    // CONFIRM DELETE
    const confirmDelete = async () => {
        if (!deleteRecord) return;

        try {
            setDeleting(true);

            const response = await fetch(
                `${API_URL}/maintenance/${deleteRecord.id}`,
                {
                    method: "DELETE",
                }
            );

            await readResponse(response);

            setRecords((previous) =>
                previous.filter(
                    (record) => record.id !== deleteRecord.id
                )
            );

            setDeleteRecord(null);

            showNotification(
                "Maintenance record deleted successfully."
            );
        } catch (err) {
            console.error("Delete maintenance error:", err);

            showNotification(
                err.message || "Failed to delete maintenance record.",
                "error"
            );
        } finally {
            setDeleting(false);
        }
    };

    return {
        records,
        filteredRecords,
        vehicles,

        loading,
        saving,
        deleting,
        error,
        fetchData,

        notification,
        dismissNotification,

        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        serviceFilter,
        setServiceFilter,

        totalRecords,
        scheduledCount,
        inProgressCount,
        completedCount,
        totalCost,

        isModalOpen,
        modalMode,
        form,
        selectedRecord,

        openAddModal,
        openEditModal,
        openViewModal,
        closeModal,
        handleChange,
        submitMaintenance,

        deleteRecord,
        handleDelete,
        confirmDelete,
        cancelDelete,
    };
}