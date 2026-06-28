import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, BadgeCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function calculateCompletion(user) {
  if (!user) return { percentage: 0, completedCount: 0, totalItems: 0, items: [] };
  
  const items = user.role === "volunteer" 
    ? [
        { key: "phoneVerified", label: "Phone verified", isComplete: !!user.isPhoneVerified, navigateTo: "/settings" },
        { key: "photoUploaded", label: "Photo uploaded", isComplete: !!user.volunteerProfile?.profilePhoto, navigateTo: "/profile-setup/volunteer" },
        { key: "emailVerified", label: "Email verified", isComplete: !!user.volunteerProfile?.isEmailVerified, navigateTo: "/settings" },
        { key: "skillsAdded", label: "Skills added", isComplete: (user.volunteerProfile?.skills?.length || 0) > 0, navigateTo: "/profile-setup/volunteer" },
      ]
    : [
        { key: "phoneVerified", label: "Phone verified", isComplete: !!user.isPhoneVerified, navigateTo: "/settings" },
        { key: "photoUploaded", label: "Photo/logo uploaded", isComplete: !!(user.organiserProfile?.profilePhoto || user.organiserProfile?.logo), navigateTo: "/profile-setup/organiser" },
        { key: "emailVerified", label: "Email verified", isComplete: !!user.organiserProfile?.isEmailVerified, navigateTo: "/settings" },
        { key: "companyInfo", label: "Company info complete", isComplete: !!(user.organiserProfile?.entityType && user.organiserProfile?.companyName && user.organiserProfile?.companyEmail), navigateTo: "/profile-setup/organiser" },
      ];

  const completedCount = items.filter(i => i.isComplete).length;
  const totalItems = items.length;
  const percentage = Math.round((completedCount / totalItems) * 100);

  return { percentage, completedCount, totalItems, items };
}

export default function ProfileCompleteness({ user, isOwnProfile }) {
  const navigate = useNavigate();
  
  if (!isOwnProfile || !user) return null;
  
  const { percentage, items } = calculateCompletion(user);

  return (
    <div className="space-y-4 p-4 rounded-xl bg-white shadow-sm border">
      {/* Badge at 100% */}
      {percentage === 100 && (
        <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
          <BadgeCheck className="h-5 w-5" />
          <span>Verified Profile</span>
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-slate-700">Profile completion</span>
          <span className="text-slate-500">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>

      {/* Checklist */}
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.key} className="flex items-center gap-2">
            {item.isComplete ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            {item.isComplete ? (
              <span className="text-sm text-slate-600">{item.label}</span>
            ) : (
              <button
                onClick={() => navigate(item.navigateTo)}
                className="text-sm text-indigo-600 hover:underline"
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
