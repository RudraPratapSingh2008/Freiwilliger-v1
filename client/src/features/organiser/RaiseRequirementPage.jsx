import { useNavigate } from "react-router-dom";
import RaiseRequirement from "./RaiseRequirement";
import { useCreateEventMutation } from "@/api/eventsApi";
import useGeolocation from "@/hooks/useGeolocation";

// Wizard offers 4 payment options; the server schema only stores 2
// (paid | unpaid | certificate | stipend) plus a free-text `notes` field —
// fold the extra nuance (refreshments) into notes instead of dropping it.
function mapCompensation(form) {
  const isPaid = form.paymentType === "Paid" || form.paymentType === "Paid + Refreshments";
  const hasRefreshments =
    form.paymentType === "Refreshments only" || form.paymentType === "Paid + Refreshments";

  const notesParts = [];
  if (hasRefreshments) {
    notesParts.push(form.refreshmentsDesc ? `Refreshments: ${form.refreshmentsDesc}` : "Refreshments provided");
  }
  if (isPaid && form.amountUnit === "per-hour") {
    notesParts.push("Amount is per hour");
  }

  return {
    paymentType: isPaid ? "paid" : "unpaid",
    amount: isPaid ? Number(form.amount) || 0 : 0,
    notes: notesParts.join(". ") || undefined,
  };
}

function mapFormToPayload(form, location) {
  return {
    eventName: form.name,
    description: form.description,
    category: form.category,
    location: {
      lat: location.lat,
      lng: location.lng,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
    },
    dateTime: {
      start: new Date(`${form.startDate}T${form.startTime}`).toISOString(),
      end: new Date(`${form.endDate}T${form.endTime}`).toISOString(),
    },
    requirements: {
      genderPreference: form.genderPref,
      requiredSkills: form.skills,
      minHelpScore: Array.isArray(form.minHelpScore) ? form.minHelpScore[0] : form.minHelpScore,
      minAge: form.ageRange?.[0],
      maxAge: form.ageRange?.[1],
      requiredLanguages: form.languages,
      dressCode: form.dressCode || undefined,
      otherRequirements: form.otherRequirements || undefined,
    },
    compensation: mapCompensation(form),
    roles: form.roles,
    totalVolunteersNeeded: Number(form.totalVolunteers) || 1,
  };
}

export default function RaiseRequirementPage() {
  const navigate = useNavigate();
  const [createEvent] = useCreateEventMutation();
  const { location, loading: geoLoading, error: geoError } = useGeolocation();

  const handleSubmit = async (form) => {
    // The wizard has no map picker yet, so the venue's coordinates come from
    // the organiser's current location via the browser. Without it the
    // backend's required geo-index field has nothing to populate.
    if (geoLoading) {
      window.alert("Still getting your location — please wait a moment and try again.");
      return;
    }
    if (geoError || !location) {
      window.alert(
        "Location access is required to publish an event (used for the venue's map coordinates). Please enable location permissions and try again."
      );
      return;
    }

    try {
      await createEvent(mapFormToPayload(form, location)).unwrap();
      navigate("/dashboard");
    } catch (err) {
      const message = err?.data?.message || "Failed to publish event. Please check your details and try again.";
      window.alert(message);
    }
  };

  return <RaiseRequirement onSubmit={handleSubmit} />;
}
