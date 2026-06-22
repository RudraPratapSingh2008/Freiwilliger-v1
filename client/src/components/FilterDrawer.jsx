import { useEffect } from "react";
import { X, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const PAYMENT_OPTIONS = ["Any", "Paid", "Unpaid", "Refreshments"];
const GENDER_OPTIONS = ["Any", "Male", "Female"];

export const DEFAULT_FILTERS = {
  payment: "Any",
  distance: 25,
  dateFrom: "",
  dateTo: "",
  gender: "Any",
  minPay: "",
  skillsMatch: false,
};

function ToggleRow({ options, value, onSelect }) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`flex-1 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function FilterDrawer({
  filters = DEFAULT_FILTERS,
  onChange,
  onApply,
  onClose,
  isOpen,
}) {
  const update = (patch) => onChange?.({ ...filters, ...patch });

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleClearAll = () => onChange?.(DEFAULT_FILTERS);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter events"
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-xl rounded-t-2xl bg-white shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-slate-200" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-medium text-violet-600"
          >
            Clear All
          </button>
          <p className="text-base font-semibold text-slate-900">Filters</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] space-y-6 overflow-y-auto px-4 py-3">
          {/* Payment */}
          <div>
            <Label className="text-sm font-medium text-slate-700">Payment</Label>
            <div className="mt-2">
              <ToggleRow
                options={PAYMENT_OPTIONS}
                value={filters.payment}
                onSelect={(payment) => update({ payment })}
              />
            </div>
          </div>

          {/* Min pay (only if Paid) */}
          {filters.payment === "Paid" && (
            <div>
              <Label className="text-sm font-medium text-slate-700">
                Minimum pay
              </Label>
              <div className="mt-1.5 flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-slate-400" />
                <Input
                  type="number"
                  min={0}
                  value={filters.minPay}
                  onChange={(e) => update({ minPay: e.target.value })}
                  placeholder="0"
                  className="max-w-[160px]"
                />
              </div>
            </div>
          )}

          {/* Distance */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-slate-700">Distance</Label>
              <span className="text-sm font-medium text-violet-600">
                {filters.distance} km
              </span>
            </div>
            <Slider
              min={1}
              max={50}
              step={1}
              value={[filters.distance]}
              onValueChange={([distance]) => update({ distance })}
              className="mt-3"
            />
          </div>

          {/* Date range */}
          <div>
            <Label className="text-sm font-medium text-slate-700">Date range</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-400">From</span>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => update({ dateFrom: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <span className="text-xs text-slate-400">To</span>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => update({ dateTo: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Gender preference */}
          <div>
            <Label className="text-sm font-medium text-slate-700">
              Gender preference
            </Label>
            <div className="mt-2">
              <ToggleRow
                options={GENDER_OPTIONS}
                value={filters.gender}
                onSelect={(gender) => update({ gender })}
              />
            </div>
          </div>

          {/* Skills match */}
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Match my skills</p>
              <p className="text-xs text-slate-500">
                Only show events matching my skills
              </p>
            </div>
            <Switch
              checked={filters.skillsMatch}
              onCheckedChange={(skillsMatch) => update({ skillsMatch })}
            />
          </div>
        </div>

        {/* Apply */}
        <div className="border-t border-slate-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            className="w-full bg-violet-600 hover:bg-violet-700"
            onClick={onApply}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  );
}