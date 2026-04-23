import { supabase } from './supabaseClient';

/**
 * portfolioService.js
 * 
 * Handles all CRUD operations with the Supabase 'user_projects' table.
 */

export const saveProject = async (projectData) => {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_projects')
    .insert({
      user_id: user.id,
      name: projectData.name,
      type: projectData.type,
      stack: projectData.stack,
      github_url: projectData.githubUrl,
      key_features: projectData.keyFeatures,
      challenges_solved: projectData.challengesSolved
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchProjects = async () => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('user_projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const deleteProject = async (id) => {
  if (!supabase) return;

  const { error } = await supabase
    .from('user_projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
