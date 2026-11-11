import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import profileApi from '../api/profileApi';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AutocompleteInput from '../components/common/AutocompleteInput';
import ConfirmationModal from '../components/common/ConfirmationModal';
import {
  SUGGESTED_LANGUAGES,
  SUGGESTED_SKILLS,
  SUGGESTED_INTERESTS,
} from '../data/suggestionData';

const COMMON_LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C', 'C#', 'PHP', 'Ruby', 'Kotlin', 'Swift'
];

const COMMON_SKILLS = [
  'React', 'Node.js', 'Express.js', 'MongoDB', 'Spring Boot', 'REST API', 'SQL', 'Docker', 'Git', 'HTML', 'CSS', 'GraphQL', 'Tailwind CSS'
];

const COMMON_INTERESTS = [
  'Web Development', 'Backend Development', 'Frontend Development', 'Mobile Development', 'AI/ML', 'DevOps', 'Data Science', 'Cybersecurity', 'Open Source', 'Documentation', 'Testing'
];

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const TIME_OPTIONS = [
  '1-2 hrs/week',
  '5 hrs/week',
  '10 hrs/week',
  '15+ hrs/week',
];

const getInitials = (name) => {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  // Profile data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: '',
    languages: [],
    skills: [],
    experienceLevel: '',
    interests: [],
    availableHours: '',
    createdAt: '',
  });

  // Edit mode toggle
  const [isEditing, setIsEditing] = useState(false);

  // Form draft state for editing
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    languages: [],
    skills: [],
    experienceLevel: '',
    interests: [],
    availableHours: '',
  });

  const [customLanguage, setCustomLanguage] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [customInterest, setCustomInterest] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showRemovePhotoModal, setShowRemovePhotoModal] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await profileApi.getProfile();
      if (data?.success && data?.user) {
        const u = data.user;
        const normalized = {
          name: u.name || '',
          email: u.email || '',
          avatar: u.avatar || '',
          languages: Array.isArray(u.languages) ? u.languages : [],
          skills: Array.isArray(u.skills) ? u.skills : [],
          experienceLevel: u.experienceLevel || '',
          interests: Array.isArray(u.interests) ? u.interests : [],
          availableHours: u.availableHours || '',
          createdAt: u.createdAt || '',
        };
        setProfileData(normalized);
        setFormData(normalized);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load user profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleStartEdit = () => {
    setFormData({
      name: profileData.name,
      avatar: profileData.avatar,
      languages: [...profileData.languages],
      skills: [...profileData.skills],
      experienceLevel: profileData.experienceLevel,
      interests: [...profileData.interests],
      availableHours: profileData.availableHours,
    });
    setIsEditing(true);
    setAlert({ type: '', message: '' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({ ...profileData });
  };

  const toggleItem = (field, item) => {
    setFormData((prev) => {
      const exists = prev[field].includes(item);
      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((x) => x !== item)
          : [...prev[field], item],
      };
    });
  };

  const addCustomItem = (field, item, setItem) => {
    const trimmed = typeof item === 'string' ? item.trim() : '';
    if (!trimmed) return;
    if (!formData[field].some((x) => x.toLowerCase() === trimmed.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], trimmed],
      }));
    }
    if (typeof setItem === 'function') {
      setItem('');
    }
  };

  const removeItem = (field, item) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((x) => x !== item),
    }));
  };

  // Photo upload handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAlert({ type: 'error', message: 'Please select a valid image file (PNG, JPG, or WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAlert({ type: 'error', message: 'Image size should be less than 5MB.' });
      return;
    }

    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Crop and resize to square 256x256
          const canvas = document.createElement('canvas');
          const size = 256;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

          // Save photo to backend immediately
          const res = await profileApi.updateProfile({ avatar: dataUrl });
          if (res?.success) {
            setProfileData((prev) => ({ ...prev, avatar: dataUrl }));
            setFormData((prev) => ({ ...prev, avatar: dataUrl }));
            await refreshUser();
            setAlert({ type: 'success', message: 'Profile photo updated successfully!' });
          }
        } catch (err) {
          setAlert({
            type: 'error',
            message: err.response?.data?.message || err.message || 'Failed to update profile photo.',
          });
        } finally {
          setUploadingPhoto(false);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset file input
  };

  // Remove photo confirmation handler
  const handleConfirmRemovePhoto = async () => {
    try {
      setUploadingPhoto(true);
      const res = await profileApi.updateProfile({ avatar: '' });
      if (res?.success) {
        setProfileData((prev) => ({ ...prev, avatar: '' }));
        setFormData((prev) => ({ ...prev, avatar: '' }));
        await refreshUser();
        setAlert({ type: 'success', message: 'Profile photo removed.' });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to remove photo.',
      });
    } finally {
      setUploadingPhoto(false);
      setShowRemovePhotoModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert({ type: '', message: '' });

    try {
      const payload = {
        name: formData.name.trim(),
        avatar: formData.avatar,
        languages: formData.languages,
        skills: formData.skills,
        experienceLevel: formData.experienceLevel,
        interests: formData.interests,
        availableHours: formData.availableHours,
      };

      const res = await profileApi.updateProfile(payload);
      if (res?.success) {
        setProfileData((prev) => ({
          ...prev,
          ...payload,
        }));
        setIsEditing(false);
        await refreshUser();
        setAlert({
          type: 'success',
          message: 'Profile updated successfully!',
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to save profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile details..." />;
  }

  const activeAvatar = isEditing ? formData.avatar : profileData.avatar;
  const activeName = isEditing ? formData.name : profileData.name;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Alert Messages */}
      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />
      )}

      {/* =========================================================================
          PROFILE HEADER CARD
          Circular photo/avatar, actual name, email, edit button
      ========================================================================== */}
      <div className="content-card rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
            {/* Circular Profile Photo / Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#ff7200] shadow-lg bg-slate-900 flex items-center justify-center">
                {activeAvatar ? (
                  <img
                    src={activeAvatar}
                    alt={activeName || 'User profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#ff7200] to-[#e66600] flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl tracking-wider select-none">
                    {getInitials(activeName)}
                  </div>
                )}
              </div>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Upload or change profile photo"
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer"
              >
                {uploadingPhoto ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span className="text-base mb-0.5">📷</span>
                    <span>Change</span>
                  </>
                )}
              </button>
            </div>

            {/* Profile Identity Details */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {profileData.name || 'Developer'}
                </h1>
                {profileData.experienceLevel && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ff7200]/15 text-[#ff7200] border border-[#ff7200]/30">
                    {profileData.experienceLevel}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-300 font-medium">
                {profileData.email}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-400">
                {profileData.availableHours && (
                  <span className="flex items-center gap-1.5">
                    <span>⏱️</span>
                    <span>{profileData.availableHours}</span>
                  </span>
                )}
                {profileData.languages.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span>💻</span>
                    <span>{profileData.languages.length} languages</span>
                  </span>
                )}
                {profileData.createdAt && (
                  <span className="text-slate-500">
                    Joined {new Date(profileData.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Photo Actions under Avatar on mobile/desktop */}
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#ff7200] hover:underline font-semibold cursor-pointer"
                >
                  {profileData.avatar ? 'Change photo' : 'Upload photo'}
                </button>
                {profileData.avatar && (
                  <>
                    <span className="text-white/20">•</span>
                    <button
                      type="button"
                      onClick={() => setShowRemovePhotoModal(true)}
                      className="text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Button / Actions */}
          <div className="shrink-0 flex items-center gap-3">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="btn-orange px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>✏️</span>
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white border border-white/10 bg-slate-900 hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel Editing
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE: Organized Clean Profile Details
      ========================================================================== */}
      {!isEditing ? (
        <div className="space-y-6">
          {/* Grid of Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Programming Languages */}
            <div className="content-card rounded-2xl p-6 border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff7200]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    Programming Languages
                  </h2>
                </div>
                <span className="text-xs text-slate-400">
                  {profileData.languages.length} configured
                </span>
              </div>

              {profileData.languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#ff7200]/15 text-[#ff7200] border border-[#ff7200]/30"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-2">
                  No languages configured yet. Click "Edit Profile" to add the programming languages you know.
                </p>
              )}
            </div>

            {/* Frameworks & Skills */}
            <div className="content-card rounded-2xl p-6 border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff7200]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    Frameworks & Skills
                  </h2>
                </div>
                <span className="text-xs text-slate-400">
                  {profileData.skills.length} configured
                </span>
              </div>

              {profileData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-200 border border-white/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-2">
                  No frameworks or skills specified. Click "Edit Profile" to add tools like React, Node.js, Docker, etc.
                </p>
              )}
            </div>

            {/* Topics & Domain Interests */}
            <div className="content-card rounded-2xl p-6 border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    Topics & Ecosystem Interests
                  </h2>
                </div>
                <span className="text-xs text-slate-400">
                  {profileData.interests.length} configured
                </span>
              </div>

              {profileData.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                    >
                      #{interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-2">
                  No domain interests selected. Add themes like Web Development, AI/ML, or DevOps.
                </p>
              )}
            </div>

            {/* Contribution Commitment */}
            <div className="content-card rounded-2xl p-6 border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    Contribution Commitment
                  </h2>
                </div>
                <span className="text-xs text-slate-400">Pace & Calibration</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Experience Level
                  </span>
                  <p className="text-base font-bold text-white">
                    {profileData.experienceLevel || 'Not set'}
                  </p>
                  <span className="text-[11px] text-slate-400 block">
                    Calibrates good-first-issues
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Available Time
                  </span>
                  <p className="text-base font-bold text-white">
                    {profileData.availableHours || 'Flexible'}
                  </p>
                  <span className="text-[11px] text-slate-400 block">
                    Weekly contribution bandwidth
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick CTA to Repositories */}
          <div className="content-card rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Ready to find open-source projects matching your profile?
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Our matching engine automatically ranks repositories based on your configured languages and skill stack.
              </p>
            </div>
            <Link
              to="/repositories?tab=recommended&source=profile"
              className="btn-orange px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md shrink-0 inline-flex items-center gap-2"
            >
              <span>Explore Matched Repositories</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      ) : (
        /* =========================================================================
            EDIT MODE: Interactive Profile Form
        ========================================================================== */
        <div className="content-card rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          <div className="border-b border-white/10 pb-4 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Edit Profile Details
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Update your name, technical skills, and weekly contribution availability.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name & Read-Only Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Full Name / Username
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 praro-input rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Account Email (Read-Only)
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-400 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            {/* Programming Languages */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff7200]" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Programming Languages
                </label>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Languages you write or intend to contribute with across open-source codebases.
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_LANGUAGES.map((lang) => {
                  const selected = formData.languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleItem('languages', lang)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        selected
                          ? 'bg-[#ff7200] text-white border-[#ff7200] shadow-sm'
                          : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-[#ff7200]/40 hover:text-white'
                      }`}
                    >
                      {selected ? `✓ ${lang}` : `+ ${lang}`}
                    </button>
                  );
                })}
              </div>

              {/* Custom Language input with Live Autocomplete */}
              <AutocompleteInput
                value={customLanguage}
                onChange={setCustomLanguage}
                onAdd={(item) => addCustomItem('languages', item, setCustomLanguage)}
                suggestionsPool={SUGGESTED_LANGUAGES}
                activeItems={formData.languages}
                placeholder="Type language (e.g. JavaScript, Python)..."
                buttonText="Add"
              />

              {formData.languages.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 mr-1 font-semibold">Active:</span>
                  {formData.languages.map((l) => (
                    <span
                      key={l}
                      className="inline-flex items-center text-xs font-medium bg-[#ff7200]/15 text-[#ff7200] border border-[#ff7200]/30 px-2.5 py-0.5 rounded-lg"
                    >
                      {l}
                      <button
                        type="button"
                        onClick={() => removeItem('languages', l)}
                        className="ml-1.5 text-[#ff7200] hover:text-rose-400 font-bold transition"
                        aria-label={`Remove ${l}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Frameworks & Skills */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff7200]" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Frameworks & Technologies
                </label>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Technologies, libraries, and tools you are comfortable working with.
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_SKILLS.map((skill) => {
                  const selected = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleItem('skills', skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        selected
                          ? 'bg-[#ff7200] text-white border-[#ff7200] shadow-sm'
                          : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-[#ff7200]/40 hover:text-white'
                      }`}
                    >
                      {selected ? `✓ ${skill}` : `+ ${skill}`}
                    </button>
                  );
                })}
              </div>

              {/* Custom Skill input with Live Autocomplete */}
              <AutocompleteInput
                value={customSkill}
                onChange={setCustomSkill}
                onAdd={(item) => addCustomItem('skills', item, setCustomSkill)}
                suggestionsPool={SUGGESTED_SKILLS}
                activeItems={formData.skills}
                placeholder="Type technology (e.g. React, SQLite)..."
                buttonText="Add"
              />

              {formData.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 mr-1 font-semibold">Active:</span>
                  {formData.skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center text-xs font-medium bg-[#ff7200]/15 text-[#ff7200] border border-[#ff7200]/30 px-2.5 py-0.5 rounded-lg"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeItem('skills', s)}
                        className="ml-1.5 text-[#ff7200] hover:text-rose-400 font-bold transition"
                        aria-label={`Remove ${s}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Experience Level & Available Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">
                  Experience Level
                </label>
                <p className="text-xs text-slate-400 mb-2.5">
                  Determines beginner-friendly issue recommendations (e.g. good-first-issue).
                </p>
                <div className="space-y-2.5">
                  {EXPERIENCE_LEVELS.map((lvl) => {
                    const isSelected = formData.experienceLevel === lvl;
                    return (
                      <label
                        key={lvl}
                        className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'border-[#ff7200] bg-[#ff7200]/10 shadow-sm'
                            : 'border-white/10 bg-slate-900/60 hover:bg-slate-900'
                        }`}
                      >
                        <input
                          type="radio"
                          name="experienceLevel"
                          value={lvl}
                          checked={isSelected}
                          onChange={(e) =>
                            setFormData({ ...formData, experienceLevel: e.target.value })
                          }
                          className="accent-[#ff7200] cursor-pointer"
                        />
                        <span className={`ml-3 text-sm uppercase tracking-wider font-semibold ${isSelected ? 'text-[#ff7200]' : 'text-slate-300'}`}>
                          {lvl}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">
                  Available Contribution Time Per Week
                </label>
                <p className="text-xs text-slate-400 mb-2.5">
                  Estimated weekly dedication for open source exploration and tasks.
                </p>
                <div className="space-y-2.5">
                  {TIME_OPTIONS.map((time) => {
                    const isSelected = formData.availableHours === time;
                    return (
                      <label
                        key={time}
                        className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'border-[#ff7200] bg-[#ff7200]/10 shadow-sm'
                            : 'border-white/10 bg-slate-900/60 hover:bg-slate-900'
                        }`}
                      >
                        <input
                          type="radio"
                          name="availableHours"
                          value={time}
                          checked={isSelected}
                          onChange={(e) =>
                            setFormData({ ...formData, availableHours: e.target.value })
                          }
                          className="accent-[#ff7200] cursor-pointer"
                        />
                        <span className={`ml-3 text-sm uppercase tracking-wider font-semibold ${isSelected ? 'text-[#ff7200]' : 'text-slate-300'}`}>
                          {time}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Topics & Domain Interests */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff7200]" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Topics & Domain Interests
                </label>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Domains and ecosystem themes to prioritize for open-source exploration.
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_INTERESTS.map((interest) => {
                  const selected = formData.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleItem('interests', interest)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        selected
                          ? 'bg-[#ff7200] text-white border-[#ff7200] shadow-sm'
                          : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-[#ff7200]/40 hover:text-white'
                      }`}
                    >
                      {selected ? `✓ ${interest}` : `+ ${interest}`}
                    </button>
                  );
                })}
              </div>

              {/* Custom Interest input with Live Autocomplete */}
              <AutocompleteInput
                value={customInterest}
                onChange={setCustomInterest}
                onAdd={(item) => addCustomItem('interests', item, setCustomInterest)}
                suggestionsPool={SUGGESTED_INTERESTS}
                activeItems={formData.interests}
                placeholder="Type domain (e.g. Artificial Intelligence, AI/ML)..."
                buttonText="Add"
              />

              {formData.interests.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 mr-1 font-semibold">Active:</span>
                  {formData.interests.map((it) => (
                    <span
                      key={it}
                      className="inline-flex items-center text-xs font-medium bg-[#ff7200]/15 text-[#ff7200] border border-[#ff7200]/30 px-2.5 py-0.5 rounded-lg"
                    >
                      {it}
                      <button
                        type="button"
                        onClick={() => removeItem('interests', it)}
                        className="ml-1.5 text-[#ff7200] hover:text-rose-400 font-bold transition"
                        aria-label={`Remove ${it}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-5 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white border border-white/10 bg-slate-900 hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-orange px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Confirmation Dialog for Profile Photo Removal */}
      <ConfirmationModal
        isOpen={showRemovePhotoModal}
        title="Remove Profile Photo?"
        message="Are you sure you want to remove your profile photo? This action cannot be undone."
        confirmText="Remove Photo"
        cancelText="Cancel"
        onConfirm={handleConfirmRemovePhoto}
        onCancel={() => setShowRemovePhotoModal(false)}
        isLoading={uploadingPhoto}
        danger={true}
      />
    </div>
  );
};

export default Profile;
