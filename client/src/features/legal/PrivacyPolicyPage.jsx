import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-3xl">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <Card className="rounded-xl border-0 shadow-sm p-6 sm:p-8">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-violet-600" />
            <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
          </div>

          <p className="text-sm text-slate-500 mb-8">
            Last updated: January 2025
          </p>

          <div className="space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
            {/* 1. Information We Collect */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">1. Information We Collect</h2>
              <p className="mb-2">We collect the following types of information when you use Freiwilliger:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Phone number:</strong> Used for account verification and optional contact sharing.</li>
                <li><strong>Email address:</strong> Used for account recovery, notifications, and communication.</li>
                <li><strong>Location data:</strong> City, area, or coordinates to match you with nearby volunteering opportunities.</li>
                <li><strong>Profile data:</strong> Name, bio, skills, interests, profile photo, and availability preferences.</li>
                <li><strong>Usage data:</strong> App interactions, event participation history, and engagement metrics.</li>
                <li><strong>Device information:</strong> Browser type, operating system, and device identifiers for security and analytics.</li>
              </ul>
            </section>

            {/* 2. How We Use Information */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To create and maintain your account on the Platform.</li>
                <li>To match volunteers with relevant events based on skills, interests, and location.</li>
                <li>To facilitate communication between volunteers and organisers through the contact request system.</li>
                <li>To calculate and maintain reliability scores and engagement metrics.</li>
                <li>To send notifications about events, applications, and Platform updates.</li>
                <li>To improve the Platform's features, performance, and user experience.</li>
                <li>To enforce our Terms &amp; Conditions and Community Guidelines.</li>
              </ul>
            </section>

            {/* 3. Information Sharing */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">3. Information Sharing</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Contact request system:</strong> Your phone number or email is shared with an organiser only after you explicitly approve their contact request.
                </li>
                <li>
                  <strong>Public profile:</strong> Information you add to your public profile (name, bio, skills, city) is visible to other authenticated users.
                </li>
                <li>
                  <strong>Never sold:</strong> We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                </li>
                <li>
                  <strong>Legal requirements:</strong> We may disclose information if required by Indian law, court order, or government authority.
                </li>
              </ul>
            </section>

            {/* 4. Data Security */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">4. Data Security</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>All data is transmitted over encrypted connections (HTTPS/TLS).</li>
                <li>Passwords are hashed and never stored in plain text.</li>
                <li>Access to user data is restricted to authorised personnel on a need-to-know basis.</li>
                <li>We conduct regular security reviews and follow industry-standard practices.</li>
                <li>While we take reasonable measures, no system is 100% secure. We encourage you to use strong, unique passwords.</li>
              </ul>
            </section>

            {/* 5. Your Rights */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">5. Your Rights</h2>
              <p className="mb-2">As a user, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information in your profile at any time.</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data through Settings → Data &amp; Privacy.</li>
                <li><strong>Withdraw consent:</strong> Opt out of non-essential communications and data processing.</li>
                <li><strong>Portability:</strong> Request your data in a commonly used, machine-readable format.</li>
              </ul>
            </section>

            {/* 6. Cookies and Local Storage */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">6. Cookies &amp; Local Storage</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>We use local storage to maintain your authentication session and app preferences.</li>
                <li>No third-party advertising cookies are used on the Platform.</li>
                <li>Essential cookies are used for security (CSRF protection) and session management.</li>
                <li>You can clear local storage through your browser settings, though this will log you out.</li>
              </ul>
            </section>

            {/* 7. Third-Party Services */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">7. Third-Party Services</h2>
              <p className="mb-2">We use the following third-party services:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Firebase (Google):</strong> Authentication, real-time database, and cloud messaging for push notifications.
                </li>
                <li>
                  <strong>Cloudinary:</strong> Image hosting and optimization for profile photos and event images.
                </li>
                <li>
                  <strong>Nominatim (OpenStreetMap):</strong> Geocoding and reverse geocoding for location-based features. No personal data is sent — only coordinates or search queries.
                </li>
              </ul>
              <p className="mt-2">
                Each third-party service has its own privacy policy. We encourage you to review them.
              </p>
            </section>

            {/* 8. Children's Privacy */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">8. Children's Privacy</h2>
              <p>
                Freiwilliger is intended for users aged 18 and above. We do not knowingly collect personal information from individuals under 18 years of age. If we become aware that a user is under 18, we will take steps to delete their account and associated data promptly.
              </p>
            </section>

            {/* 9. Changes to Policy */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">9. Changes to This Policy</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law.</li>
                <li>Significant changes will be communicated via in-app notification or email.</li>
                <li>Continued use of the Platform after changes constitutes acceptance of the updated policy.</li>
                <li>The "Last updated" date at the top indicates when the policy was last revised.</li>
              </ul>
            </section>

            {/* 10. Indian Data Protection Compliance */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">10. Indian Data Protection Compliance</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Information Technology Act, 2000:</strong> We comply with the IT Act and its rules, including the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
                </li>
                <li>
                  <strong>Digital Personal Data Protection Act (DPDP Act), 2023:</strong> We are committed to complying with the DPDP Act as its provisions come into effect. This includes lawful processing of personal data, purpose limitation, data minimisation, and respecting data principal rights.
                </li>
                <li>
                  <strong>Grievance Officer:</strong> In accordance with applicable regulations, a Grievance Officer has been appointed to address your concerns regarding data processing. Contact details are provided below.
                </li>
              </ul>
            </section>

            {/* 11. Contact */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">11. Contact Information</h2>
              <p>
                For any privacy-related queries or to exercise your data rights, please contact us:
              </p>
              <p className="mt-2 font-medium">
                Email: privacy@freiwilliger.in
              </p>
              <p className="font-medium">
                Grievance Officer: grievance@freiwilliger.in
              </p>
              <p className="font-medium">
                Address: Bengaluru, Karnataka, India
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
