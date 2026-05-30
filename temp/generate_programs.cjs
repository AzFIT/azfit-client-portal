const fs = require('fs');

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const result = [];
  for (const line of lines) {
    if (line.startsWith('🔍 FILTER:')) continue;
    const cols = [];
    let inQuote = false;
    let current = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        cols.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    cols.push(current.trim());
    result.push(cols);
  }
  return result;
}

const progRaw = fs.readFileSync('program list.csv', 'utf8');
const exRaw = fs.readFileSync('exercise_list.csv', 'utf8');
const progRows = parseCSV(progRaw);
const exRows = parseCSV(exRaw);

const progHeaders = progRows[0];
const exHeaders = exRows[0];

const programs = [];
for (let i = 1; i < progRows.length; i++) {
  const r = progRows[i];
  const p = {};
  progHeaders.forEach((h, idx) => p[h] = r[idx] || '');
  programs.push(p);
}

const exercises = [];
for (let i = 1; i < exRows.length; i++) {
  const r = exRows[i];
  const e = {};
  exHeaders.forEach((h, idx) => e[h] = r[idx] || '');
  exercises.push(e);
}

const byMuscle = {};
exercises.forEach(e => {
  const m = e.Muscle_Group;
  if (!byMuscle[m]) byMuscle[m] = [];
  byMuscle[m].push(e);
});

function seededShuffle(arr, seed) {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getTemplateType(prog) {
  const name = prog.Name.toLowerCase();
  const focus = (prog.Focus || '').toLowerCase();
  const split = (prog.Split || '').toLowerCase();
  
  if (name.includes('gvt') || (focus.includes('hypertrophy') && prog.Sets === '10')) return 'GVT';
  if (name.includes('gbc') || focus.includes('fat loss') || focus.includes('body composition')) return 'GBC';
  if (name.includes('hiit') || focus.includes('conditioning') || focus.includes('endurance')) return 'HIIT';
  if (split.includes('push/pull/legs') || name.includes('ppl')) return 'PPL';
  if (split.includes('full body')) return 'Full Body';
  if (split.includes('bro split')) return 'Custom';
  if (focus.includes('strength')) return 'Strength';
  return 'Custom';
}

function getTrainingMethod(templateType, seed) {
  const methods = {
    'GVT': ['Straight Sets'],
    'GBC': ['Triset', 'Superset'],
    'HIIT': ['Superset', 'Triset'],
    'PPL': ['Straight Sets', 'Superset'],
    'Full Body': ['Straight Sets', 'Superset'],
    'Strength': ['Straight Sets'],
    'Custom': ['Straight Sets', 'Superset', 'Triset']
  };
  const pool = methods[templateType] || ['Straight Sets'];
  return pool[seed % pool.length];
}

const splitMuscles = {
  'Upper/Lower': { upper: ['Chest','Shoulders','Back','Arms'], lower: ['Legs','Glutes','Calves'], core: ['Core'] },
  'Push/Pull/Legs': { push: ['Chest','Shoulders','Arms'], pull: ['Back','Arms'], legs: ['Legs','Glutes','Calves'], core: ['Core'] },
  'Bro Split': { all: ['Chest','Back','Shoulders','Arms','Legs','Glutes','Calves','Core'] },
  'Full Body': { all: ['Chest','Back','Shoulders','Arms','Legs','Glutes','Calves','Core'] },
  'Push/Pull': { push: ['Chest','Shoulders','Legs','Glutes','Calves'], pull: ['Back','Arms'], core: ['Core'] }
};

function getMusclesForDay(split, dayIndex, totalDays) {
  const mapping = splitMuscles[split];
  if (!mapping) return ['Chest','Back','Shoulders','Arms','Legs','Glutes','Calves','Core'];
  
  if (mapping.all) {
    const all = mapping.all;
    const perDay = Math.ceil(all.length / totalDays);
    const start = (dayIndex * perDay) % all.length;
    const result = [];
    for (let i = 0; i < perDay; i++) {
      result.push(all[(start + i) % all.length]);
    }
    return result;
  }
  
  if (split === 'Upper/Lower') {
    return dayIndex % 2 === 0 ? mapping.upper : mapping.lower;
  }
  
  if (split === 'Push/Pull/Legs') {
    const dayType = dayIndex % 3;
    if (dayType === 0) return mapping.push;
    if (dayType === 1) return mapping.pull;
    return mapping.legs;
  }
  
  if (split === 'Push/Pull') {
    return dayIndex % 2 === 0 ? mapping.push : mapping.pull;
  }
  
  return ['Chest','Back','Shoulders','Arms','Legs','Glutes','Calves','Core'];
}

function pickExercisesForProgram(prog, count = 16) {
  const seed = hashString(prog.Name);
  const split = prog.Split;
  const freq = parseInt(prog.Frequency) || 3;
  
  const allMuscles = ['Chest','Back','Shoulders','Arms','Legs','Glutes','Calves','Core'];
  const shuffledPools = {};
  allMuscles.forEach(m => {
    shuffledPools[m] = seededShuffle(byMuscle[m] || [], seed + hashString(m));
  });
  
  const picked = [];
  const usedNames = new Set();
  
  for (let dayIdx = 0; dayIdx < freq; dayIdx++) {
    const dayMuscles = getMusclesForDay(split, dayIdx, freq);
    const perDay = Math.ceil(count / freq);
    
    let dayPicked = 0;
    let round = 0;
    while (dayPicked < perDay && round < 10) {
      for (const muscle of dayMuscles) {
        if (dayPicked >= perDay) break;
        const pool = shuffledPools[muscle];
        const idx = (dayIdx * 3 + round) % pool.length;
        if (pool[idx] && !usedNames.has(pool[idx].Name)) {
          picked.push({ ...pool[idx], _dayIndex: dayIdx });
          usedNames.add(pool[idx].Name);
          dayPicked++;
        }
      }
      round++;
    }
  }
  
  return picked;
}

function secToRest(s) {
  const sec = parseInt(s) || 60;
  const m = Math.floor(sec / 60);
  const rs = sec % 60;
  return m > 0 ? (rs > 0 ? String(m).padStart(2,'0') + ':' + String(rs).padStart(2,'0') : String(m).padStart(2,'0') + ':00') : '00:' + String(rs).padStart(2,'0');
}

function getEquipmentLevel(prog) {
  const equip = (prog.Equipment_Needed || '').toLowerCase();
  if (equip.includes('bodyweight')) return 'Bodyweight';
  if (equip.includes('dumbbell')) return 'Dumbbells';
  if (equip.includes('minimal')) return 'Minimal';
  return 'Full Gym';
}

function getTimePerSession(prog) {
  const min = parseInt(prog.Avg_Time_min) || 45;
  if (min <= 30) return '30';
  if (min <= 45) return '45';
  if (min <= 60) return '60';
  return '90';
}

const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const savedPrograms = programs.map((prog, idx) => {
  const seed = hashString(prog.Name);
  const matched = pickExercisesForProgram(prog, 16);
  const templateType = getTemplateType(prog);
  const trainingMethod = getTrainingMethod(templateType, seed);
  const freq = parseInt(prog.Frequency) || 3;
  const duration = parseInt(prog.Duration_wk) || 4;
  const now = new Date().toISOString();
  
  const days = [];
  for (let d = 0; d < freq; d++) {
    const dayExercises = matched.filter(e => e._dayIndex === d).map((e, ei) => ({
      code: String.fromCharCode(65 + d) + (ei + 1),
      name: e.Name,
      sets: parseInt(e.Sets) || 3,
      reps: e.Reps || '8-12',
      pct1RM: prog.Sets + '×' + prog.Reps + ' @ ' + (prog.Level || 'moderate'),
      tempo: e.Tempo || '2-0-2',
      rest: secToRest(e.Rest_sec),
      muscleGroup: e.Muscle_Group
    }));
    
    if (dayExercises.length > 0) {
      days.push({
        day: dayNames[d],
        active: true,
        workout: templateType + ' Day ' + (d + 1),
        exercises: dayExercises,
        method: trainingMethod
      });
    }
  }
  
  const flatExercises = matched.map((e, ei) => ({
    code: 'E' + (ei + 1),
    name: e.Name,
    sets: parseInt(e.Sets) || 3,
    reps: e.Reps || '8-12',
    pct1RM: prog.Sets + '×' + prog.Reps + ' @ ' + (prog.Level || 'moderate'),
    tempo: e.Tempo || '2-0-2',
    rest: secToRest(e.Rest_sec)
  }));
  
  const totalSets = flatExercises.reduce((s, e) => s + e.sets, 0);
  
  const phaseWeeks = Math.ceil(duration / 3);
  const phases = [
    { id: 'phase1', name: 'Accumulation', weeks: phaseWeeks, focus: prog.Focus || 'General', color: '#00AEEF', active: true },
    { id: 'phase2', name: 'Intensification', weeks: phaseWeeks, focus: prog.Focus || 'General', color: '#8B5CF6', active: true },
    { id: 'phase3', name: 'Realization', weeks: Math.max(1, duration - phaseWeeks * 2), focus: prog.Focus || 'General', color: '#22C55E', active: true }
  ];
  
  return {
    id: prog.Prog_ID || 'prog_' + idx,
    createdAt: prog.Created_Date || now,
    updatedAt: now,
    data: {
      id: prog.Prog_ID || 'prog_' + idx,
      programName: prog.Name,
      goal: prog.Focus || 'General',
      method: prog.Split || 'Full Body',
      description: prog.Description || '',
      tags: [prog.Focus, prog.Level, prog.Split, templateType].filter(Boolean),
      isPublic: prog.Status === 'Active',
      assignedClient: '',
      weeklyHours: Math.round((parseInt(prog.Avg_Time_min) || 45) * freq / 60),
      phases,
      split: days.map(d => ({ day: d.day, active: d.active, workout: d.workout })),
      days,
      clientContext: {
        ageRange: '25-35',
        experience: prog.Level || 'Intermediate',
        bodyType: 'Average',
        availability: freq + 'x/week',
        equipment: getEquipmentLevel(prog),
        timePerSession: getTimePerSession(prog),
        limitations: [],
        otherLimitation: ''
      },
      exercises: flatExercises,
      templateType,
      trainingMethod,
      totalSets,
      status: prog.Status
    }
  };
});

fs.writeFileSync('../public/programs_db.json', JSON.stringify(savedPrograms, null, 2));
console.log('Saved', savedPrograms.length, 'enhanced programs to public/programs_db.json');

const unlinked = savedPrograms.filter(p => p.data.exercises.length === 0);
console.log('Unlinked programs:', unlinked.length);

console.log('\n=== SAMPLE: ' + savedPrograms[0].data.programName + ' ===');
console.log('Template:', savedPrograms[0].data.templateType);
console.log('Method:', savedPrograms[0].data.trainingMethod);
console.log('Total Sets:', savedPrograms[0].data.totalSets);
console.log('Days:', savedPrograms[0].data.days.length);
savedPrograms[0].data.days.forEach(d => {
  console.log('\n' + d.day + ' (' + d.method + ') - ' + d.exercises.length + ' exercises:');
  d.exercises.forEach(e => console.log('  ' + e.code + ': ' + e.name + ' | ' + e.sets + '×' + e.reps + ' | ' + e.rest));
});
