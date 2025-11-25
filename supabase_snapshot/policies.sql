 CREATE POLICY cron_job_policy ON cron.job AS PERMISSIVE FOR ALL TO PUBLIC USING ((username = CURRENT_USER));
 CREATE POLICY cron_job_run_details_policy ON cron.job_run_details AS PERMISSIVE FOR ALL TO PUBLIC USING ((username = CURRENT_USER));
 CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((EXISTS ( SELECT 1                                                                                                                             +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Admins can read audit logs" ON public.admin_audit_logs AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                    +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Audit logs are immutable" ON public.admin_audit_logs AS PERMISSIVE FOR UPDATE TO PUBLIC USING (false);
 CREATE POLICY "Audit logs cannot be deleted" ON public.admin_audit_logs AS PERMISSIVE FOR DELETE TO PUBLIC USING (false);
 CREATE POLICY "Allow public insert for AI training data" ON public.ai_training_data AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
 CREATE POLICY "Service role can read all AI training data" ON public.ai_training_data AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
 CREATE POLICY "Users can read their own AI training data" ON public.ai_training_data AS PERMISSIVE FOR SELECT TO PUBLIC USING (((auth.uid() = user_id) OR (user_id IS NULL)));
 CREATE POLICY "Public can view likes" ON public.blog_likes AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
 CREATE POLICY "Users can like posts" ON public.blog_likes AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() = user_id));
 CREATE POLICY "Users can unlike posts" ON public.blog_likes AS PERMISSIVE FOR DELETE TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY "Allow delete for admin" ON public.blogs AS PERMISSIVE FOR DELETE TO PUBLIC USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
 CREATE POLICY "Allow insert for admin" ON public.blogs AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (((auth.jwt() ->> 'role'::text) = 'admin'::text));
 CREATE POLICY "Allow select for all" ON public.blogs AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
 CREATE POLICY "Allow update for admin" ON public.blogs AS PERMISSIVE FOR UPDATE TO PUBLIC USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
 CREATE POLICY blogs ON public.blogs AS PERMISSIVE FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
 CREATE POLICY "Templates are manageable by admins" ON public.certificate_templates AS PERMISSIVE FOR ALL TO PUBLIC USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
 CREATE POLICY "Templates are viewable by admins" ON public.certificate_templates AS PERMISSIVE FOR SELECT TO PUBLIC USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
 CREATE POLICY "Admins can manage all certificates" ON public.certificates AS PERMISSIVE FOR ALL TO PUBLIC USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
 CREATE POLICY "Certificates are publicly viewable by cert_id" ON public.certificates AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
 CREATE POLICY "Users can view their own certificates" ON public.certificates AS PERMISSIVE FOR SELECT TO PUBLIC USING ((user_id = auth.uid()));
 CREATE POLICY collaboration ON public.collaboration_applications AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
 CREATE POLICY "Anyone can view verified active companies" ON public.companies AS PERMISSIVE FOR SELECT TO PUBLIC USING (((verification_status = 'verified'::text) AND (status = 'active'::text)));
 CREATE POLICY "Authenticated users can create companies" ON public.companies AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
 CREATE POLICY "Company members can view own company" ON public.companies AS PERMISSIVE FOR SELECT TO PUBLIC USING (user_is_company_member(auth.uid(), id));
 CREATE POLICY "Company owners can update" ON public.companies AS PERMISSIVE FOR UPDATE TO PUBLIC USING (user_has_company_role(auth.uid(), id, ARRAY['owner'::text]));
 CREATE POLICY "Service role full access" ON public.companies AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);
 CREATE POLICY "Admins can view all analytics" ON public.company_analytics AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Members can view company analytics" ON public.company_analytics AS PERMISSIVE FOR SELECT TO PUBLIC USING ((company_id IN ( SELECT company_members.company_id                                                                                           +
    FROM company_members                                                                                                                                                                                                                                               +
   WHERE ((company_members.user_id = auth.uid()) AND (company_members.status = 'active'::text)))));
 CREATE POLICY "Service role can insert analytics" ON public.company_analytics AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
 CREATE POLICY "Service role can update analytics" ON public.company_analytics AS PERMISSIVE FOR UPDATE TO PUBLIC USING (true);
 CREATE POLICY "Members can view company members" ON public.company_members AS PERMISSIVE FOR SELECT TO PUBLIC USING (user_is_company_member(auth.uid(), company_id));
 CREATE POLICY "Owners and admins can add members" ON public.company_members AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (user_has_company_role(auth.uid(), company_id, ARRAY['owner'::text, 'admin'::text]));
 CREATE POLICY "Owners and admins can delete members" ON public.company_members AS PERMISSIVE FOR DELETE TO PUBLIC USING (user_has_company_role(auth.uid(), company_id, ARRAY['owner'::text, 'admin'::text]));
 CREATE POLICY "Owners and admins can update members" ON public.company_members AS PERMISSIVE FOR UPDATE TO PUBLIC USING (user_has_company_role(auth.uid(), company_id, ARRAY['owner'::text, 'admin'::text]));
 CREATE POLICY "Service role full access members" ON public.company_members AS PERMISSIVE FOR ALL TO PUBLIC USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));
 CREATE POLICY "Users can create own membership" ON public.company_members AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((user_id = auth.uid()));
 CREATE POLICY "Users can view own memberships" ON public.company_members AS PERMISSIVE FOR SELECT TO PUBLIC USING ((user_id = auth.uid()));
 CREATE POLICY contact ON public.contact_submissions AS PERMISSIVE FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
 CREATE POLICY "Users can add participants" ON public.conversation_participants AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
 CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants AS PERMISSIVE FOR SELECT TO authenticated USING ((conversation_id IN ( SELECT cp.conversation_id                                                               +
    FROM conversation_participants cp                                                                                                                                                                                                                                  +
   WHERE (cp.user_id = auth.uid()))));
 CREATE POLICY "Users can create conversations" ON public.conversations AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
 CREATE POLICY "Users can update their conversations" ON public.conversations AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1                                                                                                                      +
    FROM conversation_participants                                                                                                                                                                                                                                     +
   WHERE ((conversation_participants.conversation_id = conversations.id) AND (conversation_participants.user_id = auth.uid())))));
 CREATE POLICY "Users can view their conversations" ON public.conversations AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1                                                                                                                        +
    FROM conversation_participants                                                                                                                                                                                                                                     +
   WHERE ((conversation_participants.conversation_id = conversations.id) AND (conversation_participants.user_id = auth.uid())))));
 CREATE POLICY "System can insert audit logs" ON public.event_audit_log AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
 CREATE POLICY "Users can view audit logs for their companies" ON public.event_audit_log AS PERMISSIVE FOR SELECT TO PUBLIC USING ((company_id IN ( SELECT company_members.company_id                                                                                  +
    FROM company_members                                                                                                                                                                                                                                               +
   WHERE ((company_members.user_id = auth.uid()) AND (company_members.status = 'active'::text)))));
 CREATE POLICY "Admins can insert moderation logs" ON public.event_moderation_log AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((EXISTS ( SELECT 1                                                                                                                    +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Admins can view all moderation logs" ON public.event_moderation_log AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                       +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Members can view company moderation log" ON public.event_moderation_log AS PERMISSIVE FOR SELECT TO PUBLIC USING ((company_id IN ( SELECT company_members.company_id                                                                                   +
    FROM company_members                                                                                                                                                                                                                                               +
   WHERE ((company_members.user_id = auth.uid()) AND (company_members.status = 'active'::text)))));
 CREATE POLICY "Service role can insert moderation logs" ON public.event_moderation_log AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
 CREATE POLICY "Admins can view all registrations" ON public.event_registrations AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                             +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Users can insert their own registrations" ON public.event_registrations AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() = user_id));
 CREATE POLICY "Users can update their own registrations" ON public.event_registrations AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY "Users can view their own registrations" ON public.event_registrations AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY "Admins can delete any event" ON public.events AS PERMISSIVE FOR DELETE TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                             +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Admins can update any event" ON public.events AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                             +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Admins can view all events" ON public.events AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                              +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Allow insert for admins" ON public.events AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((EXISTS ( SELECT 1                                                                                                                                            +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Allow public read access to events" ON public.events AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
 CREATE POLICY "Anyone can view approved events" ON public.events AS PERMISSIVE FOR SELECT TO PUBLIC USING ((approval_status = 'approved'::text));
 CREATE POLICY "Company editors can create events" ON public.events AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((company_id IN ( SELECT company_members.company_id                                                                                                  +
    FROM company_members                                                                                                                                                                                                                                               +
   WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text])) AND (company_members.status = 'active'::text)))));
 CREATE POLICY "Company editors can delete events" ON public.events AS PERMISSIVE FOR DELETE TO PUBLIC USING ((company_id IN ( SELECT company_members.company_id                                                                                                       +
    FROM company_members                                                                                                                                                                                                                                               +
   WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text]))))));
 CREATE POLICY "Company editors can update events" ON public.events AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((company_id IN ( SELECT company_members.company_id                                                                                                       +
    FROM company_members                                                                                                                                                                                                                                               +
   WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text])) AND (company_members.status = 'active'::text)))));
 CREATE POLICY "Company members can view own events" ON public.events AS PERMISSIVE FOR SELECT TO PUBLIC USING ((company_id IN ( SELECT company_members.company_id                                                                                                     +
    FROM company_members                                                                                                                                                                                                                                               +
   WHERE ((company_members.user_id = auth.uid()) AND (company_members.status = 'active'::text)))));
 CREATE POLICY "Users can delete their own hackathon registrations" ON public.hackathon_registrations AS PERMISSIVE FOR DELETE TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY "Users can insert their own hackathon registrations" ON public.hackathon_registrations AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() = user_id));
 CREATE POLICY "Users can update their own hackathon registrations" ON public.hackathon_registrations AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY "Users can view their own hackathon registrations" ON public.hackathon_registrations AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY "Admins can update any hackathon" ON public.hackathons AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                     +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Admins can view all hackathons" ON public.hackathons AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                      +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Allow admin write access" ON public.hackathons AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                               +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Allow public read access" ON public.hackathons AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
 CREATE POLICY "Anyone can view approved hackathons" ON public.hackathons AS PERMISSIVE FOR SELECT TO PUBLIC USING ((approval_status = 'approved'::text));
 CREATE POLICY "Company editors can create hackathons" ON public.hackathons AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((company_id IN ( SELECT company_members.company_id                                                                                          +
    FROM company_members                                                                                                                                                                                                                                               +
   WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text])) AND (company_members.status = 'active'::text)))));
 CREATE POLICY "Company editors can update hackathons" ON public.hackathons AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((company_id IN ( SELECT company_members.company_id                                                                                               +
    FROM company_members                                                                                                                                                                                                                                               +
   WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text])) AND (company_members.status = 'active'::text)))));
 CREATE POLICY "Company members can delete their company hackathons" ON public.hackathons AS PERMISSIVE FOR DELETE TO authenticated USING (((EXISTS ( SELECT 1                                                                                                         +
    FROM company_members                                                                                                                                                                                                                                               +
   WHERE ((company_members.company_id = hackathons.company_id) AND (company_members.user_id = auth.uid()) AND (company_members.status = 'active'::text) AND (company_members.role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text]))))) OR (EXISTS ( SELECT 1+
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))))));
 CREATE POLICY "Company members can view own hackathons" ON public.hackathons AS PERMISSIVE FOR SELECT TO PUBLIC USING ((company_id IN ( SELECT company_members.company_id                                                                                             +
    FROM company_members                                                                                                                                                                                                                                               +
   WHERE ((company_members.user_id = auth.uid()) AND (company_members.status = 'active'::text)))));
 CREATE POLICY admins_can_manage_interns ON public.interns AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                                   +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY read_own_intern_row ON public.interns AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.email() = email));
 CREATE POLICY user_insert_own_app ON public.internship_applications AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
 CREATE POLICY user_select_own_app ON public.internship_applications AS PERMISSIVE FOR SELECT TO authenticated USING ((auth.uid() = user_id));
 CREATE POLICY judges_applications ON public.judges_applications AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
 CREATE POLICY system_can_manage_keep_alive ON public.keep_alive AS PERMISSIVE FOR ALL TO PUBLIC USING (true);
 CREATE POLICY "Admins can view all master registrations" ON public.master_registrations AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                     +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Users can insert their own master registrations" ON public.master_registrations AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() = user_id));
 CREATE POLICY "Users can view their own master registrations" ON public.master_registrations AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY mentor ON public.mentor_applications AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
 CREATE POLICY admins_can_manage_mentorship ON public.mentorship AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                             +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY authenticated_users_can_apply_mentorship ON public.mentorship AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() IS NOT NULL));
 CREATE POLICY users_can_view_mentorship ON public.mentorship AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
 CREATE POLICY "Users can delete their own messages" ON public.messages AS PERMISSIVE FOR DELETE TO authenticated USING ((sender_id = auth.uid()));
 CREATE POLICY "Users can send messages to their conversations" ON public.messages AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((sender_id = auth.uid()) AND (conversation_id IN ( SELECT cp.conversation_id                                                 +
    FROM conversation_participants cp                                                                                                                                                                                                                                  +
   WHERE (cp.user_id = auth.uid())))));
 CREATE POLICY "Users can update their own messages" ON public.messages AS PERMISSIVE FOR UPDATE TO authenticated USING ((sender_id = auth.uid()));
 CREATE POLICY "Users can view messages in their conversations" ON public.messages AS PERMISSIVE FOR SELECT TO authenticated USING ((conversation_id IN ( SELECT cp.conversation_id                                                                                    +
    FROM conversation_participants cp                                                                                                                                                                                                                                  +
   WHERE (cp.user_id = auth.uid()))));
 CREATE POLICY "Allow authenticated users to view subscribers" ON public.newsletter_subscriptions AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.role() = 'authenticated'::text));
 CREATE POLICY "Allow public subscription" ON public.newsletter_subscriptions AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
 CREATE POLICY "Allow service role to read all" ON public.newsletter_subscriptions AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
 CREATE POLICY "Allow unsubscribe with token" ON public.newsletter_subscriptions AS PERMISSIVE FOR UPDATE TO PUBLIC USING (true);
 CREATE POLICY "Admins can view all notifications" ON public.notifications AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Service role can insert notifications" ON public.notifications AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
 CREATE POLICY "Users can update own notifications" ON public.notifications AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((user_id = auth.uid()));
 CREATE POLICY "Users can view own notifications" ON public.notifications AS PERMISSIVE FOR SELECT TO PUBLIC USING ((user_id = auth.uid()));
 CREATE POLICY system_can_manage_order_items ON public.order_items AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                           +
    FROM auth.users                                                                                                                                                                                                                                                    +
   WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'service_role'::text)))));
 CREATE POLICY users_can_view_own_order_items ON public.order_items AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                       +
    FROM orders                                                                                                                                                                                                                                                        +
   WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));
 CREATE POLICY system_can_manage_orders ON public.orders AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                                     +
    FROM auth.users                                                                                                                                                                                                                                                    +
   WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'service_role'::text)))));
 CREATE POLICY users_can_create_orders ON public.orders AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((user_id = auth.uid()));
 CREATE POLICY users_can_update_own_orders ON public.orders AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((user_id = auth.uid()));
 CREATE POLICY users_can_view_own_orders ON public.orders AS PERMISSIVE FOR SELECT TO PUBLIC USING ((user_id = auth.uid()));
 CREATE POLICY "Admins can manage organizations" ON public.organizations AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                     +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Users can view active organizations" ON public.organizations AS PERMISSIVE FOR SELECT TO PUBLIC USING ((is_active = true));
 CREATE POLICY "Service role full access payments" ON public.payments AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.role() = 'service_role'::text));
 CREATE POLICY "Users can view own payments" ON public.payments AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.uid() IN ( SELECT pending_payments.user_id                                                                                                             +
    FROM pending_payments                                                                                                                                                                                                                                              +
   WHERE ((payments.razorpay_order_id)::text = (payments.razorpay_order_id)::text))));
 CREATE POLICY "Service role full access pending payments" ON public.pending_payments AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.role() = 'service_role'::text));
 CREATE POLICY "Users can insert own pending payments" ON public.pending_payments AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() = user_id));
 CREATE POLICY "Users can update own pending payments" ON public.pending_payments AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY "Users can view own pending payments" ON public.pending_payments AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY users_can_view_own_pending_payments ON public.pending_payments AS PERMISSIVE FOR SELECT TO PUBLIC USING ((user_id = auth.uid()));
 CREATE POLICY admins_can_manage_products ON public.products AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                                 +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY public_can_view_products ON public.products AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
 CREATE POLICY "Public profiles are viewable by all" ON public.profiles AS PERMISSIVE FOR SELECT TO PUBLIC USING ((is_public = true));
 CREATE POLICY "Users can insert own profile" ON public.profiles AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() = id));
 CREATE POLICY "Users can insert their own profile" ON public.profiles AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() = id));
 CREATE POLICY "Users can update own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((auth.uid() = id));
 CREATE POLICY "Users can update their own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((auth.uid() = id));
 CREATE POLICY "Users can view own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.uid() = id));
 CREATE POLICY "Users can view public profiles" ON public.profiles AS PERMISSIVE FOR SELECT TO PUBLIC USING ((is_public = true));
 CREATE POLICY "Users can view their own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.uid() = id));
 CREATE POLICY admins_can_manage_projects ON public.projects AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                                 +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY public_can_view_projects ON public.projects AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
 CREATE POLICY "Admins can manage reserved usernames" ON public.reserved_usernames AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                           +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Anyone can read active reserved usernames" ON public.reserved_usernames AS PERMISSIVE FOR SELECT TO PUBLIC USING ((is_active = true));
 CREATE POLICY "Users can create own resumes" ON public.resumes AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() = user_id));
 CREATE POLICY "Users can delete own resumes" ON public.resumes AS PERMISSIVE FOR DELETE TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY "Users can update own resumes" ON public.resumes AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY "Users can view own resumes" ON public.resumes AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY role ON public.roles AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
 CREATE POLICY system_can_manage_round_registrations ON public.round_registrations AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                           +
    FROM auth.users                                                                                                                                                                                                                                                    +
   WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'service_role'::text)))));
 CREATE POLICY users_can_create_round_registrations ON public.round_registrations AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((user_id = auth.uid()));
 CREATE POLICY users_can_view_own_round_registrations ON public.round_registrations AS PERMISSIVE FOR SELECT TO PUBLIC USING ((user_id = auth.uid()));
 CREATE POLICY sponsorship ON public.sponsorship_applications AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
 CREATE POLICY "Admins can create replies on any ticket" ON public.support_ticket_replies AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (((admin_id = auth.uid()) AND (EXISTS ( SELECT 1                                                                               +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))))));
 CREATE POLICY "Admins can insert replies" ON public.support_ticket_replies AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1                                                                                                                   +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Admins can view all replies" ON public.support_ticket_replies AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                             +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Users can create replies on their tickets" ON public.support_ticket_replies AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1                                                                              +
    FROM support_tickets                                                                                                                                                                                                                                               +
   WHERE ((support_tickets.id = support_ticket_replies.ticket_id) AND (support_tickets.user_id = auth.uid()))))));
 CREATE POLICY "Users can view replies on their tickets" ON public.support_ticket_replies AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                 +
    FROM support_tickets                                                                                                                                                                                                                                               +
   WHERE ((support_tickets.id = support_ticket_replies.ticket_id) AND (support_tickets.user_id = auth.uid())))));
 CREATE POLICY "Users can view replies to their tickets" ON public.support_ticket_replies AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1                                                                                                          +
    FROM support_tickets                                                                                                                                                                                                                                               +
   WHERE ((support_tickets.id = support_ticket_replies.ticket_id) AND (support_tickets.user_id = auth.uid())))));
 CREATE POLICY "Admins can update all support tickets" ON public.support_tickets AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1                                                                                                                   +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Admins can update all tickets" ON public.support_tickets AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                  +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Admins can view all support tickets" ON public.support_tickets AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1                                                                                                                     +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Admins can view all tickets" ON public.support_tickets AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                    +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY "Users can create their own support tickets" ON public.support_tickets AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
 CREATE POLICY "Users can create their own tickets" ON public.support_tickets AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() = user_id));
 CREATE POLICY "Users can view their own support tickets" ON public.support_tickets AS PERMISSIVE FOR SELECT TO authenticated USING ((auth.uid() = user_id));
 CREATE POLICY "Users can view their own tickets" ON public.support_tickets AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY "Admins can manage all answers" ON public.test_answers AS PERMISSIVE FOR ALL TO PUBLIC USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
 CREATE POLICY "Users can submit their own answers" ON public.test_answers AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((EXISTS ( SELECT 1                                                                                                                           +
    FROM test_attempts ta                                                                                                                                                                                                                                              +
   WHERE ((ta.id = test_answers.attempt_id) AND (ta.user_id = auth.uid()) AND (ta.status = 'in_progress'::text)))));
 CREATE POLICY "Users can update their own answers" ON public.test_answers AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                +
    FROM test_attempts ta                                                                                                                                                                                                                                              +
   WHERE ((ta.id = test_answers.attempt_id) AND (ta.user_id = auth.uid()) AND (ta.status = 'in_progress'::text)))));
 CREATE POLICY "Users can view their own answers" ON public.test_answers AS PERMISSIVE FOR SELECT TO PUBLIC USING (((EXISTS ( SELECT 1                                                                                                                                 +
    FROM test_attempts ta                                                                                                                                                                                                                                              +
   WHERE ((ta.id = test_answers.attempt_id) AND (ta.user_id = auth.uid())))) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));
 CREATE POLICY "Admins can manage all attempts" ON public.test_attempts AS PERMISSIVE FOR ALL TO PUBLIC USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
 CREATE POLICY "Users can create their own attempts" ON public.test_attempts AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1                                                                                             +
    FROM test_registrations tr                                                                                                                                                                                                                                         +
   WHERE ((tr.test_id = test_attempts.test_id) AND (tr.user_id = auth.uid()))))));
 CREATE POLICY "Users can view their own attempts" ON public.test_attempts AS PERMISSIVE FOR SELECT TO PUBLIC USING (((user_id = auth.uid()) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));
 CREATE POLICY "Admins can manage leaderboard" ON public.test_leaderboard AS PERMISSIVE FOR ALL TO PUBLIC USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
 CREATE POLICY "Leaderboard is viewable by everyone" ON public.test_leaderboard AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
 CREATE POLICY "Questions are manageable by admins" ON public.test_questions AS PERMISSIVE FOR ALL TO PUBLIC USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
 CREATE POLICY "Questions are viewable by registered users" ON public.test_questions AS PERMISSIVE FOR SELECT TO PUBLIC USING (((EXISTS ( SELECT 1                                                                                                                     +
    FROM test_registrations tr                                                                                                                                                                                                                                         +
   WHERE ((tr.test_id = test_questions.test_id) AND (tr.user_id = auth.uid())))) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));
 CREATE POLICY "Anyone can view registration counts for public tests" ON public.test_registrations AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                        +
    FROM tests                                                                                                                                                                                                                                                         +
   WHERE ((tests.id = test_registrations.test_id) AND (tests.is_public = true)))));
 CREATE POLICY "Service role can manage all registrations" ON public.test_registrations AS PERMISSIVE FOR ALL TO PUBLIC USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));
 CREATE POLICY "Users can insert own registrations" ON public.test_registrations AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() = user_id));
 CREATE POLICY "Users can register for public tests" ON public.test_registrations AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((EXISTS ( SELECT 1                                                                                                                    +
    FROM tests t                                                                                                                                                                                                                                                       +
   WHERE ((t.id = test_registrations.test_id) AND (t.is_public = true) AND (t.registration_start <= now()) AND (t.registration_end >= now())))));
 CREATE POLICY "Users can update own registrations" ON public.test_registrations AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY "Users can view own registrations" ON public.test_registrations AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY "Users can view their own registrations" ON public.test_registrations AS PERMISSIVE FOR SELECT TO PUBLIC USING (((user_id = auth.uid()) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));
 CREATE POLICY admins_can_manage_test_rounds ON public.test_rounds AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                           +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY public_can_view_test_rounds ON public.test_rounds AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
 CREATE POLICY "Anyone can view public active tests" ON public.tests AS PERMISSIVE FOR SELECT TO PUBLIC USING (((is_public = true) AND (is_active = true)));
 CREATE POLICY "Authenticated users can view tests" ON public.tests AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.uid() IS NOT NULL));
 CREATE POLICY "Service role can manage tests" ON public.tests AS PERMISSIVE FOR ALL TO PUBLIC USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));
 CREATE POLICY "Tests are manageable by admins" ON public.tests AS PERMISSIVE FOR ALL TO PUBLIC USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
 CREATE POLICY "Tests are viewable by everyone if public" ON public.tests AS PERMISSIVE FOR SELECT TO PUBLIC USING (((is_public = true) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));
 CREATE POLICY "Admins can manage all activity" ON public.user_activity AS PERMISSIVE FOR ALL TO PUBLIC USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
 CREATE POLICY "Users can create their own activity" ON public.user_activity AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((user_id = auth.uid()));
 CREATE POLICY "Users can view their own activity" ON public.user_activity AS PERMISSIVE FOR SELECT TO PUBLIC USING (((user_id = auth.uid()) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));
 CREATE POLICY "Admins can view all activity logs" ON public.user_activity_log AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                            +
    FROM auth.users                                                                                                                                                                                                                                                    +
   WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'admin'::text)))));
 CREATE POLICY "System can insert activity logs" ON public.user_activity_log AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
 CREATE POLICY "Users can view their own activity log" ON public.user_activity_log AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY "Users can create their own connections" ON public.user_connections AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((follower_id = auth.uid()));
 CREATE POLICY "Users can delete their own connections" ON public.user_connections AS PERMISSIVE FOR DELETE TO PUBLIC USING ((follower_id = auth.uid()));
 CREATE POLICY "Users can view all connections" ON public.user_connections AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
 CREATE POLICY "Admins can view all points" ON public.user_points AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                         +
    FROM auth.users                                                                                                                                                                                                                                                    +
   WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'admin'::text)))));
 CREATE POLICY "System can insert user points" ON public.user_points AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
 CREATE POLICY "Users can update their own points" ON public.user_points AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY "Users can view all points for leaderboard" ON public.user_points AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.role() = 'authenticated'::text));
 CREATE POLICY "Anyone can view user presence" ON public.user_presence AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
 CREATE POLICY "Users can insert own presence" ON public.user_presence AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() = user_id));
 CREATE POLICY "Users can update own presence" ON public.user_presence AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((auth.uid() = user_id));
 CREATE POLICY admins_can_manage_user_roles ON public.user_roles AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1                                                                                                                                             +
    FROM profiles                                                                                                                                                                                                                                                      +
   WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
 CREATE POLICY users_can_view_own_roles ON public.user_roles AS PERMISSIVE FOR SELECT TO PUBLIC USING ((user_id = auth.uid()));
 CREATE POLICY "Enable read access for all users" ON public.volunteer_applications AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
 CREATE POLICY admin ON public.volunteer_applications AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

