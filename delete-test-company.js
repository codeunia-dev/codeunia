const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ocnorlktyfswjqgvzrve.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jbm9ybGt0eWZzd2pxZ3Z6cnZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQzNTY4NSwiZXhwIjoyMDY2MDExNjg1fQ.QP6L8TLHMk5dreFc_OTdeLzk-adB90WL9LSlmQgoRCs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteTestCompany() {
  const companySlug = 'vertex-digital-solutions'
  
  console.log('='.repeat(80))
  console.log('DELETING TEST COMPANY: Vertex Digital Solutions')
  console.log('='.repeat(80))
  console.log()
  
  try {
    // First, get the company to confirm it exists
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('id, name, slug')
      .eq('slug', companySlug)
      .single()
    
    if (fetchError || !company) {
      console.log('❌ Company not found or already deleted')
      return
    }
    
    console.log('Found company:')
    console.log(`- ID: ${company.id}`)
    console.log(`- Name: ${company.name}`)
    console.log(`- Slug: ${company.slug}`)
    console.log()
    
    // Get counts before deletion
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)
    
    const { count: hackathonsCount } = await supabase
      .from('hackathons')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)
    
    const { count: membersCount } = await supabase
      .from('company_members')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)
    
    const { count: analyticsCount } = await supabase
      .from('company_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)
    
    console.log('Data to be deleted:')
    console.log(`- Events: ${eventsCount || 0}`)
    console.log(`- Hackathons: ${hackathonsCount || 0}`)
    console.log(`- Members: ${membersCount || 0}`)
    console.log(`- Analytics Records: ${analyticsCount || 0}`)
    console.log()
    
    console.log('⚠️  WARNING: This will permanently delete all data!')
    console.log('Press Ctrl+C within 5 seconds to cancel...')
    console.log()
    
    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    console.log('Proceeding with deletion...')
    console.log()
    
    // Step 1: Get all events and hackathons IDs
    const { data: events } = await supabase
      .from('events')
      .select('id')
      .eq('company_id', company.id)
    
    const { data: hackathons } = await supabase
      .from('hackathons')
      .select('id')
      .eq('company_id', company.id)
    
    const eventIds = events?.map(e => e.id) || []
    const hackathonIds = hackathons?.map(h => h.id) || []
    
    // Step 2: Delete event registrations
    if (eventIds.length > 0) {
      console.log('Step 1: Deleting event registrations...')
      const { error: eventRegsError } = await supabase
        .from('event_registrations')
        .delete()
        .in('event_id', eventIds)
      
      if (eventRegsError && eventRegsError.code !== 'PGRST116') {
        console.error('Warning: Error deleting event registrations:', eventRegsError)
      } else {
        console.log('✓ Event registrations deleted')
      }
    }
    
    // Step 3: Delete hackathon registrations
    if (hackathonIds.length > 0) {
      console.log('Step 2: Deleting hackathon registrations...')
      const { error: hackRegsError } = await supabase
        .from('hackathon_registrations')
        .delete()
        .in('hackathon_id', hackathonIds)
      
      if (hackRegsError && hackRegsError.code !== 'PGRST116') {
        console.error('Warning: Error deleting hackathon registrations:', hackRegsError)
      } else {
        console.log('✓ Hackathon registrations deleted')
      }
    }
    
    // Step 4: Delete event_audit_log records
    console.log('Step 3: Deleting event audit logs...')
    const { error: auditError } = await supabase
      .from('event_audit_log')
      .delete()
      .eq('company_id', company.id)
    
    if (auditError && auditError.code !== 'PGRST116') {
      console.error('Warning: Error deleting audit logs:', auditError)
    } else {
      console.log('✓ Audit logs deleted')
    }
    
    // Step 5: Delete event_moderation_log records
    console.log('Step 4: Deleting moderation logs...')
    const { error: moderationError } = await supabase
      .from('event_moderation_log')
      .delete()
      .eq('company_id', company.id)
    
    if (moderationError && moderationError.code !== 'PGRST116') {
      console.error('Warning: Error deleting moderation logs:', moderationError)
    } else {
      console.log('✓ Moderation logs deleted')
    }
    
    // Step 6: Delete events
    if (eventIds.length > 0) {
      console.log('Step 5: Deleting events...')
      const { error: eventsError } = await supabase
        .from('events')
        .delete()
        .eq('company_id', company.id)
      
      if (eventsError) {
        console.error('❌ Error deleting events:', eventsError)
        return
      }
      console.log('✓ Events deleted')
    }
    
    // Step 7: Delete hackathons
    if (hackathonIds.length > 0) {
      console.log('Step 6: Deleting hackathons...')
      const { error: hackathonsError } = await supabase
        .from('hackathons')
        .delete()
        .eq('company_id', company.id)
      
      if (hackathonsError) {
        console.error('❌ Error deleting hackathons:', hackathonsError)
        return
      }
      console.log('✓ Hackathons deleted')
    }
    
    // Step 8: Delete company analytics
    console.log('Step 7: Deleting analytics...')
    const { error: analyticsError } = await supabase
      .from('company_analytics')
      .delete()
      .eq('company_id', company.id)
    
    if (analyticsError && analyticsError.code !== 'PGRST116') {
      console.error('Warning: Error deleting analytics:', analyticsError)
    } else {
      console.log('✓ Analytics deleted')
    }
    
    // Step 9: Delete company members
    console.log('Step 8: Deleting company members...')
    const { error: membersError } = await supabase
      .from('company_members')
      .delete()
      .eq('company_id', company.id)
    
    if (membersError) {
      console.error('❌ Error deleting members:', membersError)
      return
    }
    console.log('✓ Company members deleted')
    
    // Step 10: Finally delete the company
    console.log('Step 9: Deleting company...')
    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .eq('id', company.id)
    
    if (deleteError) {
      console.error('❌ Error deleting company:', deleteError)
      return
    }
    console.log('✓ Company deleted')
    
    console.log('✅ Successfully deleted Vertex Digital Solutions!')
    console.log()
    console.log('All related data has been removed:')
    console.log('- Company record')
    console.log('- All events')
    console.log('- All hackathons')
    console.log('- All company members')
    console.log('- All analytics records')
    console.log('- All moderation logs')
    console.log('- All audit logs')
    console.log()
    console.log('='.repeat(80))
    console.log('You can now create a fresh company with clean data!')
    console.log('='.repeat(80))
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

deleteTestCompany().catch(console.error)
