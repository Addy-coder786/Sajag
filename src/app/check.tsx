import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Card, ContactCard, dial, openLink, PillButton, Row, Screen, SectionTitle, SmallButton, SpeakButton, Txt, useAutoSpeak } from '@/components/ui';
import { analyzeText } from '@/engine/analyze';
import type { ActionCode, Analysis, Tier } from '@/engine/types';
import type { StringKey } from '@/i18n/strings';
import { useSettings } from '@/state/settings';
import { C, RADIUS, SHADOW } from '@/theme';

const TIER_STYLE: Record<Tier, { color: string; icon: 'warning' | 'help-circle' | 'information-circle' }> = {
  scam_signs: { color: C.red, icon: 'warning' },
  unsure: { color: C.amber, icon: 'help-circle' },
  no_common_signs: { color: C.blue, icon: 'information-circle' },
};

export default function Check() {
  const params = useLocalSearchParams<{ text?: string }>();
  const { s, t } = useSettings();
  const router = useRouter();
  const [text, setText] = useState(params.text ?? '');
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(false);

  const run = () => {
    if (!text.trim()) {
      setError(t('check_empty'));
      setResult(null);
      return;
    }
    setError('');
    setFeedback(false);
    setResult(analyzeText(text));
  };

  const paste = async () => {
    const clip = await Clipboard.getStringAsync().catch(() => '');
    if (clip) setText(clip);
  };

  const again = () => {
    setText('');
    setResult(null);
    setFeedback(false);
  };

  // Elder-friendly: once checked, the result takes the top of the screen (no hidden result below the fold).
  if (result) {
    return (
      <Screen title={t('tile_check')}>
        <Result a={result} feedback={feedback} onFeedback={() => setFeedback(true)} onRuko={() => router.push('/ruko')} />
        <PillButton label={t('check_again')} icon="refresh" onPress={again} />
      </Screen>
    );
  }

  return (
    <Screen title={t('tile_check')}>
      <Txt size={20} weight="700" accessibilityRole="header">{t('check_title')}</Txt>
      <View style={styles.inputCard}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t('check_hint')}
          placeholderTextColor={C.muted}
          multiline
          accessibilityLabel={t('check_hint')}
          style={[styles.input, { fontSize: Math.round(16 * s.textScale) }]}
          textAlignVertical="top"
        />
        <Row>
          <SmallButton label={t('check_paste')} icon="clipboard" onPress={paste} />
          <SmallButton label={t('check_clear')} icon="close-circle" color={C.muted} onPress={() => { setText(''); setResult(null); }} />
        </Row>
      </View>
      <PillButton label={t('check_button')} icon="search" onPress={run} />
      <Row style={{ flexWrap: 'nowrap' }}>
        <Ionicons name="lock-closed" size={16} color={C.green} />
        <Txt size={12} color={C.muted} style={{ flex: 1 }}>{t('check_privacy')}</Txt>
      </Row>
      {error ? <Txt size={15} weight="600" color={C.red}>{error}</Txt> : null}
    </Screen>
  );
}

function Result({ a, feedback, onFeedback, onRuko }: { a: Analysis; feedback: boolean; onFeedback: () => void; onRuko: () => void }) {
  const { s, t } = useSettings();
  useAutoSpeak(`${t(`tier_${a.tier}` as StringKey)}. ${t(`tier_${a.tier}_sub` as StringKey)}`);
  const st = TIER_STYLE[a.tier];
  const title = t(`tier_${a.tier}` as StringKey);
  const sub = t(`tier_${a.tier}_sub` as StringKey);
  const reasons = useMemo(() => a.hits.slice(0, 3), [a.hits]);
  const flagged = a.urls.filter((u) => u.flags.length > 0);
  const spoken = [title, sub, ...reasons.map((h) => `${h.title[s.lang]}. ${h.explain[s.lang]}`)].join(' ');
  const first = s.contacts[0];

  return (
    <View style={{ gap: 14 }}>
      <View style={[styles.verdict, { backgroundColor: st.color }]}>
        <Ionicons name={st.icon} size={50} color={C.white} />
        <Txt size={22} weight="800" color={C.white} center accessibilityRole="header">{title}</Txt>
        <Txt size={15} color={C.white} center>{sub}</Txt>
        <SpeakButton light text={spoken} />
      </View>

      {reasons.length > 0 || flagged.length > 0 ? (
        <Card>
          <Txt size={17} weight="700">{t('whyTitle')}</Txt>
          {reasons.map((h, i) => (
            <View key={h.ruleId} style={styles.reason}>
              <View style={[styles.num, { backgroundColor: st.color }]}>
                <Txt size={13} weight="700" color={C.white}>{i + 1}</Txt>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Txt size={16} weight="600">{h.title[s.lang]}</Txt>
                <Txt size={14} color={C.muted}>{h.explain[s.lang]}</Txt>
                <View style={[styles.quote, { borderColor: st.color }]}>
                  <Txt size={13} color={st.color}>“{h.match.trim().slice(0, 80)}”</Txt>
                </View>
              </View>
            </View>
          ))}
          {flagged.map((u) => (
            <View key={u.url} style={styles.reason}>
              <View style={[styles.num, { backgroundColor: C.red }]}>
                <Ionicons name="link" size={16} color={C.white} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Txt size={16} weight="600">{t('linkWarning')}: {u.host}</Txt>
                {u.flags.map((f) => (
                  <Txt key={f} size={14} color={C.muted}>• {t(`flag_${f}` as StringKey)}</Txt>
                ))}
              </View>
            </View>
          ))}
        </Card>
      ) : null}

      {a.deliveryOtpException ? (
        <Card tint={C.blueSoft}>
          <Txt size={14}>{t('deliveryNote')}</Txt>
        </Card>
      ) : null}

      <SectionTitle>{t('whatToDo')}</SectionTitle>
      <Card>
        {a.actions.map((act) => (
          <ActionRow key={act} act={act} onRuko={onRuko} />
        ))}
      </Card>
      {a.actions.includes('ask_family') && first ? (
        <ContactCard name={first.name} phone={first.phone} index={2} badge={t('firstAsk')} callLabel={t('call')} />
      ) : null}

      {feedback ? (
        <Txt size={13} color={C.green}>{t('thanksFeedback')}</Txt>
      ) : (
        <SmallButton label={t('wasWrong')} icon="chatbox-ellipses" color={C.muted} onPress={onFeedback} />
      )}
    </View>
  );
}

function ActionRow({ act, onRuko }: { act: ActionCode; onRuko: () => void }) {
  const { s, t } = useSettings();
  const label = t(`act_${act}` as StringKey);
  const handlers: Partial<Record<ActionCode, () => void>> = {
    ruko: onRuko,
    call_bank_known_number: s.myBankNumber ? () => dial(s.myBankNumber) : undefined,
    report_chakshu: () => openLink('https://sancharsaathi.gov.in/sfc/'),
    call_1930: () => dial('1930'),
  };
  const handler = handlers[act];
  return (
    <View style={styles.action}>
      <Ionicons name="checkmark-circle" size={22} color={C.green} />
      <Txt size={15} style={{ flex: 1 }}>{label}</Txt>
      {handler ? (
        <SmallButton label={act === 'ruko' ? t('tile_ruko') : act === 'report_chakshu' ? t('open') : t('call')} onPress={handler} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputCard: { backgroundColor: C.surface, borderRadius: RADIUS, padding: 14, gap: 10, ...SHADOW },
  input: { minHeight: 130, backgroundColor: C.bg, borderRadius: RADIUS - 6, padding: 14, color: C.ink, fontFamily: 'Poppins_400Regular' },
  verdict: { borderRadius: 26, padding: 22, alignItems: 'center', gap: 8, ...SHADOW, shadowOpacity: 0.25 },
  reason: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  quote: { borderLeftWidth: 3, paddingLeft: 8, marginTop: 2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 },
});
