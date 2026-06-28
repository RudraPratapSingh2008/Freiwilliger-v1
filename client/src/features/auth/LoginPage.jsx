/**
 * Firebase-Wired Login Page for Freiwilliger
 * 
 * This file contains the complete LoginPage component with Firebase Phone Auth integration.
 * Copy this to: client/src/features/auth/LoginPage.jsx
 * 
 * Required imports in your project:
 * - firebase (npm install firebase)
 * - @reduxjs/toolkit (already installed)
 * - react-redux (already installed)
 * 
 * Environment variables needed:
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_APP_ID
 */

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { 
  usePhoneAuthMutation, 
  useLoginMutation 
} from '../../api/authApi';
import { setCredentials, setLoading, setError } from './authSlice';
import * as analytics from '../../services/analytics';

// UI Components - adjust imports based on your UI library
// If using custom components, replace these with your own
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

// Loading Spinner
const Loader = () => (
  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// Icons (inline SVGs to avoid dependency)
const PhoneIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

const ArrowLeftIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      const prevInput = document.getElementById(`login-otp-${index - 1}`);
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
          id={`login-otp-${index}`}
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

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [mode, setMode] = useState('phone'); // 'phone' or 'username'
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  // RTK Query mutations
  const [phoneAuth] = usePhoneAuthMutation();
  const [login] = useLoginMutation();

  // Setup invisible reCAPTCHA on mount
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('[Freiwilliger] reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.log('[Freiwilliger] reCAPTCHA expired');
            setLocalError('reCAPTCHA expired. Please try again.');
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
  }, []);

  // Handle sending OTP via Firebase
  const handleSendOtp = useCallback(async (e) => {
    e.preventDefault();
    if (phone.length !== 10) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    setLocalError(null);

    try {
      const formattedPhone = `+91${phone.trim()}`;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );
      
      // Save confirmationResult for OTP verification
      window.confirmationResult = confirmationResult;
      setStep('otp');
      console.log('[Freiwilliger] OTP sent successfully');
    } catch (err) {
      console.error('[Freiwilliger] Send OTP error:', err);
      const errorMessage = getFirebaseErrorMessage(err.code);
      setLocalError(errorMessage);
      
      // Reset reCAPTCHA on error
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

  // Handle OTP verification and backend auth
  const handleVerifyOtp = useCallback(async (e) => {
    e.preventDefault();
    if (otp.length !== 6 || !window.confirmationResult) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    setLocalError(null);

    try {
      // Step 1: Verify OTP with Firebase
      const result = await window.confirmationResult.confirm(otp);
      const firebaseIdToken = await result.user.getIdToken();
      console.log('[Freiwilliger] OTP verified, got Firebase token');

      // Step 2: Send token to our backend
      const response = await phoneAuth(firebaseIdToken).unwrap();

      if (response.isNewUser) {
        // New user - redirect to registration
        // Store the Firebase token for registration completion
        sessionStorage.setItem('firebaseIdToken', firebaseIdToken);
        navigate('/register?newUser=true');
      } else {
        // Existing user - set credentials and redirect
        dispatch(setCredentials({
          user: response.user,
          accessToken: response.accessToken,
        }));
        analytics.track('user_logged_in', { method: 'phone' });
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('[Freiwilliger] OTP verification error:', err);
      const errorMessage = err.code 
        ? getFirebaseErrorMessage(err.code)
        : err.data?.message || 'Verification failed. Please try again.';
      setLocalError(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }, [otp, phoneAuth, dispatch, navigate]);

  // Handle username/password login
  const handleUsernameLogin = useCallback(async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    setLocalError(null);

    try {
      const response = await login({ username, password }).unwrap();
      dispatch(setCredentials({
        user: response.user,
        accessToken: response.accessToken,
      }));
      analytics.track('user_logged_in', { method: 'username' });
      navigate('/dashboard');
    } catch (err) {
      console.error('[Freiwilliger] Login error:', err);
      setLocalError(err.data?.message || 'Invalid username or password.');
    } finally {
      dispatch(setLoading(false));
    }
  }, [username, password, login, dispatch, navigate]);

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 tracking-tight">
            Freiwilliger
          </h1>
          <p className="text-gray-500 text-sm mt-1">Find volunteer work near you</p>
        </div>

        {/* Mode Toggle - only show when on phone step */}
        {step === 'phone' && (
          <div className="flex bg-gray-100 rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                mode === 'phone'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <PhoneIcon />
              Phone OTP
            </button>
            <button
              type="button"
              onClick={() => setMode('username')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                mode === 'username'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserIcon />
              Username
            </button>
          </div>
        )}

        {/* Error Message */}
        {displayError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {displayError}
          </div>
        )}

        {/* Phone OTP Mode - Enter Phone */}
        {mode === 'phone' && step === 'phone' && (
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
              <p className="text-xs text-gray-400">We'll send you a verification code</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
              disabled={phone.length !== 10 || loading}
            >
              {loading ? <><Loader /> Sending OTP...</> : 'Send OTP'}
            </Button>
          </form>
        )}

        {/* Phone OTP Mode - Verify OTP */}
        {mode === 'phone' && step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtp('');
              }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              <ArrowLeftIcon />
              Back
            </button>

            <div className="space-y-2">
              <Label>Enter OTP</Label>
              <p className="text-xs text-gray-500 mb-2">
                We sent a 6-digit code to +91 {phone}
              </p>
              <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
              disabled={otp.length !== 6 || loading}
            >
              {loading ? <><Loader /> Verifying...</> : 'Verify & Login'}
            </Button>

            <button
              type="button"
              onClick={() => {
                setOtp('');
                handleSendOtp({ preventDefault: () => {} });
              }}
              className="w-full text-sm text-indigo-600 hover:text-indigo-700"
              disabled={loading}
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* Username/Password Mode */}
        {mode === 'username' && step === 'phone' && (
          <form onSubmit={handleUsernameLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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
            </div>

            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Forgot Password?
            </button>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
              disabled={!username || !password || loading}
            >
              {loading ? <><Loader /> Logging in...</> : 'Login'}
            </Button>
          </form>
        )}

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Register
            </button>
          </p>
        </div>

        {/* Hidden reCAPTCHA container for Firebase */}
        <div id="recaptcha-container" />
      </div>
    </div>
  );
}
