import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function CommunityGuidelinesPage() {
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
            <h1 className="text-2xl font-bold text-slate-900">Community Guidelines</h1>
          </div>

          <p className="text-sm text-slate-500 mb-8">
            Last updated: January 2025
          </p>

          <div className="space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
            {/* 1. Purpose & Values */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">1. Purpose &amp; Values</h2>
              <p>
                Freiwilliger exists to connect passionate volunteers with meaningful opportunities across India. Our community thrives on trust, mutual respect, and a shared commitment to making a positive impact. These guidelines help ensure a safe, inclusive, and productive environment for everyone.
              </p>
            </section>

            {/* 2. Expected Behaviour */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">2. Expected Behaviour</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Respect:</strong> Treat all community members with dignity and respect, regardless of background, caste, religion, gender, or orientation.
                </li>
                <li>
                  <strong>Honesty:</strong> Provide accurate information in your profile, event listings, and communications. Misrepresentation erodes community trust.
                </li>
                <li>
                  <strong>Reliability:</strong> Honour your commitments. If you sign up for an event, show up on time. If circumstances change, provide advance notice.
                </li>
                <li>
                  <strong>Constructive feedback:</strong> When leaving reviews, be fair, specific, and constructive. Focus on the experience, not personal attacks.
                </li>
                <li>
                  <strong>Inclusivity:</strong> Welcome newcomers and support fellow community members. Volunteering is for everyone.
                </li>
              </ul>
            </section>

            {/* 3. Prohibited Content & Behaviour */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">3. Prohibited Content &amp; Behaviour</h2>
              <p className="mb-2">The following are strictly prohibited on Freiwilliger:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Harassment &amp; bullying:</strong> Intimidation, threats, stalking, or any form of harassment directed at other users.
                </li>
                <li>
                  <strong>Discrimination:</strong> Content or behaviour that discriminates based on caste, religion, race, gender, sexual orientation, disability, or any protected characteristic.
                </li>
                <li>
                  <strong>Spam &amp; solicitation:</strong> Unsolicited promotional content, pyramid schemes, MLM recruitment, or commercial advertising unrelated to volunteering.
                </li>
                <li>
                  <strong>Fake profiles:</strong> Creating accounts with false identities, impersonating others, or operating multiple accounts to manipulate the system.
                </li>
                <li>
                  <strong>No-shows without notice:</strong> Repeatedly signing up for events and failing to attend without providing reasonable advance notice.
                </li>
                <li>
                  <strong>Harmful content:</strong> Posting violent, sexually explicit, or otherwise inappropriate content.
                </li>
                <li>
                  <strong>Exploitation:</strong> Using the Platform to exploit volunteers (unpaid labour disguised as volunteering, unsafe conditions, etc.).
                </li>
                <li>
                  <strong>Illegal activity:</strong> Any activity that violates Indian law, including fraud, money laundering, or data theft.
                </li>
              </ul>
            </section>

            {/* 4. Reporting Violations */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">4. Reporting Violations</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>If you witness or experience a violation of these guidelines, please report it through the in-app "Report a Problem" feature in Settings → Support.</li>
                <li>You can also email us directly at support@freiwilliger.in with details of the incident.</li>
                <li>All reports are reviewed confidentially. We will never reveal the identity of the reporter to the accused party without consent.</li>
                <li>False or malicious reports are themselves a violation and may result in action against the reporter.</li>
              </ul>
            </section>

            {/* 5. Consequences */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">5. Consequences</h2>
              <p className="mb-2">Violations of these guidelines may result in the following actions, depending on severity:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Warning:</strong> A formal notice for first-time or minor violations, with guidance on expected behaviour.
                </li>
                <li>
                  <strong>Score penalties:</strong> Reduction of your reliability/engagement score, affecting your visibility and event eligibility.
                </li>
                <li>
                  <strong>Temporary suspension:</strong> Account access restricted for a defined period (7–30 days) for repeated or moderate violations.
                </li>
                <li>
                  <strong>Permanent ban:</strong> Immediate and permanent account removal for severe violations (harassment, illegal activity, exploitation).
                </li>
              </ul>
              <p className="mt-2">
                We apply consequences proportionally and consider context, intent, and history when making decisions.
              </p>
            </section>

            {/* 6. Appeal Process */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">6. Appeal Process</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>If you believe an action taken against your account is unjust, you may submit an appeal within 15 days.</li>
                <li>Send your appeal to appeals@freiwilliger.in with your username, the action taken, and your explanation.</li>
                <li>Appeals are reviewed by a different team member than the one who made the original decision.</li>
                <li>You will receive a response within 7 working days. The appeal decision is final.</li>
              </ul>
            </section>

            {/* 7. Contact */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">7. Contact</h2>
              <p>
                If you have questions about these Community Guidelines or need clarification, reach out to us:
              </p>
              <p className="mt-2 font-medium">
                Email: support@freiwilliger.in
              </p>
              <p className="font-medium">
                In-app: Settings → Support → Help Centre
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
