import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';
import { usePathname, useRouter, type Href } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { SPEECH_LANG } from '@/i18n/strings';
import { useSettings } from '@/state/settings';
import { C, FONT, GAP, LINE_HEIGHT, RADIUS, SHADOW, TOUCH } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];
type Weight = '400' | '500' | '600' | '700' | '800';

const FAMILY: Record<Weight, string> = {
  '400': FONT.regular,
  '500': FONT.medium,
  '600': FONT.semibold,
  '700': FONT.bold,
  '800': FONT.extrabold,
};

/** Text that follows the user's chosen size, uses Poppins (Latin + Devanagari) and safe line height. */
export function Txt({
  children,
  size = 16,
  weight = '400',
  color = C.ink,
  style,
  center,
  upper,
  accessibilityRole,
  numberOfLines,
}: {
  children: ReactNode;
  size?: number;
  weight?: Weight;
  color?: string;
  style?: TextStyle;
  center?: boolean;
  upper?: boolean;
  accessibilityRole?: 'header' | 'text';
  numberOfLines?: number;
}) {
  const { s } = useSettings();
  const fs = Math.round(size * s.textScale);
  return (
    <Text
      accessibilityRole={accessibilityRole}
      numberOfLines={numberOfLines}
      style={[
        { fontFamily: FAMILY[weight], fontSize: fs, lineHeight: Math.round(fs * LINE_HEIGHT), color },
        center && { textAlign: 'center' },
        upper && { textTransform: 'uppercase', letterSpacing: 0.5 },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Red header with rounded bottom corners, back arrow and an optional right action. */
export function AppHeader({ title, back = true, right }: { title: string; back?: boolean; right?: { icon: IconName; label: string; onPress: () => void } }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={26} color={C.white} />
        </Pressable>
      ) : (
        <View style={styles.headerBtn} />
      )}
      <Txt size={19} weight="600" color={C.white} center style={{ flex: 1 }} numberOfLines={1} accessibilityRole="header">
        {title}
      </Txt>
      {right ? (
        <Pressable accessibilityRole="button" accessibilityLabel={right.label} onPress={right.onPress} style={styles.headerBtn} hitSlop={8}>
          <Ionicons name={right.icon} size={28} color={C.white} />
        </Pressable>
      ) : (
        <View style={styles.headerBtn} />
      )}
    </View>
  );
}

export function Screen({
  children,
  title,
  back = true,
  right,
  nav = false,
  banner,
  scroll = true,
}: {
  children: ReactNode;
  title?: string;
  back?: boolean;
  right?: { icon: IconName; label: string; onPress: () => void };
  nav?: boolean;
  banner?: ReactNode;
  scroll?: boolean;
}) {
  const body = <View style={[styles.body, nav && { paddingBottom: 120 }]}>{children}</View>;
  return (
    <View style={styles.safe}>
      {title ? <AppHeader title={title} back={back} right={right} /> : null}
      {banner}
      <SafeAreaView style={{ flex: 1 }} edges={title ? ['left', 'right'] : ['top', 'left', 'right']}>
        {scroll ? (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </SafeAreaView>
      {nav ? <BottomNav /> : null}
    </View>
  );
}

export function Card({ children, style, tint }: { children: ReactNode; style?: ViewStyle; tint?: string }) {
  return <View style={[styles.card, tint ? { backgroundColor: tint, shadowOpacity: 0, elevation: 0 } : null, style]}>{children}</View>;
}

/** Rounded icon bubble used on tiles and list rows. */
export function IconBubble({ icon, color, bg, size = 48 }: { icon: IconName; color: string; bg: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={Math.round(size * 0.5)} color={color} />
    </View>
  );
}

/** Big tappable row/tile: icon bubble, title, subtitle, chevron. */
export function BigButton({
  label,
  sub,
  icon,
  color = C.red,
  onPress,
  outline,
  solid,
  disabled,
}: {
  label: string;
  sub?: string;
  icon?: IconName;
  color?: string;
  onPress: () => void;
  outline?: boolean;
  solid?: boolean;
  disabled?: boolean;
}) {
  const filled = solid ?? !outline;
  const fg = filled ? C.white : C.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={sub ? `${label}. ${sub}` : label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.big,
        filled ? { backgroundColor: color } : styles.bigOutline,
        { opacity: disabled ? 0.5 : pressed ? 0.88 : 1 },
      ]}
    >
      {icon ? <IconBubble icon={icon} color={filled ? color : C.white} bg={filled ? C.white : color} size={46} /> : null}
      <View style={{ flex: 1 }}>
        <Txt size={17} weight="600" color={fg}>{label}</Txt>
        {sub ? <Txt size={13} color={filled ? '#FFE9E8' : C.muted}>{sub}</Txt> : null}
      </View>
      <Ionicons name="chevron-forward" size={22} color={filled ? C.white : C.muted} />
    </Pressable>
  );
}

/** Rounded pill button like "Let's get started →". */
export function PillButton({ label, onPress, icon = 'arrow-forward', color = C.red, disabled }: { label: string; onPress: () => void; icon?: IconName; color?: string; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.pill, { backgroundColor: color, opacity: disabled ? 0.45 : pressed ? 0.88 : 1 }]}
    >
      <Txt size={17} weight="600" color={C.white}>{label}</Txt>
      <Ionicons name={icon} size={22} color={C.white} />
    </Pressable>
  );
}

export function SmallButton({ label, icon, onPress, color = C.red }: { label: string; icon?: IconName; onPress: () => void; color?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.small, { borderColor: color, opacity: pressed ? 0.8 : 1 }]}
    >
      {icon ? <Ionicons name={icon} size={19} color={color} /> : null}
      <Txt size={14} weight="600" color={color}>{label}</Txt>
    </Pressable>
  );
}

/** Green round call button, as on the contact list. */
export function CallCircle({ number, label }: { number: string; label: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${number}`}
      onPress={() => dial(number)}
      style={({ pressed }) => [styles.callCircle, pressed && { opacity: 0.85 }]}
    >
      <Ionicons name="call" size={22} color={C.white} />
    </Pressable>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

const AVATAR_COLORS = ['#D7261E', '#2457D6', '#6A3FD6', '#1E9E4A', '#C25E00'];

/** Contact row: initials avatar, name, number, optional badge, green call button. */
export function ContactCard({
  name,
  phone,
  index = 0,
  badge,
  onMore,
  callLabel,
  icon,
}: {
  name: string;
  phone: string;
  index?: number;
  badge?: string;
  onMore?: () => void;
  callLabel: string;
  /** Show an icon instead of initials (for services like 1930 or the bank). */
  icon?: IconName;
}) {
  const col = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <View style={[styles.card, styles.contact]}>
      <View style={[styles.avatar, { backgroundColor: col }]}>
        {icon ? <Ionicons name={icon} size={26} color={C.white} /> : <Txt size={17} weight="700" color={C.white}>{initials(name)}</Txt>}
      </View>
      <View style={{ flex: 1 }}>
        <Txt size={17} weight="600" numberOfLines={1}>{name || phone}</Txt>
        <Txt size={14} color={C.muted}>{phone}</Txt>
        {badge ? <Txt size={12} weight="600" color={C.red}>{badge}</Txt> : null}
      </View>
      {onMore ? (
        <Pressable accessibilityRole="button" accessibilityLabel="More" onPress={onMore} style={styles.more} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={22} color={C.ink} />
        </Pressable>
      ) : null}
      <CallCircle number={phone} label={callLabel} />
    </View>
  );
}

/** Circular countdown ring (used by the RUKO breathing pause). */
export function RingTimer({ total, left, label }: { total: number; left: number; label: string }) {
  const size = 230;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(1, left / total));
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={`${left} ${label}`}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#F3EDED" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={C.red}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={circ * (1 - progress)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={{ fontFamily: FONT.bold, fontSize: 52, color: C.red }}>{`${mm}:${ss}`}</Text>
      <Txt size={14} color={C.muted}>{label}</Txt>
    </View>
  );
}

const NAV: { href: Href; match: (p: string) => boolean; icon: IconName; iconActive: IconName; key: 'nav_home' | 'nav_practice' | 'nav_helplines' | 'nav_settings' }[] = [
  { href: '/', match: (p) => p === '/', icon: 'home-outline', iconActive: 'home', key: 'nav_home' },
  { href: '/practice', match: (p) => p.startsWith('/practice'), icon: 'school-outline', iconActive: 'school', key: 'nav_practice' },
  { href: '/helplines', match: (p) => p.startsWith('/helplines'), icon: 'call-outline', iconActive: 'call', key: 'nav_helplines' },
  { href: '/settings', match: (p) => p.startsWith('/settings') || p.startsWith('/contacts'), icon: 'person-outline', iconActive: 'person', key: 'nav_settings' },
];

/** Bottom navigation with a raised red RUKO button in the centre. */
export function BottomNav() {
  const router = useRouter();
  const path = usePathname();
  const insets = useSafeAreaInsets();
  const { t } = useSettings();
  const item = (n: (typeof NAV)[number]) => {
    const active = n.match(path);
    return (
      <Pressable
        key={n.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={t(n.key)}
        onPress={() => router.navigate(n.href)}
        style={styles.navItem}
      >
        <Ionicons name={active ? n.iconActive : n.icon} size={25} color={active ? C.red : '#8E8A96'} />
        <Text style={[styles.navLabel, { color: active ? C.red : '#6F6B78' }]} numberOfLines={1}>{t(n.key)}</Text>
      </Pressable>
    );
  };
  return (
    <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {item(NAV[0])}
      {item(NAV[1])}
      <View style={styles.navItem}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('tile_ruko')}
          onPress={() => router.navigate('/ruko')}
          style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.96 }] }]}
        >
          <Ionicons name="hand-left" size={30} color={C.white} />
        </Pressable>
        <Text style={[styles.navLabel, { color: C.red, marginTop: 2 }]}>{t('tile_ruko')}</Text>
      </View>
      {item(NAV[2])}
      {item(NAV[3])}
    </View>
  );
}

/** Opens the phone dialer. Uses a dial intent, so no CALL_PHONE permission is needed. */
export function dial(number: string) {
  Linking.openURL(`tel:${number.replace(/[^\d+]/g, '')}`).catch(() => undefined);
}

export function openLink(url: string) {
  Linking.openURL(url).catch(() => undefined);
}

/** Reads text aloud in the user's language (hi-IN / mr-IN / en-IN). */
export function SpeakButton({ text, light }: { text: string; light?: boolean }) {
  const { s, t } = useSettings();
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => void Speech.stop(), []);
  const toggle = async () => {
    if (speaking) {
      await Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(text, {
      language: SPEECH_LANG[s.lang],
      rate: 0.9,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };
  return (
    <SmallButton
      label={speaking ? t('stop') : t('readAloud')}
      icon={speaking ? 'stop-circle' : 'volume-high'}
      color={light ? C.white : C.red}
      onPress={toggle}
    />
  );
}

/** Speaks once when a screen opens, if voice guidance is on. */
export function useAutoSpeak(text: string, enabled = true) {
  const { s } = useSettings();
  useEffect(() => {
    if (!s.voice || !enabled || !text) return;
    Speech.speak(text, { language: SPEECH_LANG[s.lang], rate: 0.9 });
    return () => void Speech.stop();
  }, [text, s.voice, s.lang, enabled]);
}

export function PracticeBanner() {
  const { t } = useSettings();
  return (
    <View style={styles.practice} accessibilityRole="text" accessibilityLabel={t('practice_banner')}>
      <Ionicons name="school" size={18} color={C.white} />
      <Text style={styles.practiceText}>{t('practice_banner')}</Text>
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Txt size={14} weight="600" color={C.muted} upper style={{ marginTop: 6 }}>{children}</Txt>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  body: { padding: 18, gap: GAP, maxWidth: 640, width: '100%', alignSelf: 'center' },
  header: {
    backgroundColor: C.red,
    paddingHorizontal: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOW,
  },
  headerBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: C.surface, borderRadius: RADIUS, padding: 16, gap: 10, ...SHADOW },
  big: { minHeight: TOUCH.main + 8, borderRadius: RADIUS, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 14, ...SHADOW },
  bigOutline: { backgroundColor: C.surface },
  pill: { minHeight: 58, borderRadius: 999, paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...SHADOW },
  small: { minHeight: TOUCH.min, borderRadius: 999, borderWidth: 1.5, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  callCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  contact: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  avatar: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  more: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center' },
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.surface,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', minHeight: 54, gap: 2 },
  navLabel: { fontFamily: FONT.medium, fontSize: 12 },
  fab: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: C.red,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -34,
    borderWidth: 5,
    borderColor: C.surface,
    ...SHADOW,
    shadowOpacity: 0.3,
  },
  practice: { backgroundColor: C.purple, paddingVertical: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  practiceText: { color: C.white, fontFamily: FONT.bold, letterSpacing: 1, fontSize: 15 },
});
