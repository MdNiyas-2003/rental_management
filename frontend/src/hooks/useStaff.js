import { useEffect, useMemo, useState } from "react";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
);

const emptyStaffForm = {
    name: "",
    email: "",
    password: "",
    employeeId: "",
    designation: "",
    phone: "",
    status: "Active",
};

function useStaff() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [viewStaff, setViewStaff] = useState(null);
    const [deleteStaff, setDeleteStaff] = useState(null);

    const [form, setForm] = useState({ ...emptyStaffForm });

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

    // COMMON API REQUEST
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

    // GET ALL STAFF
    const fetchStaff = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await apiRequest("/staff");

            setStaff(result.data || []);

            return true;
        } catch (error) {
            setError(error.message);
            showNotification(error.message, "error");

            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    // SEARCH AND FILTER
    const filteredStaff = useMemo(() => {
        return staff.filter((item) => {
            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                item.name?.toLowerCase().includes(searchText) ||
                item.email?.toLowerCase().includes(searchText) ||
                item.employeeId?.toLowerCase().includes(searchText) ||
                item.phone?.toLowerCase().includes(searchText) ||
                item.designation?.toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "All" ||
                item.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [staff, search, statusFilter]);

    const activeCount = staff.filter(
        (item) => item.status === "Active"
    ).length;

    const inactiveCount = staff.filter(
        (item) => item.status === "Inactive"
    ).length;

    // OPEN ADD MODAL
    const openAddModal = () => {
        setEditingStaff(null);
        setForm({ ...emptyStaffForm });
        setError("");
        setIsModalOpen(true);
    };

    // OPEN EDIT MODAL
    const openEditModal = (item) => {
        setEditingStaff(item);

        setForm({
            ...emptyStaffForm,
            ...item,
            password: "",
        });

        setError("");
        setIsModalOpen(true);
    };

    // CLOSE MODAL
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStaff(null);
        setError("");
    };

    // FORM CHANGE
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // CREATE / UPDATE STAFF
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const staffData = {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                employeeId: form.employeeId.trim().toUpperCase(),
                designation: form.designation.trim(),
                phone: form.phone?.trim() || "",
                status: form.status || "Active",
            };

            const isEditing = Boolean(editingStaff);

            if (isEditing) {
                if (form.password?.trim()) {
                    staffData.password = form.password;
                }

                await apiRequest(`/staff/${editingStaff.id}`, {
                    method: "PUT",
                    body: JSON.stringify(staffData),
                });
            } else {
                if (!form.password || form.password.length < 8) {
                    throw new Error(
                        "Password must be at least 8 characters"
                    );
                }

                staffData.password = form.password;

                await apiRequest("/staff", {
                    method: "POST",
                    body: JSON.stringify(staffData),
                });
            }

            await fetchStaff();
            closeModal();

            showNotification(
                isEditing
                    ? "Staff updated successfully"
                    : "Staff created successfully"
            );

        } catch (error) {
            setError(error.message);
            showNotification(error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    // OPEN DELETE CONFIRMATION
    const handleDelete = (item) => {
        const selectedStaff =
            typeof item === "object"
                ? item
                : staff.find((record) => record.id === item);

        if (!selectedStaff) return;

        setDeleteStaff(selectedStaff);
        setError("");
    };

    const cancelDelete = () => {
        if (deleting) return;
        setDeleteStaff(null);
    };

    // CONFIRM DELETE
    const confirmDelete = async () => {
        if (!deleteStaff || deleting) return;

        try {
            setDeleting(true);
            setError("");

            await apiRequest(`/staff/${deleteStaff.id}`, {
                method: "DELETE",
            });

            setStaff((previous) =>
                previous.filter((item) => item.id !== deleteStaff.id)
            );

            if (viewStaff?.id === deleteStaff.id) {
                setViewStaff(null);
            }

            setDeleteStaff(null);

            showNotification("Staff deleted successfully");

        } catch (error) {
            setError(error.message);
            showNotification(error.message, "error");
        } finally {
            setDeleting(false);
        }
    };

    return {
        staff,
        filteredStaff,

        search,
        setSearch,

        statusFilter,
        setStatusFilter,

        activeCount,
        inactiveCount,

        loading,
        saving,
        deleting,
        error,
        setError,
        fetchStaff,

        notification,
        showNotification,
        dismissNotification,

        isModalOpen,
        editingStaff,
        viewStaff,
        setViewStaff,
        deleteStaff,

        form,

        openAddModal,
        openEditModal,
        closeModal,
        handleChange,
        handleSubmit,

        handleDelete,
        confirmDelete,
        cancelDelete,
    };
}

export default useStaff;
