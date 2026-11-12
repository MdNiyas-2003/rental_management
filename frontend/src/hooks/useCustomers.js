import { useEffect, useMemo, useState } from "react";
import { emptyCustomerForm } from "../data/customerData";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
);

function useCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [viewCustomer, setViewCustomer] = useState(null);
    const [deleteCustomer, setDeleteCustomer] = useState(null);

    const [form, setForm] = useState({
        ...emptyCustomerForm,
        password: "",
    });

    // Notifications
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

    // GET ALL CUSTOMERS
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await apiRequest("/customers");

            setCustomers(result.data || []);

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
        fetchCustomers();
    }, []);

    // SEARCH AND STATUS FILTER
    const filteredCustomers = useMemo(() => {
        return customers.filter((customer) => {
            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                customer.name?.toLowerCase().includes(searchText) ||
                customer.phone?.toLowerCase().includes(searchText) ||
                customer.email?.toLowerCase().includes(searchText) ||
                customer.licenseNumber?.toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "All" ||
                customer.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [customers, search, statusFilter]);

    // SUMMARY COUNTS
    const activeCount = customers.filter(
        (customer) => customer.status === "Active"
    ).length;

    const inactiveCount = customers.filter(
        (customer) => customer.status === "Inactive"
    ).length;

    // OPEN ADD MODAL
    const openAddModal = () => {
        setEditingCustomer(null);
        setForm({
            ...emptyCustomerForm,
            password: "",
        });
        setError("");
        setIsModalOpen(true);
    };

    // OPEN EDIT MODAL
    const openEditModal = (customer) => {
        setEditingCustomer(customer);

        setForm({
            ...emptyCustomerForm,
            ...customer,
            password: "",
        });

        setError("");
        setIsModalOpen(true);
    };

    // CLOSE MODAL
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
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

    // CREATE / UPDATE CUSTOMER
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const customerData = {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone?.trim() || "",
                licenseNumber: form.licenseNumber?.trim() || "",
                address: form.address?.trim() || "",
                status: form.status || "Active",
            };

            const isEditing = Boolean(editingCustomer);

            if (isEditing) {
                if (form.password?.trim()) {
                    customerData.password = form.password;
                }

                await apiRequest(
                    `/customers/${editingCustomer.id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(customerData),
                    }
                );
            } else {
                if (!form.password || form.password.length < 8) {
                    throw new Error(
                        "Password must be at least 8 characters"
                    );
                }

                customerData.password = form.password;

                await apiRequest("/customers", {
                    method: "POST",
                    body: JSON.stringify(customerData),
                });
            }

            await fetchCustomers();
            closeModal();

            showNotification(
                isEditing
                    ? "Customer updated successfully"
                    : "Customer created successfully"
            );

        } catch (error) {
            setError(error.message);
            showNotification(error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    // OPEN DELETE CONFIRMATION
    const handleDelete = (customer) => {
        const selectedCustomer =
            typeof customer === "object"
                ? customer
                : customers.find((item) => item.id === customer);

        if (!selectedCustomer) return;

        setDeleteCustomer(selectedCustomer);
        setError("");
    };

    // CANCEL DELETE
    const cancelDelete = () => {
        if (deleting) return;
        setDeleteCustomer(null);
    };

    // CONFIRM DELETE
    const confirmDelete = async () => {
        if (!deleteCustomer || deleting) return;

        try {
            setDeleting(true);
            setError("");

            await apiRequest(`/customers/${deleteCustomer.id}`, {
                method: "DELETE",
            });

            setCustomers((previous) =>
                previous.filter(
                    (customer) => customer.id !== deleteCustomer.id
                )
            );

            if (viewCustomer?.id === deleteCustomer.id) {
                setViewCustomer(null);
            }

            setDeleteCustomer(null);

            showNotification("Customer deleted successfully");

        } catch (error) {
            setError(error.message);
            showNotification(error.message, "error");
        } finally {
            setDeleting(false);
        }
    };

    return {
        customers,
        filteredCustomers,

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
        fetchCustomers,

        notification,
        showNotification,
        dismissNotification,

        isModalOpen,
        editingCustomer,
        viewCustomer,
        setViewCustomer,
        deleteCustomer,

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

export default useCustomers;
