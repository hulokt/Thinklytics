import React, { createContext, useContext, useState, useEffect } from 'react';

const SoundSettingsContext = createContext();

export const useSoundSettings = () => {
  const context = useContext(SoundSettingsContext);
  if (!context) {
    throw new Error('useSoundSettings must be used within a SoundSettingsProvider');
  }
  return context;
};

export const SoundSettingsProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Initialize state from localStorage or default to true
    const savedSoundSetting = localStorage.getItem('soundEnabled');
    if (savedSoundSetting !== null) {
      return JSON.parse(savedSoundSetting);
    } else {
      // Default to enabled
      return true;
    }
  });

  useEffect(() => {
    // Save sound preference to localStorage
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const enableSound = () => {
    setSoundEnabled(true);
  };

  const disableSound = () => {
    setSoundEnabled(false);
  };

  const value = {
    soundEnabled,
    toggleSound,
    enableSound,
    disableSound,
  };

  return (
    <SoundSettingsContext.Provider value={value}>
      {children}
    </SoundSettingsContext.Provider>
  );
};
