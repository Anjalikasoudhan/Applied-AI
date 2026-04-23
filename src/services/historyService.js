import { supabase } from './supabaseClient';

/**
 * historyService.js
 * 
 * Handles all CRUD operations with the Supabase 'job_analyses' table.
 * Each function is a clean async utility — no React dependencies.
 */

// Save a completed analysis to the database
export const saveAnalysis = async (analysisData) => {
  if (!supabase) {
    console.warn("Supabase not configured. Skipping save.");
    return null;
  }

  // Get current user id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn("User not logged in. Analysis will not be saved to history.");
    return null;
  }

  const { data, error } = await supabase
    .from('job_analyses')
    .insert({
      user_id: user.id,
      company_name: analysisData.companyName || 'Unknown',
      role_title: analysisData.roleTitle || 'Untitled Role',
      summary: analysisData.summary || '',
      match_score: analysisData.matchScore || 0,
      analysis_data: analysisData  // Store the ENTIRE JSON blob
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    throw error;
  }

  return data;
};

// Fetch all past analyses, newest first
export const fetchHistory = async () => {
  if (!supabase) {
    console.warn("Supabase not configured. Returning empty history.");
    return [];
  }

  const { data, error } = await supabase
    .from('job_analyses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    throw error;
  }

  return data || [];
};

// Delete a single analysis by its UUID
export const deleteAnalysis = async (id) => {
  if (!supabase) return;

  const { error } = await supabase
    .from('job_analyses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Supabase delete error:", error);
    throw error;
  }
};
