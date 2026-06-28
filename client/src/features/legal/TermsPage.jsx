import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function TermsPage() {
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
            <FileText className="h-6 w-6 text-violet-600" />
            <h1 className="text-2xl font-bold text-slate-900">Terms &amp; Conditions</h1>
          </div>

          <p className="text-sm text-slate-500 mb-8">
            Last updated: January 2025
          </p>

          <div className="space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
            {/* 1. Acceptance of Terms */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Freiwilliger platform ("Platform"), you agree to be bound by these Terms &amp; Conditions. If you do not agree, please discontinue use immediately. These terms constitute a legally binding agreement between you and Freiwilliger.
              </p>
            </section>

            {/* 2. Eligibility */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">2. Eligibility</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Volunteers:</strong> You must be at least 18 years of age to register as a volunteer on the Platform.
                </li>
                <li>
                  <strong>Organisers:</strong> You must be a registered entity (NGO, trust, society, company, or other legal body registered under applicable Indian law) to create an organiser account. You represent and warrant that you have the authority to bind such entity.
                </li>
                <li>
                  Users must provide accurate, current, and complete information during registration.
                </li>
              </ul>
            </section>

            {/* 3. Account Responsibilities */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">3. Account Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You must not share your login details with any third party.</li>
                <li>You are responsible for all activities that occur under your account.</li>
                <li>You must notify us immediately if you suspect any unauthorized access to your account.</li>
              </ul>
            </section>

            {/* 4. Volunteer Obligations */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">4. Volunteer Obligations</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Honour commitments made through the Platform. If you sign up for an event, attend reliably or provide advance notice of cancellation.</li>
                <li>Behave respectfully towards organisers, other volunteers, and event beneficiaries.</li>
                <li>Provide truthful information in your profile and applications.</li>
                <li>Not engage in any illegal, harmful, or disruptive activities during volunteering events.</li>
              </ul>
            </section>

            {/* 5. Organiser Obligations */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">5. Organiser Obligations</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Post accurate and truthful event descriptions, requirements, and schedules.</li>
                <li>Provide a safe environment for volunteers participating in your events.</li>
                <li>Not exploit, underpay (if stipends are offered), or mislead volunteers.</li>
                <li>Respond to volunteer applications in a timely and respectful manner.</li>
                <li>Comply with all applicable Indian labour and welfare laws.</li>
              </ul>
            </section>

            {/* 6. Privacy */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">6. Privacy</h2>
              <p>
                Your privacy is important to us. Please review our{" "}
                <button
                  type="button"
                  onClick={() => navigate("/privacy-policy")}
                  className="text-violet-600 hover:text-violet-700 underline font-medium"
                >
                  Privacy Policy
                </button>{" "}
                to understand how we collect, use, and protect your personal information. By using the Platform, you consent to our data practices as described in the Privacy Policy.
              </p>
            </section>

            {/* 7. Intellectual Property */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">7. Intellectual Property</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>All content, design, logos, and software on the Platform are owned by Freiwilliger or its licensors and are protected under Indian intellectual property laws.</li>
                <li>You may not copy, reproduce, distribute, or create derivative works from any Platform content without prior written permission.</li>
                <li>Content you post (profile information, reviews, photos) remains yours, but you grant Freiwilliger a non-exclusive, royalty-free licence to display it on the Platform.</li>
              </ul>
            </section>

            {/* 8. Limitation of Liability */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">8. Limitation of Liability</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Freiwilliger acts as a platform connecting volunteers with organisers. We are not a party to any agreement between volunteers and organisers.</li>
                <li>We do not guarantee the quality, safety, or legality of any volunteering opportunity listed on the Platform.</li>
                <li>To the maximum extent permitted under Indian law, Freiwilliger shall not be liable for any indirect, incidental, consequential, or punitive damages.</li>
                <li>Our total liability shall not exceed ₹1,000 (Indian Rupees One Thousand) in aggregate.</li>
              </ul>
            </section>

            {/* 9. Termination */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">9. Termination &amp; Account Deletion</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You may delete your account at any time through Settings → Data &amp; Privacy.</li>
                <li>Freiwilliger reserves the right to suspend or terminate accounts that violate these terms, our Community Guidelines, or applicable law.</li>
                <li>Upon termination, your profile data will be deleted within 30 days, except where retention is required by law.</li>
              </ul>
            </section>

            {/* 10. Dispute Resolution */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">10. Dispute Resolution</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>These terms are governed by the laws of India.</li>
                <li>Any disputes arising from or relating to these terms shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.</li>
                <li>Before initiating legal proceedings, parties agree to attempt resolution through good-faith negotiation for at least 30 days.</li>
              </ul>
            </section>

            {/* 11. Contact */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">11. Contact Information</h2>
              <p>
                If you have any questions about these Terms &amp; Conditions, please contact us at:
              </p>
              <p className="mt-2 font-medium">
                Email: legal@freiwilliger.in
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
