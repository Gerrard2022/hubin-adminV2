import { supabase } from '@/lib/supabase';

export interface FeaturedLocationData {
  Title: string;
  SubTitle: string;
  Image: string;
}

export async function fetchFeaturedLocations() {
  const { data, error } = await supabase
    .from('FeaturedLocations')
    .select('*')
    .order('CreatedAt', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createFeaturedLocation({ Title, SubTitle, Image }: FeaturedLocationData) {
  const { data, error } = await supabase
    .from('FeaturedLocations')
    .insert({ Title, SubTitle, Image })
    .select();
  if (error) throw error;
  return data ? data[0] : null;
}

export async function updateFeaturedLocation(id: number, { Title, SubTitle, Image }: FeaturedLocationData) {
  const { data, error } = await supabase
    .from('FeaturedLocations')
    .update({ Title, SubTitle, Image })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data ? data[0] : null;
}

export async function deleteFeaturedLocation(id: number) {
  const { error } = await supabase
    .from('FeaturedLocations')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}
