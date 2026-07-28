import { useState, useEffect } from 'react';

export type ConsentValue = 'granted' | 'denied';

export interface ConsentPreferences {
  analytics_storage: ConsentValue;
  ad_storage: ConsentValue;
  ad_user_data: ConsentValue;
  ad_personalization: ConsentValue;
}

export interface StoredConsent {
  preferences: ConsentPreferences;
  timestamp: number;
}

const STORAGE_KEY = 'qa_consent';

function pushConsentUpdate(prefs: ConsentPreferences) {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('consent', 'update', prefs);
  }
}

function loadStored(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredConsent;
  } catch {
    return null;
  }
}

function saveStored(prefs: ConsentPreferences) {
  const stored: StoredConsent = { preferences: prefs, timestamp: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export function useConsent() {
  // null = not yet decided (show banner), non-null = decided (hide banner)
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);
  const [isReady, setIsReady] = useState(false);

  // On mount, replay any previously stored consent so GA4 gets the update
  // before the wait_for_update window expires.
  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setPreferences(stored.preferences);
      pushConsentUpdate(stored.preferences);
    }
    setIsReady(true);
  }, []);

  function acceptAll() {
    const prefs: ConsentPreferences = {
      analytics_storage:  'granted',
      ad_storage:         'granted',
      ad_user_data:       'granted',
      ad_personalization: 'granted',
    };
    saveStored(prefs);
    pushConsentUpdate(prefs);
    setPreferences(prefs);
  }

  function rejectAll() {
    const prefs: ConsentPreferences = {
      analytics_storage:  'denied',
      ad_storage:         'denied',
      ad_user_data:       'denied',
      ad_personalization: 'denied',
    };
    saveStored(prefs);
    pushConsentUpdate(prefs);
    setPreferences(prefs);
  }

  function saveCustom(analyticsGranted: boolean, adsGranted: boolean) {
    const value = (b: boolean): ConsentValue => (b ? 'granted' : 'denied');
    const prefs: ConsentPreferences = {
      analytics_storage:  value(analyticsGranted),
      ad_storage:         value(adsGranted),
      ad_user_data:       value(adsGranted),
      ad_personalization: value(adsGranted),
    };
    saveStored(prefs);
    pushConsentUpdate(prefs);
    setPreferences(prefs);
  }

  // Banner should only show once the component has checked localStorage
  // and confirmed no prior choice exists.
  const showBanner = isReady && preferences === null;

  return { preferences, showBanner, acceptAll, rejectAll, saveCustom };
}
