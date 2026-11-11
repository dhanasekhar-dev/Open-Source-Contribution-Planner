import React, { createContext, useState, useContext, useCallback } from 'react';

export const ExploreContext = createContext(null);

const DEFAULT_PREFERENCES = {
  languages: [],
  skills: [],
  interests: [],
  experienceLevel: '',
  availableHours: '',
};

export const ExploreProvider = ({ children }) => {
  const [explorePreferences, setExplorePreferences] = useState(() => {
    try {
      const saved = sessionStorage.getItem('osp_explore_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  // 'none' (explore all / unpersonalized) | 'custom' (independent explore filter) | 'profile' (started from profile)
  const [preferenceSource, setPreferenceSource] = useState(() => {
    return sessionStorage.getItem('osp_preference_source') || 'none';
  });

  const [isExploreActive, setIsExploreActive] = useState(() => {
    return sessionStorage.getItem('osp_explore_active') === 'true';
  });

  // Apply new explore preferences (independent from saved profile)
  const applyPreferences = useCallback((newPrefs) => {
    const sanitized = {
      languages: Array.isArray(newPrefs.languages) ? newPrefs.languages : [],
      skills: Array.isArray(newPrefs.skills) ? newPrefs.skills : [],
      interests: Array.isArray(newPrefs.interests) ? newPrefs.interests : [],
      experienceLevel: newPrefs.experienceLevel || '',
      availableHours: newPrefs.availableHours || '',
    };

    setExplorePreferences(sanitized);
    setIsExploreActive(true);
    setPreferenceSource('custom');

    try {
      sessionStorage.setItem('osp_explore_preferences', JSON.stringify(sanitized));
      sessionStorage.setItem('osp_explore_active', 'true');
      sessionStorage.setItem('osp_preference_source', 'custom');
    } catch (e) {
      console.warn('sessionStorage write error:', e);
    }
  }, []);

  // Use saved user profile as starting explore preferences without linking or modifying it
  const useProfileAsStarting = useCallback((userProfile) => {
    if (!userProfile) return;
    const fromProfile = {
      languages: Array.isArray(userProfile.languages) ? [...userProfile.languages] : [],
      skills: Array.isArray(userProfile.skills) ? [...userProfile.skills] : [],
      interests: Array.isArray(userProfile.interests) ? [...userProfile.interests] : [],
      experienceLevel: userProfile.experienceLevel || '',
      availableHours: userProfile.availableHours || '',
    };

    setExplorePreferences(fromProfile);
    setIsExploreActive(true);
    setPreferenceSource('profile');

    try {
      sessionStorage.setItem('osp_explore_preferences', JSON.stringify(fromProfile));
      sessionStorage.setItem('osp_explore_active', 'true');
      sessionStorage.setItem('osp_preference_source', 'profile');
    } catch (e) {
      console.warn('sessionStorage write error:', e);
    }
  }, []);

  // Clear preferences to explore all/unpersonalized repositories
  const clearPreferences = useCallback(() => {
    setExplorePreferences(DEFAULT_PREFERENCES);
    setIsExploreActive(true);
    setPreferenceSource('none');

    try {
      sessionStorage.setItem('osp_explore_preferences', JSON.stringify(DEFAULT_PREFERENCES));
      sessionStorage.setItem('osp_explore_active', 'true');
      sessionStorage.setItem('osp_preference_source', 'none');
    } catch (e) {
      console.warn('sessionStorage write error:', e);
    }
  }, []);

  // Check if current explore preferences has any active preference
  const hasActivePreferences = useCallback(() => {
    return (
      (explorePreferences.languages && explorePreferences.languages.length > 0) ||
      (explorePreferences.skills && explorePreferences.skills.length > 0) ||
      (explorePreferences.interests && explorePreferences.interests.length > 0) ||
      Boolean(explorePreferences.experienceLevel && explorePreferences.experienceLevel.trim()) ||
      Boolean(explorePreferences.availableHours && explorePreferences.availableHours.trim())
    );
  }, [explorePreferences]);

  // Convert current preferences to query params format for API calls
  // Only override backend profile when custom temporary explore preferences are active
  const getQueryParams = useCallback(() => {
    if (preferenceSource === 'custom' && hasActivePreferences()) {
      return {
        explore: 'true',
        languages: explorePreferences.languages || [],
        skills: explorePreferences.skills || [],
        interests: explorePreferences.interests || [],
        experienceLevel: explorePreferences.experienceLevel || '',
        availableHours: explorePreferences.availableHours || '',
      };
    }
    return {};
  }, [explorePreferences, preferenceSource, hasActivePreferences]);

  return (
    <ExploreContext.Provider
      value={{
        explorePreferences,
        isExploreActive,
        preferenceSource,
        hasActivePreferences,
        applyPreferences,
        useProfileAsStarting,
        clearPreferences,
        getQueryParams,
      }}
    >
      {children}
    </ExploreContext.Provider>
  );
};

export const useExplore = () => {
  const context = useContext(ExploreContext);
  if (!context) {
    throw new Error('useExplore must be used within an ExploreProvider');
  }
  return context;
};

export default ExploreContext;
