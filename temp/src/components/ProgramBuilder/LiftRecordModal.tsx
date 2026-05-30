import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LiftRecord } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (records: Record<string, LiftRecord>) => void;
  exerciseName: string;
  exerciseId: string;
  existingRecords: Record<string, LiftRecord>;
}

const DEFAULT_REPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];

export default function LiftRecordModal({
  open,
  onClose,
  onSave,
  exerciseName,
  existingRecords,
}: Props) {
  const [records, setRecords] = useState<Record<string, LiftRecord>>({});

  useEffect(() => {
    if (open) {
      setRecords({ ...existingRecords });
    }
  }, [open, existingRecords]);

  // Compute inherited values
  const computeDisplay = (): Record<number, { val: string; date: string; inherited: boolean }> => {
    const result: Record<number, { val: string; date: string; inherited: boolean }> = {};
    let lastVal = '';
    let lastDate = '';

    for (let i = 1; i <= 12; i++) {
      const key = String(i);
      if (records[key]) {
        lastVal = records[key].val;
        lastDate = records[key].date;
        result[i] = { val: lastVal, date: lastDate, inherited: false };
      } else if (lastVal) {
        result[i] = { val: lastVal, date: 'Inherited', inherited: true };
      } else {
        result[i] = { val: '', date: '', inherited: false };
      }
    }
    return result;
  };

  const display = computeDisplay();

  const handleChange = (rep: number, val: string) => {
    const key = String(rep);
    if (val.trim()) {
      setRecords(prev => ({
        ...prev,
        [key]: {
          val: val.trim(),
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        },
      }));
    } else {
      setRecords(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSave = () => {
    onSave(records);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-[var(--black-card)] border-[var(--cyan)]/20 dark:border-[var(--cyan)]/20 border shadow-[0_0_40px_rgba(0,174,239,0.08)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--cyan)] text-lg font-semibold">
            {exerciseName} — Lift Records
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {/* Header */}
          <div className="grid grid-cols-[32px_1fr_110px] gap-3 px-1">
            <span className="text-[11px] font-semibold text-[var(--gray-500)] uppercase tracking-wider text-right">Rep</span>
            <span className="text-[11px] font-semibold text-[var(--gray-500)] uppercase tracking-wider">Weight (kg)</span>
            <span className="text-[11px] font-semibold text-[var(--gray-500)] uppercase tracking-wider">Date</span>
          </div>

          {/* Rows */}
          {DEFAULT_REPS.map((rep) => {
            const d = display[rep];
            const isExplicit = !!records[String(rep)];
            const isNewPR = isExplicit && d.val && Object.values(records).length > 0;

            return (
              <div
                key={rep}
                className={`grid grid-cols-[32px_1fr_110px] gap-3 items-center px-1 py-1 rounded-lg transition-colors ${
                  isExplicit ? 'bg-[var(--cyan)]/5' : ''
                } ${isNewPR ? 'ring-1 ring-[var(--warning)]/50' : ''}`}
              >
                <span className="text-[13px] font-semibold text-[var(--gray-500)] text-right">{rep}</span>
                <Input
                  type="text"
                  defaultValue={d.val}
                  placeholder="—"
                  onChange={(e) => handleChange(rep, e.target.value)}
                  className={`h-9 text-[14px] font-medium bg-[var(--black)]/50 border-[var(--gray-700)] focus:border-[var(--cyan)] focus:ring-[var(--cyan)]/20 text-[var(--white)] ${
                    d.inherited ? 'opacity-50' : ''
                  }`}
                />
                <span
                  className={`text-[11px] truncate ${
                    d.inherited
                      ? 'text-[var(--gray-500)] italic'
                      : d.date
                      ? 'text-[var(--gray-400)]'
                      : 'text-[var(--gray-600)] italic'
                  }`}
                >
                  {d.date || 'No record'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-2 border-t border-[var(--gray-700)]/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 bg-[var(--gray-800)] border-[var(--gray-700)] text-[var(--gray-300)] hover:bg-[var(--gray-700)] hover:text-[var(--white)]"
          >
            Close
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-10 bg-gradient-to-r from-[var(--cyan)] to-[var(--admin-accent)] text-white font-semibold hover:opacity-90"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
