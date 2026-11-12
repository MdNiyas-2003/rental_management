import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

function DataTable({
    columns,
    data = [],
    emptyMessage = "No records found",
    pageSize = 5,
    compact = false,
}) {
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

    useEffect(() => {
        setPage((current) => Math.min(current, totalPages));
    }, [totalPages]);

    const startIndex = (page - 1) * pageSize;
    const currentData = data.slice(startIndex, startIndex + pageSize);

    return (
        <div className="flex h -full min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full border-collapse whitespace-nowrap">
                    <thead className="bg-slate-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`border-b border-slate-200 px-4 ${compact ? "py-2" : "py-4"} text-left text-[10px] font-bold uppercase tracking-wide text-slate-500`}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {currentData.length > 0 ? (
                            currentData.map((row, index) => (
                                <tr
                                    key={row.id ?? index}
                                    className="hover:bg-slate-50"
                                >
                                    {columns.map((column) => {
                                        const value = row[column.key];

                                        return (
                                            <td
                                                key={column.key}
                                                className={`border-b border-slate-100 px-4 ${compact ? "py-3" : "py-4"} ${compact ? "text-xs" : "text-[13px]"} text-slate-700`}
                                            >
                                                {column.render
                                                    ? column.render(value, row)
                                                    : value}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className={`px-4 ${compact ? "py-7" : "py-12"} text-center text-sm text-slate-400`}
                                >
                                    <Search size={25} className="mx-auto mb-2" />
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className={`flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 ${compact ? "px-4 py-2" : "p-4"} text-[11px] text-slate-500`}>
                <span>
                    Showing {data.length === 0 ? 0 : startIndex + 1} -{" "}
                    {Math.min(startIndex + pageSize, data.length)} of {data.length} records
                </span>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        disabled={page === 1}
                        onClick={() => setPage((current) => current - 1)}
                        className={`flex ${compact ? "h-7 w-7" : "h-[30px] w-[30px]"} items-center justify-center rounded-md border border-slate-200 bg-white disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <span>{page} / {totalPages}</span>

                    <button
                        type="button"
                        disabled={page === totalPages}
                        onClick={() => setPage((current) => current + 1)}
                        className={`flex ${compact ? "h-7 w-7" : "h-[30px] w-[30px]"} items-center justify-center rounded-md border border-slate-200 bg-white disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DataTable;