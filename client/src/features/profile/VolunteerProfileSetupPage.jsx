import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';
import { updateUser } from '../auth/authSlice';
import VolunteerProfileSetup from './VolunteerProfileSetup';

const normalizeOtherSkills = (freeText) => {
  if (!freeText) return [];
  return freeText
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
};

export default function VolunteerProfileSetupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async (formData) => {
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender,
        qualification: formData.qualification,
        occupation: formData.occupation,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        skills: formData.skills || [],
        otherSkills: normalizeOtherSkills(formData.freeTextSkills),
        languages: formData.languages || [],
        pastExperiences: formData.pastExperiences || [],
      };

      await axios.patch('/users/me/volunteer-profile', payload);

      if (formData.profilePhoto) {
        const photoData = new FormData();
        photoData.append('photo', formData.profilePhoto);
        await axios.post('/users/me/photo', photoData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (formData.aadhaarDocument) {
        const idData = new FormData();
        idData.append('document', formData.aadhaarDocument);
        await axios.post('/users/me/id-document', idData, {
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
        <VolunteerProfileSetup onComplete={handleComplete} />
      </div>
    </div>
  );
}
