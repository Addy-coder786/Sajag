import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BigButton, ContactCard, IconBubble, Screen, SectionTitle, Txt } from '@/components/ui';
import { DRILLS } from '@/content/drills';
import { useSettings } from '@/state/settings';
import { C, RADIUS, SHADOW } from '@/theme';

const LANG_NAME = { hi: 'हिन्दी', mr: 'मराठी', en: 'English' } as const;

export default function Home() {
  const { ready, s, t } = useSettings();
  const router = useRouter();
  const [now] = useState(() => Date.now());

  if (!ready) return null;
  if (!s.onboarded) return <Redirect href="/language" />;

  const due = DRILLS.find((d) => {
    const p = s.drills[d.id];
    return !p || new Date(p.nextDue).getTime() <= now;
  });

  return (
    <Screen nav>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Txt size={13} color={C.muted}>{t('tagline')}</Txt>
          <Txt size={24} weight="800" color={C.red} accessibilityRole="header">{t('appName')}</Txt>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('language')}
          onPress={() => router.push('/language')}
          style={({ pressed }) => [styles.langChip, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="globe-outline" size={20} color={C.red} />
          <Txt size={14} weight="600" color={C.red}>{LANG_NAME[s.lang]}</Txt>
        </Pressable>
      </View>

      <Txt size={17} weight="600">{t('home_greeting')}</Txt>

      {/* RUKO hero card */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('tile_ruko')}. ${t('tile_ruko_sub')}`}
        onPress={() => router.push('/ruko')}
        style={({ pressed }) => [styles.hero, pressed && { opacity: 0.92 }]}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Txt size={30} weight="800" color={C.white}>{t('tile_ruko')}</Txt>
          <Txt size={15} color="#FFE3E1">{t('tile_ruko_sub')}</Txt>
          <View style={styles.heroCta}>
            <Txt size={14} weight="600" color={C.red}>{t('ruko_cta')}</Txt>
            <Ionicons name="arrow-forward" size={18} color={C.red} />
          </View>
        </View>
        <View style={styles.heroIcon}>
          <Ionicons name="hand-left" size={56} color={C.red} />
        </View>
      </Pressable>

      <BigButton label={t('tile_check')} sub={t('tile_check_sub')} icon="search" color={C.blue} outline onPress={() => router.push('/check')} />
      <BigButton label={t('tile_practice')} sub={t('tile_practice_sub')} icon="school" color={C.purple} outline onPress={() => router.push('/practice')} />
      <BigButton label={t('tile_lost')} sub={t('tile_lost_sub')} icon="medkit" color={C.red} outline onPress={() => router.push('/lost')} />

      {due ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/practice/[id]', params: { id: due.id } })}
          style={styles.booster}
        >
          <IconBubble icon="notifications" color={C.white} bg={C.purple} size={40} />
          <View style={{ flex: 1 }}>
            <Txt size={15} weight="600" color={C.purple}>{t('boosterDue')}</Txt>
            <Txt size={13} color={C.muted} numberOfLines={1}>{due.title[s.lang]}</Txt>
          </View>
          <Ionicons name="chevron-forward" size={22} color={C.purple} />
        </Pressable>
      ) : null}

      <SectionTitle>{t('quickActions')}</SectionTitle>
      {s.myBankNumber ? <ContactCard name={t('callBankShort')} phone={s.myBankNumber} index={1} icon="business" callLabel={t('call')} /> : null}
      {s.contacts.slice(0, 2).map((c, i) => (
        <ContactCard key={c.id} name={c.name} phone={c.phone} index={i + 2} badge={i === 0 ? t('firstAsk') : undefined} callLabel={t('call')} />
      ))}
      {!s.myBankNumber || s.contacts.length === 0 ? (
        <BigButton label={t('trustedPeople')} sub={t('addPerson')} icon="person-add" color={C.green} outline onPress={() => router.push('/contacts')} />
      ) : null}

      <Txt size={12} color={C.muted} center>{t('promise')}</Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  langChip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 48, paddingHorizontal: 14, borderRadius: 999, backgroundColor: C.redSoft },
  hero: { backgroundColor: C.red, borderRadius: 26, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 150, ...SHADOW, shadowOpacity: 0.25 },
  heroCta: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.white, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start', marginTop: 8 },
  heroIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  booster: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.purpleSoft, borderRadius: RADIUS, padding: 14, minHeight: 60 },
});
