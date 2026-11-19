import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { nextDueDays } from '@/content/drills';
import type { Lang } from '@/engine/types';
import { format, STRINGS, type StringKey } from '@/i18n/strings';

const KEY = 'sajag.settings.v1';

export interface DrillProgress {
  box: number;
  times: number;
  lastVariant: number;
  nextDue: string; // ISO date
  lastPauseStep?: number;
}

/**
 * Everything here is stored only on this phone. Never store OTPs, PINs,
 * passwords, account numbers or the family safe word.
 */
export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
}

export const MAX_CONTACTS = 5;

export interface Settings {
  onboarded: boolean;
  lang: Lang;
  textScale: number; // 1, 1.2, 1.4
  voice: boolean;
  myBankNumber: string;
  /** People the senior chose to ask before acting. The first one is the default "Ask" contact. */
  contacts: TrustedContact[];
  drills: Record<string, DrillProgress>;
}

const DEFAULTS: Settings = {
  onboarded: false,
  lang: 'hi',
  textScale: 1.2,
  voice: true,
  myBankNumber: '',
  contacts: [],
  drills: {},
};

/** Upgrades settings saved by v0.1 (single trustedName/trustedPhone) to the contacts list. */
function migrate(raw: Record<string, unknown>): Settings {
  const merged = { ...DEFAULTS, ...raw } as Settings & { trustedName?: string; trustedPhone?: string };
  if ((!merged.contacts || merged.contacts.length === 0) && merged.trustedPhone) {
    merged.contacts = [{ id: 'c1', name: merged.trustedName || '', phone: merged.trustedPhone }];
  }
  delete merged.trustedName;
  delete merged.trustedPhone;
  return merged;
}

interface Ctx {
  ready: boolean;
  s: Settings;
  update: (patch: Partial<Settings>) => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  recordDrill: (drillId: string, outcome: 'safe' | 'risky', variant: number, pauseStep: number) => void;
  reset: () => void;
}

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setS(migrate(JSON.parse(raw)));
      } catch {
        // Storage can be unavailable (private browsing); the app still works with defaults.
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback((next: Settings) => {
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const update = useCallback(
    (patch: Partial<Settings>) => {
      setS((prev) => {
        const next = { ...prev, ...patch };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const recordDrill = useCallback(
    (drillId: string, outcome: 'safe' | 'risky', variant: number, pauseStep: number) => {
      setS((prev) => {
        const old = prev.drills[drillId] ?? { box: 0, times: 0, lastVariant: -1, nextDue: new Date().toISOString() };
        const box = outcome === 'safe' ? old.box + 1 : 0;
        const due = new Date();
        due.setDate(due.getDate() + (outcome === 'safe' ? nextDueDays(box) : 1));
        const next: Settings = {
          ...prev,
          drills: {
            ...prev.drills,
            [drillId]: { box, times: old.times + 1, lastVariant: variant, nextDue: due.toISOString(), lastPauseStep: pauseStep },
          },
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    setS(DEFAULTS);
    AsyncStorage.removeItem(KEY).catch(() => undefined);
  }, []);

  const t = useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => format(STRINGS[s.lang][key] ?? STRINGS.en[key], vars),
    [s.lang],
  );

  const value = useMemo(() => ({ ready, s, update, t, recordDrill, reset }), [ready, s, update, t, recordDrill, reset]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
