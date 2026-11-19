import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Card, ContactCard, IconBubble, PillButton, Row, Screen, SmallButton, Txt } from '@/components/ui';
import { MAX_CONTACTS, useSettings } from '@/state/settings';
import { C, RADIUS, TOUCH } from '@/theme';

/** Trusted people list (stored only on this phone). The first person is asked first. */
export default function Contacts() {
  const { s, t, update } = useSettings();
  const [adding, setAdding] = useState(s.contacts.length === 0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [menu, setMenu] = useState<string | null>(null);
  const fs = Math.round(17 * s.textScale);
  const full = s.contacts.length >= MAX_CONTACTS;

  const [error, setError] = useState('');

  const save = () => {
    const cleanPhone = phone.replace(/[^\d+\s-]/g, '').trim();
    if (cleanPhone.replace(/\D/g, '').length < 10) {
      setError(t('contact_invalid'));
      return;
    }
    setError('');
    update({ contacts: [...s.contacts, { id: `c${Date.now()}`, name: name.trim().slice(0, 40), phone: cleanPhone }] });
    setName('');
    setPhone('');
    setAdding(false);
  };

  const remove = (id: string) => {
    update({ contacts: s.contacts.filter((c) => c.id !== id) });
    setMenu(null);
  };

  const makeFirst = (id: string) => {
    const c = s.contacts.find((x) => x.id === id);
    if (!c) return;
    update({ contacts: [c, ...s.contacts.filter((x) => x.id !== id)] });
    setMenu(null);
  };

  return (
    <Screen
      title={t('trustedPeople')}
      nav
      right={full ? undefined : { icon: 'add-circle-outline', label: t('addPerson'), onPress: () => setAdding(true) }}
    >
      <Txt size={14} color={C.muted}>{t('trustedPeople_sub')}</Txt>

      {adding && !full ? (
        <Card>
          <Row style={{ flexWrap: 'nowrap' }}>
            <IconBubble icon="person-add" color={C.white} bg={C.red} size={40} />
            <Txt size={17} weight="600">{t('addPerson')}</Txt>
          </Row>
          <TextInput value={name} onChangeText={setName} placeholder={t('trusted_name')} placeholderTextColor={C.muted} accessibilityLabel={t('trusted_name')} style={[styles.input, { fontSize: fs }]} />
          <TextInput value={phone} onChangeText={setPhone} placeholder={t('trusted_phone')} placeholderTextColor={C.muted} keyboardType="phone-pad" accessibilityLabel={t('trusted_phone')} style={[styles.input, { fontSize: fs }]} />
          {error ? <Txt size={15} weight="600" color={C.red}>{error}</Txt> : null}
          <PillButton label={t('save')} icon="checkmark" color={C.green} onPress={save} />
          {s.contacts.length > 0 ? <SmallButton label={t('cancel')} color={C.muted} onPress={() => setAdding(false)} /> : null}
        </Card>
      ) : null}

      {s.contacts.length === 0 && !adding ? (
        <Card tint={C.redTint}>
          <Txt size={15}>{t('noContacts')}</Txt>
        </Card>
      ) : null}

      {s.contacts.map((c, i) => (
        <View key={c.id} style={{ gap: 8 }}>
          <ContactCard
            name={c.name}
            phone={c.phone}
            index={i + 2}
            badge={i === 0 ? t('firstAsk') : undefined}
            callLabel={t('call')}
            onMore={() => setMenu(menu === c.id ? null : c.id)}
          />
          {menu === c.id ? (
            <Row style={{ paddingHorizontal: 6 }}>
              {i > 0 ? <SmallButton label={t('firstAsk')} icon="arrow-up" color={C.blue} onPress={() => makeFirst(c.id)} /> : null}
              <SmallButton label={t('remove')} icon="trash" color={C.red} onPress={() => remove(c.id)} />
            </Row>
          ) : null}
        </View>
      ))}

      {full ? <Txt size={13} color={C.muted} center>{t('contactsLimit')}</Txt> : null}

      <Card tint={C.amberSoft}>
        <Txt size={16} weight="700" color={C.amber}>{t('safeWord_title')}</Txt>
        <Txt size={14}>{t('safeWord_body')}</Txt>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: TOUCH.min + 6, backgroundColor: C.bg, borderRadius: RADIUS - 4, paddingHorizontal: 16, color: C.ink, borderWidth: 1.5, borderColor: C.line },
});
