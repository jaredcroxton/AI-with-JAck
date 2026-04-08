-- PerformOS Row Level Security Policies
-- 08 April 2026

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_health_scores ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id AND deleted_at IS NULL);

-- Managers can read profiles of their team members
CREATE POLICY "profiles_select_team" ON profiles
  FOR SELECT USING (
    manager_id = auth.uid() AND deleted_at IS NULL
  );

-- Executives can read all profiles (non-deleted)
CREATE POLICY "profiles_select_executive" ON profiles
  FOR SELECT USING (
    get_my_role() = 'executive' AND deleted_at IS NULL
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- SESSIONS
-- ============================================

-- Managers can CRUD sessions they own (soft delete only)
CREATE POLICY "sessions_select_manager" ON sessions
  FOR SELECT USING (
    manager_id = auth.uid() AND deleted_at IS NULL
  );

CREATE POLICY "sessions_insert_manager" ON sessions
  FOR INSERT WITH CHECK (
    manager_id = auth.uid() AND get_my_role() = 'manager'
  );

CREATE POLICY "sessions_update_manager" ON sessions
  FOR UPDATE USING (manager_id = auth.uid())
  WITH CHECK (manager_id = auth.uid());

-- Team members can read sessions they are part of
CREATE POLICY "sessions_select_team_member" ON sessions
  FOR SELECT USING (
    team_member_id = auth.uid() AND deleted_at IS NULL
  );

-- Team members can update mood_rating on their sessions
CREATE POLICY "sessions_update_mood" ON sessions
  FOR UPDATE USING (team_member_id = auth.uid())
  WITH CHECK (team_member_id = auth.uid());

-- ============================================
-- REFLECTIONS
-- ============================================

-- Team members can CRUD their own reflections
CREATE POLICY "reflections_select_own" ON reflections
  FOR SELECT USING (
    team_member_id = auth.uid() AND deleted_at IS NULL
  );

CREATE POLICY "reflections_insert_own" ON reflections
  FOR INSERT WITH CHECK (
    team_member_id = auth.uid()
  );

CREATE POLICY "reflections_update_own" ON reflections
  FOR UPDATE USING (team_member_id = auth.uid())
  WITH CHECK (team_member_id = auth.uid());

-- Managers can read reflections for their sessions
CREATE POLICY "reflections_select_manager" ON reflections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = reflections.session_id
        AND sessions.manager_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- ============================================
-- ACTION ITEMS
-- ============================================

-- Users can see action items assigned to them
CREATE POLICY "action_items_select_assigned" ON action_items
  FOR SELECT USING (
    assigned_to = auth.uid() AND deleted_at IS NULL
  );

-- Users can see action items they created
CREATE POLICY "action_items_select_created" ON action_items
  FOR SELECT USING (
    created_by = auth.uid() AND deleted_at IS NULL
  );

-- Managers can create action items for their sessions
CREATE POLICY "action_items_insert_manager" ON action_items
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = action_items.session_id
        AND sessions.manager_id = auth.uid()
    )
  );

-- Assigned users can update their action items (status changes)
CREATE POLICY "action_items_update_assigned" ON action_items
  FOR UPDATE USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Creators can update their action items
CREATE POLICY "action_items_update_creator" ON action_items
  FOR UPDATE USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- ============================================
-- RISK FLAGS
-- ============================================

-- Managers can see risk flags for their team members
CREATE POLICY "risk_flags_select_manager" ON risk_flags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = risk_flags.team_member_id
        AND profiles.manager_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- Managers can resolve risk flags for their team
CREATE POLICY "risk_flags_update_manager" ON risk_flags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = risk_flags.team_member_id
        AND profiles.manager_id = auth.uid()
    )
  );

-- ============================================
-- TEAM HEALTH SCORES (Executive View)
-- ============================================

-- Executives can read all health scores (aggregated data only)
CREATE POLICY "health_scores_select_executive" ON team_health_scores
  FOR SELECT USING (
    get_my_role() = 'executive'
  );

-- Managers can see their own team health scores
CREATE POLICY "health_scores_select_manager" ON team_health_scores
  FOR SELECT USING (
    manager_id = auth.uid()
  );
