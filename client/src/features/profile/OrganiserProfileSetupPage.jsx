import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';
import { updateUser } from '../auth/authSlice';
import OrganiserProfileSetup from './OrganiserProfileSetup';

export default function OrganiserProfileSetupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    </div>
  );
}
