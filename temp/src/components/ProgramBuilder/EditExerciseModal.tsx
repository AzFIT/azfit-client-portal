import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Exercise } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (newExercise: Partial<Exercise>) => void;
  exercise: Exercise | null;
}

// Similar exercises by muscle group
const SIMILAR_EXERCISES: Record<string, Array<{ name: string; scheme: string }>> = {
  'Quads, Glutes': [
    { name: 'Leg Press', scheme: '3×10' },
    { name: 'Hack Squat', scheme: '4×6' },
    { name: 'Front Squat', scheme: '4×6' },
    { name: 'Goblet Squat', scheme: '3×10' },
    { name: 'Pendulum Squat', scheme: '3×12' },
    { name: 'Belt Squat', scheme: '4×6' },
  ],
  'Hamstrings, Glutes': [
    { name: 'Good Morning', scheme: '3×8' },
    { name: 'Single-Leg RDL', scheme: '3×10' },
    { name: '45° Hyperextension', scheme: '3×12' },
    { name: 'Reverse Hyper', scheme: '3×15' },
    { name: 'Nordic Curl', scheme: '3×6' },
    { name: 'Glute-Ham Raise', scheme: '3×8' },
  ],
  'Quads': [
    { name: 'Leg Extension', scheme: '3×12' },
    { name: 'Bulgarian Split Squat', scheme: '3×10' },
    { name: 'Step-up', scheme: '3×12' },
    { name: 'Sissy Squat', scheme: '3×10' },
    { name: 'Terminal Knee Extension', scheme: '3×15' },
    { name: 'Cyclist Squat', scheme: '3×10' },
  ],
  'Hamstrings': [
    { name: 'Lying Leg Curl', scheme: '3×12' },
    { name: 'Seated Leg Curl', scheme: '3×10' },
    { name: 'Standing Leg Curl', scheme: '3×12' },
    { name: 'Slider Curl', scheme: '3×10' },
    { name: 'Swiss Ball Curl', scheme: '3×12' },
    { name: 'Razor Curl', scheme: '3×8' },
  ],
  'Chest': [
    { name: 'Dumbbell Bench Press', scheme: '3×8' },
    { name: 'Incline Bench Press', scheme: '3×8' },
    { name: 'Cable Fly', scheme: '3×12' },
    { name: 'Machine Chest Press', scheme: '3×10' },
    { name: 'Dips', scheme: '3×10' },
    { name: 'Floor Press', scheme: '3×8' },
  ],
  'Back': [
    { name: 'Pull-Up', scheme: '3×8' },
    { name: 'Barbell Row', scheme: '3×8' },
    { name: 'Cable Row', scheme: '3×10' },
    { name: 'Lat Pulldown', scheme: '3×10' },
    { name: 'Chest-Supported Row', scheme: '3×10' },
    { name: 'Meadows Row', scheme: '3×10' },
  ],
  'Shoulders': [
    { name: 'Overhead Press', scheme: '3×8' },
    { name: 'Dumbbell Shoulder Press', scheme: '3×8' },
    { name: 'Lateral Raise', scheme: '3×15' },
    { name: 'Face Pull', scheme: '3×15' },
    { name: 'Arnold Press', scheme: '3×10' },
    { name: 'Upright Row', scheme: '3×10' },
  ],
  'Arms': [
    { name: 'Barbell Curl', scheme: '3×10' },
    { name: 'Skullcrusher', scheme: '3×10' },
    { name: 'Hammer Curl', scheme: '3×10' },
    { name: 'Pushdown', scheme: '3×12' },
    { name: 'Preacher Curl', scheme: '3×10' },
    { name: 'Overhead Extension', scheme: '3×10' },
  ],
  'Calves': [
    { name: 'Standing Calf Raise', scheme: '3×15' },
    { name: 'Seated Calf Raise', scheme: '3×15' },
    { name: 'Leg Press Calf Raise', scheme: '3×15' },
    { name: 'Donkey Calf Raise', scheme: '3×15' },
    { name: 'Single-Leg Calf Raise', scheme: '3×12' },
    { name: 'Tibialis Raise', scheme: '3×15' },
  ],
  'Core': [
    { name: 'Ab Wheel', scheme: '3×10' },
    { name: 'Hanging Leg Raise', scheme: '3×12' },
    { name: 'Pallof Press', scheme: '3×12' },
    { name: 'Dead Bug', scheme: '3×10' },
    { name: 'Cable Crunch', scheme: '3×15' },
    { name: 'Dragon Flag', scheme: '3×6' },
  ],
};

const DEFAULT_MUSCLE = 'Quads, Glutes';

export default function EditExerciseModal({ open, onClose, onSave, exercise }: Props) {
  const [mode, setMode] = useState<'similar' | 'different'>('similar');
  const [selectedName, setSelectedName] = useState('');

  if (!exercise) return null;

  const muscleGroup = exercise.muscleGroup || DEFAULT_MUSCLE;
  const suggestions = SIMILAR_EXERCISES[muscleGroup] || SIMILAR_EXERCISES[DEFAULT_MUSCLE];

  const handleSave = () => {
    if (mode === 'similar' && selectedName) {
      onSave({ name: selectedName });
    } else if (mode === 'different' && selectedName) {
      onSave({ name: selectedName });
    }
    setSelectedName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-[var(--black-card)] border-[var(--cyan)]/20 shadow-[0_0_40px_rgba(0,174,239,0.08)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--cyan)] text-lg font-semibold">
            Edit Exercise — {exercise.name}
          </DialogTitle>
        </DialogHeader>

        {/* Mode Selection */}
        <RadioGroup
          value={mode}
          onValueChange={(v) => { setMode(v as 'similar' | 'different'); setSelectedName(''); }}
          className="space-y-3"
        >
          <div className="flex items-start space-x-3 rounded-lg border border-[var(--gray-700)]/50 p-3 bg-[var(--black)]/30">
            <RadioGroupItem value="similar" id="similar" className="mt-1 border-[var(--gray-500)] data-[state=checked]:border-[var(--cyan)] data-[state=checked]:bg-[var(--cyan)]" />
            <div className="flex-1">
              <Label htmlFor="similar" className="text-[var(--white)] font-semibold text-sm cursor-pointer">
                Replace with Similar
              </Label>
              <p className="text-[var(--gray-500)] text-xs mt-0.5">
                Target: {muscleGroup}
              </p>
            </div>
          </div>

          {mode === 'similar' && (
            <div className="grid grid-cols-2 gap-2 pl-7">
              {suggestions.map((ex) => (
                <button
                  key={ex.name}
                  onClick={() => setSelectedName(ex.name)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedName === ex.name
                      ? 'border-[var(--cyan)] bg-[var(--cyan)]/10 shadow-[0_0_12px_rgba(0,174,239,0.15)]'
                      : 'border-[var(--gray-700)]/50 bg-[var(--black)]/30 hover:border-[var(--gray-600)] hover:bg-[var(--gray-800)]/50'
                  }`}
                >
                  <div className="text-[var(--white)] text-sm font-medium">{ex.name}</div>
                  <div className="text-[var(--cyan)] text-xs mt-0.5">{ex.scheme}</div>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-start space-x-3 rounded-lg border border-[var(--gray-700)]/50 p-3 bg-[var(--black)]/30">
            <RadioGroupItem value="different" id="different" className="mt-1 border-[var(--gray-500)] data-[state=checked]:border-[var(--cyan)] data-[state=checked]:bg-[var(--cyan)]" />
            <div className="flex-1">
              <Label htmlFor="different" className="text-[var(--white)] font-semibold text-sm cursor-pointer">
                Replace with Different
              </Label>
              <p className="text-[var(--gray-500)] text-xs mt-0.5">
                Full exercise library search
              </p>
            </div>
          </div>
        </RadioGroup>

        {/* Warning */}
        {selectedName && (
          <div className="flex items-center gap-2 text-[var(--warning)] text-xs bg-[var(--warning)]/5 rounded-lg p-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            This change will update your program phase automatically.
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 pt-2 border-t border-[var(--gray-700)]/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 bg-[var(--gray-800)] border-[var(--gray-700)] text-[var(--gray-300)] hover:bg-[var(--gray-700)] hover:text-[var(--white)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedName}
            className="flex-1 h-10 bg-gradient-to-r from-[var(--cyan)] to-[var(--admin-accent)] text-white font-semibold hover:opacity-90 disabled:opacity-40"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
