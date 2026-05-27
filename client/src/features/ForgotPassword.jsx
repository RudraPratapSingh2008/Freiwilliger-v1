import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../lib/firebase";
import axios from "../../lib/axios";

// ─── Zod Schemas ───────────────────────────────────────────────────────────────

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Enter a valid 10-digit mobile number")
    .max(10, "Enter a valid 10-digit mobile number")
    .regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Step Indicator ────────────────────────────────────────────────────────────

function StepIndicator({ currentStep }) {
  const steps = [
    { num: 1, label: "Phone" },
    { num: 2, label: "OTP" },
    { num: 3, label: "Password" },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep > step.num
                  ? "bg-indigo-600 text-white ring-2 ring-indigo-200"
                  : currentStep === step.num
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                  : "bg-gray-100 text-gray-400 ring-2 ring-gray-100"
              }`}
            >
              {currentStep > step.num ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.num
              )}
            </div>
            <span
              className={`text-xs mt-1.5 font-medium ${
                currentStep >= step.num ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`w-16 h-0.5 mb-5 mx-1 transition-all duration-500 ${
                currentStep > step.num ? "bg-indigo-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── OTP Input Component ───────────────────────────────────────────────────────

function OtpBoxes({ value, onChange, hasError }) {
  const inputsRef = useRef([]);
  const digits = (value || "").split("").concat(Array(6).fill("")).slice(0, 6);

  const handleInput = (e, idx) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[idx] = char;
    const newVal = newDigits.join("");
    onChange(newVal);
    if (char && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (!digits[idx] && idx > 0) {
        const newDigits = [...digits];
        newDigits[idx - 1] = "";
        onChange(newDigits.join(""));
        inputsRef.current[idx - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[idx] = "";
        onChange(newDigits.join(""));
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, "").slice(0, 6));
      const nextIdx = Math.min(pasted.length, 5);
      inputsRef.current[nextIdx]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleInput(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className={`w-11 h-13 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
            hasError
              ? "border-red-400 bg-red-50 text-red-600"
              : digit
              ? "border-indigo-400 bg-indigo-50 text-indigo-700"
              : "border-gray-200 bg-gray-50 text-gray-800"
          }`}
          style={{ height: "52px" }}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [firebaseIdToken, setFirebaseIdToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [otpValue, setOtpValue] = useState("");
  const [success, setSuccess] = useState(false);
  const timerRef = useRef(null);

  // Start 30-second resend countdown
  const startResendTimer = () => {
    setResendTimer(30);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── Step 1: Phone Form ──
  const phoneForm = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  // ── Step 2: OTP Form ──
  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // ── Step 3: Password Form ──
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  // ── Setup reCAPTCHA (once on mount) ──
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container-forgot",
        { size: "invisible" }
      );
    }
  }, []);

  // ── Step 1 Submit: Send OTP via Firebase ──
  const handleSendOtp = async ({ phone: phoneNum }) => {
    setIsLoading(true);
    setApiError("");
    try {
      const formattedPhone = "+91" + phoneNum.trim();
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );
      window.forgotConfirmationResult = confirmationResult;
      setPhone(phoneNum);
      setStep(2);
      startResendTimer();
    } catch (err) {
      const code = err?.code;
      if (code === "auth/too-many-requests") {
        setApiError("Too many attempts. Please wait before trying again.");
      } else if (code === "auth/invalid-phone-number") {
        setApiError("This phone number is not registered.");
      } else {
        setApiError("Failed to send OTP. Please try again.");
      }
      // Reset reCAPTCHA on error
      window.recaptchaVerifier?.clear?.();
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container-forgot",
        { size: "invisible" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2 Submit: Verify OTP ──
  const handleVerifyOtp = async ({ otp }) => {
    setIsLoading(true);
    setApiError("");
    try {
      const result = await window.forgotConfirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      setFirebaseIdToken(idToken);
      setStep(3);
    } catch (err) {
      const code = err?.code;
      if (code === "auth/invalid-verification-code") {
        setApiError("Incorrect OTP. Please check and try again.");
      } else if (code === "auth/code-expired") {
        setApiError("OTP has expired. Please request a new one.");
      } else {
        setApiError("OTP verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ──
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    setApiError("");
    setOtpValue("");
    otpForm.reset();
    try {
      const formattedPhone = "+91" + phone;
      window.recaptchaVerifier?.clear?.();
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container-forgot",
        { size: "invisible" }
      );
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );
      window.forgotConfirmationResult = confirmationResult;
      startResendTimer();
    } catch {
      setApiError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3 Submit: Reset Password via Backend ──
  const handleResetPassword = async ({ newPassword }) => {
    setIsLoading(true);
    setApiError("");
    try {
      await axios.post("/auth/forgot-password/reset", {
        firebaseIdToken,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      const message = err?.response?.data?.message;
      setApiError(message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success State ──
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
          <p className="text-gray-500 text-sm">Redirecting you to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-12">
      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container-forgot" />

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 font-medium mb-6 hover:text-indigo-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Login
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-gray-500 text-sm mt-1.5">
            {step === 1 && "We'll send a verification code to your phone"}
            {step === 2 && `OTP sent to +91 ${phone}`}
            {step === 3 && "Choose a strong new password"}
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Global API Error */}
          {apiError && (
            <div className="mb-5 flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {apiError}
            </div>
          )}

          {/* ── STEP 1: Phone ── */}
          {step === 1 && (
            <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} noValidate>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mobile Number
                </label>
                <div className="flex items-center gap-0 rounded-xl border-2 border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all overflow-hidden">
                  <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm font-medium border-r border-gray-200 select-none">
                    +91
                  </span>
                  <input
                    {...phoneForm.register("phone")}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    className="flex-1 px-3 py-3 text-sm outline-none bg-white text-gray-900 placeholder-gray-400"
                    autoFocus
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {phoneForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending OTP…
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                Protected by reCAPTCHA
              </p>
            </form>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 2 && (
            <form
              onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
              noValidate
            >
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                  Enter 6-digit OTP
                </label>
                <OtpBoxes
                  value={otpValue}
                  onChange={(val) => {
                    setOtpValue(val);
                    otpForm.setValue("otp", val, { shouldValidate: true });
                  }}
                  hasError={!!otpForm.formState.errors.otp}
                />
                {otpForm.formState.errors.otp && (
                  <p className="mt-2 text-xs text-red-600 text-center">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || otpValue.length < 6}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Verifying…
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs text-gray-400">
                    Resend OTP in{" "}
                    <span className="text-indigo-600 font-semibold">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 disabled:opacity-50 transition-colors"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setStep(1); setApiError(""); setOtpValue(""); }}
                className="w-full mt-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Change phone number
              </button>
            </form>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 3 && (
            <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} noValidate>
              {/* New Password */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  New Password
                </label>
                <input
                  {...passwordForm.register("newPassword")}
                  type="password"
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  autoFocus
                  className={`w-full px-3.5 py-3 rounded-xl border-2 text-sm outline-none transition-all focus:ring-2 ${
                    passwordForm.formState.errors.newPassword
                      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100"
                  } text-gray-900 placeholder-gray-400`}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <input
                  {...passwordForm.register("confirmPassword")}
                  type="password"
                  placeholder="Repeat new password"
                  className={`w-full px-3.5 py-3 rounded-xl border-2 text-sm outline-none transition-all focus:ring-2 ${
                    passwordForm.formState.errors.confirmPassword
                      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100"
                  } text-gray-900 placeholder-gray-400`}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Resetting…
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Remember your password?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}