import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle } from 'lucide-react';
import type { Exercise } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Exercise>) => void;
  exercise: Exercise | null;
}

const EXERCISE_LIBRARY = [
  { name: 'Barbell Back Squat', muscle: 'Quads/Glutes', scheme: '4×6' },
  { name: 'Romanian Deadlift', muscle: 'Hamstrings/Glutes', scheme: '3×8' },
  { name: 'Bench Press', muscle: 'Chest/Triceps', scheme: '4×6' },
  { name: 'Overhead Press', muscle: 'Shoulders', scheme: '4×6' },
  { name: 'Pull-Up', muscle: 'Back/Biceps', scheme: '4×8' },
  { name: 'Barbell Row', muscle: 'Back/Biceps', scheme: '4×8' },
  { name: 'Walking Lunges', muscle: 'Quads', scheme: '3×12' },
  { name: 'Leg Curl (Machine)', muscle: 'Hamstrings', scheme: '3×10' },
  { name: 'Dumbbell Lateral Raise', muscle: 'Shoulders', scheme: '3×12' },
  { name: 'Cable Tricep Pushdown', muscle: 'Triceps', scheme: '3×12' },
  { name: 'Incline Dumbbell Press', muscle: 'Chest/Shoulders', scheme: '4×8' },
  { name: 'Hip Thrust', muscle: 'Glutes', scheme: '4×8' },
];

export default function EditExerciseModal({ open, onClose, onSave, exercise }: Props) {
  const [mode, setMode] = useState<'similar' | 'different'>('similar');
  const [selected, setSelected] = useState('');
  const [scheme, setScheme] = useState('');
  const [target, setTarget] = useState('');

  useEffect(() => {
    if (exercise) {
      setScheme(exercise.scheme);
      setTarget(exercise.target);
    }
  }, [exercise]);

  const handleSave = () => {
    const updates: Partial<Exercise> = {};

    if (mode === 'different' && selected) {
      const ex = EXERCISE_LIBRARY.find(e => e.name === selected);
      if (ex) {
        updates.name = ex.name;
        updates.muscleGroup = ex.muscle;
        updates.scheme = ex.scheme;
        updates.sets = Array.from({ length: parseInt(ex.scheme.split('×')[0]) }, (_, i) => ({
          set: i + 1,
          prescribed: `${ex.scheme} @ ${target} kg`,
          clientLoad: '',
          load: '',
          reps: ex.scheme.split('×')[1] || '',
          rpe: '',
          rest: '180',
          type: 'Normal' as const,
          done: 'empty' as const,
        }));
      }
    }

    if (scheme !== exercise?.scheme) updates.scheme = scheme;
    if (target !== exercise?.target) updates.target = target;

    onSave(updates);
    onClose();
  };

  if (!exercise) return null;

  const similarExercises = EXERCISE_LIBRARY.filter(ex =>
    ex.muscle === exercise.muscleGroup || ex.muscle.includes(exercise.muscleGroup)
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-[#141414] border-[#00AEEF]/20 shadow-[0_0_40px_rgba(0,174,239,0.08)]">
        <DialogHeader>
          <DialogTitle className="text-[#00AEEF] text-lg font-semibold">
            Edit Exercise: {exercise.name}
          </DialogTitle>
        </DialogHeader>

        {/* Scheme & Target */}
        <div className="grid grid-cols-2 gap-3 py-2">
          <div>
            <Label className="text-[#A0A0A0] text-xs uppercase tracking-wider">Scheme</Label>
            <input
              type="text"
              value={scheme}
              onChange={(e) => setScheme(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-[#0A0A0A]/50 border border-[#2A2A2A] text-[#F0F0F0] text-sm focus:border-[#00AEEF] focus:outline-none"
            />
          </div>
          <div>
            <Label className="text-[#A0A0A0] text-xs uppercase tracking-wider">Target (kg)</Label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-[#0A0A0A]/50 border border-[#2A2A2A] text-[#F0F0F0] text-sm focus:border-[#00AEEF] focus:outline-none"
            />
          </div>
        </div>

        <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'similar' | 'different')}>
          {/* Similar exercises */}
          <div className="flex items-start space-x-3 rounded-lg border border-[#2A2A2A]/50 p-3 bg-[#0A0A0A]/30">
            <RadioGroupItem value="similar" id="similar" className="mt-1 border-[#6B6B6B] data-[state=checked]:border-[#00AEEF] data-[state=checked]:bg-[#00AEEF]" />
            <div className="flex-1">
              <Label htmlFor="similar" className="text-[#F0F0F0] font-semibold text-sm cursor-pointer">
                Keep Similar Exercise
              </Label>
              <p className="text-[#6B6B6B] text-xs mt-0.5">
                Replace with a similar exercise targeting {exercise.muscleGroup}
              </p>
              {mode === 'similar' && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {similarExercises.map((ex) => (
                    <button
                      key={ex.name}
                      onClick={() => setSelected(ex.name)}
                      className={`text-left p-2 rounded-lg border text-xs transition-all ${
                        selected === ex.name
                          ? 'border-[#00AEEF] bg-[#00AEEF]/10 shadow-[0_0_12px_rgba(0,174,239,0.15)]'
                          : 'border-[#2A2A2A]/50 bg-[#0A0A0A]/30 hover:border-[#374151] hover:bg-[#1F2937]/50'
                      }`}
                    >
                      <div className="text-[#F0F0F0] text-sm font-medium">{ex.name}</div>
                      <div className="text-[#00AEEF] text-xs mt-0.5">{ex.scheme}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Different exercises */}
          <div className="flex items-start space-x-3 rounded-lg border border-[#2A2A2A]/50 p-3 bg-[#0A0A0A]/30 mt-2">
            <RadioGroupItem value="different" id="different" className="mt-1 border-[#6B6B6B] data-[state=checked]:border-[#00AEEF] data-[state=checked]:bg-[#00AEEF]" />
            <div className="flex-1">
              <Label htmlFor="different" className="text-[#F0F0F0] font-semibold text-sm cursor-pointer">
                Different Muscle Group
              </Label>
              <p className="text-[#6B6B6B] text-xs mt-0.5">
                Replace with an exercise targeting a different muscle group
              </p>
              {mode === 'different' && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {EXERCISE_LIBRARY.filter(ex => !similarExercises.includes(ex)).map((ex) => (
                    <button
                      key={ex.name}
                      onClick={() => setSelected(ex.name)}
                      className={`text-left p-2 rounded-lg border text-xs transition-all ${
                        selected === ex.name
                          ? 'border-[#00AEEF] bg-[#00AEEF]/10 shadow-[0_0_12px_rgba(0,174,239,0.15)]'
                          : 'border-[#2A2A2A]/50 bg-[#0A0A0A]/30 hover:border-[#374151] hover:bg-[#1F2937]/50'
                      }`}
                    >
                      <div className="text-[#F0F0F0] text-sm font-medium">{ex.name}</div>
                      <div className="text-[#00AEEF] text-xs mt-0.5">{ex.scheme}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </RadioGroup>

        {/* Warning */}
        {mode === 'different' && (
          <div className="flex items-center gap-2 text-[#EAB308] text-xs bg-[#EAB308]/5 rounded-lg p-2.5">
            <AlertTriangle size={14} />
            <span>Changing muscle groups will reset your set data for this exercise.</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 pt-2 border-t border-[#2A2A2A]/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 bg-[#1F2937] border-[#2A2A2A] text-[#D1D5DB] hover:bg-[#374151] hover:text-[#F0F0F0]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-10 bg-gradient-to-r from-[#00AEEF] to-[#A855F7] text-white font-semibold hover:opacity-90 disabled:opacity-40"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
