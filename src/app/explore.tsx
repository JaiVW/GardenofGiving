import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthScreen } from '@/components/auth-screen';
import { ThemedText } from '@/components/themed-text';
import { GardenColors, GardenShadow, GardenSoftShadow } from '@/constants/garden-theme';
import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { GardenSlot, getGardenState, getNextGrowthGoal } from '@/lib/gog';
import { supabase } from '@/lib/supabase';

const gardenScene = require('@/assets/garden/garden-land.png');
const plantFamilies = {
  a: [
    require('@/assets/garden/plants/family-a-stage-01.png'),
    require('@/assets/garden/plants/family-a-stage-02.png'),
    require('@/assets/garden/plants/family-a-stage-03.png'),
    require('@/assets/garden/plants/family-a-stage-04.png'),
    require('@/assets/garden/plants/family-a-stage-05.png'),
    require('@/assets/garden/plants/family-a-stage-06.png'),
    require('@/assets/garden/plants/family-a-stage-07.png'),
    require('@/assets/garden/plants/family-a-stage-08.png'),
    require('@/assets/garden/plants/family-a-stage-09.png'),
    require('@/assets/garden/plants/family-a-stage-10.png'),
  ],
  b: [
    require('@/assets/garden/plants/family-b-stage-01.png'),
    require('@/assets/garden/plants/family-b-stage-02.png'),
    require('@/assets/garden/plants/family-b-stage-03.png'),
    require('@/assets/garden/plants/family-b-stage-04.png'),
    require('@/assets/garden/plants/family-b-stage-05.png'),
    require('@/assets/garden/plants/family-b-stage-06.png'),
    require('@/assets/garden/plants/family-b-stage-07.png'),
    require('@/assets/garden/plants/family-b-stage-08.png'),
    require('@/assets/garden/plants/family-b-stage-09.png'),
    require('@/assets/garden/plants/family-b-stage-10.png'),
  ],
} as const;

function Plant({ slot }: { slot: GardenSlot }) {
  const source = plantFamilies[slot.family][slot.stage - 1];
  return (
    <View
      style={[
        styles.plantSlot,
        slot.row === 'front' && styles.frontSlot,
        slot.size === 'small' && styles.smallSlot,
        slot.size === 'large' && styles.largeSlot,
      ]}>
      <Image
        accessibilityIgnoresInvertColors
        source={source}
        style={[styles.plantImage, { opacity: Math.min(1, 0.52 + slot.stage * 0.055) }]}
      />
    </View>
  );
}

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
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  const slots = getGardenState(totalCompleted);
  const nextGoal = getNextGrowthGoal(totalCompleted);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="smallBold" style={styles.kicker}>
            My garden
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            A living record of giving
          </ThemedText>
        </View>

        <ImageBackground
          accessibilityIgnoresInvertColors
          imageStyle={styles.gardenSceneImage}
          source={gardenScene}
          style={styles.gardenBed}>
          <View style={styles.sceneVeil} />
          <View style={styles.gardenStats}>
            <View style={styles.statCell}>
              <ThemedText style={styles.statNumber}>{totalCompleted}</ThemedText>
              <ThemedText type="small" style={styles.statLabel}>
                days
              </ThemedText>
            </View>
            <View style={styles.statCell}>
              <ThemedText style={styles.statNumber}>{slots.length}</ThemedText>
              <ThemedText type="small" style={styles.statLabel}>
                plants
              </ThemedText>
            </View>
          </View>
          {isLoading ? (
            <View style={styles.loadingGarden}>
              <ActivityIndicator />
            </View>
          ) : (
            <View style={styles.bedRow}>
              {slots.length ? (
                slots.map((slot, index) => <Plant key={`${slot.tone}-${index}`} slot={slot} />)
              ) : (
                <View style={styles.emptyGardenMessage}>
                  <ThemedText style={styles.emptyGardenText}>Bare ground, ready for the first seed.</ThemedText>
                </View>
              )}
            </View>
          )}
        </ImageBackground>

        <View style={styles.progress}>
          <View>
            <ThemedText style={styles.summaryNumber}>{totalCompleted}</ThemedText>
            <ThemedText type="small" style={styles.summaryLabel}>
              completed day{totalCompleted === 1 ? '' : 's'}
            </ThemedText>
          </View>
          <ThemedText style={styles.progressCopy}>
            {nextGoal
              ? `Next visible growth at ${nextGoal} completed days.`
              : 'The garden will keep filling in as you continue.'}
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: GardenColors.bg,
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    backgroundColor: GardenColors.bg,
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    alignSelf: 'center',
    maxWidth: MaxContentWidth,
    paddingBottom: BottomTabInset + 36,
    paddingHorizontal: 16,
    paddingTop: 88,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  kicker: {
    color: GardenColors.inkSoft,
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: GardenColors.ink,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 42,
    fontWeight: '400',
    lineHeight: 46,
    textAlign: 'center',
  },
  gardenBed: {
    borderColor: 'rgba(80,91,86,0.18)',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 690,
    overflow: 'hidden',
    position: 'relative',
    ...GardenShadow,
  },
  gardenSceneImage: {
    borderRadius: 8,
    resizeMode: 'cover',
  },
  sceneVeil: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sky: {
    backgroundColor: '#EFF0EB',
    height: '56%',
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sunDisc: {
    backgroundColor: 'rgba(255,248,231,0.9)',
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 34,
    borderWidth: 1,
    height: 68,
    position: 'absolute',
    right: '20%',
    top: '16%',
    width: 68,
    ...GardenSoftShadow,
  },
  mountain: {
    backgroundColor: 'rgba(168,176,174,0.24)',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    bottom: -18,
    position: 'absolute',
  },
  mountainOne: {
    height: '58%',
    right: '-8%',
    width: '38%',
  },
  mountainTwo: {
    height: '35%',
    left: '28%',
    width: '44%',
  },
  gardenStats: {
    backgroundColor: 'rgba(255,253,249,0.68)',
    borderColor: 'rgba(255,255,255,0.76)',
    borderRadius: 999,
    borderWidth: 1,
    left: 24,
    overflow: 'hidden',
    position: 'absolute',
    top: 98,
    zIndex: 5,
    ...GardenSoftShadow,
  },
  statCell: {
    alignItems: 'center',
    borderTopColor: 'rgba(46,42,34,0.08)',
    borderTopWidth: 1,
    minWidth: 66,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  statNumber: {
    color: GardenColors.mintDeep,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 22,
  },
  statLabel: {
    color: GardenColors.inkSoft,
  },
  fountain: {
    bottom: 151,
    height: 150,
    left: '50%',
    marginLeft: -75,
    position: 'absolute',
    width: 150,
    zIndex: 3,
  },
  fountainTop: {
    backgroundColor: '#D7D9D5',
    borderRadius: 24,
    height: 48,
    left: 51,
    position: 'absolute',
    top: 8,
    width: 48,
  },
  fountainStem: {
    backgroundColor: '#A89F8E',
    borderRadius: 14,
    bottom: 52,
    height: 88,
    left: 62,
    position: 'absolute',
    width: 27,
  },
  fountainBowl: {
    backgroundColor: 'rgba(89,138,135,0.6)',
    borderRadius: 62,
    bottom: 0,
    height: 76,
    left: 13,
    position: 'absolute',
    right: 13,
  },
  loadingGarden: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 6,
  },
  bedRow: {
    alignContent: 'flex-end',
    bottom: '12%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    left: '5%',
    position: 'absolute',
    right: '5%',
    top: '50%',
    zIndex: 5,
  },
  plantSlot: {
    alignItems: 'center',
    flexBasis: '15%',
    height: 116,
    justifyContent: 'flex-end',
    minWidth: 70,
    position: 'relative',
  },
  frontSlot: {
    transform: [{ translateY: -4 }],
  },
  smallSlot: {
    transform: [{ scale: 0.78 }],
  },
  largeSlot: {
    transform: [{ scale: 1.08 }],
  },
  shadow: {
    backgroundColor: 'rgba(58,44,33,0.16)',
    borderRadius: 50,
    bottom: 8,
    height: 13,
    position: 'absolute',
    width: '58%',
  },
  plantImage: {
    height: 112,
    resizeMode: 'contain',
    width: 112,
  },
  emptyGardenMessage: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,253,249,0.72)',
    borderColor: GardenColors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  emptyGardenText: {
    color: GardenColors.inkSoft,
    fontSize: 13,
  },
  progress: {
    alignItems: 'center',
    backgroundColor: GardenColors.glass,
    borderColor: GardenColors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 18,
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    ...GardenShadow,
  },
  summaryNumber: {
    color: GardenColors.ink,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 30,
    lineHeight: 32,
  },
  summaryLabel: {
    color: GardenColors.inkSoft,
  },
  progressCopy: {
    color: GardenColors.inkSoft,
    flex: 1,
    lineHeight: 22,
  },
});
