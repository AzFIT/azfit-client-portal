/**
 * Complete Dropdown Canonicalization & Sync
 *
 * Goals:
 * 1. Deduplicate & standardize all category lists
 * 2. Build canonical value mappings
 * 3. Update ALL sheet data to use canonical values
 * 4. Create clean Category_Dropdown with 12 master lists
 * 5. Add data validation linking every dropdown to Category_Dropdown
 */

const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, 'Complete linking categories.xlsx');
const OUTPUT_FILE = path.join(__dirname, 'Complete linking categories_FIXED.xlsx');

// ── Normalization helpers ──────────────────────────────────────
function normalize(val) {
  if (val === undefined || val === null) return '';
  let s = String(val).trim();
  // Remove leading dash + space
  s = s.replace(/^[-–—]\s*/, '');
  // Remove trailing/leading spaces
  s = s.trim();
  // Normalize internal whitespace
  s = s.replace(/\s+/g, ' ');
  return s;
}

function dedupeCaseInsensitive(arr) {
  const seen = new Set();
  const out = [];
  for (const v of arr) {
    const lower = v.toLowerCase();
    if (!seen.has(lower) && v !== '') {
      seen.add(lower);
      out.push(v);
    }
  }
  return out;
}

// Fuzzy dedupe: merge values that are identical after normalization
function canonicalizeList(arr, customMappings = {}) {
  const normalizedMap = new Map(); // normalized -> canonical
  const canonicals = [];

  for (const raw of arr) {
    const norm = normalize(raw);
    if (!norm) continue;

    // Apply custom mapping if exists
    const mapped = customMappings[norm] || norm;

    const lower = mapped.toLowerCase();
    if (normalizedMap.has(lower)) continue;

    normalizedMap.set(lower, mapped);
    canonicals.push(mapped);
  }

  return canonicals.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

// ── Custom mappings for known inconsistencies ──────────────────
const GOAL_MAPPINGS = {
  'lose weight': 'Lose Weight',
  'build muscle': 'Build Muscle',
  'strength': 'Strength',
  'endurance': 'Endurance',
  'hypertrophy': 'Hypertrophy',
  'fat loss': 'Fat Loss',
  'conditioning': 'Conditioning',
  'general fitness': 'General Fitness',
  'mobility & flexibility': 'Mobility & Flexibility',
  'injury rehab': 'Injury Rehab',
  'body recomposition': 'Body Recomposition',
  'sports performance': 'Sports Performance',
  'hyrox': 'Hyrox',
  'crossfit': 'CrossFit',
  'triathlon': 'Triathlon',
  'marathon': 'Marathon',
  'running (5k, 10k, half marathon)': 'Running (5K/10K/Half Marathon)',
  'running (5k/10k/half)': 'Running (5K/10K/Half Marathon)',
  'rugby': 'Rugby',
  'soccer': 'Soccer',
  'basketball': 'Basketball',
  'combat sports (boxing, mma, judo, wrestling)': 'Combat Sports (Boxing/MMA/Judo/Wrestling)',
  'combat sports': 'Combat Sports (Boxing/MMA/Judo/Wrestling)',
  'tag rugby': 'Tag Rugby',
  'american football': 'American Football',
  'swimming': 'Swimming',
  'cycling': 'Cycling',
  'tennis': 'Tennis',
  'golf': 'Golf',
  'rowing': 'Rowing',
  'volleyball': 'Volleyball',
  'hockey': 'Hockey',
  'youth training': 'Youth Training',
  'senior fitness': 'Senior Fitness',
  'prehab / rehab': 'Prehab / Rehab',
  'prehab/rehab': 'Prehab / Rehab',
  'seasonal goals (summer shred, winter bulk)': 'Seasonal Goals (Summer Shred / Winter Bulk)',
  'seasonal goals (shred)': 'Seasonal Goals (Summer Shred / Winter Bulk)',
  'seasonal goals (bulk)': 'Seasonal Goals (Summer Shred / Winter Bulk)',
  'hybrid programs (strength + conditioning, fat loss + performance)': 'Hybrid Programs (Strength + Conditioning)',
  'hybrid programs': 'Hybrid Programs (Strength + Conditioning)',
  'mind-body (yoga, pilates, breathwork)': 'Mind-Body (Yoga/Pilates/Breathwork)',
  'mind-body (yoga/pilates/breathwork)': 'Mind-Body (Yoga/Pilates/Breathwork)',
  'stress reduction': 'Stress Reduction',
  'postpartum fitness': 'Postpartum Fitness',
  'corporate wellness': 'Corporate Wellness',
};

const METHOD_MAPPINGS = {
  'straight sets': 'Straight Sets',
  'supersets': 'Supersets',
  'trisets': 'Trisets',
  'circuits': 'Circuits',
  'giant sets': 'Giant Sets',
  'pyramid sets': 'Pyramid Sets',
  'drop sets': 'Drop Sets',
  'rest-pause': 'Rest-Pause',
  'rest‑pause': 'Rest-Pause',
  'cluster sets': 'Cluster Sets',
  'wave loading': 'Wave Loading',
  'german volume training (10x10)': 'German Volume Training (10x10)',
  'escalating density training': 'Escalating Density Training',
  'time under tension (tut)': 'Time Under Tension (TUT)',
  'tempo training': 'Tempo Training',
  'progressive overload': 'Progressive Overload',
  'linear periodization': 'Linear Periodization',
  'block periodization': 'Block Periodization',
  'interval training': 'Interval Training',
  'hiit': 'HIIT',
  'tabata': 'Tabata',
  'emom (every minute on the minute)': 'EMOM (Every Minute on the Minute)',
  'amrap (as many reps as possible)': 'AMRAP (As Many Reps As Possible)',
  'fartlek training': 'Fartlek Training',
  'sprint intervals': 'Sprint Intervals',
  'circuit conditioning': 'Circuit Conditioning',
  'olympic lifts': 'Olympic Lifts',
  'powerlifting': 'Powerlifting',
  'sport-specific drills': 'Sport-Specific Drills',
  'skill work (agility, speed, coordination)': 'Skill Work (Agility/Speed/Coordination)',
  'functional training': 'Functional Training',
  'plyometrics': 'Plyometrics',
  'speed & agility ladder work': 'Speed & Agility Ladder Work',
  'mobility flow': 'Mobility Flow',
  'yoga': 'Yoga',
  'pilates': 'Pilates',
  'breathwork': 'Breathwork',
  'active recovery sessions': 'Active Recovery Sessions',
  'stretching protocols': 'Stretching Protocols',
  'meditation & movement': 'Meditation & Movement',
};

const PROGRAM_MAPPINGS = {
  'gbc (german body composition)': 'GBC (German Body Composition)',
  'hiit': 'HIIT',
  'custom': 'Custom',
  'german volume training (10x10)': 'German Volume Training (10x10)',
  'stronglifts 5x5': 'StrongLifts 5x5',
  'starting strength': 'Starting Strength',
  'push pull legs (ppl)': 'Push Pull Legs (PPL)',
  'full body split': 'Full Body Split',
  'upper/lower split': 'Upper/Lower Split',
  'bro split (chest/back/legs/arms/shoulders)': 'Bro Split (Chest/Back/Legs/Arms/Shoulders)',
  'running plan (5k, 10k, half marathon)': 'Running Plan (5K/10K/Half Marathon)',
  'tag rugby': 'Tag Rugby',
  'american football': 'American Football',
  'powerlifting': 'Powerlifting',
  'functional training': 'Functional Training',
  'mobility & flexibility': 'Mobility & Flexibility',
  'youth development': 'Youth Development',
  'senior fitness': 'Senior Fitness',
  'prehab / rehab': 'Prehab / Rehab',
  'corporate wellness program': 'Corporate Wellness Program',
  'postpartum fitness program': 'Postpartum Fitness Program',
  'fat loss circuit': 'Fat Loss Circuit',
  'muscle gain split': 'Muscle Gain Split',
  'general fitness': 'General Fitness',
  'stress reduction flow': 'Stress Reduction Flow',
  'hyrox prep': 'Hyrox Prep',
  'crossfit wod': 'CrossFit WOD',
  'rugby conditioning': 'Rugby Conditioning',
  'soccer performance': 'Soccer Performance',
  'basketball strength': 'Basketball Strength',
  'combat sports conditioning': 'Combat Sports Conditioning',
  'swimming endurance': 'Swimming Endurance',
  'cycling power': 'Cycling Power',
  'tennis agility': 'Tennis Agility',
  'golf strength & mobility': 'Golf Strength & Mobility',
  'rowing conditioning': 'Rowing Conditioning',
  'volleyball performance': 'Volleyball Performance',
  'hockey conditioning': 'Hockey Conditioning',
  'speed & agility program': 'Speed & Agility Program',
  'seasonal goal program (summer shred, winter bulk)': 'Seasonal Goal Program (Summer Shred / Winter Bulk)',
  'hybrid training (strength + conditioning, fat loss + performance)': 'Hybrid Training (Strength + Conditioning)',
  'endurance build': 'Endurance Build',
  'conditioning flow': 'Conditioning Flow',
  'body recomposition circuit': 'Body Recomposition Circuit',
  'triathlon base': 'Triathlon Base',
  'marathon training': 'Marathon Training',
  'olympic weightlifting': 'Olympic Weightlifting',
  'plyometric power program': 'Plyometric Power Program',
};

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log('Reading workbook...');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(INPUT_FILE);

  // Also read with XLSX for reliable data extraction
  const xwb = XLSX.readFile(INPUT_FILE);

  // ============================================================
  // PHASE 1: Extract ALL raw values from every relevant column
  // ============================================================
  console.log('\n=== PHASE 1: Extracting raw values from all sheets ===');

  function extractCol(sheetName, colIndex, startRow) {
    const ws = xwb.Sheets[sheetName];
    if (!ws) return [];
    const data = XLSX.utils.sheet_to_json(ws, {header:1});
    const vals = [];
    for (let i = startRow; i < data.length; i++) {
      if (data[i] && data[i][colIndex] !== undefined && data[i][colIndex] !== null && data[i][colIndex] !== '') {
        vals.push(String(data[i][colIndex]));
      }
    }
    return vals;
  }

  // Exercise Database
  const rawPrimaryMuscle = extractCol('Exercise Database', 2, 3);
  const rawSecondaryMuscle = extractCol('Exercise Database', 3, 3);
  const rawEquipment = extractCol('Exercise Database', 4, 3);
  const rawDifficulty = extractCol('Exercise Database', 5, 3);
  const rawType = extractCol('Exercise Database', 6, 3);

  // Programs Library
  const rawProgCategory = extractCol('Programs Library', 4, 2);
  const rawProgLevel = extractCol('Programs Library', 5, 2);
  const rawProgSplit = extractCol('Programs Library', 8, 2);
  const rawProgFocus = extractCol('Programs Library', 9, 2);
  const rawProgEquipNeeded = extractCol('Programs Library', 12, 2);
  const rawProgStatus = extractCol('Programs Library', 13, 2);

  // Category_Dropdown (original lists)
  const rawCdPrimaryMuscle = extractCol('Category_Dropdown', 1, 2);
  const rawCdSecondaryMuscle = extractCol('Category_Dropdown', 2, 2);
  const rawCdEquipment = extractCol('Category_Dropdown', 3, 2);
  const rawCdDifficulty = extractCol('Category_Dropdown', 4, 2);
  const rawCdType = extractCol('Category_Dropdown', 5, 2);
  const rawCdSplit = extractCol('Category_Dropdown', 9, 2);
  const rawCdFocus = extractCol('Category_Dropdown', 10, 2);
  const rawCdEquipNeeded = extractCol('Category_Dropdown', 11, 2);
  const rawCdGoals = extractCol('Category_Dropdown', 12, 2);
  const rawCdMethods = extractCol('Category_Dropdown', 13, 2);
  const rawCdPrograms = extractCol('Category_Dropdown', 14, 2);

  // STEP sheets
  const rawStep1Items = extractCol('STEP 1 Primary Goal Selection', 3, 1);
  const rawStep2Items = extractCol('STEP 2 Training Method', 3, 1);
  const rawStep3Items = extractCol('STEP 3 Matching Program', 3, 1);
  const rawDbItems = extractCol('database', 3, 1);

  // AzFIT_Training_Goals_Weekly_Str
  const rawTgCategory = extractCol('AzFIT_Training_Goals_Weekly_Str', 0, 1);
  const rawTgGoal = extractCol('AzFIT_Training_Goals_Weekly_Str', 1, 1);
  const rawTgSplit = extractCol('AzFIT_Training_Goals_Weekly_Str', 4, 1);

  // Pipeline columns (goal, method, program from the flattened data)
  const rawPipeGoal = extractCol('Category_Dropdown', 19, 2);
  const rawPipeMethod = extractCol('Category_Dropdown', 20, 2);
  const rawPipeGoal2 = extractCol('Category_Dropdown', 21, 2);
  const rawPipeMethod2 = extractCol('Category_Dropdown', 22, 2);
  const rawPipeProgram = extractCol('Category_Dropdown', 23, 2);

  // ============================================================
  // PHASE 2: Build canonical lists
  // ============================================================
  console.log('\n=== PHASE 2: Building canonical lists ===');

  const canonical = {
    Primary_Muscle: canonicalizeList([
      ...rawPrimaryMuscle, ...rawCdPrimaryMuscle
    ]),
    Secondary_Muscle: canonicalizeList([
      ...rawSecondaryMuscle, ...rawCdSecondaryMuscle
    ]),
    Equipment: canonicalizeList([
      ...rawEquipment, ...rawCdEquipment
    ]),
    Difficulty: canonicalizeList([
      ...rawDifficulty, ...rawCdDifficulty, ...rawProgLevel
    ]),
    Type: canonicalizeList([
      ...rawType, ...rawCdType
    ]),
    Split: canonicalizeList([
      ...rawProgSplit, ...rawCdSplit, ...rawTgSplit
    ]),
    Focus: canonicalizeList([
      ...rawProgFocus, ...rawCdFocus
    ]),
    Equipment_Needed: canonicalizeList([
      ...rawProgEquipNeeded, ...rawCdEquipNeeded
    ]),
    Primary_Goals: canonicalizeList([
      ...rawCdGoals, ...rawStep1Items, ...rawDbItems,
      ...rawPipeGoal, ...rawPipeGoal2, ...rawTgGoal
    ], GOAL_MAPPINGS),
    Training_Methods: canonicalizeList([
      ...rawCdMethods, ...rawStep2Items,
      ...rawPipeMethod, ...rawPipeMethod2
    ], METHOD_MAPPINGS),
    Matching_Programs: canonicalizeList([
      ...rawCdPrograms, ...rawStep3Items, ...rawPipeProgram
    ], PROGRAM_MAPPINGS),
    Program_Category: canonicalizeList([
      ...rawProgCategory
    ]),
    Status: ['Active', 'Archived', 'Draft'],
  };

  // Print canonical lists
  for (const [key, list] of Object.entries(canonical)) {
    console.log(`  ${key}: ${list.length} unique items`);
  }

  // ============================================================
  // PHASE 3: Build reverse lookup (raw -> canonical)
  // ============================================================
  function buildLookup(canonicalList, customMappings = {}) {
    const lookup = {};
    for (const raw of canonicalList) {
      const norm = normalize(raw);
      if (norm) lookup[norm] = raw;
    }
    // Add custom mappings
    for (const [key, val] of Object.entries(customMappings)) {
      lookup[key] = val;
    }
    return lookup;
  }

  const lookups = {
    muscle: buildLookup([...canonical.Primary_Muscle, ...canonical.Secondary_Muscle]),
    equipment: buildLookup(canonical.Equipment),
    difficulty: buildLookup(canonical.Difficulty),
    type: buildLookup(canonical.Type),
    split: buildLookup(canonical.Split),
    focus: buildLookup(canonical.Focus),
    equipNeeded: buildLookup(canonical.Equipment_Needed),
    goal: buildLookup(canonical.Primary_Goals, GOAL_MAPPINGS),
    method: buildLookup(canonical.Training_Methods, METHOD_MAPPINGS),
    program: buildLookup(canonical.Matching_Programs, PROGRAM_MAPPINGS),
    progCategory: buildLookup(canonical.Program_Category),
    status: buildLookup(canonical.Status),
  };

  // ============================================================
  // PHASE 4: Update all data in all sheets
  // ============================================================
  console.log('\n=== PHASE 4: Updating all sheet data to canonical values ===');

  function updateColumn(ws, colLetter, startRow, lookup, label) {
    let changed = 0;
    for (let r = startRow; r <= ws.rowCount; r++) {
      const cell = ws.getRow(r).getCell(colLetter);
      if (cell.value === undefined || cell.value === null || cell.value === '') continue;
      const raw = String(cell.value);
      const norm = normalize(raw);
      if (lookup[norm] && lookup[norm] !== raw) {
        cell.value = lookup[norm];
        changed++;
      }
    }
    console.log(`  ${ws.name} ${colLetter} (${label}): ${changed} cells updated`);
  }

  // Exercise Database
  const ed = wb.getWorksheet('Exercise Database');
  if (ed) {
    updateColumn(ed, 'C', 4, lookups.muscle, 'Primary Muscle');
    updateColumn(ed, 'D', 4, lookups.muscle, 'Secondary Muscle');
    updateColumn(ed, 'E', 4, lookups.equipment, 'Equipment');
    updateColumn(ed, 'F', 4, lookups.difficulty, 'Difficulty');
    updateColumn(ed, 'G', 4, lookups.type, 'Type');
  }

  // Programs Library
  const pl = wb.getWorksheet('Programs Library');
  if (pl) {
    updateColumn(pl, 'E', 3, lookups.progCategory, 'Category');
    updateColumn(pl, 'F', 3, lookups.difficulty, 'Level');
    updateColumn(pl, 'I', 3, lookups.split, 'Split');
    updateColumn(pl, 'J', 3, lookups.focus, 'Focus');
    updateColumn(pl, 'M', 3, lookups.equipNeeded, 'Equipment Needed');
    updateColumn(pl, 'N', 3, lookups.status, 'Status');
  }

  // AzFIT_Training_Goals_Weekly_Str
  const tg = wb.getWorksheet('AzFIT_Training_Goals_Weekly_Str');
  if (tg) {
    updateColumn(tg, 'A', 2, lookups.goal, 'Category');
    updateColumn(tg, 'B', 2, lookups.goal, 'Goal');
    updateColumn(tg, 'E', 2, lookups.split, 'Split');
  }

  // STEP sheets
  const stepConfigs = [
    { name: 'STEP 1 Primary Goal Selection', col: 'D', lookup: lookups.goal, label: 'Goal' },
    { name: 'STEP 2 Training Method', col: 'D', lookup: lookups.method, label: 'Method' },
    { name: 'STEP 3 Matching Program', col: 'D', lookup: lookups.program, label: 'Program' },
    { name: 'database', col: 'D', lookup: lookups.goal, label: 'Goal' },
  ];
  for (const cfg of stepConfigs) {
    const ws = wb.getWorksheet(cfg.name);
    if (ws) updateColumn(ws, cfg.col, 2, cfg.lookup, cfg.label);
  }

  // ============================================================
  // PHASE 5: Create clean Category_Dropdown
  // ============================================================
  console.log('\n=== PHASE 5: Creating clean Category_Dropdown ===');

  const cd = wb.getWorksheet('Category_Dropdown');

  // Remove all rows
  let lastRow = cd.rowCount;
  for (let r = lastRow; r >= 1; r--) {
    cd.spliceRows(r, 1);
  }

  // Define new columns
  const newColumns = [
    { name: 'Primary_Muscle',      list: canonical.Primary_Muscle },
    { name: 'Secondary_Muscle',    list: canonical.Secondary_Muscle },
    { name: 'Equipment',           list: canonical.Equipment },
    { name: 'Difficulty',          list: canonical.Difficulty },
    { name: 'Type',                list: canonical.Type },
    { name: 'Program_Category',    list: canonical.Program_Category },
    { name: 'Split',               list: canonical.Split },
    { name: 'Focus',               list: canonical.Focus },
    { name: 'Equipment_Needed',    list: canonical.Equipment_Needed },
    { name: 'Primary_Goals',       list: canonical.Primary_Goals },
    { name: 'Training_Methods',    list: canonical.Training_Methods },
    { name: 'Matching_Programs',   list: canonical.Matching_Programs },
    { name: 'Status',              list: canonical.Status },
  ];

  // Title row
  cd.getCell('A1').value = 'AzFIT Master Category Lists (Canonical)';
  cd.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF00AEEF' } };
  try { cd.unMergeCells('A1:M1'); } catch(e) {}
  try { cd.unMergeCells('A1'); } catch(e) {}
  cd.mergeCells('A1:M1');

  // Subtitle
  cd.getCell('A2').value = 'All dropdowns across the workbook reference these lists. Edit here to update everywhere.';
  cd.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF888888' } };
  try { cd.unMergeCells('A2:M2'); } catch(e) {}
  try { cd.unMergeCells('A2'); } catch(e) {}
  cd.mergeCells('A2:M2');

  // Header row
  newColumns.forEach((col, idx) => {
    const cell = cd.getRow(3).getCell(idx + 1);
    cell.value = col.name;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A1A' } };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FF00AEEF' } } };
  });

  // Data rows
  const maxLen = Math.max(...newColumns.map(c => c.list.length));
  for (let rowIdx = 0; rowIdx < maxLen; rowIdx++) {
    const row = cd.getRow(rowIdx + 4);
    newColumns.forEach((col, colIdx) => {
      if (rowIdx < col.list.length) {
        row.getCell(colIdx + 1).value = col.list[rowIdx];
      }
    });
  }

  // Store range references
  const refs = {};
  newColumns.forEach((col, idx) => {
    const colLetter = String.fromCharCode(65 + idx);
    const lastDataRow = 3 + col.list.length;
    refs[col.name] = `Category_Dropdown!$${colLetter}$4:$${colLetter}$${lastDataRow}`;
  });

  // Auto-width
  newColumns.forEach((_, idx) => {
    cd.getColumn(idx + 1).width = 40;
  });

  console.log('  Category_Dropdown rebuilt with 13 clean lists');

  // ============================================================
  // PHASE 6: Add data validation to all sheets
  // ============================================================
  console.log('\n=== PHASE 6: Adding data validation ===');

  function addDropdowns(ws, colLetter, startRow, refKey, label, allowBlank = false) {
    if (!ws) return;
    const ref = refs[refKey];
    if (!ref) { console.log(`  WARNING: no ref for ${refKey}`); return; }
    for (let r = startRow; r <= ws.rowCount; r++) {
      ws.getRow(r).getCell(colLetter).dataValidation = {
        type: 'list',
        allowBlank,
        formulae: [`=${ref}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Entry',
        error: `Please select from the ${label} dropdown list.`,
      };
    }
    console.log(`  ${ws.name} ${colLetter} → ${refKey}`);
  }

  // Exercise Database
  addDropdowns(ed, 'C', 4, 'Primary_Muscle', 'Primary Muscle');
  addDropdowns(ed, 'D', 4, 'Secondary_Muscle', 'Secondary Muscle', true);
  addDropdowns(ed, 'E', 4, 'Equipment', 'Equipment');
  addDropdowns(ed, 'F', 4, 'Difficulty', 'Difficulty');
  addDropdowns(ed, 'G', 4, 'Type', 'Type');

  // Programs Library
  addDropdowns(pl, 'E', 3, 'Program_Category', 'Program Category');
  addDropdowns(pl, 'F', 3, 'Difficulty', 'Level');
  addDropdowns(pl, 'I', 3, 'Split', 'Split');
  addDropdowns(pl, 'J', 3, 'Focus', 'Focus');
  addDropdowns(pl, 'M', 3, 'Equipment_Needed', 'Equipment Needed');
  addDropdowns(pl, 'N', 3, 'Status', 'Status');

  // AzFIT_Training_Goals_Weekly_Str
  addDropdowns(tg, 'A', 2, 'Primary_Goals', 'Category');
  addDropdowns(tg, 'B', 2, 'Primary_Goals', 'Goal');
  addDropdowns(tg, 'E', 2, 'Split', 'Split');

  // STEP sheets
  const stepCfgs = [
    { name: 'STEP 1 Primary Goal Selection', col: 'D', ref: 'Primary_Goals', label: 'Goal' },
    { name: 'STEP 2 Training Method', col: 'D', ref: 'Training_Methods', label: 'Method' },
    { name: 'STEP 3 Matching Program', col: 'D', ref: 'Matching_Programs', label: 'Program' },
    { name: 'database', col: 'D', ref: 'Primary_Goals', label: 'Goal' },
  ];
  for (const cfg of stepCfgs) {
    const ws = wb.getWorksheet(cfg.name);
    addDropdowns(ws, cfg.col, 2, cfg.ref, cfg.label);
  }

  // ============================================================
  // PHASE 7: Create Pipeline_Links sheet
  // ============================================================
  console.log('\n=== PHASE 7: Creating Pipeline_Links sheet ===');

  const xcd = xwb.Sheets['Category_Dropdown'];
  const xcdData = XLSX.utils.sheet_to_json(xcd, {header:1});

  const pipelineHeaders = [];
  const headerRow = xcdData[1] || [];
  for (let c = 15; c < 32; c++) {
    pipelineHeaders.push(headerRow[c] || '');
  }

  const pipelineRows = [];
  for (let r = 2; r < xcdData.length; r++) {
    const row = xcdData[r];
    if (!row) continue;
    let hasData = false;
    for (let c = 15; c < 32; c++) {
      if (row[c] !== undefined && row[c] !== null && row[c] !== '') {
        hasData = true;
        break;
      }
    }
    if (!hasData) continue;

    const rowData = [];
    for (let c = 15; c < 32; c++) {
      rowData.push(row[c] !== undefined ? row[c] : '');
    }
    pipelineRows.push(rowData);
  }

  // Canonicalize pipeline data
  for (const row of pipelineRows) {
    for (let i = 0; i < row.length; i++) {
      const val = String(row[i] || '').trim();
      if (!val) continue;
      const norm = normalize(val);
      // Try goal mapping
      if (lookups.goal[norm]) row[i] = lookups.goal[norm];
      // Try method mapping
      else if (lookups.method[norm]) row[i] = lookups.method[norm];
      // Try program mapping
      else if (lookups.program[norm]) row[i] = lookups.program[norm];
    }
  }

  // Remove existing Pipeline_Links
  const existingPl = wb.getWorksheet('Pipeline_Links');
  if (existingPl) wb.removeWorksheet(existingPl.id);

  const plSheet = wb.addWorksheet('Pipeline_Links');
  plSheet.getCell('A1').value = 'Goal → Method → Program Pipeline Links (Canonical)';
  plSheet.getCell('A1').font = { bold: true, size: 12, color: { argb: 'FF00AEEF' } };

  const cleanHeaders = pipelineHeaders.map(h => String(h).trim());
  cleanHeaders.forEach((h, idx) => {
    const cell = plSheet.getRow(2).getCell(idx + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A1A' } };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FF00AEEF' } } };
  });

  for (let i = 0; i < pipelineRows.length; i++) {
    const row = plSheet.getRow(i + 3);
    pipelineRows[i].forEach((val, idx) => {
      if (val !== undefined && val !== null && val !== '') {
        row.getCell(idx + 1).value = val;
      }
    });
  }

  for (let c = 1; c <= 8; c++) {
    plSheet.getColumn(c).width = 30;
  }

  console.log(`  Pipeline_Links: ${pipelineRows.length} rows`);

  // ============================================================
  // PHASE 8: Save
  // ============================================================
  console.log('\n=== PHASE 8: Saving ===');
  await wb.xlsx.writeFile(OUTPUT_FILE);

  const stats = fs.statSync(OUTPUT_FILE);
  console.log(`\n✅ DONE! Saved to: ${OUTPUT_FILE}`);
  console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  console.log(`\n📋 CANONICAL LISTS SUMMARY:`);
  for (const [key, list] of Object.entries(canonical)) {
    console.log(`   ${key}: ${list.length} items`);
  }

  console.log(`\n💡 HOW TO UPDATE DROPDOWNS:`);
  console.log(`   1. Open in Excel or Google Sheets`);
  console.log(`   2. Go to Category_Dropdown sheet`);
  console.log(`   3. Edit any list (columns A-M, rows 4+)`);
  console.log(`   4. All dropdowns auto-sync via =Category_Dropdown!$Col$4:$Col$Last`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
