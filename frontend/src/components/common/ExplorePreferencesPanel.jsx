import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useExplore from '../../hooks/useExplore';
import AutocompleteInput from './AutocompleteInput';
import {
  SUGGESTED_LANGUAGES,
  SUGGESTED_SKILLS,
  SUGGESTED_INTERESTS,
} from '../../data/suggestionData';

const PRESET_LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'PHP', 'Ruby', 'Kotlin', 'Swift'
];

const PRESET_SKILLS = [
  'React', 'Node.js', 'Express.js', 'MongoDB', 'Spring Boot', 'REST API', 'SQL', 'Docker', 'Git', 'HTML', 'CSS'
];

const PRESET_INTERESTS = [
  'Web Development', 'Backend Development', 'Frontend Development', 'Mobile Development', 'AI/ML', 'DevOps', 'Cybersecurity', 'Open Source', 'Documentation'
];

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const TIME_OPTIONS = [
  '1-2 hrs/week',
  '5 hrs/week',
  '10 hrs/week',
  '15+ hrs/week',
];

const ExplorePreferencesPanel = ({ onApply }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    explorePreferences,
    preferenceSource,
    applyPreferences,
    useProfileAsStarting,
    clearPreferences,
  } = useExplore();

  // Local draft state for editing before applying
  const [draft, setDraft] = useState({
    languages: [],
    skills: [],
    interests: [],
    experienceLevel: '',
    availableHours: '',
  });

  const [customLanguage, setCustomLanguage] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [customInterest, setCustomInterest] = useState('');

  const [isOpen, setIsOpen] = useState(true);

  // Sync draft whenever explorePreferences changes
  useEffect(() => {
    setDraft({
      languages: Array.isArray(explorePreferences.languages) ? [...explorePreferences.languages] : [],
      skills: Array.isArray(explorePreferences.skills) ? [...explorePreferences.skills] : [],
      interests: Array.isArray(explorePreferences.interests) ? [...explorePreferences.interests] : [],
      experienceLevel: explorePreferences.experienceLevel || '',
      availableHours: explorePreferences.availableHours || '',
    });
  }, [explorePreferences]);

  const toggleItem = (field, item) => {
    setDraft((prev) => {
      const exists = prev[field].includes(item);
      return {
        ...prev,
        [field]: exists ? prev[field].filter((x) => x !== item) : [...prev[field], item],
      };
    });
  };

  const addCustomItem = (field, val, setVal) => {
    const trimmed = typeof val === 'string' ? val.trim() : '';
    if (!trimmed) return;
    if (!draft[field].some((x) => x.toLowerCase() === trimmed.toLowerCase())) {
      setDraft((prev) => ({
        ...prev,
        [field]: [...prev[field], trimmed],
      }));
    }
    if (typeof setVal === 'function') {
      setVal('');
    }
  };

  const removeItem = (field, item) => {
    setDraft((prev) => ({
      ...prev,
      [field]: prev[field].filter((x) => x !== item),
    }));
  };

  const handleApply = () => {
    applyPreferences(draft);
    if (onApply) onApply(draft);
  };

  const handleClear = () => {
    const emptyDraft = {
      languages: [],
      skills: [],
      interests: [],
      experienceLevel: '',
      availableHours: '',
    };
    setDraft(emptyDraft);
    clearPreferences();
    if (onApply) onApply(emptyDraft);
  };

  const handleUseProfile = () => {
    if (!isAuthenticated || !user) {
      navigate('/login', {
        state: {
          from: { pathname: '/repositories' },
          message: 'Please sign in to initialize explore preferences from your saved developer profile.',
        },
      });
      return;
    }
    useProfileAsStarting(user);
    const fromProfile = {
      languages: Array.isArray(user.languages) ? [...user.languages] : [],
      skills: Array.isArray(user.skills) ? [...user.skills] : [],
      interests: Array.isArray(user.interests) ? [...user.interests] : [],
      experienceLevel: user.experienceLevel || '',
      availableHours: user.availableHours || '',
    };
    setDraft(fromProfile);
    if (onApply) onApply(fromProfile);
  };

  const handleExploreAll = () => {
    handleClear();
  };

  const hasAnyDraft =
    draft.languages.length > 0 ||
    draft.skills.length > 0 ||
    draft.interests.length > 0 ||
    Boolean(draft.experienceLevel) ||
    Boolean(draft.availableHours);

  return (
    <div className="content-card rounded-2xl overflow-hidden mb-6 shadow-xl">
      {/* Panel Header */}
      <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 bg-[#ff7200]/10 border border-[#ff7200]/30 text-[#ff7200] rounded-xl text-base flex items-center justify-center">
            ⚙️
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-tight">
                Explore Preferences Panel
              </h2>
              {/* Status Badge */}
              {preferenceSource === 'custom' && hasAnyDraft ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ff7200]/20 text-[#ff7200] border border-[#ff7200]/40">
                  Custom Preferences Active
                </span>
              ) : preferenceSource === 'profile' && hasAnyDraft ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  Profile Preferences Linked
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-white/10">
                  Unranked Discovery
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Customize temporary discovery preferences.{' '}
              <span className="text-[#ff7200] font-semibold">Your saved profile in MongoDB remains completely unchanged.</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold uppercase tracking-wider text-[#ff7200] hover:text-white px-3.5 py-1.5 rounded-lg border border-[#ff7200]/30 bg-slate-900 hover:bg-[#ff7200] transition self-start sm:self-auto cursor-pointer"
        >
          {isOpen ? '▲ Collapse Preferences' : '▼ Configure Preferences'}
        </button>
      </div>

      {/* Panel Body */}
      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pb-4 border-b border-white/10">
            <button
              type="button"
              onClick={handleUseProfile}
              className="px-3.5 py-1.5 bg-[#ff7200]/10 hover:bg-[#ff7200]/20 text-[#ff7200] border border-[#ff7200]/30 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
              title={!isAuthenticated ? 'Sign in to load saved profile' : 'Copy your profile fields into explore controls as a starting point'}
            >
              <span>{isAuthenticated ? '📋' : '🔒'}</span> Initialize From My Profile
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
              title="Clear all explore preferences"
            >
              <span>🗑️</span> Clear Preferences
            </button>
            <button
              type="button"
              onClick={handleExploreAll}
              className="px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
              title="Explore popular unranked repositories"
            >
              <span>🌐</span> Explore All (Unranked)
            </button>
          </div>

          {/* Languages */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff7200]" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Programming Languages
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {PRESET_LANGUAGES.map((lang) => {
                const selected = draft.languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleItem('languages', lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
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
            <AutocompleteInput
              value={customLanguage}
              onChange={setCustomLanguage}
              onAdd={(item) => addCustomItem('languages', item, setCustomLanguage)}
              suggestionsPool={SUGGESTED_LANGUAGES}
              activeItems={draft.languages}
              placeholder="Other language (e.g. JavaScript)..."
              buttonText="Add"
              className="max-w-xs"
            />
            {draft.languages.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {draft.languages.map((l) => (
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

          {/* Skills */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff7200]" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Frameworks & Skills
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {PRESET_SKILLS.map((skill) => {
                const selected = draft.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleItem('skills', skill)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
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
            <AutocompleteInput
              value={customSkill}
              onChange={setCustomSkill}
              onAdd={(item) => addCustomItem('skills', item, setCustomSkill)}
              suggestionsPool={SUGGESTED_SKILLS}
              activeItems={draft.skills}
              placeholder="Other skill (e.g. SQLite)..."
              buttonText="Add"
              className="max-w-xs"
            />
            {draft.skills.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {draft.skills.map((s) => (
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

          {/* Topics & Interests */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff7200]" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Topics & Interests
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {PRESET_INTERESTS.map((interest) => {
                const selected = draft.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleItem('interests', interest)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
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
            <AutocompleteInput
              value={customInterest}
              onChange={setCustomInterest}
              onAdd={(item) => addCustomItem('interests', item, setCustomInterest)}
              suggestionsPool={SUGGESTED_INTERESTS}
              activeItems={draft.interests}
              placeholder="Other topic (e.g. AI/ML)..."
              buttonText="Add"
              className="max-w-xs"
            />
            {draft.interests.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {draft.interests.map((it) => (
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

          {/* Experience Level & Available Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                Desired Experience Level
              </label>
              <select
                value={draft.experienceLevel}
                onChange={(e) => setDraft({ ...draft, experienceLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 praro-input rounded-lg text-xs text-slate-200 cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-400">Any / Unspecified</option>
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl} className="bg-slate-900 text-slate-200">
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                Available Contribution Time
              </label>
              <select
                value={draft.availableHours}
                onChange={(e) => setDraft({ ...draft, availableHours: e.target.value })}
                className="w-full px-3.5 py-2.5 praro-input rounded-lg text-xs text-slate-200 cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-400">Flexible / Unspecified</option>
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time} className="bg-slate-900 text-slate-200">
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              {hasAnyDraft ? (
                <span>
                  Preferences set:{' '}
                  <strong className="text-[#ff7200]">
                    {draft.languages.length} languages, {draft.skills.length} skills,{' '}
                    {draft.interests.length} topics
                    {draft.experienceLevel ? `, ${draft.experienceLevel}` : ''}
                  </strong>
                </span>
              ) : (
                <span className="italic text-slate-400">
                  No preferences set (showing unranked popular repositories)
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 bg-slate-900/90 hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="btn-orange px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shadow-md cursor-pointer"
              >
                Apply Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePreferencesPanel;
