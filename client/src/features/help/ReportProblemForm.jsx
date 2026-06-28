import { useState } from "react";
import { useSubmitReportMutation } from "../../api/supportApi";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const CATEGORIES = [
  "Bug",
  "Account Issue",
  "Safety Concern",
  "Feature Request",
  "Other",
];

const INITIAL_STATE = {
  category: "Bug",
  subject: "",
  description: "",
  screenshot: null,
};

export default function ReportProblemForm() {
  const [form, setForm] = useState(INITIAL_STATE);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitReport, { isLoading }] = useSubmitReportMutation();

  const descriptionTooShort = form.description.length > 0 && form.description.length < 20;
  const isValid =
    form.subject.trim().length > 0 &&
    form.description.length >= 20;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccessMessage("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, screenshot: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    const formData = new FormData();
    formData.append("category", form.category);
    formData.append("subject", form.subject);
    formData.append("description", form.description);
    if (form.screenshot) {
      formData.append("screenshot", form.screenshot);
    }

    try {
      await submitReport(formData).unwrap();
      setSuccessMessage("Report submitted successfully");
      setForm(INITIAL_STATE);
      // Reset the file input
      const fileInput = document.getElementById("screenshot-input");
      if (fileInput) fileInput.value = "";
    } catch {
      // Error handled by RTK Query state
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-lg mx-auto p-4">
      <h2 className="text-lg font-semibold">Report a Problem</h2>

      {successMessage && (
        <p className="text-sm text-green-600 font-medium">{successMessage}</p>
      )}

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select value={form.category} onValueChange={(val) => handleChange("category", val)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          placeholder="Brief summary of the issue"
          value={form.subject}
          onChange={(e) => handleChange("subject", e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the problem in detail (min 20 characters)"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={5}
          required
        />
        <div className="flex items-center justify-between text-xs">
          <span className={descriptionTooShort ? "text-red-500" : "text-muted-foreground"}>
            {descriptionTooShort && "Description must be at least 20 characters"}
          </span>
          <span className="text-muted-foreground">{form.description.length}/20</span>
        </div>
      </div>

      {/* Screenshot */}
      <div className="space-y-1.5">
        <Label htmlFor="screenshot-input">Screenshot (optional)</Label>
        <Input
          id="screenshot-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* Submit */}
      <Button type="submit" disabled={!isValid || isLoading} className="w-full">
        {isLoading ? "Submitting..." : "Submit Report"}
      </Button>
    </form>
  );
}
