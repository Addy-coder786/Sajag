import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BigButton, Card, ContactCard, dial, PillButton, RingTimer, Screen, SectionTitle, SmallButton, SpeakButton, Txt, useAutoSpeak } from '@/components/ui';
import type { Ask } from '@/engine/types';
import type { StringKey } from '@/i18n/strings';
import { useSettings } from '@/state/settings';
import { C, SHADOW } from '@/theme';

type IconName = 'cash' | 'keypad' | 'download' | 'eye-off' | 'call';
const ASKS: { id: Ask; icon: IconName }[] = [
  { id: 'money', icon: 'cash' },
  { id: 'code', icon: 'keypad' },
  { id: 'app', icon: 'download' },
  { id: 'secrecy', icon: 'eye-off' },
];
const BREATH_SECONDS = 10;

/**
 * RUKO flow, built for a frightened user: one question per screen, two huge buttons.
 * Any "Yes" to the Four Asks goes straight to "Stop" (after asking whether they are on a call).
 */
type Phase =
  | { kind: 'breathe' }
  | { kind: 'ask'; index: number }
  | { kind: 'onCall'; ask: Ask }
  | { kind: 'stop'; ask: Ask; onCall: boolean }
  | { kind: 'clear' };

export default function Ruko() {
  const { t } = useSettings();
  const [phase, setPhase] = useState<Phase>({ kind: 'breathe' });
  const [left, setLeft] = useState(BREATH_SECONDS);

  useAutoSpeak(phase.kind === 'breathe' ? `${t('ruko_title')} ${t('ruko_breathe')}` : '', phase.kind === 'breathe');

  useEffect(() => {
    if (phase.kind !== 'breathe') return;
    const id = setTimeout(() => {
      if (left <= 1) setPhase({ kind: 'ask', index: 0 });
      else setLeft(left - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [phase.kind, left]);

  if (phase.kind === 'breathe') {
    return (
      <Screen title={t('tile_ruko')}>
        <View style={styles.center}>
          <Txt size={24} weight="800" center accessibilityRole="header">{t('ruko_title')}</Txt>
          <Txt size={17} center color={C.muted}>{t('ruko_breathe')}</Txt>
          <RingTimer total={BREATH_SECONDS} left={left} label={t('seconds')} />
        </View>
        <PillButton label={t('ruko_skip')} icon="play-skip-forward" onPress={() => setPhase({ kind: 'ask', index: 0 })} />
      </Screen>
    );
  }

  if (phase.kind === 'ask') {
    const a = ASKS[phase.index];
    return (
      <Question
        key={a.id}
        step={phase.index + 1}
        total={ASKS.length}
        icon={a.icon}
        lead={t('ruko_question')}
        question={t(`ask_${a.id}` as StringKey)}
        onYes={() => setPhase({ kind: 'onCall', ask: a.id })}
        onNo={() => setPhase(phase.index + 1 < ASKS.length ? { kind: 'ask', index: phase.index + 1 } : { kind: 'clear' })}
        onBack={phase.index > 0 ? () => setPhase({ kind: 'ask', index: phase.index - 1 }) : undefined}
      />
    );
  }

  if (phase.kind === 'onCall') {
    return (
      <Question
        key="onCall"
        icon="call"
        question={t('ruko_onCall')}
        onYes={() => setPhase({ kind: 'stop', ask: phase.ask, onCall: true })}
        onNo={() => setPhase({ kind: 'stop', ask: phase.ask, onCall: false })}
      />
    );
  }

  return <Result stop={phase.kind === 'stop'} onCall={phase.kind === 'stop' && phase.onCall} onRestart={() => { setLeft(BREATH_SECONDS); setPhase({ kind: 'ask', index: 0 }); }} />;
}

function Question({
  step,
  total,
  icon,
  lead,
  question,
  onYes,
  onNo,
  onBack,
}: {
  step?: number;
  total?: number;
  icon: IconName;
  lead?: string;
  question: string;
  onYes: () => void;
  onNo: () => void;
  onBack?: () => void;
}) {
  const { t } = useSettings();
  useAutoSpeak(`${lead ?? ''} ${question}`);
  return (
    <Screen title={t('tile_ruko')}>
      {step && total ? (
        <View style={styles.dots} accessibilityLabel={`${step} / ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <View key={i} style={[styles.dot, i < step && { backgroundColor: C.red }]} />
          ))}
        </View>
      ) : null}
      <View style={styles.qCard}>
        <View style={styles.qIcon}>
          <Ionicons name={icon} size={46} color={C.red} />
        </View>
        {lead ? <Txt size={16} color={C.muted} center>{lead}</Txt> : null}
        <Txt size={24} weight="700" center accessibilityRole="header">{question}</Txt>
        <SpeakButton text={`${lead ?? ''} ${question}`} />
      </View>
      <View style={styles.answers}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('yes')} onPress={onYes} style={({ pressed }) => [styles.answer, { backgroundColor: C.red }, pressed && styles.pressed]}>
          <Ionicons name="alert-circle" size={30} color={C.white} />
          <Txt size={22} weight="700" color={C.white}>{t('yes')}</Txt>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('no')} onPress={onNo} style={({ pressed }) => [styles.answer, { backgroundColor: C.green }, pressed && styles.pressed]}>
          <Ionicons name="checkmark-circle" size={30} color={C.white} />
          <Txt size={22} weight="700" color={C.white}>{t('no')}</Txt>
        </Pressable>
      </View>
      {onBack ? <SmallButton label={t('previous')} icon="arrow-back" color={C.muted} onPress={onBack} /> : null}
    </Screen>
  );
}

function Result({ stop, onCall, onRestart }: { stop: boolean; onCall: boolean; onRestart: () => void }) {
  const { s, t } = useSettings();
  const router = useRouter();
  const title = stop ? t('ruko_stop_title') : t('ruko_clear_title');
  const body = stop ? t('ruko_stop_body') : t('ruko_clear_body');
  const spoken = `${title}. ${onCall ? t('ruko_onCall_tip') + ' ' : ''}${body}`;
  useAutoSpeak(spoken);

  return (
    <Screen title={t('tile_ruko')}>
      <View style={[styles.result, { backgroundColor: stop ? C.red : C.green }]}>
        <Ionicons name={stop ? 'hand-left' : 'checkmark-circle'} size={56} color={C.white} />
        <Txt size={23} weight="800" color={C.white} center accessibilityRole="header">{title}</Txt>
        {stop && onCall ? (
          <View style={styles.tip}>
            <Ionicons name="call" size={22} color={C.red} />
            <Txt size={17} weight="700" color={C.red} style={{ flexShrink: 1 }}>{t('ruko_onCall_tip')}</Txt>
          </View>
        ) : null}
        <Txt size={16} color={C.white} center>{body}</Txt>
        <SpeakButton light text={spoken} />
      </View>

      <SectionTitle>{t('whatToDo')}</SectionTitle>
      {s.myBankNumber ? (
        <ContactCard name={t('callMyBank')} phone={s.myBankNumber} index={1} icon="business" callLabel={t('call')} />
      ) : (
        <Card tint={C.blueSoft}>
          <Txt size={15}>{t('noBankNumber')}</Txt>
          <SmallButton label={t('settings')} icon="settings" color={C.blue} onPress={() => router.push('/settings')} />
        </Card>
      )}
      {s.contacts.length > 0 ? (
        s.contacts.slice(0, 3).map((c, i) => (
          <ContactCard key={c.id} name={c.name} phone={c.phone} index={i + 2} badge={i === 0 ? t('firstAsk') : undefined} callLabel={t('call')} />
        ))
      ) : (
        <Card tint={C.greenSoft}>
          <Txt size={15}>{t('noTrusted')}</Txt>
          <SmallButton label={t('addPerson')} icon="person-add" color={C.green} onPress={() => router.push('/contacts')} />
        </Card>
      )}
      <BigButton label={t('checkMessage')} icon="search" color={C.blue} outline onPress={() => router.push('/check')} />
      {stop ? <BigButton label={t('call1930')} icon="call" color={C.red} onPress={() => dial('1930')} /> : null}
      <SmallButton label={t('ruko_again')} icon="refresh" color={C.muted} onPress={onRestart} />
      <PillButton label={t('nav_home')} icon="home" color={C.navy} onPress={() => router.navigate('/')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 14, paddingVertical: 10 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  dot: { width: 34, height: 8, borderRadius: 4, backgroundColor: C.redSoft },
  qCard: { backgroundColor: C.surface, borderRadius: 26, padding: 22, gap: 12, alignItems: 'center', ...SHADOW },
  qIcon: { width: 92, height: 92, borderRadius: 46, backgroundColor: C.redSoft, alignItems: 'center', justifyContent: 'center' },
  answers: { flexDirection: 'row', gap: 14 },
  answer: { flex: 1, minHeight: 96, borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 4, ...SHADOW, shadowOpacity: 0.2 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  result: { borderRadius: 26, padding: 22, alignItems: 'center', gap: 10, ...SHADOW, shadowOpacity: 0.25 },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.white, borderRadius: 16, padding: 14 },
});
