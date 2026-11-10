import { useMemo, useState } from "react";
import {
initialMaintenanceRecords,
emptyMaintenanceForm,
} from "../data/maintenanceData";

export default function useMaintenance() {
const [records, setRecords] = useState(initialMaintenanceRecords);
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("All");
const [serviceFilter, setServiceFilter] = useState("All");

const [isModalOpen, setIsModalOpen] = useState(false);
const [modalMode, setModalMode] = useState("add");
const [form, setForm] = useState(emptyMaintenanceForm);
const [selectedRecord, setSelectedRecord] = useState(null);

const filteredRecords = useMemo(() => {
return records.filter((record) => {
const searchText = search.toLowerCase();

const matchesSearch =
record.vehicle.toLowerCase().includes(searchText) ||
record.registrationNumber.toLowerCase().includes(searchText) ||
record.maintenanceId.toLowerCase().includes(searchText);

const matchesStatus =
statusFilter === "All" || record.status === statusFilter;

const matchesService =
serviceFilter === "All" || record.serviceType === serviceFilter;

return matchesSearch && matchesStatus && matchesService;
});
}, [records, search, statusFilter, serviceFilter]);

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

const openAddModal = () => {
setModalMode("add");
setForm(emptyMaintenanceForm);
setSelectedRecord(null);
setIsModalOpen(true);
};

const openEditModal = (record) => {
setModalMode("edit");
setForm({ ...record });
setSelectedRecord(record);
setIsModalOpen(true);
};

const openViewModal = (record) => {
setSelectedRecord(record);
setModalMode("view");
setIsModalOpen(true);
};

const closeModal = () => {
setIsModalOpen(false);
setSelectedRecord(null);
};

const handleChange = (field, value) => {
setForm((previous) => ({
...previous,
[field]: value,
}));
};

const submitMaintenance = (event) => {
event.preventDefault();

if (
!form.vehicle ||
!form.registrationNumber ||
!form.serviceDate ||
!form.serviceProvider ||
!form.odometer ||
form.cost === ""
) {
alert("Please fill all required fields.");
return;
}

if (Number(form.odometer) < 0 || Number(form.cost) < 0) {
alert("Odometer and cost cannot be negative.");
return;
}

if (
form.nextServiceDate &&
form.nextServiceDate < form.serviceDate
) {
alert("Next service date cannot be before service date.");
return;
}

if (modalMode === "edit" && selectedRecord) {
setRecords((previous) =>
previous.map((record) =>
record.id === selectedRecord.id
? {
...record,
...form,
odometer: Number(form.odometer),
cost: Number(form.cost),
}
: record
)
);
} else {
const newRecord = {
...form,
id: Date.now(),
maintenanceId: `MNT-${Date.now()}`,
odometer: Number(form.odometer),
cost: Number(form.cost),
};

setRecords((previous) => [newRecord, ...previous]);
}

closeModal();
};

const deleteMaintenance = (id) => {
const confirmed = window.confirm(
"Are you sure you want to delete this maintenance record?"
);

if (!confirmed) return;

setRecords((previous) =>
previous.filter((record) => record.id !== id)
);
};

return {
records,
filteredRecords,
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
deleteMaintenance,
};
}