import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import axios from '../../lib/axios';
import { updateUser } from '../auth/authSlice';
import { startVerification } from '../../services/digilocker';
import OrganiserProfileSetup from './OrganiserProfileSetup';

export default function OrganiserProfileSetupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [digiLockerLoading, setDigiLockerLoading] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const verificationStatus = user?.idVerificationStatus || 'none';

  const handleDigiLockerVerify = async () => {
    setDigiLockerLoading(true);
    try {
      await startVerification();
    } catch {
      // silent — popup handles flow
    } finally {
      setDigiLockerLoading(false);
    }
  };

  const handleComplete = async (formData) => {
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        entityType: formData.entityType,
        companyName: formData.companyName,
        companyEmail: formData.companyEmail,
        companyPhone: formData.companyPhone,
        gstNumber: formData.gstNumber,
        websiteUrl: formData.websiteUrl,
        fullName: formData.fullName,
        email: formData.email,
      };

      await axios.patch('/users/me/organiser-profile', payload);

      if (formData.entityType === 'company' && formData.companyLogo) {
        const logoData = new FormData();
        logoData.append('photo', formData.companyLogo);
        await axios.post('/users/me/company-logo', logoData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (formData.entityType === 'individual' && formData.profilePhoto) {
        const photoData = new FormData();
        photoData.append('photo', formData.profilePhoto);
        await axios.post('/users/me/photo', photoData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      const refreshed = await axios.get('/users/me');
      dispatch(updateUser(refreshed.data?.data || {}));

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="max-w-md mx-auto px-4 pt-6">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}
      <div className={isLoading ? 'pointer-events-none opacity-70' : ''}>
        <OrganiserProfileSetup onComplete={handleComplete} />
      </div>

      {/* DigiLocker Verification Section */}
      <div className="max-w-md mx-auto px-4 pb-8">
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-violet-600" />
            <span className="text-sm font-semibold text-gray-800">Identity Verification</span>
          </div>
          {verificationStatus === 'verified' ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Verified with DigiLocker</span>
            </div>
          ) : verificationStatus === 'pending' ? (
            <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Verification Pending</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDigiLockerVerify}
              disabled={digiLockerLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {digiLockerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {verificationStatus === 'failed' ? 'Retry Verification' : 'Verify with DigiLocker'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
