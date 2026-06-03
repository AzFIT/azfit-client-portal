import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceKey) {
  console.error('Error: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars')
  console.error('Example:')
  console.error('  SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=eyJ... npx tsx scripts/migrate-localstorage.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function migrate() {
  const exportPath = path.join(process.cwd(), 'scripts', 'localstorage-export.json')

  if (!fs.existsSync(exportPath)) {
    console.error('Error: scripts/localstorage-export.json not found')
    console.error('Follow the export instructions in scripts/README.md')
    process.exit(1)
  }

  const raw = fs.readFileSync(exportPath, 'utf-8')
  const data = JSON.parse(raw)

  const coaches = data.coaches || []
  const clients = data.clients || []
  const programs = data.programs || []

  console.log(`Found: ${coaches.length} coaches, ${clients.length} clients, ${programs.length} programs`)

  // ── Migrate Coaches ────────────────────────────────────
  if (coaches.length > 0) {
    console.log('Migrating coaches...')
    for (const coach of coaches) {
      const { error } = await supabase.from('coaches').upsert({
        id: coach.id,
        full_name: coach.fullName,
        email: coach.email.toLowerCase(),
        password_hash: coach.passwordHash,
        business_name: coach.businessName || null,
        specialty: coach.specialty || null,
        years_experience: coach.yearsExperience || 0,
        settings: coach.settings || { theme: 'dark', unitSystem: 'metric', defaultSessionDuration: 60 },
        created_at: coach.createdAt,
        last_login: coach.lastLogin,
      }, { onConflict: 'id' })

      if (error) console.error(`  Coach ${coach.email}: ${error.message}`)
      else console.log(`  ✅ Coach: ${coach.fullName}`)
    }
  }

  // ── Migrate Clients ────────────────────────────────────
  if (clients.length > 0) {
    console.log('Migrating clients...')
    for (const client of clients) {
      const { error } = await supabase.from('clients').upsert({
        id: client.id,
        coach_id: client.coachId,
        full_name: client.personal?.fullName || '',
        email: client.personal?.email || null,
        status: client.status || 'active',
        created_at: client.createdAt,
        updated_at: client.updatedAt,
        personal: client.personal || {},
        goals: client.goals || {},
        body_assessment: client.bodyAssessment || {},
        tdee: client.tdee || {},
        medical: client.medical || {},
        nutrition: client.nutrition || {},
        assessment_history: client.assessmentHistory || [],
      }, { onConflict: 'id' })

      if (error) console.error(`  Client ${client.personal?.fullName}: ${error.message}`)
      else console.log(`  ✅ Client: ${client.personal?.fullName}`)
    }
  }

  // ── Migrate Programs ───────────────────────────────────
  if (programs.length > 0) {
    console.log('Migrating programs...')
    for (const program of programs) {
      const programData = program.data || program
      const { error } = await supabase.from('programs').upsert({
        id: program.id,
        coach_id: programData.coachId || program.coachId,
        client_id: programData.assignedClient || program.clientId || null,
        name: programData.programName || 'Untitled Program',
        description: programData.description || '',
        status: 'active',
        data: programData,
        created_at: program.createdAt || new Date().toISOString(),
        updated_at: program.updatedAt || new Date().toISOString(),
      }, { onConflict: 'id' })

      if (error) console.error(`  Program ${programData.programName}: ${error.message}`)
      else console.log(`  ✅ Program: ${programData.programName || 'Untitled'}`)
    }
  }

  console.log('\n🎉 Migration complete!')
  console.log('You can now reload the app and your data will come from Supabase.')
}

migrate().catch(console.error)
