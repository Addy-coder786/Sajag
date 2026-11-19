import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, ContactCard, openLink, PillButton, Row, Screen, SectionTitle, SmallButton, SpeakButton, Txt, useAutoSpeak } from '@/components/ui';
import { liabilityRuleKey } from '@/content/helplines';
import type { StringKey } from '@/i18n/strings';
import { useSettings } from '@/state/settings';
import { C, SHADOW } from '@/theme';

const STEPS = [1, 2, 3, 4, 5] as const;

export default function Lost() {
  const { s, t } = useSettings();
  const [copied, setCopied] = useState(false);
  const rights = t(liabilityRuleKey());
  useAutoSpeak(`${t('lost_title')} ${t('lost_sub')}`);

  const copy = async () => {
    await Clipboard.setStringAsync(t('complaint_text')).catch(() => false);
    setCopied(true);
  };

  return (
    <Screen title={t('tile_lost')}>
      <View style={styles.hero}>
        <Txt size={21} weight="800" color={C.white} center accessibilityRole="header">{t('lost_title')}</Txt>
        <Txt size={15} color={C.white} center>{t('lost_sub')}</Txt>
        <SpeakButton light text={`${t('lost_title')} ${t('lost_sub')} ${STEPS.map((n) => t(`lost_s${n}_title` as StringKey)).join('. ')}`} />
      </View>

      {STEPS.map((n) => (
        <View key={n} style={styles.stepWrap}>
          <View style={styles.rail}>
            <View style={styles.num}><Txt size={15} weight="700" color={C.white}>{n}</Txt></View>
            {n < STEPS.length ? <View style={styles.railLine} /> : null}
          </View>
          <Card style={{ flex: 1 }}>
            <Txt size={17} weight="700">{t(`lost_s${n}_title` as StringKey)}</Txt>
            <Txt size={14} color={C.muted}>{t(`lost_s${n}_body` as StringKey)}</Txt>
            {n === 2 ? <ContactCard name={t('lost_s2_title')} phone="1930" index={0} icon="shield" callLabel={t('call')} /> : null}
            {n === 3 ? (
              <>
                {s.myBankNumber ? (
                  <ContactCard name={t('callMyBank')} phone={s.myBankNumber} index={1} icon="business" callLabel={t('call')} />
                ) : (
                  <Txt size={14} weight="600" color={C.blue}>{t('noBankNumber')}</Txt>
                )}
                <View style={styles.rights}>
                  <Txt size={14} weight="600" color={C.navy}>{rights}</Txt>
                </View>
              </>
            ) : null}
            {n === 4 ? (
              <>
                <SmallButton label={t('open_portal')} icon="globe-outline" onPress={() => openLink('https://cybercrime.gov.in')} />
                <View style={styles.complaint}>
                  <Txt size={15} weight="700">{t('complaint_title')}</Txt>
                  <Txt size={14}>{t('complaint_text')}</Txt>
                  <PillButton label={copied ? t('copied') : t('copy')} icon={copied ? 'checkmark' : 'copy'} color={copied ? C.green : C.red} onPress={copy} />
                </View>
              </>
            ) : null}
          </Card>
        </View>
      ))}

      {s.contacts.length > 0 ? (
        <>
          <SectionTitle>{t('askFamilyGeneric')}</SectionTitle>
          {s.contacts.slice(0, 3).map((c, i) => (
            <ContactCard key={c.id} name={c.name} phone={c.phone} index={i + 2} badge={i === 0 ? t('firstAsk') : undefined} callLabel={t('call')} />
          ))}
        </>
      ) : null}
      <Row style={{ justifyContent: 'center' }}>
        <Txt size={12} color={C.muted} center>{t('helplines_sub')}</Txt>
      </Row>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: C.red, borderRadius: 26, padding: 20, gap: 8, alignItems: 'center', ...SHADOW, shadowOpacity: 0.25 },
  stepWrap: { flexDirection: 'row', gap: 10 },
  rail: { alignItems: 'center', width: 34 },
  num: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  railLine: { flex: 1, width: 3, backgroundColor: C.redSoft, marginTop: 4, borderRadius: 2 },
  rights: { backgroundColor: C.blueSoft, borderRadius: 12, padding: 12 },
  complaint: { backgroundColor: C.redTint, borderRadius: 14, padding: 14, gap: 8 },
});
