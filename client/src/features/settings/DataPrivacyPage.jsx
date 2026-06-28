import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Download, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useDeleteAccountMutation } from "../../api/settingsApi";
import { logout } from "../../features/auth/authSlice";

// ---------------------------------------------------------------------------
// Privacy commitments
// ---------------------------------------------------------------------------

const PRIVACY_PROMISES = [
  "We never sell your data",
  "Your phone number is never shown publicly",
  "Contact info is shared only with your explicit approval",
  "You can delete your account at any time",
];

// ---------------------------------------------------------------------------
// Visibility table data
// ---------------------------------------------------------------------------

const VISIBILITY_DATA = [
  {
    viewer: "Volunteers",
    sees: "Name, photo, city, skills, reviews",
  },
  {
    viewer: "Organisers",
    sees: "Name, photo, city, skills, age range, qualification, reviews",
  },
  {
    viewer: "No one",
    sees: "Phone, email, exact age, ID document",
  },
];

// ---------------------------------------------------------------------------
// DataPrivacyPage
// ---------------------------------------------------------------------------

export default function DataPrivacyPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const handleDownloadData = () => {
    alert("Feature coming soon");
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch {
      // Silently handle — user stays on page if delete fails
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 shadow-sm">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full p-1 transition-colors hover:bg-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">Data &amp; Privacy</h1>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-6 px-4 pt-6">
        {/* Our Promises */}
        <Card className="rounded-xl border-0 p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-violet-600" />
            <h2 className="text-sm font-semibold text-slate-900">Our Promises</h2>
          </div>
          <ul className="space-y-2">
            {PRIVACY_PROMISES.map((promise) => (
              <li
                key={promise}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                {promise}
              </li>
            ))}
          </ul>
        </Card>

        {/* Who Sees What */}
        <Card className="rounded-xl border-0 p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Who Sees What</h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Viewer
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Can See
                  </th>
                </tr>
              </thead>
              <tbody>
                {VISIBILITY_DATA.map((row, idx) => (
                  <tr
                    key={row.viewer}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-3 py-2 font-medium text-slate-800">
                      {row.viewer}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{row.sees}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {/* Download My Data */}
          <Button
            variant="outline"
            className="w-full justify-center gap-2"
            onClick={handleDownloadData}
          >
            <Download className="h-4 w-4" />
            Download My Data
          </Button>

          {/* Delete My Account */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action is permanent and cannot be undone. All your data,
                  events, and connections will be removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {isDeleting ? "Deleting…" : "Yes, delete my account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
