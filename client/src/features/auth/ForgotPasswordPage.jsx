import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useForgotPasswordMutation } from '../../api/authApi';
import { setLoading, setError } from './authSlice';

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

const Label = ({ children, ...props }) => (
  <label className="block text-sm font-medium text-gray-700" {...props}>
    {children}
  </label>
);

const Loader = () => (
  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const OtpInput = ({ value, onChange, disabled }) => {
  const handleChange = (index, char) => {
    if (char.length > 1) return;
    const newValue = value.split('');
    newValue[index] = char;
    onChange(newValue.join('').slice(0, 6));
    if (char && index < 5) document.getElementById(`fp-otp-${index + 1}`)?.focus();
  };
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0)
      document.getElementById(`fp-otp-${index - 1}`)?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    onChange(e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6));
  };
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          id={`fp-otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-10 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none disabled:bg-gray-100"
        />
      ))}
    </div>
  );
};

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1); // 1=phone, 2=otp, 3=new password
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [firebaseToken, setFirebaseToken] = useState(null);

  const [forgotPassword] = useForgotPasswordMutation();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'fp-recaptcha-container', {
        size: 'invisible',
      });
    }
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleSendOtp = useCallback(async (e) => {
    e?.preventDefault();
    if (phone.length !== 10) return;
    dispatch(setLoading(true));
    setLocalError(null);
    try {
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, window.recaptchaVerifier);
      window.confirmationResult = result;
      setStep(2);
    } catch (err) {
      setLocalError('Failed to send OTP. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  }, [phone, dispatch]);

  const handleVerifyOtp = useCallback(async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    dispatch(setLoading(true));
    setLocalError(null);
    try {
      const result = await window.confirmationResult.confirm(otp);
      const token = await result.user.getIdToken();
      setFirebaseToken(token);
      setStep(3);
    } catch (err) {
      setLocalError('Invalid OTP. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  }, [otp, dispatch]);

  const handleResetPassword = useCallback(async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword || newPassword.length < 8) return;
    dispatch(setLoading(true));
    setLocalError(null);
    try {
      await forgotPassword({ firebaseIdToken: firebaseToken, newPassword }).unwrap();
      navigate('/login');
    } catch (err) {
      setLocalError(err.data?.message || 'Failed to reset password.');
    } finally {
      dispatch(setLoading(false));
    }
  }, [newPassword, confirmPassword, firebaseToken, forgotPassword, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600">Freiwilliger</h1>
          <p className="text-gray-500 text-sm mt-1">Reset your password</p>
        </div>

        {localError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {localError}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fp-phone">Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center justify-center px-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm font-medium">
                  +91
                </div>
                <Input
                  id="fp-phone"
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
              {loading ? <><Loader />Sending...</> : 'Send OTP'}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <Label>Enter OTP sent to +91 {phone}</Label>
            <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
              disabled={otp.length !== 6 || loading}
            >
              {loading ? <><Loader />Verifying...</> : 'Verify OTP'}
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
              disabled={newPassword.length < 8 || newPassword !== confirmPassword || loading}
            >
              {loading ? <><Loader />Resetting...</> : 'Reset Password'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Back to Login
          </button>
        </div>

        <div id="fp-recaptcha-container" />
      </div>
    </div>
  );
}