import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconBubble, PillButton, PracticeBanner, Screen, SpeakButton, Txt, useAutoSpeak } from '@/components/ui';
import { DRILLS, type Choice } from '@/content/drills';
import { useSettings } from '@/state/settings';
import { C, RADIUS, SHADOW, TOUCH } from '@/theme';

type Phase = { kind: 'playing' } | { kind: 'safe' } | { kind: 'risky'; clue: string };

export default function DrillPlayer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t, recordDrill } = useSettings();
  const router = useRouter();
  const drill = DRILLS.find((d) => d.id === id);

  // Boosters rotate through story variants: same ask, new story.
  const variantIndex = useMemo(() => {
    if (!drill) return 0;
    const last = s.drills[drill.id]?.lastVariant ?? -1;
    return (last + 1) % drill.variants.length;
    // Picked once per visit: progress saved during this drill must not switch the story mid-way.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drill?.id]);

  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>({ kind: 'playing' });

  const variant = drill?.variants[variantIndex];
  const current = variant?.steps[step];
  useAutoSpeak(phase.kind === 'playing' && current ? current.line[s.lang] : '', phase.kind === 'playing');

  if (!drill || !variant || !current) {
    return (
      <Screen title={t('tile_practice')}>
        <Txt size={17}>Drill not found.</Txt>
        <PillButton label={t('practice_back')} onPress={() => router.replace('/practice')} />
      </Screen>
    );
  }

  const choose = (c: Choice) => {
    if (c.result === 'next') {
      if (step + 1 < variant.steps.length) setStep(step + 1);
      return;
    }
    recordDrill(drill.id, c.result, variantIndex, step);
    setPhase(c.result === 'safe' ? { kind: 'safe' } : { kind: 'risky', clue: c.feedback?.[s.lang] ?? drill.lesson[s.lang] });
  };

  const restart = () => {
    setStep(0);
    setPhase({ kind: 'playing' });
  };

  if (phase.kind !== 'playing') {
    const ok = phase.kind === 'safe';
    const head = ok ? t('practice_done') : t('practice_risky');
    const body = ok ? drill.lesson[s.lang] : phase.clue;
    return (
      <Screen title={drill.title[s.lang]} banner={<PracticeBanner />}>
        <View style={[styles.result, { backgroundColor: ok ? C.green : C.amber }]}>
          <IconBubble icon={ok ? 'trophy' : 'bulb'} color={ok ? C.green : C.amber} bg={C.white} size={78} />
          <Txt size={22} weight="800" color={C.white} center accessibilityRole="header">{head}</Txt>
          <Txt size={16} color={C.white} center>{body}</Txt>
          {!ok ? <Txt size={15} weight="600" color={C.white} center>{drill.lesson[s.lang]}</Txt> : null}
          <SpeakButton light text={`${head} ${body}`} />
        </View>
        {!ok ? <PillButton label={t('practice_again')} icon="refresh" color={C.purple} onPress={restart} /> : null}
        <PillButton label={t('practice_back')} icon="list" color={C.red} onPress={() => router.replace('/practice')} />
      </Screen>
    );
  }

  const isCall = drill.kind === 'call';
  return (
    <Screen title={drill.title[s.lang]} banner={<PracticeBanner />}>
      <View style={[styles.caller, isCall ? { backgroundColor: C.navy } : { backgroundColor: C.surface }]}>
        <View style={styles.callerTop}>
          <IconBubble icon={isCall ? 'call' : 'chatbubble-ellipses'} color={C.white} bg={isCall ? C.green : C.purple} size={46} />
          <View style={{ flex: 1 }}>
            <Txt size={13} weight="600" color={isCall ? '#CFC6E6' : C.muted}>{isCall ? t('incoming_call') : t('new_message')}</Txt>
            <Txt size={15} weight="600" color={isCall ? C.white : C.ink}>{variant.from[s.lang]}</Txt>
          </View>
        </View>
        {variant.steps.slice(0, step + 1).map((st, i) => (
          <View key={i} style={[styles.bubble, isCall ? { backgroundColor: C.white } : { backgroundColor: C.purpleSoft }]}>
            <Txt size={16} color={C.ink}>{st.line[s.lang]}</Txt>
          </View>
        ))}
        <SpeakButton light={isCall} text={current.line[s.lang]} />
      </View>

      {current.choices.map((c, i) => (
        <Pressable
          key={i}
          accessibilityRole="button"
          accessibilityLabel={c.label[s.lang]}
          onPress={() => choose(c)}
          style={({ pressed }) => [styles.choice, pressed && { opacity: 0.88 }]}
        >
          <View style={styles.choiceDot}><Txt size={14} weight="700" color={C.red}>{String.fromCharCode(65 + i)}</Txt></View>
          <Txt size={16} weight="600" style={{ flex: 1 }}>{c.label[s.lang]}</Txt>
          <Ionicons name="chevron-forward" size={20} color={C.muted} />
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  caller: { borderRadius: 24, padding: 18, gap: 12, ...SHADOW },
  callerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bubble: { borderRadius: 16, borderTopLeftRadius: 4, padding: 14 },
  result: { borderRadius: 26, padding: 22, alignItems: 'center', gap: 10, ...SHADOW, shadowOpacity: 0.25 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: TOUCH.main, borderRadius: RADIUS, backgroundColor: C.surface, paddingHorizontal: 14, paddingVertical: 12, ...SHADOW },
  choiceDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.redSoft, alignItems: 'center', justifyContent: 'center' },
});
