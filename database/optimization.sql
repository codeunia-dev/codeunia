-- Database Optimization Script for Codeunia
-- This script adds indexes and optimizations to improve query performance

-- 1. Add indexes for hackathons table
CREATE INDEX IF NOT EXISTS idx_hackathons_featured_date ON hackathons(featured, date);
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON hackathons(status);
CREATE INDEX IF NOT EXISTS idx_hackathons_category ON hackathons(category);
CREATE INDEX IF NOT EXISTS idx_hackathons_slug ON hackathons(slug);
CREATE INDEX IF NOT EXISTS idx_hackathons_date ON hackathons(date);

-- 2. Add indexes for tests table
CREATE INDEX IF NOT EXISTS idx_tests_public_active ON tests(is_public, is_active);
CREATE INDEX IF NOT EXISTS idx_tests_created_at ON tests(created_at);
CREATE INDEX IF NOT EXISTS idx_tests_status ON tests(status);

-- 3. Add indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_codeunia_id ON profiles(codeunia_id);
CREATE INDEX IF NOT EXISTS idx_profiles_setup_completed ON profiles(setup_completed_at);

-- 4. Add indexes for user_points table
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_points ON user_points(points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_updated_at ON user_points(updated_at);

-- 5. Add indexes for test_attempts table
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_created_at ON test_attempts(created_at);

-- 6. Add indexes for test_registrations table
CREATE INDEX IF NOT EXISTS idx_test_registrations_user_id ON test_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_test_registrations_test_id ON test_registrations(test_id);

-- 7. Add indexes for leaderboard_view (if it's a materialized view)
-- Note: This depends on your leaderboard implementation

-- 8. Add indexes for pending_payments table
CREATE INDEX IF NOT EXISTS idx_pending_payments_user_id ON pending_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON pending_payments(status);
CREATE INDEX IF NOT EXISTS idx_pending_payments_created_at ON pending_payments(created_at);

-- 9. Add indexes for certificates table
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_test_id ON certificates(test_id);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at);

-- 10. Add indexes for blog_posts table (if exists)
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

-- 11. Add indexes for events table (if exists)
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- 12. Add indexes for forms submissions (if exists)
CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON form_submissions(type);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at);

-- 13. Add indexes for admin tables
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- 14. Add indexes for audit logs (if exists)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 15. Add indexes for notifications (if exists)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 16. Add indexes for user_activity (if exists)
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);

-- 17. Add indexes for rounds table (if exists)
CREATE INDEX IF NOT EXISTS idx_rounds_hackathon_id ON rounds(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_rounds_status ON rounds(status);
CREATE INDEX IF NOT EXISTS idx_rounds_date ON rounds(date);

-- 18. Add indexes for round_registrations table (if exists)
CREATE INDEX IF NOT EXISTS idx_round_registrations_user_id ON round_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_round_registrations_round_id ON round_registrations(round_id);

-- 19. Add indexes for payments table (if exists)
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- 20. Add indexes for subscriptions table (if exists)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

-- 21. Add indexes for user_sessions table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- 22. Add indexes for user_preferences table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- 23. Add indexes for user_achievements table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_type ON user_achievements(achievement_type);

-- 24. Add indexes for user_badges table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_type ON user_badges(badge_type);

-- 25. Add indexes for user_skills table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_name ON user_skills(skill_name);

-- 26. Add indexes for user_projects table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_status ON user_projects(status);

-- 27. Add indexes for user_connections table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_connection_id ON user_connections(connection_id);

-- 28. Add indexes for user_messages table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_messages_sender_id ON user_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_receiver_id ON user_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON user_messages(created_at);

-- 29. Add indexes for user_notifications table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(read);

-- 30. Add indexes for user_settings table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- 31. Add indexes for user_verification table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_verification_user_id ON user_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verification_status ON user_verification(status);

-- 32. Add indexes for user_reports table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_id ON user_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);

-- 33. Add indexes for user_feedback table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(type);

-- 34. Add indexes for user_support table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_support_user_id ON user_support(user_id);
CREATE INDEX IF NOT EXISTS idx_user_support_status ON user_support(status);

-- 35. Add indexes for user_analytics table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);

-- 36. Add indexes for user_metrics table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_metrics_metric_type ON user_metrics(metric_type);

-- 37. Add indexes for user_goals table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(status);

-- 38. Add indexes for user_progress table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_goal_id ON user_progress(goal_id);

-- 39. Add indexes for user_mentorship table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_mentorship_mentor_id ON user_mentorship(mentor_id);
CREATE INDEX IF NOT EXISTS idx_user_mentorship_mentee_id ON user_mentorship(mentee_id);
CREATE INDEX IF NOT EXISTS idx_user_mentorship_status ON user_mentorship(status);

-- 40. Add indexes for user_collaboration table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_collaboration_user_id ON user_collaboration(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collaboration_project_id ON user_collaboration(project_id);

-- 41. Add indexes for user_competitions table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_competitions_user_id ON user_competitions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_competitions_competition_id ON user_competitions(competition_id);

-- 42. Add indexes for user_challenges table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge_id ON user_challenges(challenge_id);

-- 43. Add indexes for user_workshops table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_workshops_user_id ON user_workshops(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workshops_workshop_id ON user_workshops(workshop_id);

-- 44. Add indexes for user_webinars table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_webinars_user_id ON user_webinars(user_id);
CREATE INDEX IF NOT EXISTS idx_user_webinars_webinar_id ON user_webinars(webinar_id);

-- 45. Add indexes for user_courses table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_course_id ON user_courses(course_id);

-- 46. Add indexes for user_assignments table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_assignments_user_id ON user_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assignments_assignment_id ON user_assignments(assignment_id);

-- 47. Add indexes for user_grades table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_grades_user_id ON user_grades(user_id);
CREATE INDEX IF NOT EXISTS idx_user_grades_assignment_id ON user_grades(assignment_id);

-- 48. Add indexes for user_attendance table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_attendance_user_id ON user_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_attendance_event_id ON user_attendance(event_id);

-- 49. Add indexes for user_participation table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_participation_user_id ON user_participation(user_id);
CREATE INDEX IF NOT EXISTS idx_user_participation_event_id ON user_participation(event_id);

-- 50. Add indexes for user_contributions table (if exists)
CREATE INDEX IF NOT EXISTS idx_user_contributions_user_id ON user_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contributions_project_id ON user_contributions(project_id);

-- Show optimization results
SELECT 'Database optimization completed successfully' as status; 