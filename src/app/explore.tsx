import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthScreen } from '@/components/auth-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { getGardenState, getNextGrowthGoal } from '@/lib/gog';
import { supabase } from '@/lib/supabase';

export default function GardenScreen() {
  const { isLoading: isAuthLoading, session } = useAuth();
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const userId = session?.user.id;

  const loadGarden = useCallback(async () => {
    if (!userId) {
      return;
    }

    setIsLoading(true);
    const { count, error } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true);

    if (!error) {
      setTotalCompleted(count ?? 0);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadGarden();
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [loadGarden]);

  if (isAuthLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  const slots = getGardenState(totalCompleted);
  const nextGoal = getNextGrowthGoal(totalCompleted);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="smallBold" style={styles.kicker}>
              My garden
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              A living record of giving
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.gardenBed}>
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <View style={styles.bedGrid}>
                {slots.map((slot, index) => (
                  <View
                    key={`${slot.tone}-${index}`}
                    style={[
                      styles.plantSlot,
                      styles[slot.stage],
                      slot.size === 'large' && styles.large,
                      slot.size === 'small' && styles.small,
                    ]}>
                    <View style={styles.stem} />
                    <View style={[styles.leaf, slot.stage === 'bloom' && styles.bloomLeaf]} />
                  </View>
                ))}
              </View>
            )}
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.progress}>
            <View>
              <ThemedText type="subtitle">{totalCompleted}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                completed days
              </ThemedText>
            </View>
            <ThemedText style={styles.progressCopy}>
              {nextGoal
                ? `Next visible growth at ${nextGoal} completed days.`
                : 'The garden will keep filling in as you continue.'}
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
  },
  scrollContent: {
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    paddingTop: Spacing.five,
  },
  header: {
    gap: Spacing.two,
  },
  kicker: {
    color: '#2E6659',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 40,
    lineHeight: 44,
  },
  gardenBed: {
    borderRadius: Spacing.two,
    minHeight: 320,
    overflow: 'hidden',
    padding: Spacing.four,
  },
  bedGrid: {
    alignContent: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'center',
    minHeight: 260,
  },
  plantSlot: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    height: 112,
    justifyContent: 'flex-end',
    width: 68,
  },
  small: {
    transform: [{ scale: 0.82 }],
  },
  large: {
    transform: [{ scale: 1.16 }],
  },
  stem: {
    backgroundColor: '#2E6659',
    borderRadius: 4,
    height: 56,
    width: 8,
  },
  leaf: {
    backgroundColor: '#78977F',
    borderRadius: 28,
    height: 42,
    marginTop: -52,
    width: 42,
  },
  seed: {
    opacity: 0.35,
  },
  sprout: {
    opacity: 0.65,
  },
  growth: {
    opacity: 0.9,
  },
  bloom: {
    opacity: 1,
  },
  bloomLeaf: {
    backgroundColor: '#E95732',
  },
  progress: {
    alignItems: 'center',
    borderRadius: Spacing.two,
    flexDirection: 'row',
    gap: Spacing.four,
    justifyContent: 'space-between',
    padding: Spacing.three,
  },
  progressCopy: {
    flex: 1,
    textAlign: 'right',
  },
});
