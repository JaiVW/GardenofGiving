import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { Link, usePathname, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { GardenColors, GardenSoftShadow } from '@/constants/garden-theme';
import { MaxContentWidth } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="today" href="/" asChild>
            <TabButton>Today</TabButton>
          </TabTrigger>
          <TabTrigger name="garden" href="/explore" asChild>
            <TabButton>Garden</TabButton>
          </TabTrigger>
          <TabTrigger name="completed" href="/completed" asChild>
            <TabButton>Completed</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function BrandMark() {
  return (
    <View style={styles.brandMark}>
      <View style={[styles.brandPetal, styles.brandPetalOne]} />
      <View style={[styles.brandPetal, styles.brandPetalTwo]} />
      <View style={styles.brandSeed} />
    </View>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabPressable, pressed && styles.pressed]}>
      <View style={[styles.tabButton, isFocused && styles.tabButtonActive]}>
        <ThemedText type="smallBold" style={[styles.tabText, isFocused && styles.tabTextActive]}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const pathname = usePathname();

  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.brand}>
          <BrandMark />
          <ThemedText style={styles.brandText}>Garden of Giving</ThemedText>
        </View>
        <View style={styles.nav}>{props.children}</View>
      </View>
      <View style={styles.bottomNav}>
        <BottomLink href="/" label="Today" active={pathname === '/'} />
        <BottomLink href="/explore" label="Garden" active={pathname === '/explore'} />
        <View style={styles.disabledBottomItem}>
          <ThemedText type="small" style={styles.bottomIcon}>
            ◌
          </ThemedText>
          <ThemedText type="small" style={styles.bottomText}>
            Well
          </ThemedText>
        </View>
        <View style={styles.disabledBottomItem}>
          <ThemedText type="small" style={styles.bottomIcon}>
            ♡
          </ThemedText>
          <ThemedText type="small" style={styles.bottomText}>
            Our Garden
          </ThemedText>
        </View>
        <BottomLink href="/completed" label="Completed" active={pathname === '/completed'} />
      </View>
    </View>
  );
}

function BottomLink({ href, label, active }: { href: Href; label: string; active: boolean }) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.bottomItem}>
        <ThemedText type="small" style={[styles.bottomIcon, active && styles.bottomActive]}>
          {label === 'Today' ? '□' : label === 'Garden' ? '♧' : '☼'}
        </ThemedText>
        <ThemedText type="small" style={[styles.bottomText, active && styles.bottomActive]}>
          {label}
        </ThemedText>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: '100%',
  },
  tabListContainer: {
    bottom: 0,
    left: 0,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    pointerEvents: 'box-none',
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
    zIndex: 20,
  },
  innerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    maxWidth: MaxContentWidth + 120,
    width: '100%',
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  brandText: {
    color: GardenColors.ink,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 18,
  },
  brandMark: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: GardenColors.line,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    position: 'relative',
    width: 32,
    ...GardenSoftShadow,
  },
  brandPetal: {
    borderRadius: 9,
    height: 12,
    position: 'absolute',
    top: 10,
    width: 12,
  },
  brandPetalOne: {
    backgroundColor: GardenColors.teal,
    left: 7,
  },
  brandPetalTwo: {
    backgroundColor: GardenColors.sage,
    right: 7,
  },
  brandSeed: {
    backgroundColor: GardenColors.claySoft,
    borderRadius: 4,
    bottom: 8,
    height: 8,
    left: 12,
    position: 'absolute',
    width: 8,
  },
  nav: {
    backgroundColor: 'rgba(255,253,249,0.72)',
    borderColor: GardenColors.line,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 3,
    padding: 4,
  },
  tabPressable: {
    minWidth: 112,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 22,
  },
  tabButtonActive: {
    backgroundColor: GardenColors.clay,
  },
  tabText: {
    color: GardenColors.ink,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.75,
  },
  bottomNav: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,253,249,0.9)',
    borderColor: 'rgba(255,255,255,0.78)',
    borderRadius: 24,
    borderWidth: 1,
    bottom: 18,
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'space-between',
    maxWidth: MaxContentWidth,
    minHeight: 76,
    paddingHorizontal: 10,
    paddingVertical: 9,
    position: 'absolute',
    width: '100%',
    shadowColor: '#231E18',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
  },
  bottomItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  disabledBottomItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    opacity: 0.68,
  },
  bottomIcon: {
    color: GardenColors.inkSoft,
    fontSize: 18,
    lineHeight: 20,
  },
  bottomText: {
    color: GardenColors.inkSoft,
    fontSize: 11,
    textAlign: 'center',
  },
  bottomActive: {
    color: GardenColors.mintDeep,
  },
});
