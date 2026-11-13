import {
    CarFront,
    KeyRound,
    Receipt,
    Eye,
    CreditCard,
    Plus,
    CheckCircle,
    Printer,
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import useInvoices from "../hooks/useInvoice";

function Invoices() {
    const {
        activeTab,
        setActiveTab,

        pickupBookings,
        activeRentals,
        selectedBooking,
        selectedRental,
        selectedBookingId,
        setSelectedBookingId,
        selectedRecordId,
        setSelectedRecordId,

        pickupForm,
        handlePickupChange,
        pickupTotal,
        pickupBalance,
        submitPickup,

        returnForm,
        handleReturnChange,
        distanceTravelled,
        includedKm,
        extraKm,
        extraKmRate,
        extraKmAmount,
        fuelDifference,
        returnTotal,
        submitReturn,

        records,
        filteredRecords,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        paymentFilter,
        setPaymentFilter,

        totalInvoices,
        paidCount,
        partialCount,
        unpaidCount,
        totalCollected,
        totalOutstanding,

        viewRecord,
        setViewRecord,
        paymentRecord,
        paymentAmount,
        setPaymentAmount,
        paymentMethod,
        setPaymentMethod,
        paymentReference,
        setPaymentReference,
        openPayment,
        closePayment,
        submitPayment,

        formatCurrency,
    } = useInvoices();

    const inputClass =
        "h-9 w-full rounded-md border border-gray-300 px-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100";

    const labelClass =
        "mb-1 block text-xs font-medium text-gray-600";

    const paymentStyle = {
        Paid: "bg-green-100 text-green-700",
        Partial: "bg-amber-100 text-amber-700",
        Unpaid: "bg-red-100 text-red-700",
    };

    const tabs = [
        { id: "pickup", label: "Vehicle Pickup", icon: CarFront },
        { id: "return", label: "Vehicle Return", icon: KeyRound },
        { id: "invoices", label: "Invoices", icon: Receipt },
    ];

    const columns = [
        {
            key: "invoiceNumber",
            label: "Invoice No.",
            render: (value, record) => (
                <div>
                    <p className="font-semibold text-blue-600">
                        {value || "Pending"}
                    </p>
                    <p className="text-xs text-gray-500">
                        {record.bookingId}
                    </p>
                </div>
            ),
        },
        {
            key: "customer",
            label: "Customer",
        },
        {
            key: "vehicle",
            label: "Vehicle",
            render: (value, record) => (
                <div>
                    <p className="font-medium text-gray-800">{value}</p>
                    <p className="text-xs text-gray-500">
                        {record.registrationNumber}
                    </p>
                </div>
            ),
        },
        {
            key: "rentalStatus",
            label: "Status",
            render: (value) => (
                <span className={`rounded - full px-3 py-1 text-xs font-semibold ${value === "Pickup"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`} > {value} </span>),
        },
        {
            key: "finalAmount",
            label: "Total",
            render: (value, record) => (<span className="font-semibold" >
                {formatCurrency(value ?? record.estimatedAmount)} </span>),
        },
        { key: "paidAmount", label: "Paid", render: (value) => (<span className="font-semibold text-green-600" > {formatCurrency(value)} </span>), },
        { key: "balanceAmount", label: "Balance", render: (value) => (<span className="font-semibold text-red-600"> {formatCurrency(value)} </span>), },
        {
            key: "paymentStatus", label: "Payment", render: (value) => (<span className={`rounded- full px - 3 py - 1 text - xs font - semibold ${paymentStyle[value]} `}>
                {value}
            </span >
            ),
        },
        {
            key: "id",
            label: "Actions",
            render: (_, record) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setViewRecord(record)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        title="View"
                    >
                        <Eye size={17} />
                    </button>

                    {record.balanceAmount > 0 && (
                        <button
                            onClick={() => openPayment(record)}
                            className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                            title="Record payment"
                        >
                            <CreditCard size={17} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="min-w-0 space-y-4 font-sans text-sm">

                {/* Page Header */}
                <div>
                    <h1 className="text-xl font-bold text-gray-800">
                        Rental & Invoice Management
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage vehicle pickup, return and customer payments.
                    </p>
                </div>

                {/* Three Tabs */}
                <div className="grid w-full grid-cols-3 gap-1 rounded-xl border border-gray-200 bg-white p-1 sm:inline-flex sm:w-fit">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`inline-flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg px-1.5 text-[11px] font-semibold transition sm:px-4 sm:text-xs ${isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                <Icon size={15} />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">
                                    {tab.id === "pickup" ? "Pickup" : tab.id === "return" ? "Return" : "Invoices"}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* ================= PICKUP TAB ================= */}
                {activeTab === "pickup" && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="mb-3">
                            <h2 className="text-base font-semibold text-gray-800">
                                Vehicle Pickup Details
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Select a confirmed booking and record the vehicle handover.
                            </p>
                        </div>

                        <form onSubmit={submitPickup} className="space-y-4">

                            <div>
                                <label className={labelClass}>Select Confirmed Booking</label>
                                <select
                                    value={selectedBookingId}
                                    onChange={(e) => setSelectedBookingId(e.target.value)}
                                    required
                                    className={inputClass}
                                >
                                    <option value="">Select booking</option>
                                    {pickupBookings.map((booking) => (
                                        <option key={booking.id} value={booking.bookingId}>
                                            {booking.bookingId} - {booking.customer} - {booking.vehicle}
                                        </option>
                                    ))}
                                </select>

                                {pickupBookings.length === 0 && (
                                    <p className="mt-2 text-sm text-amber-600">
                                        No confirmed bookings available for pickup.
                                    </p>
                                )}
                            </div>

                            {selectedBooking && (
                                <>
                                    <div className="rounded-md bg-blue-50 p-3">
                                        <h3 className="mb-2 text-sm font-semibold text-blue-900">
                                            Booking & Customer Details
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                            <p><span className="text-gray-500">Customer:</span> <strong>{selectedBooking.customer}</strong></p>
                                            <p><span className="text-gray-500">Phone:</span> <strong>{selectedBooking.phone}</strong></p>
                                            <p><span className="text-gray-500">Email:</span> <strong>{selectedBooking.email}</strong></p>
                                            <p><span className="text-gray-500">Vehicle:</span> <strong>{selectedBooking.vehicle}</strong></p>
                                            <p><span className="text-gray-500">Registration:</span> <strong>{selectedBooking.registrationNumber}</strong></p>
                                            <p><span className="text-gray-500">Booking ID:</span> <strong>{selectedBooking.bookingId}</strong></p>
                                            <p><span className="text-gray-500">Pickup:</span> <strong>{selectedBooking.pickupDate}</strong></p>
                                            <p><span className="text-gray-500">Expected Return:</span> <strong>{selectedBooking.returnDate}</strong></p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="mb-3 font-semibold text-gray-800">
                                            Pickup Inspection
                                        </h3>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div>
                                                <label className={labelClass}>Pickup Odometer (KM)</label>
                                                <input
                                                    type="number"
                                                    name="pickupOdometer"
                                                    value={pickupForm.pickupOdometer}
                                                    onChange={handlePickupChange}
                                                    min="0"
                                                    required
                                                    className={inputClass}
                                                    placeholder="Enter odometer reading"
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClass}>Pickup Fuel Level (%)</label>
                                                <input
                                                    type="number"
                                                    name="pickupFuel"
                                                    value={pickupForm.pickupFuel}
                                                    onChange={handlePickupChange}
                                                    min="0"
                                                    max="100"
                                                    required
                                                    className={inputClass}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClass}>Vehicle Condition</label>
                                                <select
                                                    name="condition"
                                                    value={pickupForm.condition}
                                                    onChange={handlePickupChange}
                                                    className={inputClass}
                                                >
                                                    <option value="Good">Good</option>
                                                    <option value="Minor Damage">Minor Damage</option>
                                                    <option value="Existing Damage">Existing Damage</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Estimated Rental Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    name="estimatedAmount"
                                                    value={pickupForm.estimatedAmount}
                                                    onChange={handlePickupChange}
                                                    min="0"
                                                    className={inputClass}
                                                    placeholder={String(pickupTotal)}
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>Pickup Notes</label>
                                                <textarea
                                                    name="notes"
                                                    value={pickupForm.notes}
                                                    onChange={handlePickupChange}
                                                    rows={2}
                                                    className="min-h-16 w-full rounded-md border border-gray-300 px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                                                    placeholder="Enter pickup remarks..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-gray-200 p-3">
                                        <h3 className="mb-3 font-semibold text-gray-800">
                                            Advance Payment
                                        </h3>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div>
                                                <label className={labelClass}>Advance Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    name="paidAmount"
                                                    value={pickupForm.paidAmount}
                                                    onChange={handlePickupChange}
                                                    min="0"
                                                    max={pickupTotal}
                                                    required
                                                    className={inputClass}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClass}>Payment Method</label>
                                                <select
                                                    name="paymentMethod"
                                                    value={pickupForm.paymentMethod}
                                                    onChange={handlePickupChange}
                                                    className={inputClass}
                                                >
                                                    <option value="UPI">UPI</option>
                                                    <option value="Card">Card</option>
                                                    <option value="Cash">Cash</option>
                                                    <option value="Bank Transfer">Bank Transfer</option>
                                                </select>
                                            </div>

                                            {pickupForm.paidAmount !== "0" && (
                                                <div className="sm:col-span-2">
                                                    <label className={labelClass}>
                                                        Payment Reference / Transaction ID
                                                    </label>
                                                    <input
                                                        name="paymentReference"
                                                        value={pickupForm.paymentReference}
                                                        onChange={handlePickupChange}
                                                        required
                                                        className={inputClass}
                                                        placeholder="Enter transaction reference"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                            <div className="rounded-md bg-gray-50 p-2.5">
                                                <p className="text-xs text-gray-500">Estimated Total</p>
                                                <p className="mt-1 font-bold">{formatCurrency(pickupTotal)}</p>
                                            </div>
                                            <div className="rounded-lg bg-green-50 p-3">
                                                <p className="text-xs text-gray-500">Advance Paid</p>
                                                <p className="mt-1 font-bold text-green-700">
                                                    {formatCurrency(pickupForm.paidAmount)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-red-50 p-3">
                                                <p className="text-xs text-gray-500">Balance</p>
                                                <p className="mt-1 font-bold text-red-700">
                                                    {formatCurrency(pickupBalance)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                                        >
                                            <CheckCircle size={18} />
                                            Submit Vehicle Pickup
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                )}

                {/* ================= RETURN TAB ================= */}
                {activeTab === "return" && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="mb-3">
                            <h2 className="text-base font-semibold text-gray-800">
                                Vehicle Return Details
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Select an active rental and complete the return inspection.
                            </p>
                        </div>

                        <form onSubmit={submitReturn} className="space-y-4">
                            <div>
                                <label className={labelClass}>Select Active Booking</label>
                                <select
                                    value={selectedRecordId}
                                    onChange={(e) => setSelectedRecordId(e.target.value)}
                                    required
                                    className={inputClass}
                                >
                                    <option value="">Select active rental</option>
                                    {activeRentals.map((record) => (
                                        <option key={record.id} value={record.id}>
                                            {record.bookingId} - {record.customer} - {record.vehicle}
                                        </option>
                                    ))}
                                </select>
                                {activeRentals.length === 0 && (
                                    <p className="mt-2 text-sm text-amber-600">
                                        No active rentals available for return.
                                    </p>
                                )}
                            </div>

                            {selectedRental && (
                                <>
                                    <div className="rounded-md bg-blue-50 p-3">
                                        <h3 className="mb-2 text-sm font-semibold text-blue-900">
                                            Pickup Details (Saved)
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                                            <p><span className="text-gray-500">Customer:</span><br /><strong>{selectedRental.customer}</strong></p>
                                            <p><span className="text-gray-500">Vehicle:</span><br /><strong>{selectedRental.vehicle}</strong></p>
                                            <p><span className="text-gray-500">Booking:</span><br /><strong>{selectedRental.bookingId}</strong></p>
                                            <p><span className="text-gray-500">Pickup Odometer:</span><br /><strong>{selectedRental.pickupOdometer} KM</strong></p>
                                            <p><span className="text-gray-500">Pickup Fuel:</span><br /><strong>{selectedRental.pickupFuel}%</strong></p>
                                            <p><span className="text-gray-500">Expected Return:</span><br /><strong>{selectedRental.expectedReturnDate}</strong></p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="mb-3 font-semibold text-gray-800">
                                            Return Inspection
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div>
                                                <label className={labelClass}>Return Odometer (KM)</label>
                                                <input
                                                    type="number"
                                                    name="returnOdometer"
                                                    value={returnForm.returnOdometer}
                                                    onChange={handleReturnChange}
                                                    min={selectedRental.pickupOdometer + 1}
                                                    required
                                                    className={inputClass}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClass}>Return Fuel (%)</label>
                                                <input
                                                    type="number"
                                                    name="returnFuel"
                                                    value={returnForm.returnFuel}
                                                    onChange={handleReturnChange}
                                                    min="0"
                                                    max="100"
                                                    required
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                            <div className="rounded-md bg-gray-50 p-2.5">
                                                <p className="text-xs text-gray-500">Distance Travelled</p>
                                                <p className="mt-1 font-bold">{distanceTravelled} KM</p>
                                            </div>
                                            <div className="rounded-md bg-gray-50 p-2.5">
                                                <p className="text-xs text-gray-500">Included KM</p>
                                                <p className="mt-1 font-bold">{includedKm} KM</p>
                                            </div>
                                            <div className="rounded-md bg-amber-50 p-2.5">
                                                <p className="text-xs text-gray-500">Extra KM</p>
                                                <p className="mt-1 font-bold text-amber-700">{extraKm} KM</p>
                                            </div>
                                            <div className="rounded-md bg-gray-50 p-2.5">
                                                <p className="text-xs text-gray-500">Fuel Difference</p>
                                                <p className="mt-1 font-bold">{fuelDifference}%</p>
                                            </div>
                                            <div className="rounded-md bg-amber-50 p-2.5">
                                                <p className="text-xs text-gray-500">Extra KM Charge</p>
                                                <p className="mt-1 font-bold text-amber-700">
                                                    {formatCurrency(extraKmAmount)}
                                                </p>
                                            </div>
                                            <div className="rounded-md bg-gray-50 p-2.5">
                                                <p className="text-xs text-gray-500">Extra KM Rate</p>
                                                <p className="mt-1 font-bold">
                                                    ₹{extraKmRate}/KM
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="mb-3 font-semibold text-gray-800">
                                            Additional Charges
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {[
                                                ["extraCharges", "Fuel Charges (₹)"],
                                                ["lateCharges", "Late Return Charges (₹)"],
                                                ["damageCharges", "Damage Charges (₹)"],
                                                ["discount", "Discount (₹)"],
                                                ["taxAmount", "Tax Amount (₹)"],
                                            ].map(([name, label]) => (
                                                <div key={name}>
                                                    <label className={labelClass}>{label}</label>
                                                    <input
                                                        type="number"
                                                        name={name}
                                                        value={returnForm[name]}
                                                        onChange={handleReturnChange}
                                                        min="0"
                                                        step="0.01"
                                                        className={inputClass}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4">
                                            <label className={labelClass}>Return Notes / Damage Details</label>
                                            <textarea
                                                name="notes"
                                                value={returnForm.notes}
                                                onChange={handleReturnChange}
                                                rows={2}
                                                className="min-h-16 w-full rounded-md border border-gray-300 px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                                                placeholder="Enter inspection remarks..."
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-gray-200 p-3">
                                        <h3 className="mb-3 font-semibold text-gray-800">
                                            Final Invoice Calculation
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Rental Amount</span>
                                                <strong>{formatCurrency(selectedRental.estimatedAmount)}</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Extra KM Charges</span>
                                                <strong>{formatCurrency(extraKmAmount)}</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Fuel Charges</span>
                                                <strong>{formatCurrency(returnForm.extraCharges)}</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Late Charges</span>
                                                <strong>{formatCurrency(returnForm.lateCharges)}</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Damage Charges</span>
                                                <strong>{formatCurrency(returnForm.damageCharges)}</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Discount</span>
                                                <strong>-{formatCurrency(returnForm.discount)}</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Tax</span>
                                                <strong>{formatCurrency(returnForm.taxAmount)}</strong>
                                            </div>
                                            <div className="flex justify-between border-t pt-3 text-base">
                                                <strong>Final Total</strong>
                                                <strong className="text-blue-600">
                                                    {formatCurrency(returnTotal)}
                                                </strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Already Paid</span>
                                                <strong className="text-green-600">
                                                    {formatCurrency(selectedRental.paidAmount)}
                                                </strong>
                                            </div>
                                            <div className="flex justify-between font-bold">
                                                <span>Remaining Balance</span>
                                                <span className="text-red-600">
                                                    {formatCurrency(Math.max(0, returnTotal - selectedRental.paidAmount))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                                        >
                                            <Receipt size={18} />
                                            Complete Return & Generate Invoice
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                )}

                {/* ================= INVOICES TAB ================= */}
                {activeTab === "invoices" && (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            <SummaryCard label="Total Records" value={totalInvoices} />
                            <SummaryCard label="Paid" value={paidCount} color="text-green-600" />
                            <SummaryCard label="Partial" value={partialCount} color="text-amber-600" />
                            <SummaryCard label="Unpaid" value={unpaidCount} color="text-red-600" />
                            <SummaryCard label="Collected" value={formatCurrency(totalCollected)} color="text-green-600" />
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                            <div className="mb-3 flex flex-col gap-2">
                                <div>
                                    <h2 className="font-semibold text-gray-800">
                                        Invoice & Rental Records
                                    </h2>
                                    <p className="mt-1 text-xs text-gray-500">
                                        View pickup records, completed returns and customer payments.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search invoice, booking or customer..."
                                        className={inputClass}
                                    />

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="All">All Rental Status</option>
                                        <option value="Pickup">Pickup</option>
                                        <option value="Return">Return</option>
                                    </select>

                                    <select
                                        value={paymentFilter}
                                        onChange={(e) => setPaymentFilter(e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="All">All Payment Status</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Partial">Partial</option>
                                        <option value="Unpaid">Unpaid</option>
                                    </select>
                                </div>
                            </div>

                            <DataTable
                                columns={columns}
                                data={filteredRecords}
                                pageSize={5}
                                emptyMessage="No rental records found."
                            />

                            <div className="mt-3 flex justify-end">
                                <p className="text-sm text-gray-500">
                                    Outstanding Balance:{" "}
                                    <strong className="text-red-600">
                                        {formatCurrency(totalOutstanding)}
                                    </strong>
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ================= VIEW DETAILS MODAL ================= */}
            <Modal
                isOpen={Boolean(viewRecord)}
                onClose={() => setViewRecord(null)}
                title="Rental & Invoice Details"
            >
                {viewRecord && (
                    <div className="space-y-4 text-sm">
                        <div className="rounded-lg bg-gray-50 p-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                DRIVEFLOW
                            </h3>
                            <p className="mt-1 text-gray-500">Rental Details</p>
                            <p className="mt-3 font-semibold text-blue-600">
                                {viewRecord.invoiceNumber || "Provisional - Pickup"}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <p><span className="text-gray-500">Customer:</span><br /><strong>{viewRecord.customer}</strong></p>
                            <p><span className="text-gray-500">Booking:</span><br /><strong>{viewRecord.bookingId}</strong></p>
                            <p><span className="text-gray-500">Vehicle:</span><br /><strong>{viewRecord.vehicle}</strong></p>
                            <p><span className="text-gray-500">Registration:</span><br /><strong>{viewRecord.registrationNumber}</strong></p>
                            <p><span className="text-gray-500">Pickup Odometer:</span><br /><strong>{viewRecord.pickupOdometer} KM</strong></p>
                            <p><span className="text-gray-500">Pickup Fuel:</span><br /><strong>{viewRecord.pickupFuel}%</strong></p>

                            {viewRecord.returnOdometer !== null && (
                                <>
                                    <p><span className="text-gray-500">Return Odometer:</span><br /><strong>{viewRecord.returnOdometer} KM</strong></p>
                                    <p><span className="text-gray-500">Return Fuel:</span><br /><strong>{viewRecord.returnFuel}%</strong></p>
                                    <p><span className="text-gray-500">Distance:</span><br /><strong>{viewRecord.distanceTravelled} KM</strong></p>
                                    <p><span className="text-gray-500">Extra KM:</span><br /><strong>{viewRecord.extraKm || 0} KM</strong></p>
                                </>
                            )}
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Total Amount</span>
                                <strong>{formatCurrency(viewRecord.finalAmount ?? viewRecord.estimatedAmount)}</strong>
                            </div>
                            <div className="flex justify-between text-green-700">
                                <span>Paid Amount</span>
                                <strong>{formatCurrency(viewRecord.paidAmount)}</strong>
                            </div>
                            <div className="flex justify-between text-red-600">
                                <span>Balance</span>
                                <strong>{formatCurrency(viewRecord.balanceAmount)}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Payment Status</span>
                                <strong>{viewRecord.paymentStatus}</strong>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold">Payment History</h3>
                            {viewRecord.paymentHistory?.length ? (
                                viewRecord.paymentHistory.map((payment) => (
                                    <div key={payment.id} className="flex justify-between border-b py-2">
                                        <div>
                                            <p className="font-medium">{payment.method}</p>
                                            <p className="text-xs text-gray-500">{payment.reference}</p>
                                        </div>
                                        <strong>{formatCurrency(payment.amount)}</strong>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No payments recorded.</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setViewRecord(null)}
                                className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ================= PAYMENT MODAL ================= */}
            <Modal
                isOpen={Boolean(paymentRecord)}
                onClose={closePayment}
                title="Record Payment"
            >
                {paymentRecord && (
                    <form onSubmit={submitPayment} className="space-y-4">
                        <div className="rounded-lg bg-gray-50 p-4 text-sm space-y-2">
                            <p><strong>Customer:</strong> {paymentRecord.customer}</p>
                            <p><strong>Booking:</strong> {paymentRecord.bookingId}</p>
                            <p><strong>Total:</strong> {formatCurrency(paymentRecord.finalAmount ?? paymentRecord.estimatedAmount)}</p>
                            <p><strong>Paid:</strong> {formatCurrency(paymentRecord.paidAmount)}</p>
                            <p className="font-bold text-red-600">
                                Balance: {formatCurrency(paymentRecord.balanceAmount)}
                            </p>
                        </div>

                        <div>
                            <label className={labelClass}>Payment Amount (₹)</label>
                            <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                min="0.01"
                                max={paymentRecord.balanceAmount}
                                step="0.01"
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className={inputClass}
                            >
                                <option value="UPI">UPI</option>
                                <option value="Card">Card</option>
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>
                                {paymentMethod === "UPI"
                                    ? "UPI ID / Transaction Reference"
                                    : paymentMethod === "Card"
                                        ? "Card Last 4 Digits / Transaction Reference"
                                        : paymentMethod === "Cash"
                                            ? "Cash Receipt Reference"
                                            : "Bank Transaction Reference"}
                            </label>
                            <input
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                                required
                                className={inputClass}
                                placeholder="Enter payment reference"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={closePayment}
                                className="rounded-lg border px-4 py-2 text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                            >
                                Save Payment
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </AdminLayout>
    );
}

function SummaryCard({ label, value, color = "text-gray-800" }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <h2 className={`mt-2 text-2xl font-bold${color}`
            }>
                {value}
            </h2>
        </div>
    );
}

export default Invoices;
