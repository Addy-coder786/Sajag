import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconBubble, Screen, Txt } from '@/components/ui';
import { DRILLS } from '@/content/drills';
import { useSettings } from '@/state/settings';
import { C, RADIUS, SHADOW } from '@/theme';

// Generic icons only: Play policy forbids imitating other apps' branding in drills.
const KIND_ICON = { call: 'call', sms: 'chatbox', chat: 'chatbubbles' } as const;
const KIND_COLOR = { call: C.red, sms: C.blue, chat: C.purple } as const;

export default function PracticeList() {
  const { s, t } = useSettings();
  const router = useRouter();
  const [now] = useState(() => Date.now());
  const done = Object.values(s.drills).reduce((n, p) => n + p.times, 0);

  return (
    <Screen title={t('practice_title')} back={false} nav>
      <View style={styles.banner}>
        <IconBubble icon="school" color={C.purple} bg={C.white} size={52} />
        <View style={{ flex: 1 }}>
          <Txt size={15} weight="600" color={C.white}>{t('practice_sub')}</Txt>
          <Txt size={13} color="#E6DEFF">{t('practice_completed', { n: done })}</Txt>
        </View>
      </View>

      {DRILLS.map((d) => {
        const p = s.drills[d.id];
        const due = !p || new Date(p.nextDue).getTime() <= now;
        const days = p ? Math.max(0, Math.ceil((new Date(p.nextDue).getTime() - now) / 86400000)) : 0;
        return (
          <Pressable
            key={d.id}
            accessibilityRole="button"
            accessibilityLabel={d.title[s.lang]}
            onPress={() => router.push({ pathname: '/practice/[id]', params: { id: d.id } })}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.9 }]}
          >
            <IconBubble icon={KIND_ICON[d.kind]} color={C.white} bg={KIND_COLOR[d.kind]} size={52} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt size={16} weight="600">{d.title[s.lang]}</Txt>
              <View style={[styles.chip, { backgroundColor: due ? C.purpleSoft : C.greenSoft }]}>
                <Txt size={12} weight="600" color={due ? C.purple : C.green}>
                  {due ? t('practiseNow') : `${t('practice_next')}: ${t('practice_inDays', { n: days })}`}
                </Txt>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={C.muted} />
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.purple, borderRadius: 24, padding: 18, ...SHADOW },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.surface, borderRadius: RADIUS, padding: 14, minHeight: 80, ...SHADOW },
  chip: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
});
