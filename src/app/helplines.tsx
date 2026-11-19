import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Card, CallCircle, IconBubble, openLink, Row, Screen, SmallButton, Txt } from '@/components/ui';
import { HELPLINES } from '@/content/helplines';
import { useSettings } from '@/state/settings';
import { C } from '@/theme';

const ICONS: Record<string, Parameters<typeof IconBubble>[0]['icon']> = {
  '1930': 'shield',
  chakshu: 'eye',
  '1909': 'notifications-off',
  'rbi-cms': 'business',
  'sebi-check': 'trending-up',
  uidai: 'finger-print',
  elderline: 'heart',
  jeevan: 'document-text',
  '112': 'warning',
};

export default function Helplines() {
  const { s, t } = useSettings();
  const [open, setOpen] = useState<string | null>('1930');
  return (
    <Screen title={t('helplines_title')} back={false} nav>
      <Txt size={14} color={C.muted}>{t('helplines_sub')}</Txt>
      {HELPLINES.map((h, i) => {
        const expanded = open === h.id;
        return (
          <Card key={h.id} style={{ gap: 8 }}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setOpen(expanded ? null : h.id)}>
              <Row style={{ flexWrap: 'nowrap' }}>
                <IconBubble icon={ICONS[h.id] ?? 'call'} color={C.white} bg={i === 0 ? C.red : C.navy} size={50} />
                <View style={{ flex: 1 }}>
                  <Txt size={16} weight="600">{h.name[s.lang]}</Txt>
                  <Txt size={13} color={C.muted}>{h.phone ? `${h.phone} · ` : ''}{h.hours[s.lang]}</Txt>
                </View>
                {h.phone ? <CallCircle number={h.phone} label={t('call')} /> : null}
              </Row>
            </Pressable>
            {expanded ? (
              <>
                <Txt size={15}>{h.when[s.lang]}</Txt>
                <Row>
                  {h.url ? <SmallButton label={t('open')} icon="globe-outline" onPress={() => openLink(h.url!)} /> : null}
                  <SmallButton label={`${t('verified')} ${h.lastVerified}`} icon="shield-checkmark-outline" color={C.muted} onPress={() => openLink(h.source)} />
                </Row>
              </>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}
