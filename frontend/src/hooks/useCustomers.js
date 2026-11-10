import { useMemo, useState } from "react";
import {
    initialCustomers,
    emptyCustomerForm,
} from "../data/customerData";

function useCustomers() {
    const [customers, setCustomers] = useState(initialCustomers);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [viewCustomer, setViewCustomer] = useState(null);
    const [form, setForm] = useState({ ...emptyCustomerForm });

    const filteredCustomers = useMemo(() => {
        return customers.filter((customer) => {
            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                customer.name.toLowerCase().includes(searchText) ||
                customer.phone.includes(searchText) ||
                customer.email.toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "All" ||
                customer.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [customers, search, statusFilter]);

    const activeCount = customers.filter(
        (customer) => customer.status === "Active"
    ).length;

    const inactiveCount = customers.filter(
        (customer) => customer.status === "Inactive"
    ).length;

    const openAddModal = () => {
        setEditingCustomer(null);
        setForm({ ...emptyCustomerForm });
        setIsModalOpen(true);
    };

    const openEditModal = (customer) => {
        setEditingCustomer(customer);
        setForm({ ...customer });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingCustomer) {
            setCustomers((previous) =>
                previous.map((customer) =>
                    customer.id === editingCustomer.id
                        ? { ...form, id: editingCustomer.id }
                        : customer
                )
            );
        } else {
            setCustomers((previous) => [
                { ...form, id: Date.now() },
                ...previous,
            ]);
        }

        closeModal();
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this customer?"
        );

        if (!confirmed) return;

        setCustomers((previous) =>
            previous.filter((customer) => customer.id !== id)
        );
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
        isModalOpen,
        editingCustomer,
        viewCustomer,
        setViewCustomer,
        form,
        openAddModal,
        openEditModal,
        closeModal,
        handleChange,
        handleSubmit,
        handleDelete,
    };
}

export default useCustomers;
