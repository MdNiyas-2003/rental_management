import { useState } from "react";

import {
    CarFront,
    KeyRound,
    ClipboardCheck,
    Gauge,
    IndianRupee,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Receipt,
    Search,
    Printer,
    Pencil,
    X,
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";
import useRental from "../hooks/useRental";
import SearchableDropdown from "../components/SearchableDropdown";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).trim().replace(/\s+/g, "").replace(/\/+$/, "");

const inputClass =
    "h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-100 disabled:bg-slate-100";

const labelClass =
    "mb-1.5 block text-[11px] font-semibold text-slate-600";

const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const escapeHtml = (value) =>
    String(value ?? "—").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[char]);

function printInvoice(invoice) {
    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
        alert("Please allow pop-ups to print the invoice.");
        return;
    }

    const paymentRows = (invoice.payments || []).map((payment) => `
        <tr>
            <td>${escapeHtml(payment.method)}</td>
            <td>${escapeHtml(payment.reference)}</td>
            <td>${escapeHtml(formatDate(payment.paidAt))}</td>
            <td class="right">${formatCurrency(payment.amount)}</td>
        </tr>
    `).join("");

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <title>${escapeHtml(invoice.invoiceNumber)}</title>
            <style>
                * { box-sizing: border-box; }
                body { font-family: Arial, sans-serif; color: #17243b; padding: 32px; font-size: 12px; }
                h1 { font-size: 24px; margin: 0; }
                h2 { font-size: 15px; margin: 0 0 12px; }
                .header { display:flex; justify-content:space-between; border-bottom:2px solid #3158c9; padding-bottom:18px; margin-bottom:24px; }
                .muted { color:#64748b; }
                .section { margin:22px 0; }
                .details { display:grid; grid-template-columns:1fr 1fr; gap:14px; background:#f8fafc; padding:16px; border-radius:8px; }
                .label { color:#64748b; font-size:11px; }
                .value { font-weight:bold; margin-top:5px; }
                table { width:100%; border-collapse:collapse; margin-top:10px; }
                th,td { padding:10px; border-bottom:1px solid #e2e8f0; text-align:left; }
                th { background:#f1f5f9; }
                .right { text-align:right; }
                .totals { width:320px; margin-left:auto; margin-top:20px; }
                .total-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e2e8f0; }
                .grand-total { font-size:16px; font-weight:bold; color:#3158c9; }
                .footer { margin-top:45px; text-align:center; color:#64748b; border-top:1px solid #e2e8f0; padding-top:15px; }
                @media print { body { padding:15px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div><h1>DRIVEFLOW</h1><p class="muted">Vehicle Rental Management</p></div>
                <div><h2>INVOICE</h2><strong>${escapeHtml(invoice.invoiceNumber)}</strong><p class="muted">${escapeHtml(formatDate(invoice.invoiceDate))}</p></div>
            </div>
            <div class="section">
                <h2>Customer &amp; Vehicle Details</h2>
                <div class="details">
                    <div><div class="label">Customer</div><div class="value">${escapeHtml(invoice.customerName)}</div></div>
                    <div><div class="label">Phone</div><div class="value">${escapeHtml(invoice.customerPhone)}</div></div>
                    <div><div class="label">Email</div><div class="value">${escapeHtml(invoice.customerEmail)}</div></div>
                    <div><div class="label">Booking ID</div><div class="value">${escapeHtml(invoice.bookingCode)}</div></div>
                    <div><div class="label">Vehicle</div><div class="value">${escapeHtml(invoice.vehicleName)}</div></div>
                    <div><div class="label">Registration</div><div class="value">${escapeHtml(invoice.vehicleNumber)}</div></div>
                </div>
            </div>
            <div class="section">
                <h2>Payment Transactions</h2>
                <table><thead><tr><th>Method</th><th>Reference</th><th>Date</th><th class="right">Amount</th></tr></thead>
                <tbody>${paymentRows || '<tr><td colspan="4">No payment transactions recorded.</td></tr>'}</tbody></table>
            </div>
            <div class="totals">
                <div class="total-row"><span>Subtotal</span><strong>${formatCurrency(invoice.subtotal)}</strong></div>
                <div class="total-row grand-total"><span>Invoice Total</span><strong>${formatCurrency(invoice.totalAmount)}</strong></div>
                <div class="total-row"><span>Paid Amount</span><strong>${formatCurrency(invoice.paidAmount)}</strong></div>
                <div class="total-row"><span>Balance Amount</span><strong>${formatCurrency(invoice.balanceAmount)}</strong></div>
                <div class="total-row"><span>Status</span><strong>${escapeHtml(invoice.status)}</strong></div>
            </div>
            <div class="footer">Thank you for choosing DriveFlow.</div>
            <script>window.onload = () => window.print();</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function InvoiceStatusBadge({ status }) {
    const styles = {
        Paid: "bg-green-100 text-green-700",
        "Partially Paid": "bg-amber-100 text-amber-700",
        Unpaid: "bg-red-100 text-red-700",
    };

    return (
        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[status] || "bg-slate-100 text-slate-600"}`}>
            {status || "Unknown"}
        </span>
    );
}

function InvoiceSummaryCard({ label, value, color }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] text-slate-500">{label}</p>
            <p className={`mt-2 text-lg font-bold ${color}`}>{value}</p>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div className="min-w-0">
            <label className={labelClass}>{label}</label>
            {children}
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] text-slate-500">{label}</p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                {value ?? "—"}
            </p>
        </div>
    );
}

function SummaryRow({ label, value, strong = false, color = "text-slate-700" }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-xs">
            <span className="text-slate-500">{label}</span>
            <strong className={`${color} ${strong ? "font-bold" : "font-semibold"}`}>
                {value}
            </strong>
        </div>
    );
}

function VehicleSnackbar({ notification, onClose }) {
    if (!notification) return null;

    const isError = notification.type === "error";

    return (
        <div
            role="alert"
            className={`fixed right-5 top-20 z-[2000] flex w-[340px] max-w-[calc(100vw-32px)] items-center gap-3 rounded-lg border p-3 shadow-lg ${
                isError
                    ? "border-red-200 bg-red-50"
                    : "border-green-200 bg-green-50"
            }`}
        >
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isError
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                }`}
            >
                {isError ? (
                    <AlertCircle size={17} />
                ) : (
                    <CheckCircle size={17} />
                )}
            </div>

            <p
                className={`flex-1 text-xs font-medium ${
                    isError ? "text-red-700" : "text-green-700"
                }`}
            >
                {notification.message}
            </p>

            <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700"
            >
                <X size={16} />
            </button>
        </div>
    );
}

function VehiclePickupReturn() {
    const [activeTab, setActiveTab] = useState("pickup");
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [paymentEntryAmount, setPaymentEntryAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [paymentReference, setPaymentReference] = useState("");
    const [savingInvoice, setSavingInvoice] = useState(false);
    const [invoiceEditError, setInvoiceEditError] = useState("");

    const openInvoiceEditor = (invoice) => {
        setEditingInvoice(invoice);
        setPaymentEntryAmount("");
        setPaymentMethod("Cash");
        setPaymentReference("");
        setInvoiceEditError("");
        setSelectedInvoice(null);
    };

    const closeInvoiceEditor = () => {
        if (savingInvoice) return;
        setEditingInvoice(null);
        setPaymentEntryAmount("");
        setPaymentReference("");
        setInvoiceEditError("");
    };

    const saveInvoicePayment = async () => {
        if (!editingInvoice) return;

        const amount = Number(paymentEntryAmount);
        const currentBalance = Number(editingInvoice.balanceAmount || 0);

        if (!Number.isFinite(amount) || amount <= 0) {
            setInvoiceEditError("Enter a payment amount greater than ₹0.");
            return;
        }

        if (amount > currentBalance) {
            setInvoiceEditError("Payment amount cannot exceed the outstanding balance.");
            return;
        }

        if (["UPI", "Card"].includes(paymentMethod) && !paymentReference.trim()) {
            setInvoiceEditError("Enter the transaction reference for this payment.");
            return;
        }

        setSavingInvoice(true);
        setInvoiceEditError("");

        try {
            const response = await fetch(
                `${API_URL}/invoices/${editingInvoice.id}/payments`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount,
                        method: paymentMethod,
                        reference: paymentReference.trim() || null,
                    }),
                }
            );

            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to record payment.");
            }

            setEditingInvoice(null);
            setPaymentEntryAmount("");
            setPaymentReference("");
            await refresh();
        } catch (err) {
            setInvoiceEditError(err.message || "Unable to record payment.");
        } finally {
            setSavingInvoice(false);
        }
    };

    const {
        pickupBookings,
        activeRentals,

        selectedBookingId,
        setSelectedBookingId,
        selectedBooking,

        selectedRentalId,
        setSelectedRentalId,
        selectedRental,

        pickupForm,
        updatePickupForm,
        submitPickup,

        returnForm,
        updateReturnForm,
        submitReturn,

        distanceTravelled,
        includedKm,
        extraKm,
        extraKmRate,
        extraKmCharge,
        fuelCharges,
        lateCharges,
        damageCharges,
        discount,
        tax,
        subtotal,
        finalAmount,
        advanceAmount,
        remainingBeforePayment,
        balanceAmount,

        // Invoice data
        filteredInvoices,
        invoiceSearch,
        setInvoiceSearch,
        invoiceStatusFilter,
        setInvoiceStatusFilter,
        invoiceDateFilter,
        setInvoiceDateFilter,
        totalInvoices,
        paidInvoices,
        partialInvoices,
        unpaidInvoices,
        totalCollected,
        totalOutstanding,

        loading,
        submittingPickup,
        submittingReturn,
        error,
        notification,
        dismissNotification,
        refresh,
    } = useRental();

    const tabs = [
        {
            id: "pickup",
            label: "Vehicle Pickup",
            icon: CarFront,
        },
        {
            id: "return",
            label: "Vehicle Return",
            icon: KeyRound,
        },
        {
            id: "invoices",
            label: "Invoices",
            icon: Receipt,
        },
    ];

    return (
        <AdminLayout>
            <div className="mx-auto flex h-[calc(100dvh-135px)] min-h-0 w-full max-w-[1600px] flex-col gap-3 overflow-hidden">

                {/* HEADER AND TABS */}
                <div className="flex shrink-0 items-center justify-between gap-4 max-[700px]:flex-col max-[700px]:items-start">

                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-[#17243b]">
                            Vehicle Pickup & Return
                        </h1>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Manage vehicle handover, inspections and rental returns.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={refresh}
                            disabled={loading}
                            className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={15}
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-semibold transition ${
                                            isActive
                                                ? "bg-[#3158c9] text-white"
                                                : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                    >
                                        <Icon size={16} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>


               <VehicleSnackbar
    notification={notification}
    onClose={dismissNotification}
/>

                {/* MAIN CARD */}
                <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">

                    {/* ================= PICKUP TAB ================= */}
                    {activeTab === "pickup" && (
                        <form
                            onSubmit={submitPickup}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">

                                <div className="flex flex-col gap-4">

                                    <div>
                                        <h2 className="text-base font-semibold text-[#17243b]">
                                            Vehicle Pickup Details
                                        </h2>

                                        <p className="text-xs text-slate-500">
                                            Select a confirmed booking and record the vehicle handover.
                                        </p>
                                    </div>

                                    {/* BOOKING SELECTION */}
                                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

                                        <Field label="Select Confirmed Booking *">
                                            <SearchableDropdown
                                                value={selectedBookingId}
                                                onChange={setSelectedBookingId}
                                                disabled={loading || pickupBookings.length === 0}
                                                options={pickupBookings.map((booking) => ({
                                                    value: booking.id,
                                                    label: `${booking.bookingId} - ${booking.customerName} - ${booking.vehicleName}`,
                                                    keywords: `${booking.bookingId} ${booking.customerName} ${booking.vehicleName}`,
                                                }))}
                                                placeholder="Select booking"
                                                searchPlaceholder="Search booking ID, customer or vehicle..."
                                                className="min-h-[36px]"
                                            />

                                            {pickupBookings.length === 0 && !loading && (
                                                <p className="mt-1 text-[11px] text-amber-600">
                                                    No confirmed bookings available for pickup.
                                                </p>
                                            )}
                                        </Field>

                                        {/* <div className="flex min-h-14 items-center rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2">
                                            {selectedBooking ? (
                                                <div className="grid w-full grid-cols-2 gap-2">
                                                    <InfoItem
                                                        label="Customer"
                                                        value={selectedBooking.customerName}
                                                    />
                                                    <InfoItem
                                                        label="Vehicle"
                                                        value={selectedBooking.vehicleName}
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-500">
                                                    Select a booking to view customer and vehicle details.
                                                </p>
                                            )}
                                        </div> */}
                                    </div>

                                    {selectedBooking && (
                                        <>
                                            {/* BOOKING INFORMATION */}
                                            <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                                                <h3 className="mb-3 text-xs font-semibold text-blue-900">
                                                    Booking & Customer Details
                                                </h3>

                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                                    <InfoItem
                                                        label="Booking ID"
                                                        value={selectedBooking.bookingId}
                                                    />
                                                    <InfoItem
                                                        label="Customer"
                                                        value={selectedBooking.customerName}
                                                    />
                                                    <InfoItem
                                                        label="Phone"
                                                        value={selectedBooking.customerPhone}
                                                    />
                                                    <InfoItem
                                                        label="Email"
                                                        value={selectedBooking.customerEmail}
                                                    />
                                                    <InfoItem
                                                        label="Vehicle"
                                                        value={selectedBooking.vehicleName}
                                                    />
                                                    <InfoItem
                                                        label="Registration"
                                                        value={selectedBooking.vehicleNumber}
                                                    />
                                                    <InfoItem
                                                        label="Pickup Date"
                                                        value={formatDate(selectedBooking.pickupDate)}
                                                    />
                                                    <InfoItem
                                                        label="Expected Return"
                                                        value={formatDate(selectedBooking.returnDate)}
                                                    />
                                                </div>
                                            </div>

                                            {/* INSPECTION AND ADVANCE */}
                                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

                                                <div className="rounded-lg border border-slate-200 p-4">
                                                    <div className="mb-4 flex items-center gap-2">
                                                        <Gauge size={17} className="text-blue-600" />

                                                        <h3 className="text-sm font-semibold text-[#17243b]">
                                                            Pickup Inspection
                                                        </h3>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">

                                                        <Field label="Pickup Odometer (KM) *">
                                                            <input
                                                                name="pickupOdometer"
                                                                type="number"
                                                                min="0"
                                                                step="1"
                                                                value={pickupForm.pickupOdometer}
                                                                onChange={updatePickupForm}
                                                                required
                                                                placeholder="Enter KM"
                                                                className={inputClass}
                                                            />
                                                        </Field>

                                                        <Field label="Pickup Fuel Level *">
                                                            <select
                                                                name="pickupFuelLevel"
                                                                value={pickupForm.pickupFuelLevel}
                                                                onChange={updatePickupForm}
                                                                required
                                                                className={inputClass}
                                                            >
                                                                <option value="0%">Empty (0%)</option>
                                                                <option value="25%">25%</option>
                                                                <option value="50%">50%</option>
                                                                <option value="75%">75%</option>
                                                                <option value="100%">100%</option>
                                                            </select>
                                                        </Field>

                                                        <div className="col-span-2">
                                                            <Field label="Vehicle Condition *">
                                                                <select
                                                                    name="pickupCondition"
                                                                    value={pickupForm.pickupCondition}
                                                                    onChange={updatePickupForm}
                                                                    required
                                                                    className={inputClass}
                                                                >
                                                                    <option value="Good">Good</option>
                                                                    <option value="Minor Damage">Minor Damage</option>
                                                                    <option value="Existing Damage">Existing Damage</option>
                                                                </select>
                                                            </Field>
                                                        </div>

                                                        <div className="col-span-2">
                                                            <Field label="Pickup Notes">
                                                                <textarea
                                                                    name="pickupNotes"
                                                                    rows={3}
                                                                    value={pickupForm.pickupNotes}
                                                                    onChange={updatePickupForm}
                                                                    placeholder="Existing damage details or pickup remarks..."
                                                                    className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                                                                />
                                                            </Field>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* ADVANCE PAYMENT FROM BOOKING */}
                                                <div className="rounded-lg border border-slate-200 p-4">

                                                    <div className="mb-4 flex items-center gap-2">
                                                        <IndianRupee size={17} className="text-green-600" />

                                                        <h3 className="text-sm font-semibold text-[#17243b]">
                                                            Booking Payment Summary
                                                        </h3>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <InfoItem
                                                            label="Booking Total"
                                                            value={formatCurrency(selectedBooking.totalAmount)}
                                                        />

                                                        <InfoItem
                                                            label="Advance Already Paid"
                                                            value={formatCurrency(selectedBooking.advanceAmount)}
                                                        />

                                                        <InfoItem
                                                            label="Remaining Before Return Charges"
                                                            value={formatCurrency(
                                                                Math.max(
                                                                    0,
                                                                    selectedBooking.totalAmount -
                                                                    selectedBooking.advanceAmount
                                                                )
                                                            )}
                                                        />

                                                        <InfoItem
                                                            label="Daily Rate"
                                                            value={formatCurrency(selectedBooking.dailyRate)}
                                                        />
                                                    </div>

                                                    <div className="mt-4 rounded-lg bg-green-50 p-3">
                                                        <p className="text-[11px] text-slate-500">
                                                            Advance payment information
                                                        </p>

                                                        <p className="mt-1 text-xs font-semibold text-green-700">
                                                            The saved booking advance will automatically be adjusted in the final invoice.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* FIXED PICKUP FOOTER */}
                            <div className="flex shrink-0 justify-end border-t border-slate-200 bg-white p-3">
                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        submittingPickup ||
                                        !selectedBooking
                                    }
                                    className="flex h-10 items-center gap-2 rounded-lg bg-[#3158c9] px-5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <ClipboardCheck size={16} />
                                    {submittingPickup
                                        ? "Submitting..."
                                        : "Submit Vehicle Pickup"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ================= RETURN TAB ================= */}
                    {activeTab === "return" && (
                        <form
                            onSubmit={submitReturn}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">

                                <div className="flex flex-col gap-3">

                                    <div>
                                        <h2 className="text-base font-semibold text-[#17243b]">
                                            Vehicle Return Details
                                        </h2>

                                        <p className="text-xs text-slate-500">
                                            Complete the return inspection and calculate final rental charges.
                                        </p>
                                    </div>

                                    {/* ACTIVE RENTAL */}
                                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

                                        <Field label="Select Active Rental *">
                                            <SearchableDropdown
                                                value={selectedRentalId}
                                                onChange={setSelectedRentalId}
                                                disabled={loading || activeRentals.length === 0}
                                                options={activeRentals.map((rental) => ({
                                                    value: rental.id,
                                                    label: `${rental.bookingCode} - ${rental.customerName} - ${rental.vehicleName}`,
                                                    keywords: `${rental.bookingCode} ${rental.customerName} ${rental.vehicleName}`,
                                                }))}
                                                placeholder="Select active rental"
                                                searchPlaceholder="Search booking ID, customer or vehicle..."
                                                className="min-h-[36px]"
                                            />

                                            {activeRentals.length === 0 && !loading && (
                                                <p className="mt-1 text-[11px] text-amber-600">
                                                    No active rentals available for return.
                                                </p>
                                            )}
                                        </Field>

                                        {/* <div className="flex min-h-14 items-center rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2">
                                            <p className="text-xs text-slate-500">
                                                {selectedRental
                                                    ? `Rental ID: ${selectedRental.rentalId}`
                                                    : "Select an active rental to view saved pickup details."}
                                            </p>
                                        </div> */}
                                    </div>

                                    {selectedRental && (
                                        <>
                                            {/* SAVED PICKUP DETAILS */}
                                            <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">

                                                <h3 className="mb-3 text-xs font-semibold text-blue-900">
                                                    Saved Pickup Details
                                                </h3>

                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                                    <InfoItem
                                                        label="Customer"
                                                        value={selectedRental.customerName}
                                                    />
                                                    <InfoItem
                                                        label="Vehicle"
                                                        value={selectedRental.vehicleName}
                                                    />
                                                    <InfoItem
                                                        label="Booking ID"
                                                        value={selectedRental.bookingCode}
                                                    />
                                                    <InfoItem
                                                        label="Pickup Date"
                                                        value={formatDate(selectedRental.actualPickupDate)}
                                                    />
                                                    <InfoItem
                                                        label="Pickup Odometer"
                                                        value={`${selectedRental.pickupOdometer} KM`}
                                                    />
                                                    <InfoItem
                                                        label="Pickup Fuel"
                                                        value={selectedRental.pickupFuelLevel}
                                                    />
                                                    <InfoItem
                                                        label="Expected Return"
                                                        value={formatDate(selectedRental.expectedReturnDate)}
                                                    />
                                                    <InfoItem
                                                        label="Advance Paid"
                                                        value={formatCurrency(selectedRental.advanceAmount)}
                                                    />
                                                </div>
                                            </div>

                                            {/* INSPECTION AND CHARGES */}
                                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

                                                {/* RETURN INSPECTION */}
                                                <div className="rounded-lg border border-slate-200 p-4">

                                                    <h3 className="mb-4 text-sm font-semibold text-[#17243b]">
                                                        Return Inspection
                                                    </h3>

                                                    <div className="grid grid-cols-2 gap-3">

                                                        <Field label="Return Odometer (KM) *">
                                                            <input
                                                                name="returnOdometer"
                                                                type="number"
                                                                min={selectedRental.pickupOdometer}
                                                                step="1"
                                                                value={returnForm.returnOdometer}
                                                                onChange={updateReturnForm}
                                                                required
                                                                placeholder="Enter KM"
                                                                className={inputClass}
                                                            />
                                                        </Field>

                                                        <Field label="Return Fuel Level *">
                                                            <select
                                                                name="returnFuelLevel"
                                                                value={returnForm.returnFuelLevel}
                                                                onChange={updateReturnForm}
                                                                required
                                                                className={inputClass}
                                                            >
                                                                <option value="0%">Empty (0%)</option>
                                                                <option value="25%">25%</option>
                                                                <option value="50%">50%</option>
                                                                <option value="75%">75%</option>
                                                                <option value="100%">100%</option>
                                                            </select>
                                                        </Field>

                                                        <Field label="Return Condition">
                                                            <select
                                                                name="returnCondition"
                                                                value={returnForm.returnCondition}
                                                                onChange={updateReturnForm}
                                                                className={inputClass}
                                                            >
                                                                <option value="Good">Good</option>
                                                                <option value="Minor Damage">Minor Damage</option>
                                                                <option value="Damaged">Damaged</option>
                                                            </select>
                                                        </Field>

                                                        <Field label="Return Notes">
                                                            <input
                                                                name="returnNotes"
                                                                value={returnForm.returnNotes}
                                                                onChange={updateReturnForm}
                                                                placeholder="Inspection remarks"
                                                                className={inputClass}
                                                            />
                                                        </Field>
                                                    </div>

                                                    {/* DISTANCE SUMMARY */}
                                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                                        {[
                                                            ["Distance", `${distanceTravelled} KM`],
                                                            ["Included", `${includedKm} KM`],
                                                            ["Extra KM", `${extraKm} KM`],
                                                        ].map(([label, value]) => (
                                                            <div
                                                                key={label}
                                                                className="rounded-md bg-slate-50 p-3"
                                                            >
                                                                <p className="text-[10px] text-slate-500">
                                                                    {label}
                                                                </p>

                                                                <p className="mt-1 text-sm font-bold text-[#17243b]">
                                                                    {value}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <p className="mt-3 text-[11px] text-slate-500">
                                                        Extra kilometre rate: {formatCurrency(extraKmRate)} / KM
                                                    </p>

                                                    {/* PAYMENT ENTRY */}
                                                    <div className="mt-4 border-t border-slate-100 pt-4">
                                                        <div className="mb-3 flex items-center gap-2">
                                                            <IndianRupee size={16} className="text-green-600" />
                                                            <h3 className="text-sm font-semibold text-[#17243b]">Payment Entry</h3>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <Field label="Payment Method">
                                                                <select name="paymentMethod" value={returnForm.paymentMethod} onChange={updateReturnForm} className={inputClass}>
                                                                    <option value="Cash">Cash</option>
                                                                    <option value="UPI">UPI</option>
                                                                    <option value="Card">Card</option>
                                                                </select>
                                                            </Field>
                                                            <Field label="Payment Amount (₹)">
                                                                <input name="paymentAmount" type="number" min="0" max={remainingBeforePayment} step="0.01" value={returnForm.paymentAmount} onChange={updateReturnForm} className={inputClass} placeholder="Enter amount" />
                                                            </Field>
                                                            {returnForm.paymentMethod === "UPI" && (
                                                                <div className="col-span-2">
                                                                    <Field label="UPI Transaction ID / Reference *">
                                                                        <input name="paymentReference" value={returnForm.paymentReference} onChange={updateReturnForm} className={inputClass} placeholder="Enter UPI transaction reference" />
                                                                    </Field>
                                                                </div>
                                                            )}
                                                            {returnForm.paymentMethod === "Card" && (
                                                                <div className="col-span-2">
                                                                    <Field label="Card Transaction Reference / Last 4 Digits *">
                                                                        <input name="paymentReference" value={returnForm.paymentReference} onChange={updateReturnForm} className={inputClass} maxLength={64} placeholder="Transaction reference or last 4 digits only" />
                                                                    </Field>
                                                                    <p className="mt-1 text-[10px] text-slate-400">Do not enter the full card number, CVV or PIN.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="mt-2 text-[10px] text-slate-500">Outstanding before this payment: {formatCurrency(remainingBeforePayment)}</p>
                                                    </div>
                                                </div>

                                                {/* RIGHT SIDE */}
                                                <div className="flex flex-col gap-3">

                                                    {/* ADDITIONAL CHARGES */}
                                                    <div className="rounded-lg border border-slate-200 p-4">

                                                        <h3 className="mb-3 text-sm font-semibold text-[#17243b]">
                                                            Additional Charges
                                                        </h3>

                                                        <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-3">

                                                            <Field label="Fuel (₹)">
                                                                <input
                                                                    name="fuelCharges"
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={returnForm.fuelCharges}
                                                                    onChange={updateReturnForm}
                                                                    className={inputClass}
                                                                />
                                                            </Field>

                                                            <Field label="Late Return (₹)">
                                                                <input
                                                                    name="lateCharges"
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={returnForm.lateCharges}
                                                                    onChange={updateReturnForm}
                                                                    className={inputClass}
                                                                />
                                                            </Field>

                                                            <Field label="Damage (₹)">
                                                                <input
                                                                    name="damageCharges"
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={returnForm.damageCharges}
                                                                    onChange={updateReturnForm}
                                                                    className={inputClass}
                                                                />
                                                            </Field>

                                                            <Field label="Discount (₹)">
                                                                <input
                                                                    name="discount"
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={returnForm.discount}
                                                                    onChange={updateReturnForm}
                                                                    className={inputClass}
                                                                />
                                                            </Field>

                                                            <Field label="Tax (₹)">
                                                                <input
                                                                    name="tax"
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={returnForm.tax}
                                                                    onChange={updateReturnForm}
                                                                    className={inputClass}
                                                                />
                                                            </Field>
                                                        </div>
                                                    </div>

                                                    {/* FINAL INVOICE CALCULATION */}
                                                    <div className="rounded-lg border border-slate-200 p-4">

                                                        <h3 className="mb-3 text-sm font-semibold text-[#17243b]">
                                                            Final Invoice Calculation
                                                        </h3>

                                                        <SummaryRow
                                                            label="Rental Amount"
                                                            value={formatCurrency(selectedRental.rentalAmount)}
                                                        />

                                                        <SummaryRow
                                                            label={`Extra KM (${extraKm} × ${formatCurrency(extraKmRate)})`}
                                                            value={formatCurrency(extraKmCharge)}
                                                        />

                                                        <SummaryRow
                                                            label="Fuel Charges"
                                                            value={formatCurrency(fuelCharges)}
                                                        />

                                                        <SummaryRow
                                                            label="Late Charges"
                                                            value={formatCurrency(lateCharges)}
                                                        />

                                                        <SummaryRow
                                                            label="Damage Charges"
                                                            value={formatCurrency(damageCharges)}
                                                        />

                                                        <SummaryRow
                                                            label="Discount"
                                                            value={`− ${formatCurrency(discount)}`}
                                                            color="text-green-600"
                                                        />

                                                        <SummaryRow
                                                            label="Tax"
                                                            value={formatCurrency(tax)}
                                                        />

                                                        <div className="mt-3 flex items-center justify-between text-sm font-bold">
                                                            <span className="text-[#17243b]">
                                                                Final Invoice Total
                                                            </span>

                                                            <span className="text-[#3158c9]">
                                                                {formatCurrency(finalAmount)}
                                                            </span>
                                                        </div>

                                                        <div className="mt-3 rounded-lg bg-green-50 p-3">
                                                            <SummaryRow
                                                                label="Advance Already Paid"
                                                                value={`− ${formatCurrency(advanceAmount)}`}
                                                                color="text-green-700"
                                                            />
                                                            <SummaryRow
                                                                label="Payment Received Now"
                                                                value={`− ${formatCurrency(Number(returnForm.paymentAmount || 0))}`}
                                                                color="text-green-700"
                                                            />

                                                            <div className="mt-2 flex items-center justify-between">
                                                                <span className="text-xs font-bold text-slate-700">
                                                                    Balance Amount
                                                                </span>

                                                                <strong className="text-base text-green-700">
                                                                    {formatCurrency(balanceAmount)}
                                                                </strong>
                                                            </div>
                                                        </div>

                                                        <p className="mt-3 text-[10px] leading-4 text-slate-500">
                                                            The invoice records the full amount, existing advance and payment collected now. Any unpaid amount remains as the invoice balance.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* FIXED RETURN FOOTER */}
                            <div className="flex shrink-0 justify-end border-t border-slate-200 bg-white p-3">
                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        submittingReturn ||
                                        !selectedRental
                                    }
                                    className="flex h-10 items-center gap-2 rounded-lg bg-green-600 px-5 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <ClipboardCheck size={16} />
                                    {submittingReturn
                                        ? "Processing..."
                                        : "Complete Return & Generate Invoice"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ================= INVOICES TAB ================= */}
                    {activeTab === "invoices" && (
                        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
                            <div className="flex shrink-0 items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-[#17243b]">Generated Invoices</h2>
                                    <p className="mt-1 text-[11px] text-slate-500">View invoices generated after vehicle returns.</p>
                                </div>
                                <button type="button" onClick={refresh} disabled={loading} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                                    <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
                                </button>
                            </div>

                            {/* SUMMARY CARDS */}
                            <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                                <InvoiceSummaryCard label="Total Invoices" value={totalInvoices} color="text-[#3158c9]" />
                                <InvoiceSummaryCard label="Paid" value={paidInvoices} color="text-green-600" />
                                <InvoiceSummaryCard label="Partially Paid" value={partialInvoices} color="text-amber-600" />
                                <InvoiceSummaryCard label="Unpaid" value={unpaidInvoices} color="text-red-600" />
                                <InvoiceSummaryCard label="Total Collected" value={formatCurrency(totalCollected)} color="text-green-600" />
                            </div>

                            {/* INVOICE TABLE */}
                            <div className="min-h-0 flex-1 rounded-xl border border-slate-200 bg-white p-3">
                                <div className="mb-3 flex flex-col gap-3">
                                    <div>
                                        <h3 className="text-xs font-semibold text-[#17243b]">Invoice Records</h3>
                                        <p className="mt-1 text-[10px] text-slate-500">Search and filter generated invoices.</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} placeholder="Search invoice, booking, customer..." className="h-9 w-full rounded-md border border-slate-200 pl-9 pr-3 text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100" />
                                        </div>
                                        <select value={invoiceStatusFilter} onChange={(e) => setInvoiceStatusFilter(e.target.value)} className={inputClass}>
                                            <option value="All">All Payment Status</option>
                                            <option value="Paid">Paid</option>
                                            <option value="Partially Paid">Partially Paid</option>
                                            <option value="Unpaid">Unpaid</option>
                                        </select>
                                        <select value={invoiceDateFilter} onChange={(e) => setInvoiceDateFilter(e.target.value)} className={inputClass}>
                                            <option value="All">All Dates</option>
                                            <option value="Today">Today</option>
                                            <option value="This Month">This Month</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-slate-100">
                                    <table className="w-full min-w-[1100px] text-left text-[11px]">
                                        <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                                            <tr>
                                                <th className="px-3 py-3">Invoice No.</th>
                                                <th className="px-3 py-3">Date</th>
                                                <th className="px-3 py-3">Customer</th>
                                                <th className="px-3 py-3">Vehicle</th>
                                                <th className="px-3 py-3 text-right">Total</th>
                                                <th className="px-3 py-3 text-right">Paid</th>
                                                <th className="px-3 py-3 text-right">Balance</th>
                                                <th className="px-3 py-3">Status</th>
                                                <th className="px-3 py-3 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredInvoices.map((invoice) => (
                                                <tr key={invoice.id} className="hover:bg-slate-50">
                                                    <td className="px-3 py-3">
                                                        <p className="font-semibold text-[11px] text-blue-600">{invoice.invoiceNumber}</p>
                                                        <p className="mt-1 text-[10px] text-slate-400">{invoice.bookingCode || "—"}</p>
                                                    </td>
                                                    <td className="px-3 py-3 text-[11px] text-slate-600">{formatDate(invoice.invoiceDate)}</td>
                                                    <td className="px-3 py-3">
                                                        <p className="font-semibold text-[11px] text-slate-700">{invoice.customerName}</p>
                                                        <p className="mt-1 text-[10px] text-slate-400">{invoice.customerPhone || invoice.customerEmail || "—"}</p>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <p className="font-medium text-[11px] text-slate-700">{invoice.vehicleName}</p>
                                                        <p className="mt-1 text-[10px] text-slate-400">{invoice.vehicleNumber || "—"}</p>
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-semibold">{formatCurrency(invoice.totalAmount)}</td>
                                                    <td className="px-3 py-3 text-right font-semibold text-green-600">{formatCurrency(invoice.paidAmount)}</td>
                                                    <td className="px-3 py-3 text-right font-semibold text-red-600">{formatCurrency(invoice.balanceAmount)}</td>
                                                    <td className="px-3 py-3"><InvoiceStatusBadge status={invoice.status} /></td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button type="button" onClick={() => setSelectedInvoice(invoice)} className="flex h-7 items-center gap-1 rounded-md border border-blue-200 px-2 text-[10px] font-semibold text-blue-600 hover:bg-blue-50">
                                                                <Receipt size={12} /> View
                                                            </button>
                                                            <button type="button" onClick={() => openInvoiceEditor(invoice)} className="flex h-7 items-center gap-1 rounded-md border border-amber-200 px-2 text-[10px] font-semibold text-amber-700 hover:bg-amber-50">
                                                                <Pencil size={12} /> Edit
                                                            </button>
                                                            <button type="button" onClick={() => printInvoice(invoice)} className="flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
                                                                <Printer size={12} /> Print
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}

                                            {loading && (
                                                <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-500">Loading invoices...</td></tr>
                                            )}

                                            {!loading && filteredInvoices.length === 0 && (
                                                <tr>
                                                    <td colSpan={9} className="px-4 py-12 text-center">
                                                        <Receipt size={28} className="mx-auto mb-2 text-slate-300" />
                                                        <p className="text-xs font-semibold text-slate-600">No invoices found</p>
                                                        <p className="mt-1 text-[10px] text-slate-400">Invoices will appear here after vehicle returns are completed.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-[10px] text-slate-400">Showing {filteredInvoices.length} of {totalInvoices} invoices</p>
                                    <div className="rounded-lg bg-red-50 px-4 py-2.5 text-right">
                                        <p className="text-[10px] text-slate-500">Total Outstanding</p>
                                        <p className="mt-1 text-sm font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= RECORD INVOICE PAYMENT MODAL ================= */}
                    {editingInvoice && (
                        <div className="fixed inset-0 z-[1250] flex items-center justify-center bg-slate-900/50 p-4">
                            <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl">
                                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                                    <div>
                                        <h2 className="text-sm font-bold text-[#17243b]">Record Payment</h2>
                                        <p className="mt-1 text-[10px] text-slate-500">{editingInvoice.invoiceNumber}</p>
                                    </div>
                                    <button type="button" onClick={closeInvoiceEditor} disabled={savingInvoice} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close payment dialog">
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                                    <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                        <InfoItem label="Customer" value={editingInvoice.customerName} />
                                        <InfoItem label="Vehicle" value={editingInvoice.vehicleName} />
                                        <InfoItem label="Invoice Date" value={formatDate(editingInvoice.invoiceDate)} />
                                        <InfoItem label="Booking ID" value={editingInvoice.bookingCode} />
                                    </div>

                                    <div className="rounded-lg border border-slate-200 p-3">
                                        <SummaryRow label="Invoice Amount (Fixed)" value={formatCurrency(editingInvoice.totalAmount)} strong />
                                        <SummaryRow label="Already Paid" value={formatCurrency(editingInvoice.paidAmount)} color="text-green-600" />
                                        <SummaryRow label="Outstanding Balance" value={formatCurrency(editingInvoice.balanceAmount)} color="text-red-600" strong />
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>Payment Amount (₹) *</label>
                                            <input
                                                type="number"
                                                min="0.01"
                                                max={Number(editingInvoice.balanceAmount || 0)}
                                                step="0.01"
                                                value={paymentEntryAmount}
                                                onChange={(event) => setPaymentEntryAmount(event.target.value)}
                                                className={inputClass}
                                                placeholder="Enter amount received"
                                                disabled={savingInvoice}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Payment Method *</label>
                                            <select
                                                value={paymentMethod}
                                                onChange={(event) => setPaymentMethod(event.target.value)}
                                                className={inputClass}
                                                disabled={savingInvoice}
                                            >
                                                <option value="Cash">Cash</option>
                                                <option value="UPI">UPI</option>
                                                <option value="Card">Card</option>
                                                <option value="Bank Transfer">Bank Transfer</option>
                                            </select>
                                        </div>
                                    </div>

                                    {paymentMethod !== "Cash" && (
                                        <div>
                                            <label className={labelClass}>Transaction Reference {["UPI", "Card"].includes(paymentMethod) ? "*" : "(Optional)"}</label>
                                            <input
                                                type="text"
                                                value={paymentReference}
                                                onChange={(event) => setPaymentReference(event.target.value)}
                                                className={inputClass}
                                                placeholder="Enter transaction/reference ID"
                                                disabled={savingInvoice}
                                            />
                                        </div>
                                    )}

                                    <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3">
                                        <SummaryRow label="Invoice Amount" value={formatCurrency(editingInvoice.totalAmount)} />
                                        <SummaryRow label="Previously Paid" value={formatCurrency(editingInvoice.paidAmount)} color="text-green-700" />
                                        <SummaryRow label="Payment Received Now" value={`− ${formatCurrency(Number(paymentEntryAmount || 0))}`} color="text-green-700" />
                                        <SummaryRow
                                            label="New Paid Total"
                                            value={formatCurrency(Number(editingInvoice.paidAmount || 0) + Number(paymentEntryAmount || 0))}
                                            color="text-green-700"
                                            strong
                                        />
                                        <SummaryRow
                                            label="Remaining Balance"
                                            value={formatCurrency(Math.max(0, Number(editingInvoice.balanceAmount || 0) - Number(paymentEntryAmount || 0)))}
                                            color="text-red-600"
                                            strong
                                        />
                                        <div className="mt-2 flex items-center justify-between text-xs">
                                            <span className="text-slate-500">New Payment Status</span>
                                            {(() => {
                                                const newPaid = Number(editingInvoice.paidAmount || 0) + Number(paymentEntryAmount || 0);
                                                const total = Number(editingInvoice.totalAmount || 0);
                                                const status = newPaid >= total ? "Paid" : newPaid > 0 ? "Partially Paid" : "Unpaid";
                                                return <InvoiceStatusBadge status={status} />;
                                            })()}
                                        </div>
                                    </div>

                                    {invoiceEditError && (
                                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                                            {invoiceEditError}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 border-t border-slate-200 p-3">
                                    <button type="button" onClick={closeInvoiceEditor} disabled={savingInvoice} className="h-9 rounded-lg border border-slate-200 px-4 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                                        Cancel
                                    </button>
                                    <button type="button" onClick={saveInvoicePayment} disabled={savingInvoice || Number(editingInvoice.balanceAmount || 0) <= 0} className="flex h-9 items-center gap-2 rounded-lg bg-[#3158c9] px-4 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                                        <CheckCircle size={13} />
                                        {savingInvoice ? "Saving..." : "Save Payment"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= VIEW INVOICE MODAL ================= */}
                    {selectedInvoice && (
                        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/50 p-4">
                            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
                                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                                    <div>
                                        <h2 className="text-sm font-bold text-[#17243b]">Invoice Details</h2>
                                        <p className="mt-1 text-[10px] text-slate-500">{selectedInvoice.invoiceNumber}</p>
                                    </div>
                                    <button type="button" onClick={() => setSelectedInvoice(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close invoice">
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-5">
                                    <div className="mb-5 flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#3158c9]">DRIVEFLOW</h3>
                                            <p className="text-[10px] text-slate-500">Vehicle Rental Management</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-[#17243b]">INVOICE</p>
                                            <p className="mb-1 text-[10px] text-slate-500">{formatDate(selectedInvoice.invoiceDate)}</p>
                                            <InvoiceStatusBadge status={selectedInvoice.status} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <InfoItem label="Invoice Number" value={selectedInvoice.invoiceNumber} />
                                        <InfoItem label="Booking ID" value={selectedInvoice.bookingCode} />
                                        <InfoItem label="Customer" value={selectedInvoice.customerName} />
                                        <InfoItem label="Phone" value={selectedInvoice.customerPhone} />
                                        <InfoItem label="Email" value={selectedInvoice.customerEmail} />
                                        <InfoItem label="Vehicle" value={selectedInvoice.vehicleName} />
                                        <InfoItem label="Registration" value={selectedInvoice.vehicleNumber} />
                                    </div>

                                    <h3 className="mb-2 mt-5 text-xs font-bold text-[#17243b]">Payment Transactions</h3>
                                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                                        <table className="w-full min-w-[420px] text-left text-[10px]">
                                            <thead className="bg-slate-50 text-slate-500">
                                                <tr>
                                                    <th className="px-3 py-2">Method</th>
                                                    <th className="px-3 py-2">Reference</th>
                                                    <th className="px-3 py-2">Date</th>
                                                    <th className="px-3 py-2 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {(selectedInvoice.payments || []).map((payment) => (
                                                    <tr key={payment.id}>
                                                        <td className="px-3 py-2">{payment.method || "—"}</td>
                                                        <td className="px-3 py-2">{payment.reference || "—"}</td>
                                                        <td className="px-3 py-2">{formatDate(payment.paidAt)}</td>
                                                        <td className="px-3 py-2 text-right font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                                                    </tr>
                                                ))}
                                                {(!selectedInvoice.payments || selectedInvoice.payments.length === 0) && (
                                                    <tr><td colSpan={4} className="px-3 py-5 text-center text-slate-400">No payment transactions recorded.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="ml-auto mt-5 max-w-sm">
                                        <SummaryRow label="Subtotal" value={formatCurrency(selectedInvoice.subtotal)} />
                                        <SummaryRow label="Invoice Total" value={formatCurrency(selectedInvoice.totalAmount)} strong />
                                        <SummaryRow label="Paid Amount" value={formatCurrency(selectedInvoice.paidAmount)} color="text-green-600" />
                                        <SummaryRow label="Balance Amount" value={formatCurrency(selectedInvoice.balanceAmount)} color="text-red-600" strong />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 border-t border-slate-200 p-3">
                                    <button type="button" onClick={() => setSelectedInvoice(null)} className="h-9 rounded-lg border border-slate-200 px-4 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">Close</button>
                                    <button type="button" onClick={() => printInvoice(selectedInvoice)} className="flex h-9 items-center gap-2 rounded-lg bg-[#3158c9] px-4 text-[11px] font-semibold text-white hover:bg-blue-700">
                                        <Printer size={13} /> Print Invoice
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}

export default VehiclePickupReturn;