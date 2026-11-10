import { useMemo, useState } from "react";
import { initialStaff, emptyStaffForm } from "../data/staffData";

function useStaff() {
    const [staff, setStaff] = useState(initialStaff);

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [viewStaff, setViewStaff] = useState(null);

    const [form, setForm] = useState({ ...emptyStaffForm });

    const filteredStaff = useMemo(() => {
        return staff.filter((employee) => {
            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                employee.name.toLowerCase().includes(searchText) ||
                employee.employeeId.toLowerCase().includes(searchText) ||
                employee.phone.includes(searchText) ||
                employee.email.toLowerCase().includes(searchText);

            const matchesRole =
                roleFilter === "All" || employee.role === roleFilter;

            const matchesStatus =
                statusFilter === "All" || employee.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [staff, search, roleFilter, statusFilter]);

    const activeCount = staff.filter(
        (employee) => employee.status === "Active"
    ).length;

    const inactiveCount = staff.filter(
        (employee) => employee.status === "Inactive"
    ).length;

    const openAddModal = () => {
        setEditingStaff(null);
        setForm({ ...emptyStaffForm });
        setIsModalOpen(true);
    };

    const openEditModal = (employee) => {
        setEditingStaff(employee);
        setForm({ ...employee });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStaff(null);
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

        if (editingStaff) {
            setStaff((previous) =>
                previous.map((employee) =>
                    employee.id === editingStaff.id
                        ? { ...form, id: editingStaff.id }
                        : employee
                )
            );
        } else {
            setStaff((previous) => [
                { ...form, id: Date.now() },
                ...previous,
            ]);
        }

        closeModal();
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this staff member?"
        );

        if (!confirmed) return;

        setStaff((previous) =>
            previous.filter((employee) => employee.id !== id)
        );
    };

    return {
        staff,
        filteredStaff,
        search,
        setSearch,
        roleFilter,
        setRoleFilter,
        statusFilter,
        setStatusFilter,
        activeCount,
        inactiveCount,
        isModalOpen,
        editingStaff,
        viewStaff,
        setViewStaff,
        form,
        openAddModal,
        openEditModal,
        closeModal,
        handleChange,
        handleSubmit,
        handleDelete,
    };
}

export default useStaff;