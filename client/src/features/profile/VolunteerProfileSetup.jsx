
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2 } from 'lucide-react';

const qualifications = ['10th', '12th', 'Diploma', 'Graduate', 'PG', 'Other'];
const presetSkills = ['Ushering', 'Crowd Management', 'Registration Desk', 'Security', 'Hospitality', 'Event Setup', 'MC/Hosting', 'Photography', 'First Aid', 'Catering'];
const languages = ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Malayalam', 'Punjabi', 'Odia'];

const VolunteerProfileSetup = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    gender: '',
    qualification: '',
    occupation: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    skills: [],
    freeTextSkills: '',
    languages: [],
    pastExperiences: [],
    profilePhoto: null,
    aadhaarDocument: null,
  });
  const [newExperience, setNewExperience] = useState({ organisation: '', role: '', duration: '' });
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [aadhaarDocumentPreview, setAadhaarDocumentPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillChange = (skill) => {
    setFormData((prev) => {
      const currentSkills = prev.skills;
      if (currentSkills.includes(skill)) {
        return { ...prev, skills: currentSkills.filter((s) => s !== skill) };
      } else {
        return { ...prev, skills: [...currentSkills, skill] };
      }
    });
  };

  const handleLanguageChange = (lang) => {
    setFormData((prev) => {
      const currentLanguages = prev.languages;
      if (currentLanguages.includes(lang)) {
        return { ...prev, languages: currentLanguages.filter((l) => l !== lang) };
      } else {
        return { ...prev, languages: [...currentLanguages, lang] };
      }
    });
  };

  const handleAddExperience = () => {
    if (newExperience.organisation && newExperience.role && newExperience.duration) {
      setFormData((prev) => ({
        ...prev,
        pastExperiences: [...prev.pastExperiences, newExperience],
      }));
      setNewExperience({ organisation: '', role: '', duration: '' });
    }
  };

  const handleRemoveExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      pastExperiences: prev.pastExperiences.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size exceeds 5MB limit.');
        return;
      }
      setFormData((prev) => ({ ...prev, [type]: file }));
      if (type === 'profilePhoto') {
        setProfilePhotoPreview(URL.createObjectURL(file));
      } else if (type === 'aadhaarDocument') {
        setAadhaarDocumentPreview(file.name);
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

  const validateStep1 = () => {
    const { fullName, email, age, gender, qualification, occupation, street, city, state, pincode } = formData;
    return fullName && email && age >= 18 && gender && qualification && occupation && street && city && state && pincode;
  };

  const validateStep2 = () => {
    return formData.skills.length > 0 || formData.freeTextSkills.trim() !== '';
  };

  const validateStep3 = () => {
    return formData.languages.length > 0;
  };

  const validateStep4 = () => {
    return true; // Past experience is optional
  };

  const validateStep5 = () => {
    return formData.profilePhoto !== null && formData.aadhaarDocument !== null;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step === 4 && !validateStep4()) return;
    setStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep5()) {
      onComplete(formData);
    }
  };

  const progress = (step / 5) * 100;

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Progress value={progress} className="w-full mb-6" />
      <h2 className="text-2xl font-bold mb-6 text-center">Volunteer Profile Setup</h2>

      {step === 1 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Step 1: Personal Details</h3>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              <Button variant="link" className="px-0">Verify OTP</Button>
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} min="18" required />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select name="gender" value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="qualification">Qualification</Label>
              <Select name="qualification" value={formData.qualification} onValueChange={(value) => handleSelectChange('qualification', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Qualification" />
                </SelectTrigger>
                <SelectContent>
                  {qualifications.map((q) => (
                    <SelectItem key={q} value={q}>{q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} required />
            </div>
            <h4 className="font-semibold mt-2">Address</h4>
            <div>
              <Label htmlFor="street">Street</Label>
              <Input id="street" name="street" value={formData.street} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" value={formData.state} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} required />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Step 2: Skills</h3>
          <div className="grid gap-2">
            <Label>Select your skills (min 1 required)</Label>
            <div className="flex flex-wrap gap-2">
              {presetSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant={formData.skills.includes(skill) ? 'default' : 'outline'}
                  onClick={() => handleSkillChange(skill)}
                  className="cursor-pointer"
                >
                  {skill}
                </Badge>
              ))}
            </div>
            <Label htmlFor="freeTextSkills" className="mt-4">Other Skills (comma separated)</Label>
            <Input
              id="freeTextSkills"
              name="freeTextSkills"
              value={formData.freeTextSkills}
              onChange={handleChange}
              placeholder="e.g., Driving, Cooking"
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Step 3: Languages</h3>
          <div className="grid gap-2">
            <Label>Select languages you speak (min 1 required)</Label>
            {languages.map((lang) => (
              <div key={lang} className="flex items-center space-x-2">
                <Checkbox
                  id={lang}
                  checked={formData.languages.includes(lang)}
                  onCheckedChange={() => handleLanguageChange(lang)}
                />
                <Label htmlFor={lang}>{lang}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Step 4: Past Experience</h3>
          <div className="grid gap-4">
            <Accordion type="single" collapsible className="w-full">
              {formData.pastExperiences.map((exp, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>
                    {exp.organisation} - {exp.role}
                  </AccordionTrigger>
                  <AccordionContent className="flex justify-between items-center">
                    <span>Duration: {exp.duration}</span>
                    <Button variant="destructive" size="icon" onClick={() => handleRemoveExperience(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="border p-4 rounded-md grid gap-2">
              <h4 className="font-semibold">Add New Experience</h4>
              <div>
                <Label htmlFor="expOrganisation">Organisation Name</Label>
                <Input
                  id="expOrganisation"
                  value={newExperience.organisation}
                  onChange={(e) => setNewExperience((prev) => ({ ...prev, organisation: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="expRole">Role</Label>
                <Input
                  id="expRole"
                  value={newExperience.role}
                  onChange={(e) => setNewExperience((prev) => ({ ...prev, role: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="expDuration">Duration (e.g., "6 months")</Label>
                <Input
                  id="expDuration"
                  value={newExperience.duration}
                  onChange={(e) => setNewExperience((prev) => ({ ...prev, duration: e.target.value }))}
                />
              </div>
              <Button onClick={handleAddExperience} className="mt-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Step 5: ID Verification</h3>
          <div className="grid gap-4">
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
              <p className="text-sm text-gray-500 mt-1">Max 5MB. Circular crop indicator (not implemented in UI).</p>
            </div>
            <div>
              <Label htmlFor="aadhaarDocument">Aadhaar Upload</Label>
              <Input
                id="aadhaarDocument"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileChange(e, 'aadhaarDocument')}
              />
              {aadhaarDocumentPreview && (
                <p className="text-sm text-gray-700 mt-1">File selected: {aadhaarDocumentPreview}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">Max 5MB. Only last 4 digits visible to others.</p>
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4">
                <Label>Uploading...</Label>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        {step > 1 && (
          <Button variant="outline" onClick={handlePrevious}>
            Previous
          </Button>
        )}
        {step < 5 && (
          <Button onClick={handleNext} disabled={step === 1 ? !validateStep1() : step === 2 ? !validateStep2() : step === 3 ? !validateStep3() : !validateStep4()}>
            Next
          </Button>
        )}
        {step === 5 && (
          <Button onClick={handleSubmit} disabled={!validateStep5()}>
            Complete Profile
          </Button>
        )}
      </div>
    </div>
  );
};

export default VolunteerProfileSetup;
