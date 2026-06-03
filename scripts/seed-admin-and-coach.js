/**
 * Seed script: Create admin + personal coach accounts in Supabase
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node scripts/seed-admin-and-coach.js
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fodvpcwlpwfgmgvfczvb.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is required')
  console.error('   Set it as an environment variable or in a .env file')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

function simpleHash(password) {
  try {
    return Buffer.from(password).toString('base64')
  } catch {
    return password
  }
}

const ACCOUNTS = [
  {
    full_name: 'Azwar Admin',
    email: 'admin@azfit.app',
    password: 'admin123',
    business_name: 'AzFIT HQ',
    specialty: 'Administration',
    years_experience: 10,
    role: 'admin',
  },
  {
    full_name: 'Azwar Coach',
    email: 'coach@azfit.app',
    password: 'coach123',
    business_name: 'AzFIT Personal Training',
    specialty: 'Strength & Conditioning',
    years_experience: 8,
    role: 'coach',
  },
]

async function seed() {
  console.log('🔌 Connecting to Supabase...\n')

  for (const account of ACCOUNTS) {
    const { data: existing } = await supabase
      .from('coaches')
      .select('id, email, role')
      .eq('email', account.email)
      .maybeSingle()

    if (existing) {
      if (!existing.role) {
        const { error } = await supabase
          .from('coaches')
          .update({ role: account.role })
          .eq('id', existing.id)
        if (error) {
          console.error(`   ⚠️ Failed to update role for ${account.email}:`, error.message)
        } else {
          console.log(`✅ Updated role to "${account.role}" for ${account.email}`)
        }
      } else {
        console.log(`ℹ️  Account already exists: ${account.email} (role: ${existing.role})`)
      }
      continue
    }

    const { data, error } = await supabase
      .from('coaches')
      .insert({
        full_name: account.full_name,
        email: account.email.toLowerCase(),
        password_hash: simpleHash(account.password),
        business_name: account.business_name,
        specialty: account.specialty,
        years_experience: account.years_experience,
        role: account.role,
        settings: { theme: 'dark', unitSystem: 'metric', defaultSessionDuration: 60 },
        last_login: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error(`❌ Failed to create ${account.email}:`, error.message)
    } else {
      console.log(`✅ Created ${account.role} account: ${account.email}`)
      console.log(`   Password: ${account.password}`)
      console.log(`   ID: ${data.id}`)
    }
  }

  // Backfill missing roles
  const { error: updateError } = await supabase
    .from('coaches')
    .update({ role: 'coach' })
    .is('role', null)

  if (updateError) {
    console.error('\n⚠️ Failed to backfill roles:', updateError.message)
  } else {
    console.log('\n✅ Backfilled missing coach roles')
  }

  console.log('\n🏁 Done!')
}

seed().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
