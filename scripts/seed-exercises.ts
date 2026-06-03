import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceKey) {
  console.error('Error: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars')
  console.error('Example:')
  console.error('  SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=eyJ... npx tsx scripts/seed-exercises.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function seed() {
  const exercisesPath = path.join(process.cwd(), 'public', 'exercises_db.json')
  const raw = fs.readFileSync(exercisesPath, 'utf-8')
  const exercises = JSON.parse(raw)

  const rows = exercises.map((e: any) => ({
    exercise_id: e.ExerciseID,
    name: e.Name,
    muscle_group: e.MuscleGroup,
    equipment: e.Equipment,
    difficulty: e.Difficulty,
    type: e.Type,
    video_url: e.VideoURL,
    description: e.Description,
  }))

  console.log(`Inserting ${rows.length} exercises...`)

  const { error } = await supabase.from('exercises').insert(rows)

  if (error) {
    console.error('Insert failed:', error.message)
    process.exit(1)
  }

  console.log(`✅ Seeded ${rows.length} exercises into Supabase`)
}

seed().catch(console.error)
