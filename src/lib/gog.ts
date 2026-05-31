import { supabase } from '@/lib/supabase';

export type Challenge = {
  id: number;
  text: string;
};

export type TodayState = {
  challenge: Challenge | null;
  completedToday: boolean | null;
  totalCompleted: number;
  emailNotificationsEnabled: boolean;
  recentTasks: TaskHistoryItem[];
};

export type TaskHistoryItem = {
  date: string;
  text: string;
  completed: boolean | null;
};

export type GardenSlot = {
  stage: number;
  family: 'a' | 'b';
  tone: string;
  size: 'small' | 'medium' | 'large';
  row: 'front' | 'back';
};

type RecentTaskRow = {
  date: string;
  challenges: { text: string } | { text: string }[] | null;
};

type CompletedTaskRow = {
  date: string;
  completed: boolean;
};

const gardenPlots = [
  { start: 1, delay: 1, pace: 2, tone: 'fern', size: 'medium', family: 'a' },
  { start: 1, delay: 2, pace: 2, tone: 'sage', size: 'small', family: 'a' },
  { start: 2, delay: 3, pace: 2, tone: 'rose', size: 'large', family: 'b' },
  { start: 1, delay: 4, pace: 2, tone: 'moss', size: 'medium', family: 'a' },
  { start: 1, delay: 5, pace: 2, tone: 'gold', size: 'small', family: 'b' },
  { start: 1, delay: 7, pace: 2, tone: 'clover', size: 'medium', family: 'a' },
  { start: 1, delay: 9, pace: 2, tone: 'berry', size: 'small', family: 'b' },
  { start: 2, delay: 12, pace: 3, tone: 'fern', size: 'large', family: 'a' },
  { start: 1, delay: 16, pace: 3, tone: 'sage', size: 'medium', family: 'b' },
  { start: 1, delay: 22, pace: 3, tone: 'rose', size: 'small', family: 'b' },
  { start: 1, delay: 30, pace: 4, tone: 'gold', size: 'medium', family: 'a' },
  { start: 1, delay: 45, pace: 4, tone: 'clover', size: 'small', family: 'b' },
] as const;
const growthGoals = [2, 4, 6, 8, 10, 14, 20, 30, 45, 60];

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateLabel(dateKey: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00`));
}

export function getGardenState(totalCompleted: number): GardenSlot[] {
  return gardenPlots.flatMap((plot, index) => {
    if (totalCompleted < plot.delay) {
      return [];
    }

    const earnedDays = Math.max(0, totalCompleted - plot.delay);
    const stage = Math.min(plot.start + Math.floor(earnedDays / plot.pace), 10);
    return {
      stage,
      family: plot.family,
      tone: plot.tone,
      size: plot.size,
      row: index >= 8 ? 'front' : 'back',
    };
  });
}

export function getNextGrowthGoal(totalCompleted: number) {
  return growthGoals.find((goal) => totalCompleted < goal) ?? null;
}

async function getOrCreateProfile(userId: string, email: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id, email, email_notifications_enabled, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (data) {
    return data;
  }

  const { data: created, error } = await supabase
    .from('profiles')
    .insert({ id: userId, email })
    .select('id, email, email_notifications_enabled, created_at')
    .single();

  if (error) {
    throw error;
  }

  return created;
}

async function getOrAssignChallenge(userId: string, date: string) {
  const existing = await supabase
    .from('daily_assignments')
    .select('challenge_id, challenges(id, text)')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }
  if (existing.data?.challenges) {
    const challenge = Array.isArray(existing.data.challenges)
      ? existing.data.challenges[0]
      : existing.data.challenges;
    return challenge;
  }

  const { data: candidates, error: candidatesError } = await supabase
    .from('challenges')
    .select('id, text')
    .eq('active', true);

  if (candidatesError) {
    throw candidatesError;
  }
  if (!candidates.length) {
    return null;
  }

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  const inserted = await supabase
    .from('daily_assignments')
    .insert({ user_id: userId, date, challenge_id: chosen.id });

  if (inserted.error && inserted.error.code !== '23505') {
    throw inserted.error;
  }

  if (inserted.error?.code === '23505') {
    return getOrAssignChallenge(userId, date);
  }

  return chosen;
}

export async function getTodayState(userId: string, email: string): Promise<TodayState> {
  const date = todayKey();
  const profile = await getOrCreateProfile(userId, email);
  const challenge = await getOrAssignChallenge(userId, date);

  const [{ data: checkin, error: checkinError }, { count, error: countError }, recent] =
    await Promise.all([
      supabase
        .from('checkins')
        .select('completed')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle(),
      supabase
        .from('checkins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true),
      getRecentTasks(userId),
    ]);

  if (checkinError) {
    throw checkinError;
  }
  if (countError) {
    throw countError;
  }

  return {
    challenge,
    completedToday: checkin?.completed ?? null,
    totalCompleted: count ?? 0,
    emailNotificationsEnabled: profile.email_notifications_enabled,
    recentTasks: recent,
  };
}

export async function getRecentTasks(userId: string, limit = 5): Promise<TaskHistoryItem[]> {
  const { data, error } = await supabase
    .from('daily_assignments')
    .select('date, challenges(text)')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  const rows = data as unknown as RecentTaskRow[];
  const dates = rows.map((row) => row.date);
  const { data: checkins, error: checkinsError } = dates.length
    ? await supabase
        .from('checkins')
        .select('date, completed')
        .eq('user_id', userId)
        .in('date', dates)
    : { data: [], error: null };

  if (checkinsError) {
    throw checkinsError;
  }

  const checkinsByDate = new Map(checkins.map((checkin) => [checkin.date, checkin.completed]));

  return rows.map((row) => {
    const challenge = Array.isArray(row.challenges) ? row.challenges[0] : row.challenges;
    return {
      date: row.date,
      text: challenge?.text ?? 'Kindness task',
      completed: checkinsByDate.get(row.date) ?? null,
    };
  });
}

export async function getCompletedTasks(userId: string): Promise<TaskHistoryItem[]> {
  const { data, error } = await supabase
    .from('checkins')
    .select('date, completed')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = data as unknown as CompletedTaskRow[];
  const dates = rows.map((row) => row.date);
  const { data: assignments, error: assignmentsError } = dates.length
    ? await supabase
        .from('daily_assignments')
        .select('date, challenges(text)')
        .eq('user_id', userId)
        .in('date', dates)
    : { data: [], error: null };

  if (assignmentsError) {
    throw assignmentsError;
  }

  const assignmentRows = assignments as unknown as RecentTaskRow[];
  const textByDate = new Map(
    assignmentRows.map((assignment) => {
      const challenge = Array.isArray(assignment.challenges)
        ? assignment.challenges[0]
        : assignment.challenges;
      return [assignment.date, challenge?.text ?? 'Kindness task'];
    })
  );

  return rows.map((row) => {
    return {
      date: row.date,
      text: textByDate.get(row.date) ?? 'Kindness task',
      completed: row.completed,
    };
  });
}

export async function saveCheckin(userId: string, completed: boolean) {
  const { error } = await supabase
    .from('checkins')
    .upsert(
      { user_id: userId, date: todayKey(), completed },
      { onConflict: 'user_id,date' }
    );

  if (error) {
    throw error;
  }
}

export async function setEmailNotificationsEnabled(userId: string, enabled: boolean) {
  const { error } = await supabase
    .from('profiles')
    .update({ email_notifications_enabled: enabled })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}
