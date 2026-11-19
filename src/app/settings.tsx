import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, TextInput, View } from 'react-native';
import { BigButton, Card, IconBubble, PillButton, Row, Screen, SectionTitle, SmallButton, Txt } from '@/components/ui';
import { useSettings } from '@/state/settings';
import { C, RADIUS, TOUCH } from '@/theme';

export default function SettingsScreen() {
  const { s, t, update, reset } = useSettings();
  const router = useRouter();
  const [bank, setBank] = useState(s.myBankNumber);
  const [saved, setSaved] = useState(false);
  const fs = Math.round(17 * s.textScale);

  return (
    <Screen title={t('settings_title')} back={false} nav>
      <BigButton label={`${t('language')} · ${t('textSize')}`} icon="language" color={C.red} outline onPress={() => router.push('/language')} />

      <View style={styles.voice}>
        <IconBubble icon="volume-high" color={C.white} bg={C.red} size={40} />
        <Txt size={16} weight="500" style={{ flex: 1 }}>{t('voiceOn')}</Txt>
        <Switch value={s.voice} onValueChange={(v) => update({ voice: v })} accessibilityLabel={t('voiceOn')} trackColor={{ true: C.red, false: '#CFCBD4' }} thumbColor={C.white} />
      </View>

      <SectionTitle>{t('myBank')}</SectionTitle>
      <Card>
        <Row style={{ flexWrap: 'nowrap' }}>
          <IconBubble icon="business" color={C.white} bg={C.blue} size={40} />
          <Txt size={14} color={C.muted} style={{ flex: 1 }}>{t('myBank_where')}</Txt>
        </Row>
        <TextInput
          value={bank}
          onChangeText={(v) => { setBank(v); setSaved(false); }}
          placeholder={t('myBank_hint')}
          placeholderTextColor={C.muted}
          keyboardType="phone-pad"
          accessibilityLabel={t('myBank')}
          style={[styles.input, { fontSize: fs }]}
        />
        <PillButton
          label={saved ? t('saved') : t('save')}
          icon={saved ? 'checkmark-circle' : 'save'}
          color={C.green}
          onPress={() => { update({ myBankNumber: bank.replace(/[^\d+\s-]/g, '').trim() }); setSaved(true); }}
        />
      </Card>

      <SectionTitle>{t('trustedPeople')}</SectionTitle>
      <BigButton label={t('trustedPeople')} sub={`${s.contacts.length} / 5 · ${t('manage')}`} icon="people" color={C.green} outline onPress={() => router.push('/contacts')} />

      <Card tint={C.greenSoft}>
        <Row style={{ flexWrap: 'nowrap' }}>
          <IconBubble icon="lock-closed" color={C.white} bg={C.green} size={40} />
          <Txt size={16} weight="700" color={C.green}>{t('privacy_title')}</Txt>
        </Row>
        <Txt size={14}>{t('privacy_body')}</Txt>
      </Card>

      <SmallButton label={t('reset')} icon="trash" color={C.red} onPress={() => { reset(); router.replace('/language'); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: TOUCH.min + 6, backgroundColor: C.bg, borderRadius: RADIUS - 4, paddingHorizontal: 16, color: C.ink, borderWidth: 1.5, borderColor: C.line },
  voice: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderRadius: RADIUS, paddingHorizontal: 14, minHeight: 64, shadowColor: C.shadow, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
});
