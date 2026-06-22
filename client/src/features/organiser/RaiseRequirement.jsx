import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  MapPin,
  CalendarClock,
  Users,
  ShieldCheck,
  IndianRupee,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Static option lists
// ---------------------------------------------------------------------------

const CATEGORIES = [
  "Wedding",
  "Corporate",
  "Festival",
  "Sports",
  "Concert",
  "Conference",
  "Exhibition",
  "Charity",
  "Other",
];

const ROLE_PRESETS = [
  "Usher",
  "Crowd Manager",
  "Registration Desk",
  "Security",
  "Stage Hand",
  "Hospitality",
  "Photography Assist",
];

const SKILL_PRESETS = [
  "First Aid",
  "Public Speaking",
  "Crowd Control",
  "Event Photography",
  "Stage Management",
  "Hospitality",
  "Driving",
];

const LANGUAGE_PRESETS = [
  "Hindi",
  "English",
  "Marathi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Gujarati",
  "Kannada",
];

const STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Schedule" },
  { id: 3, label: "Roles" },
  { id: 4, label: "Requirements" },
  { id: 5, label: "Compensation" },
];

const INITIAL_FORM = {
  // Step 1
  name: "",
  description: "",
  category: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  // Step 2
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  // Step 3
  totalVolunteers: "",
  roles: [],
  // Step 4
  genderPref: "Any",
  ageRange: [18, 60],
  skills: [],
  languages: [],
  dressCode: "",
  minHelpScore: [0],
  otherRequirements: "",
  // Step 5
  paymentType: "Unpaid",
  amount: "",
  amountUnit: "flat",
  refreshmentsDesc: "",
};

// ---------------------------------------------------------------------------
// Small reusable pieces
// ---------------------------------------------------------------------------

function FieldLabel({ children, required }) {
  return (
    <Label className="text-sm font-medium text-slate-700">
      {children}
      {required && <span className="text-violet-600"> *</span>}
    </Label>
  );
}

function TagPicker({ presets, value, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const toggle = (tag) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  };

  const addCustom = () => {
    const clean = draft.trim();
    if (clean && !value.includes(clean)) {
      onChange([...value, clean]);
    }
    setDraft("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const active = value.includes(p);
          return (
            <button
              key={p}
              type="button"
              onClick={() => toggle(p)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder={placeholder}
          className="h-9"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 border-violet-200 text-violet-600 hover:bg-violet-50"
          onClick={addCustom}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {value.filter((v) => !presets.includes(v)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value
            .filter((v) => !presets.includes(v))
            .map((tag) => (
              <Badge
                key={tag}
                className="gap-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
              >
                {tag}
                <button type="button" onClick={() => toggle(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}

function StepShell({ title, subtitle, children }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function RaiseRequirement({ onSubmit }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const duration = useMemo(() => {
    if (!form.startDate || !form.startTime || !form.endDate || !form.endTime) {
      return null;
    }
    const start = new Date(`${form.startDate}T${form.startTime}`);
    const end = new Date(`${form.endDate}T${form.endTime}`);
    const diffMs = end - start;
    if (Number.isNaN(diffMs) || diffMs <= 0) return "invalid";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    if (days > 0) return `${days}d ${remHours}h ${minutes}m`;
    return `${hours}h ${minutes}m`;
  }, [form.startDate, form.startTime, form.endDate, form.endTime]);

  const progressPct = (step / STEPS.length) * 100;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handlePublish = () => {
    onSubmit?.(form);
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
          <Sparkles className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-900">
            Raise Requirement
          </p>
          <p className="text-xs text-slate-500">
            Tell volunteers what your event needs
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between">
          {STEPS.map((s) => (
            <span
              key={s.id}
              className={`text-[11px] font-medium ${
                s.id === step
                  ? "text-violet-600"
                  : s.id < step
                  ? "text-slate-500"
                  : "text-slate-300"
              }`}
            >
              {s.id}. {s.label}
            </span>
          ))}
        </div>
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-5">
          {/* STEP 1 — Basics */}
          {step === 1 && (
            <StepShell
              title="Event basics"
              subtitle="What's happening, and where"
            >
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Event name</FieldLabel>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name")(e.target.value)}
                    placeholder="e.g. Sharma-Mehta Wedding Reception"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <FieldLabel required>Description</FieldLabel>
                  <Textarea
                    value={form.description}
                    onChange={(e) => set("description")(e.target.value)}
                    placeholder="Briefly describe the event and what volunteers should expect"
                    className="mt-1.5"
                    rows={3}
                  />
                </div>

                <div>
                  <FieldLabel required>Category</FieldLabel>
                  <Select value={form.category} onValueChange={set("category")}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FieldLabel required>Venue address</FieldLabel>
                  <Input
                    value={form.address}
                    onChange={(e) => set("address")(e.target.value)}
                    placeholder="Building, street, area"
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel required>City</FieldLabel>
                    <Input
                      value={form.city}
                      onChange={(e) => set("city")(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <FieldLabel required>State</FieldLabel>
                    <Input
                      value={form.state}
                      onChange={(e) => set("state")(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel required>Pincode</FieldLabel>
                  <Input
                    value={form.pincode}
                    onChange={(e) =>
                      set("pincode")(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    inputMode="numeric"
                    placeholder="6-digit pincode"
                    className="mt-1.5 max-w-[160px]"
                  />
                </div>
              </div>
            </StepShell>
          )}

          {/* STEP 2 — Date & Time */}
          {step === 2 && (
            <StepShell title="Date & time" subtitle="When volunteers are needed">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel required>Start date</FieldLabel>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => set("startDate")(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <FieldLabel required>Start time</FieldLabel>
                    <Input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => set("startTime")(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel required>End date</FieldLabel>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => set("endDate")(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <FieldLabel required>End time</FieldLabel>
                    <Input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => set("endTime")(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2.5 text-sm text-indigo-700">
                  <CalendarClock className="h-4 w-4 shrink-0" />
                  {duration === null && "Duration shows once both dates and times are set"}
                  {duration === "invalid" && "End must be after start"}
                  {duration && duration !== "invalid" && (
                    <span>
                      Duration: <strong>{duration}</strong>
                    </span>
                  )}
                </div>
              </div>
            </StepShell>
          )}

          {/* STEP 3 — Roles & Count */}
          {step === 3 && (
            <StepShell title="Roles & headcount" subtitle="Who, and how many">
              <div className="space-y-5">
                <div>
                  <FieldLabel required>Total volunteers needed</FieldLabel>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      min={1}
                      value={form.totalVolunteers}
                      onChange={(e) => set("totalVolunteers")(e.target.value)}
                      placeholder="e.g. 12"
                      className="max-w-[140px]"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Roles needed</FieldLabel>
                  <p className="mb-2 text-xs text-slate-500">
                    Pick from common roles or add your own
                  </p>
                  <TagPicker
                    presets={ROLE_PRESETS}
                    value={form.roles}
                    onChange={set("roles")}
                    placeholder="Add a custom role"
                  />
                </div>
              </div>
            </StepShell>
          )}

          {/* STEP 4 — Requirements */}
          {step === 4 && (
            <StepShell
              title="Volunteer requirements"
              subtitle="Set the bar for who can apply"
            >
              <div className="space-y-6">
                <div>
                  <FieldLabel>Gender preference</FieldLabel>
                  <RadioGroup
                    value={form.genderPref}
                    onValueChange={set("genderPref")}
                    className="mt-2 flex gap-4"
                  >
                    {["Any", "Male", "Female"].map((g) => (
                      <div key={g} className="flex items-center gap-2">
                        <RadioGroupItem value={g} id={`gender-${g}`} />
                        <Label htmlFor={`gender-${g}`} className="text-sm font-normal">
                          {g}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Age range</FieldLabel>
                    <span className="text-sm font-medium text-violet-600">
                      {form.ageRange[0]} – {form.ageRange[1]} yrs
                    </span>
                  </div>
                  <Slider
                    min={18}
                    max={60}
                    step={1}
                    value={form.ageRange}
                    onValueChange={set("ageRange")}
                    className="mt-3"
                  />
                </div>

                <div>
                  <FieldLabel>Required skills</FieldLabel>
                  <div className="mt-2">
                    <TagPicker
                      presets={SKILL_PRESETS}
                      value={form.skills}
                      onChange={set("skills")}
                      placeholder="Add a custom skill"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Required languages</FieldLabel>
                  <div className="mt-2">
                    <TagPicker
                      presets={LANGUAGE_PRESETS}
                      value={form.languages}
                      onChange={set("languages")}
                      placeholder="Add a custom language"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Dress code</FieldLabel>
                  <Input
                    value={form.dressCode}
                    onChange={(e) => set("dressCode")(e.target.value)}
                    placeholder="e.g. Formal black, branded T-shirt provided"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Minimum Help Score required</FieldLabel>
                    <span className="text-sm font-medium text-violet-600">
                      {form.minHelpScore[0]}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={form.minHelpScore}
                    onValueChange={set("minHelpScore")}
                    className="mt-3"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Default 0 — open to all volunteers
                  </p>
                </div>

                <div>
                  <FieldLabel>Other requirements</FieldLabel>
                  <Textarea
                    value={form.otherRequirements}
                    onChange={(e) => set("otherRequirements")(e.target.value)}
                    placeholder="Anything else volunteers should know before applying"
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>
            </StepShell>
          )}

          {/* STEP 5 — Compensation */}
          {step === 5 && (
            <StepShell title="Compensation" subtitle="What volunteers get in return">
              <div className="space-y-5">
                <RadioGroup
                  value={form.paymentType}
                  onValueChange={set("paymentType")}
                  className="grid grid-cols-2 gap-2"
                >
                  {["Paid", "Unpaid", "Refreshments only", "Paid + Refreshments"].map(
                    (opt) => {
                      const active = form.paymentType === opt;
                      return (
                        <Label
                          key={opt}
                          htmlFor={`pay-${opt}`}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-normal transition-colors ${
                            active
                              ? "border-violet-600 bg-violet-50 text-violet-700"
                              : "border-slate-200 text-slate-600"
                          }`}
                        >
                          <RadioGroupItem value={opt} id={`pay-${opt}`} />
                          {opt}
                        </Label>
                      );
                    }
                  )}
                </RadioGroup>

                {(form.paymentType === "Paid" ||
                  form.paymentType === "Paid + Refreshments") && (
                  <div className="space-y-3 rounded-lg bg-slate-50 p-3">
                    <div>
                      <FieldLabel required>Amount</FieldLabel>
                      <div className="mt-1.5 flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-slate-400" />
                        <Input
                          type="number"
                          min={0}
                          value={form.amount}
                          onChange={(e) => set("amount")(e.target.value)}
                          placeholder="0"
                          className="max-w-[160px]"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {["flat", "per-hour"].map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => set("amountUnit")(u)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            form.amountUnit === u
                              ? "border-violet-600 bg-violet-600 text-white"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          {u === "flat" ? "Flat amount" : "Per hour"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(form.paymentType === "Refreshments only" ||
                  form.paymentType === "Paid + Refreshments") && (
                  <div>
                    <FieldLabel>Refreshments description</FieldLabel>
                    <Textarea
                      value={form.refreshmentsDesc}
                      onChange={(e) => set("refreshmentsDesc")(e.target.value)}
                      placeholder="e.g. Lunch, snacks and water provided on-site"
                      className="mt-1.5"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </StepShell>
          )}
        </CardContent>
      </Card>

      {/* Nav buttons */}
      <div className="mt-4 flex gap-3">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={back}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        {step < STEPS.length ? (
          <Button
            type="button"
            className="flex-1 gap-1.5 bg-violet-600 hover:bg-violet-700"
            onClick={next}
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            className="flex-1 gap-1.5 bg-violet-600 hover:bg-violet-700"
            onClick={handlePublish}
          >
            <Send className="h-4 w-4" />
            Publish Requirement
          </Button>
        )}
      </div>

      {/* Live preview */}
      {step === STEPS.length && (
        <Card className="mt-5 border-dashed border-violet-200 bg-violet-50/40">
          <CardContent className="space-y-3 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              Preview
            </p>

            <div>
              <p className="font-semibold text-slate-900">
                {form.name || "Untitled event"}
              </p>
              <p className="text-sm text-slate-500">
                {form.category || "No category selected"}
              </p>
            </div>

            <div className="flex items-start gap-1.5 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                {[form.address, form.city, form.state, form.pincode]
                  .filter(Boolean)
                  .join(", ") || "Venue not set"}
              </span>
            </div>

            <div className="flex items-start gap-1.5 text-sm text-slate-600">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                {form.startDate && form.startTime
                  ? `${form.startDate} ${form.startTime} → ${form.endDate} ${form.endTime}`
                  : "Schedule not set"}
                {duration && duration !== "invalid" && ` (${duration})`}
              </span>
            </div>

            <div className="flex items-start gap-1.5 text-sm text-slate-600">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                {form.totalVolunteers || "0"} volunteers
                {form.roles.length > 0 && ` · ${form.roles.join(", ")}`}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {form.skills.map((s) => (
                <Badge key={s} variant="secondary" className="bg-white text-slate-600">
                  {s}
                </Badge>
              ))}
              {form.languages.map((l) => (
                <Badge key={l} variant="secondary" className="bg-white text-slate-600">
                  {l}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <IndianRupee className="h-4 w-4 text-slate-400" />
              {form.paymentType}
              {(form.paymentType === "Paid" ||
                form.paymentType === "Paid + Refreshments") &&
                form.amount &&
                ` · ₹${form.amount} (${form.amountUnit})`}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}