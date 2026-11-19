import Ionicons from '@expo/vector-icons/Ionicons';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconBubble, PillButton, Row, Txt } from '@/components/ui';
import type { Lang } from '@/engine/types';
import { CHOOSE_LANGUAGE_ALL, SPEECH_LANG, STRINGS } from '@/i18n/strings';
import { useSettings } from '@/state/settings';
import { C, RADIUS, SHADOW, TOUCH } from '@/theme';

const LANGS: { id: Lang; label: string; spoken: string }[] = [
  { id: 'hi', label: 'हिन्दी', spoken: 'हिन्दी चुनी गई' },
  { id: 'mr', label: 'मराठी', spoken: 'मराठी निवडली' },
  { id: 'en', label: 'English', spoken: 'English selected' },
];

const SIZES = [
  { v: 1, key: 'sizeNormal' as const },
  { v: 1.2, key: 'sizeLarge' as const },
  { v: 1.4, key: 'sizeXL' as const },
];

/** Onboarding: illustration panel, language, text size, voice, "Let's get started". */
export default function LanguageScreen() {
  const { s, t, update } = useSettings();
  const router = useRouter();

  const pickLang = (l: (typeof LANGS)[number]) => {
    update({ lang: l.id });
    Speech.stop();
    Speech.speak(l.spoken, { language: SPEECH_LANG[l.id], rate: 0.9 });
  };

  const done = () => {
    update({ onboarded: true });
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Illustration panel built from icons (no stock artwork) */}
        <View style={styles.hero}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroInner}>
             <View style={styles.art}>
              <View style={styles.phone}>
                <View style={styles.phoneBar} />
                <View style={styles.msg}>
                  <Ionicons name="warning" size={18} color={C.red} />
                  <View style={{ flex: 1, gap: 5 }}>
                    <View style={[styles.line, { width: '90%' }]} />
                    <View style={[styles.line, { width: '60%' }]} />
                  </View>
                </View>
                <View style={[styles.msg, { opacity: 0.6 }]}>
                  <Ionicons name="link" size={18} color={C.muted} />
                  <View style={{ flex: 1, gap: 5 }}>
                    <View style={[styles.line, { width: '75%' }]} />
                    <View style={[styles.line, { width: '40%' }]} />
                  </View>
                </View>
              </View>
              <View style={[styles.badge, { top: 4, left: 0 }]}>
                <IconBubble icon="warning" color={C.white} bg={C.red} size={60} />
              </View>
              <View style={[styles.badge, { bottom: 0, right: 0 }]}>
                <IconBubble icon="hand-left" color={C.white} bg={C.redDark} size={78} />
              </View>
              <View style={[styles.badge, { top: 18, right: 8 }]}>
                <IconBubble icon="shield-checkmark" color={C.red} bg={C.white} size={50} />
              </View>
             </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <Txt size={26} weight="800" color={C.red} center style={{ marginTop: 6 }}>सजग · Sajag</Txt>

          {/* Language first, with the prompt in all three languages so anyone can read it */}
          <Txt size={16} weight="700" center>{CHOOSE_LANGUAGE_ALL}</Txt>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {LANGS.map((l) => {
              const active = s.lang === l.id;
              return (
                <Pressable
                  key={l.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={l.label}
                  onPress={() => pickLang(l)}
                  style={[styles.lang, active && styles.langActive]}
                >
                  <Txt size={18} weight="700" color={active ? C.white : C.red}>{l.label}</Txt>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.intro}>
            <Txt size={20} weight="700" color={C.red} center>{t('onboard_title')}</Txt>
            <Txt size={15} color={C.ink} center>{t('onboard_body')}</Txt>
          </View>

          <Txt size={16} weight="600">{t('chooseTextSize')}</Txt>
          <Row style={{ flexWrap: 'nowrap' }}>
            {SIZES.map((z) => {
              const active = s.textScale === z.v;
              return (
                <Pressable
                  key={z.v}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  onPress={() => update({ textScale: z.v })}
                  style={[styles.size, active && styles.sizeActive]}
                >
                  <Txt size={12 * z.v} weight="600" color={active ? C.red : C.muted} center>{STRINGS[s.lang][z.key]}</Txt>
                </Pressable>
              );
            })}
          </Row>

          <View style={styles.voice}>
            <Ionicons name="volume-high" size={22} color={C.red} />
            <Txt size={15} weight="500" style={{ flex: 1 }}>{t('voiceOn')}</Txt>
            <Switch value={s.voice} onValueChange={(v) => update({ voice: v })} accessibilityLabel={t('voiceOn')} trackColor={{ true: C.red, false: '#CFCBD4' }} thumbColor={C.white} />
          </View>

          <Row style={{ flexWrap: 'nowrap', justifyContent: 'center' }}>
            <Ionicons name="lock-closed" size={16} color={C.green} />
            <Txt size={13} color={C.green} style={{ flexShrink: 1 }}>{t('promise')}</Txt>
          </Row>

          <PillButton label={t('getStarted')} onPress={done} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: C.redSoft, borderBottomLeftRadius: 60, borderBottomRightRadius: 60, paddingBottom: 18 },
  heroInner: { height: 250, alignItems: 'center', justifyContent: 'center' },
  art: { width: 270, height: 240, alignItems: 'center', justifyContent: 'center' },
  phone: { width: 150, height: 210, borderRadius: 22, backgroundColor: '#F7C9C6', padding: 12, gap: 10, transform: [{ rotate: '-6deg' }] },
  phoneBar: { height: 10, width: 50, borderRadius: 5, backgroundColor: '#EFAFAB', alignSelf: 'center', marginBottom: 6 },
  msg: { flexDirection: 'row', gap: 8, backgroundColor: C.white, borderRadius: 12, padding: 10, alignItems: 'center' },
  line: { height: 6, borderRadius: 3, backgroundColor: '#EBD9D8' },
  badge: { position: 'absolute', borderRadius: 999, ...SHADOW, shadowOpacity: 0.18 },
  body: { padding: 22, gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center' },
  lang: { flex: 1, minHeight: TOUCH.main, borderRadius: RADIUS, borderWidth: 2, borderColor: C.red, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface },
  langActive: { backgroundColor: C.red },
  size: { flex: 1, minHeight: TOUCH.min + 4, borderRadius: 14, borderWidth: 2, borderColor: C.line, justifyContent: 'center', paddingHorizontal: 6, backgroundColor: C.surface },
  sizeActive: { borderColor: C.red, backgroundColor: C.redTint },
  intro: { backgroundColor: C.redTint, borderRadius: RADIUS, padding: 16, gap: 6 },
  voice: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.redTint, borderRadius: RADIUS, paddingHorizontal: 16, minHeight: 58 },
});
