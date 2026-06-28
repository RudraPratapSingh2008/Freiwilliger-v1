import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreateContactRequestMutation } from "@/api/contactRequestsApi";

const REASON_OPTIONS = [
  { value: "emergency", label: "Emergency" },
  { value: "event_coordination", label: "Event coordination" },
  { value: "technical_issue", label: "Technical issue" },
  { value: "other", label: "Other" },
];

export function OrganiserContactSheet({
  open,
  onOpenChange,
  volunteerId,
  volunteerName,
  eventId,
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [createContactRequest, { isLoading }] =
    useCreateContactRequestMutation();

  const isValid = reason !== "" && details.length >= 50;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      await createContactRequest({
        volunteerId,
        eventId,
        reason,
        details,
      }).unwrap();

      // Show success briefly then close
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setReason("");
        setDetails("");
        onOpenChange(false);
      }, 1500);
    } catch {
      // Error handled by RTK Query — could add toast here
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl p-6">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg
                className="size-6 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">
              Request submitted successfully
            </p>
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>Request Contact Info</SheetTitle>
              <SheetDescription>
                Request contact details for {volunteerName}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger id="reason" className="w-full">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {REASON_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="details">Details</Label>
                <Textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Explain why in-app messaging is not sufficient"
                  className="min-h-24"
                />
                <p className="text-xs text-muted-foreground">
                  {details.length}/50 characters minimum
                </p>
              </div>

              <Button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full"
              >
                {isLoading ? "Submitting…" : "Submit Request"}
              </Button>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default OrganiserContactSheet;
