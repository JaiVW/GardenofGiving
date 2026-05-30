import { supabase } from '@/lib/supabase';

export type GardenNote = {
  id: number;
  body: string;
  createdAt: string;
};

function mapGardenNote(row: { id: number; body: string; created_at: string }): GardenNote {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function listGardenNotes() {
  const { data, error } = await supabase
    .from('garden_notes')
    .select('id, body, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    throw error;
  }

  return data.map(mapGardenNote);
}

export async function createGardenNote(body: string) {
  const { data, error } = await supabase
    .from('garden_notes')
    .insert({ body })
    .select('id, body, created_at')
    .single();

  if (error) {
    throw error;
  }

  return mapGardenNote(data);
}
