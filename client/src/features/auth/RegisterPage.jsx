/**
 * Firebase-Wired Register Page for Freiwilliger
 * 
 * This file contains the complete RegisterPage component with Firebase Phone Auth integration.
 * Copy this to: client/src/features/auth/RegisterPage.jsx
 * 
 * Required imports in your project:
 * - firebase (npm install firebase)
 * - @reduxjs/toolkit (already installed)
 * - react-redux (already installed)
 */

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { 
  usePhoneAuthMutation, 
  useCompleteRegistrationMutation 
} from '../../api/authApi';
import { setCredentials, setLoading, setError } from './authSlice';

// UI Components
const Input = ({ className = '', ...props }) => (
  <input 
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 disabled:bg-gray-100 ${className}`}
    {...props}
  />
);

const Button = ({ children, className = '', disabled, ...props }) => (
  <button
    className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

const Label = ({ children, className = '', ...props }) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);

const Loader = () => (
  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// Icons
const CheckIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

// OTP Input Component
const OtpInput = ({ value, onChange, disabled }) => {
  const handleChange = (index, char) => {
    if (char.length > 1) return;
    
    const newValue = value.split('');
    newValue[index] = char;
    const result = newValue.join('').slice(0, 6);
    onChange(result);

    if (char && index < 5) {
      const nextInput = document.getElementById(`register-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      const prevInput = document.getElementById(`register-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pastedData);
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          id={`register-otp-${index}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-10 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all disabled:bg-gray-100"
        />
      ))}
    </div>
  );
};

// Firebase error message mapping
const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/invalid-phone-number': 'Invalid phone number. Please enter a valid Indian mobile number.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/invalid-verification-code': 'Invalid OTP. Please check and try again.',
    'auth/code-expired': 'OTP has expired. Please request a new one.',
    'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/operation-not-allowed': 'Phone authentication is not enabled.',
  };
  return errorMessages[errorCode] || 'An error occurred. Please try again.';
};

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error } = useSelector((state) => state.auth);

  // Check if user came from login (already verified phone)
  const isNewUser = searchParams.get('newUser') === 'true';
  const storedToken = sessionStorage.getItem('firebaseIdToken');

  const [step, setStep] = useState(isNewUser && storedToken ? 3 : 1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [firebaseToken, setFirebaseToken] = useState(storedToken || null);

  // RTK Query mutations
  const [phoneAuth] = usePhoneAuthMutation();
  const [completeRegistration] = useCompleteRegistrationMutation();

  // Resend OTP countdown
  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [step, resendTimer]);

  // Setup invisible reCAPTCHA
  useEffect(() => {
    if (!window.recaptchaVerifier && step < 3) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('[Freiwilliger] reCAPTCHA solved');
          },
        });
      } catch (err) {
        console.error('[Freiwilliger] reCAPTCHA setup error:', err);
      }
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [step]);

  // Handle sending OTP
  const handleSendOtp = useCallback(async (e) => {
    e?.preventDefault();
    if (phone.length !== 10) return;

    dispatch(setLoading(true));
    setLocalError(null);

    try {
      const formattedPhone = `+91${phone.trim()}`;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );
      
      window.confirmationResult = confirmationResult;
      setStep(2);
      setResendTimer(30);
      setCanResend(false);
      console.log('[Freiwilliger] OTP sent for registration');
    } catch (err) {
      console.error('[Freiwilliger] Send OTP error:', err);
      setLocalError(getFirebaseErrorMessage(err.code));
      
      // Reset reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }
    } finally {
      dispatch(setLoading(false));
    }
  }, [phone, dispatch]);

  // Handle OTP verification
  const handleVerifyOtp = useCallback(async (e) => {
    e.preventDefault();
    if (otp.length !== 6 || !window.confirmationResult) return;

    dispatch(setLoading(true));
    setLocalError(null);

    try {
      // Verify OTP with Firebase
      const result = await window.confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      setFirebaseToken(idToken);
      
      // Check if phone already registered
      const response = await phoneAuth(idToken).unwrap();
      
      if (!response.isNewUser) {
        // Phone already registered, log them in
        dispatch(setCredentials({
          user: response.user,
          accessToken: response.accessToken,
        }));
        navigate('/dashboard');
      } else {
        // New user, proceed to step 3
        setStep(3);
      }
    } catch (err) {
      console.error('[Freiwilliger] OTP verification error:', err);
      const errorMessage = err.code 
        ? getFirebaseErrorMessage(err.code)
        : err.data?.message || 'Verification failed.';
      setLocalError(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }, [otp, phoneAuth, dispatch, navigate]);

  // Handle registration completion
  const handleCompleteRegistration = useCallback(async (e) => {
    e.preventDefault();
    if (!username || !password || password !== confirmPassword) return;
    if (!firebaseToken) {
      setLocalError('Session expired. Please verify your phone again.');
      setStep(1);
      return;
    }

    dispatch(setLoading(true));
    setLocalError(null);

    try {
      const response = await completeRegistration({
        username,
        password,
        role: 'volunteer', // Default role, can be changed in profile setup
        firebaseIdToken: firebaseToken,
      }).unwrap();

      dispatch(setCredentials({
        user: response.user,
        accessToken: response.accessToken,
      }));

      // Clear stored token
      sessionStorage.removeItem('firebaseIdToken');
      
      // Navigate to role selection or dashboard
      navigate('/role-selection');
    } catch (err) {
      console.error('[Freiwilliger] Registration error:', err);
      setLocalError(err.data?.message || 'Registration failed. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  }, [username, password, confirmPassword, firebaseToken, completeRegistration, dispatch, navigate]);

  const handleResendOtp = () => {
    if (canResend) {
      handleSendOtp();
    }
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordValid = password.length >= 8;
  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 tracking-tight">
            Freiwilliger
          </h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step > stepNum
                    ? 'bg-indigo-600 text-white'
                    : step === stepNum
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > stepNum ? <CheckIcon /> : stepNum}
              </div>
              {stepNum < 3 && (
                <div
                  className={`w-8 sm:w-12 h-1 mx-1 rounded ${
                    step > stepNum ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-xs text-gray-500 mb-6 px-2">
          <span className={step >= 1 ? 'text-indigo-600 font-medium' : ''}>Phone</span>
          <span className={step >= 2 ? 'text-indigo-600 font-medium' : ''}>Verify</span>
          <span className={step >= 3 ? 'text-indigo-600 font-medium' : ''}>Account</span>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {displayError}
          </div>
        )}

        {/* Step 1: Phone Number */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center justify-center px-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm font-medium">
                  +91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
              disabled={phone.length !== 10 || loading}
            >
              {loading ? <><Loader /> Sending OTP...</> : 'Send OTP'}
            </Button>

            {/* reCAPTCHA Notice */}
            <p className="text-xs text-gray-400 text-center">
              Protected by reCAPTCHA
            </p>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
              }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              <ArrowLeftIcon />
              Back
            </button>

            <div className="space-y-2">
              <Label>Enter OTP</Label>
              <p className="text-xs text-gray-500 mb-3">
                We sent a 6-digit code to +91 {phone}
              </p>
              <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
              disabled={otp.length !== 6 || loading}
            >
              {loading ? <><Loader /> Verifying...</> : 'Verify OTP'}
            </Button>

            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-sm text-gray-400">
                  Resend OTP in {resendTimer}s
                </p>
              )}
            </div>
          </form>
        )}

        {/* Step 3: Username & Password */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Choose Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter a unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="lowercase"
                disabled={loading}
              />
              <p className="text-xs text-gray-400">
                Only lowercase letters, numbers, and underscores
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Set Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <p className={`text-xs ${passwordValid ? 'text-green-600' : 'text-gray-400'}`}>
                {passwordValid ? 'Password strength: Good' : 'Minimum 8 characters required'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pr-10 ${confirmPassword && !passwordsMatch ? 'border-red-300' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-600">Passwords match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
              disabled={!username || !passwordValid || !passwordsMatch || loading}
            >
              {loading ? <><Loader /> Creating Account...</> : 'Create Account'}
            </Button>
          </form>
        )}

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Login
            </button>
          </p>
        </div>

        {/* Hidden reCAPTCHA container */}
        <div id="recaptcha-container" />
      </div>
    </div>
  );
}
