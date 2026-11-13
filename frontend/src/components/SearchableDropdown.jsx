import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

/**
 * Reusable searchable select.
 *
 * options: [{ value, label, keywords? }]
 * onChange receives the selected value (same value previously used by <select>).
 */
export default function SearchableDropdown({
    options = [],
    value = "",
    onChange,
    placeholder = "Select an option",
    searchPlaceholder = "Type to search...",
    disabled = false,
    className = "",
    emptyMessage = "No matching options found.",
    clearable = false,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const rootRef = useRef(null);
    const inputRef = useRef(null);

    const normalizedOptions = useMemo(
        () => options.map((option) => ({
            value: String(option.value ?? ""),
            label: String(option.label ?? ""),
            keywords: String(option.keywords ?? ""),
        })),
        [options]
    );

    const selectedOption = normalizedOptions.find(
        (option) => option.value === String(value ?? "")
    );

    const filteredOptions = useMemo(() => {
        const term = query.trim().toLocaleLowerCase();
        if (!term) return normalizedOptions;

        return normalizedOptions.filter((option) =>
            `${option.label} ${option.keywords}`
                .toLocaleLowerCase()
                .includes(term)
        );
    }, [normalizedOptions, query]);

    useEffect(() => {
        if (!open) return undefined;

        const handleOutsideClick = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
                setQuery("");
                setActiveIndex(0);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("touchstart", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("touchstart", handleOutsideClick);
        };
    }, [open]);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    const selectOption = (option) => {
        onChange?.(option.value, option);
        setOpen(false);
        setQuery("");
        setActiveIndex(0);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            setOpen(false);
            setQuery("");
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!open) {
                setOpen(true);
                return;
            }
            setActiveIndex((current) =>
                Math.min(current + 1, filteredOptions.length - 1)
            );
        }

        if (event.key === "ArrowUp" && open) {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
        }

        if (event.key === "Enter" && open && filteredOptions[activeIndex]) {
            event.preventDefault();
            selectOption(filteredOptions[activeIndex]);
        }
    };

    return (
        <div ref={rootRef} className="relative w-full min-w-0">
            <div
                className={`flex min-h-[36px] w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 ${
                    disabled ? "cursor-not-allowed bg-slate-50 opacity-60" : "cursor-text"
                } ${className}`}
                onClick={() => {
                    if (!disabled && !open) {
                        setQuery("");
                        setOpen(true);
                    }
                }}
            >
                {open ? (
                    <Search size={15} className="shrink-0 text-slate-400" />
                ) : (
                    <span className="min-w-0 flex-1 truncate text-left">
                        {selectedOption?.label || (
                            <span className="text-slate-400">{placeholder}</span>
                        )}
                    </span>
                )}

                {open && (
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setActiveIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={searchPlaceholder}
                        disabled={disabled}
                        className="h-8 min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                        aria-label={searchPlaceholder}
                        aria-expanded="true"
                        role="combobox"
                        aria-autocomplete="list"
                    />
                )}

                {clearable && value && !disabled && !open && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onChange?.("");
                        }}
                        className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Clear selection"
                    >
                        <X size={13} />
                    </button>
                )}

                <button
                    type="button"
                    disabled={disabled}
                    onClick={(event) => {
                        event.stopPropagation();
                        if (disabled) return;
                        setOpen((current) => {
                            if (!current) setQuery("");
                            return !current;
                        });
                    }}
                    className="ml-auto shrink-0 text-slate-400"
                    aria-label={open ? "Close options" : "Open options"}
                >
                    <ChevronDown
                        size={15}
                        className={`transition-transform ${open ? "rotate-180" : ""}`}
                    />
                </button>
            </div>

            {open && !disabled && (
                <div className="absolute left-0 right-0 top-full z-[150] mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => {
                            const isSelected = option.value === String(value ?? "");
                            const isActive = index === activeIndex;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => selectOption(option)}
                                    className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs transition ${
                                        isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                    role="option"
                                    aria-selected={isSelected}
                                >
                                    <span className="min-w-0 flex-1 break-words">
                                        {option.label}
                                    </span>
                                    {isSelected && (
                                        <Check size={14} className="shrink-0 text-blue-600" />
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <p className="px-3 py-3 text-xs text-slate-400">
                            {emptyMessage}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
