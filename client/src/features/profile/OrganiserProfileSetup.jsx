
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Building2, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const OrganiserProfileSetup = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [entityType, setEntityType] = useState(null); // 'company' or 'individual'
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    gstNumber: "",
    companyLogo: null,
    websiteUrl: "",
    fullName: "",
    email: "",
    profilePhoto: null,
  });
  const [companyLogoPreview, setCompanyLogoPreview] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size exceeds 5MB limit.');
        return;
      }
      setFormData((prev) => ({ ...prev, [type]: file }));
      if (type === 'companyLogo') {
        setCompanyLogoPreview(URL.createObjectURL(file));
      } else if (type === 'profilePhoto') {
        setProfilePhotoPreview(URL.createObjectURL(file));
      }
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleEntityTypeSelect = (type) => {
    setEntityType(type);
    setStep(2);
  };

  const validateStep2Company = () => {
    const { companyName, companyEmail, companyPhone } = formData;
    return companyName && companyEmail && companyPhone;
  };

  const validateStep2Individual = () => {
    const { fullName, email } = formData;
    return fullName && email;
  };

  const handleSubmit = () => {
    if (entityType === 'company' && validateStep2Company()) {
      onComplete({ ...formData, entityType });
    } else if (entityType === 'individual' && validateStep2Individual()) {
      onComplete({ ...formData, entityType });
    }
  };

  const progress = step === 1 ? 50 : 100;

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Progress value={progress} className="w-full mb-6" />
      <h2 className="text-2xl font-bold mb-6 text-center">Organiser Profile Setup</h2>

      {step === 1 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-center">Step 1: Choose Entity Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={`cursor-pointer ${entityType === 'company' ? 'border-indigo-500 ring-2 ring-indigo-500' : ''}`}
              onClick={() => handleEntityTypeSelect('company')}
            >
              <CardHeader>
                <Building2 className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Company</CardTitle>
                <CardDescription>Register as an organization or business.</CardDescription>
              </CardHeader>
            </Card>
            <Card
              className={`cursor-pointer ${entityType === 'individual' ? 'border-indigo-500 ring-2 ring-indigo-500' : ''}`}
              onClick={() => handleEntityTypeSelect('individual')}
            >
              <CardHeader>
                <User className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Individual</CardTitle>
                <CardDescription>Register as a sole organizer or person.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      )}

      {step === 2 && entityType === 'company' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Step 2: Company Details</h3>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="companyName">Company Name*</Label>
              <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="companyEmail">Company Email*</Label>
              <Input id="companyEmail" name="companyEmail" type="email" value={formData.companyEmail} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="companyPhone">Company Phone*</Label>
              <Input id="companyPhone" name="companyPhone" value={formData.companyPhone} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="gstNumber">GST Number (optional)</Label>
              <Input id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="companyLogo">Company Logo</Label>
              <Input
                id="companyLogo"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'companyLogo')}
              />
              {companyLogoPreview && (
                <div className="mt-2 w-24 h-24 rounded-full overflow-hidden border">
                  <img src={companyLogoPreview} alt="Company Logo Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="websiteUrl">Website URL (optional)</Label>
              <Input id="websiteUrl" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} />
            </div>
          </div>
        </div>
      )}

      {step === 2 && entityType === 'individual' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Step 2: Individual Details</h3>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="fullName">Full Name*</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email*</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="profilePhoto">Profile Photo</Label>
              <Input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'profilePhoto')}
              />
              {profilePhotoPreview && (
                <div className="mt-2 w-24 h-24 rounded-full overflow-hidden border">
                  <img src={profilePhotoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-4">
          <Label>Uploading...</Label>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      <div className="flex justify-between mt-8">
        {step === 2 && (
          <Button variant="outline" onClick={() => setStep(1)}>
            Previous
          </Button>
        )}
        {step === 2 && (
          <Button
            onClick={handleSubmit}
            disabled={entityType === 'company' ? !validateStep2Company() : !validateStep2Individual()}
          >
            Start Posting Events
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrganiserProfileSetup;
