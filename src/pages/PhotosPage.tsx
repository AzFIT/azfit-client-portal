import { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Upload,
  X,
  Columns2,
  Download,
  ChevronLeft,
  ChevronRight,
  Star,
  Trophy,
  Trash2,
  CalendarDays,
  Clock,
  Folder,
  Filter,
  ArrowUpDown,
  MessageSquare,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import EmptyState from '../components/EmptyState'

/* ═══════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════ */

type PhotoCategory = 'Front' | 'Back' | 'Side' | 'Other'

interface ProgressPhoto {
  id: string
  clientId: string
  url: string
  thumbnailUrl: string
  date: string
  category: PhotoCategory
  notes?: string
  weight?: number
  bodyFatPercentage?: number
  trainerNotes?: string
  isMilestone?: boolean
  isGoalAchieved?: boolean
  createdAt: string
  updatedAt: string
}

interface UploadFile {
  id: string
  file: File
  preview: string
  category: PhotoCategory
  date: string
  weight: string
  bodyFat: string
  notes: string
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
}

/* ═══════════════════════════════════════════════════════════
   Demo Data — 8 Progress Photos for Sarah Johnson
   ═══════════════════════════════════════════════════════════ */

const demoPhotos: ProgressPhoto[] = [
  {
    id: '1', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
    date: '2026-01-15', category: 'Front',
    weight: 78.0, bodyFatPercentage: 22.0,
    notes: 'Starting point', trainerNotes: '',
    isMilestone: false, isGoalAchieved: false,
    createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '2', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80',
    date: '2026-01-29', category: 'Back',
    weight: 77.2, bodyFatPercentage: 21.5,
    notes: '', trainerNotes: '',
    isMilestone: false, isGoalAchieved: false,
    createdAt: '2026-01-29T10:00:00Z', updatedAt: '2026-01-29T10:00:00Z',
  },
  {
    id: '3', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80',
    date: '2026-02-12', category: 'Side',
    weight: 76.5, bodyFatPercentage: 20.8,
    notes: '2 weeks progress', trainerNotes: '',
    isMilestone: false, isGoalAchieved: false,
    createdAt: '2026-02-12T10:00:00Z', updatedAt: '2026-02-12T10:00:00Z',
  },
  {
    id: '4', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80',
    date: '2026-02-26', category: 'Front',
    weight: 75.8, bodyFatPercentage: 20.0,
    notes: 'Visible changes', trainerNotes: '',
    isMilestone: false, isGoalAchieved: false,
    createdAt: '2026-02-26T10:00:00Z', updatedAt: '2026-02-26T10:00:00Z',
  },
  {
    id: '5', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
    date: '2026-03-11', category: 'Back',
    weight: 75.0, bodyFatPercentage: 19.2,
    notes: '', trainerNotes: '',
    isMilestone: false, isGoalAchieved: false,
    createdAt: '2026-03-11T10:00:00Z', updatedAt: '2026-03-11T10:00:00Z',
  },
  {
    id: '6', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80',
    date: '2026-03-25', category: 'Side',
    weight: 74.2, bodyFatPercentage: 18.5,
    notes: 'Month 2 check-in', trainerNotes: '',
    isMilestone: false, isGoalAchieved: false,
    createdAt: '2026-03-25T10:00:00Z', updatedAt: '2026-03-25T10:00:00Z',
  },
  {
    id: '7', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80',
    date: '2026-04-08', category: 'Front',
    weight: 73.0, bodyFatPercentage: 17.0,
    notes: 'Almost there', trainerNotes: '',
    isMilestone: false, isGoalAchieved: false,
    createdAt: '2026-04-08T10:00:00Z', updatedAt: '2026-04-08T10:00:00Z',
  },
  {
    id: '8', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1583454155184-870a1f63aebc?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454155184-870a1f63aebc?w=400&q=80',
    date: '2026-04-15', category: 'Front',
    weight: 72.0, bodyFatPercentage: 15.0,
    notes: 'Goal achieved!', trainerNotes: 'Amazing transformation! Client hit all targets.',
    isMilestone: true, isGoalAchieved: true,
    createdAt: '2026-04-15T10:00:00Z', updatedAt: '2026-04-15T10:00:00Z',
  },
]

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ═══════════════════════════════════════════════════════════
   Helper: Format date DD/MM/YYYY
   ═══════════════════════════════════════════════════════════ */

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function daysBetween(a: string, b: string): number {
  const d1 = new Date(a)
  const d2 = new Date(b)
  return Math.abs(Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
}

/* ═══════════════════════════════════════════════════════════
   Stats Bar
   ═══════════════════════════════════════════════════════════ */

function StatsBar({ photos }: { photos: ProgressPhoto[] }) {
  const stats = useMemo(() => {
    const first = photos.length > 0 ? photos[photos.length - 1].date : ''
    const latest = photos.length > 0 ? photos[0].date : ''
    const cats = new Set(photos.map((p) => p.category))
    return {
      total: photos.length,
      first: first ? fmtDate(first) : '-',
      firstRaw: first,
      latest: latest ? fmtDate(latest) : '-',
      days: first ? daysBetween(first, new Date().toISOString().slice(0, 10)) : 0,
      categories: `${cats.size}/4`,
    }
  }, [photos])

  const items = [
    { label: 'Total Photos', value: String(stats.total), icon: Camera },
    { label: 'Tracking Since', value: stats.first, icon: CalendarDays },
    { label: 'Days Tracked', value: `${stats.days} days`, icon: Clock },
    { label: 'Latest Upload', value: stats.latest, icon: Upload },
    { label: 'Categories', value: stats.categories, icon: Folder },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {items.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease }}
          className="bg-[#141414] border border-[#2A2A2A] rounded-xl px-5 py-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <s.icon size={16} className="text-[#00AEEF]" />
            <span className="text-[#6B6B6B] text-xs">{s.label}</span>
          </div>
          <p className="text-[#F0F0F0] font-semibold text-lg font-mono">{s.value}</p>
        </motion.div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Upload Modal
   ═══════════════════════════════════════════════════════════ */

function UploadModal({ open, onClose, onUpload }: { open: boolean; onClose: () => void; onUpload: (photos: ProgressPhoto[]) => void }) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    )
    addFiles(dropped)
  }, [])

  const addFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > 10) {
      alert('Maximum 10 files per upload')
      return
    }
    const uploads: UploadFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
      category: 'Front',
      date: new Date().toISOString().slice(0, 10),
      weight: '',
      bodyFat: '',
      notes: '',
      progress: 0,
      status: 'pending',
    }))
    setFiles((prev) => [...prev, ...uploads])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const updateFile = (id: string, updates: Partial<UploadFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const handleUpload = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, status: 'uploading' as const })))

    // Simulate upload progress
    const interval = setInterval(() => {
      setFiles((prev) => {
        const allDone = prev.every((f) => f.progress >= 100)
        if (allDone) {
          clearInterval(interval)
          const newPhotos: ProgressPhoto[] = prev.map((f, idx) => ({
            id: `upload-${Date.now()}-${idx}`,
            clientId: 'sarah-johnson',
            url: f.preview,
            thumbnailUrl: f.preview,
            date: f.date,
            category: f.category,
            notes: f.notes || undefined,
            weight: f.weight ? parseFloat(f.weight) : undefined,
            bodyFatPercentage: f.bodyFat ? parseFloat(f.bodyFat) : undefined,
            trainerNotes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
          setTimeout(() => {
            onUpload(newPhotos)
            setFiles([])
            onClose()
          }, 500)
          return prev.map((f) => ({ ...f, status: 'done' as const, progress: 100 }))
        }
        return prev.map((f) => ({
          ...f,
          progress: Math.min(100, f.progress + 10 + Math.random() * 20),
        }))
      })
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setFiles([]); onClose() } }}>
      <DialogContent className="bg-[#141414] border-[#2A2A2A] text-[#F0F0F0] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Upload Progress Photos</DialogTitle>
        </DialogHeader>

        {/* Drop Zone */}
        {files.length === 0 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.08)] scale-[1.02]'
                : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#3A3A3A]'
            }`}
          >
            <Upload size={40} className="mx-auto text-[#6B6B6B] mb-3" />
            <p className="text-[#A0A0A0] text-sm mb-1">Drag photos here or click to browse</p>
            <p className="text-[#6B6B6B] text-xs">JPG, PNG, WebP up to 5MB each (max 10 files)</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
            />
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3 mt-4">
            {files.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[#1A1A1A] border rounded-xl p-3 space-y-3 ${
                  f.status === 'error' ? 'border-[#EF4444]' : 'border-[#2A2A2A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={f.preview} alt="" className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F0F0F0] text-sm truncate">{f.file.name}</p>
                    <p className="text-[#6B6B6B] text-xs">{(f.file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  {f.status === 'done' && <Check size={18} className="text-[#22C55E]" />}
                  {f.status === 'error' && <AlertTriangle size={18} className="text-[#EF4444]" />}
                  <Button variant="ghost" size="icon" className="text-[#6B6B6B] hover:text-[#EF4444]" onClick={() => removeFile(f.id)}>
                    <X size={16} />
                  </Button>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[#6B6B6B] text-[10px]">Category</Label>
                    <Select value={f.category} onValueChange={(v) => updateFile(f.id, { category: v as PhotoCategory })}>
                      <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-[#F0F0F0] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                        {(['Front', 'Back', 'Side', 'Other'] as const).map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#6B6B6B] text-[10px]">Date</Label>
                    <Input
                      type="date"
                      value={f.date}
                      onChange={(e) => updateFile(f.id, { date: e.target.value })}
                      className="bg-[#141414] border-[#2A2A2A] text-[#F0F0F0] h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[#6B6B6B] text-[10px]">Weight (kg)</Label>
                    <Input
                      type="number"
                      value={f.weight}
                      onChange={(e) => updateFile(f.id, { weight: e.target.value })}
                      placeholder="78.0"
                      className="bg-[#141414] border-[#2A2A2A] text-[#F0F0F0] h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[#6B6B6B] text-[10px]">Body Fat %</Label>
                    <Input
                      type="number"
                      value={f.bodyFat}
                      onChange={(e) => updateFile(f.id, { bodyFat: e.target.value })}
                      placeholder="22.0"
                      className="bg-[#141414] border-[#2A2A2A] text-[#F0F0F0] h-8 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[#6B6B6B] text-[10px]">Notes</Label>
                  <Textarea
                    value={f.notes}
                    onChange={(e) => updateFile(f.id, { notes: e.target.value })}
                    placeholder="Optional notes..."
                    className="bg-[#141414] border-[#2A2A2A] text-[#F0F0F0] min-h-[50px] text-xs"
                  />
                </div>

                {f.status === 'uploading' && (
                  <Progress value={f.progress} className="h-1 bg-[#0A0A0A] [&>div]:bg-[#00AEEF]" />
                )}
              </motion.div>
            ))}

            {/* Add more files */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-[#2A2A2A] rounded-xl text-[#6B6B6B] text-sm hover:border-[#00AEEF] hover:text-[#00AEEF] transition-colors"
            >
              + Add more files
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
            />

            {/* Progress */}
            {files.some((f) => f.status === 'uploading') && (
              <div className="pt-2">
                <p className="text-[#6B6B6B] text-xs mb-1">
                  Uploading... {Math.round(files.reduce((acc, f) => acc + f.progress, 0) / files.length)}%
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" className="text-[#A0A0A0]" onClick={() => { setFiles([]); onClose() }}>Cancel</Button>
              <Button
                className="bg-[#00AEEF] hover:bg-[#009BD6] text-white"
                onClick={handleUpload}
                disabled={files.length === 0 || files.some((f) => f.status === 'uploading')}
              >
                Upload {files.length} Photo{files.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ═══════════════════════════════════════════════════════════
   Lightbox / Annotation Modal
   ═══════════════════════════════════════════════════════════ */

function Lightbox({
  photo,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onUpdate,
}: {
  photo: ProgressPhoto
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
  onUpdate: (id: string, updates: Partial<ProgressPhoto>) => void
}) {
  const [trainerNotes, setTrainerNotes] = useState(photo.trainerNotes || '')
  const [isMilestone, setIsMilestone] = useState(photo.isMilestone || false)
  const [isGoalAchieved, setIsGoalAchieved] = useState(photo.isGoalAchieved || false)

  const handleSave = () => {
    onUpdate(photo.id, { trainerNotes, isMilestone, isGoalAchieved })
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0A0A0A] border-[#2A2A2A] text-[#F0F0F0] max-w-5xl max-h-[95vh] overflow-hidden p-0">
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Image Area */}
          <div className="flex-1 bg-[#0A0A0A] flex items-center justify-center relative min-h-[300px] lg:min-h-0">
            <img src={photo.url} alt="" className="max-w-full max-h-[60vh] lg:max-h-[85vh] object-contain" />

            {/* Nav buttons */}
            {hasPrev && (
              <button
                onClick={onPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
            >
              <X size={16} />
            </button>
          </div>

          {/* Sidebar Info */}
          <div className="w-full lg:w-[300px] border-t lg:border-t-0 lg:border-l border-[#2A2A2A] bg-[#141414] p-5 overflow-y-auto max-h-[40vh] lg:max-h-[85vh]">
            <div className="space-y-4">
              <div>
                <p className="text-[#6B6B6B] text-xs mb-1">Date</p>
                <p className="text-[#F0F0F0] font-semibold text-base">{fmtDate(photo.date)}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgba(0,174,239,0.15)] text-[#00AEEF]">
                  {photo.category}
                </span>
                {isMilestone && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgba(234,179,8,0.15)] text-[#EAB308]">
                    Milestone
                  </span>
                )}
                {isGoalAchieved && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgba(34,197,94,0.15)] text-[#22C55E]">
                    Goal Achieved
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1A1A1A] rounded-lg p-3">
                  <p className="text-[#6B6B6B] text-[10px]">Weight</p>
                  <p className="text-[#F0F0F0] font-semibold font-mono text-lg">{photo.weight ? `${photo.weight} kg` : '-'}</p>
                </div>
                <div className="bg-[#1A1A1A] rounded-lg p-3">
                  <p className="text-[#6B6B6B] text-[10px]">Body Fat</p>
                  <p className="text-[#F0F0F0] font-semibold font-mono text-lg">{photo.bodyFatPercentage ? `${photo.bodyFatPercentage}%` : '-'}</p>
                </div>
              </div>

              {photo.notes && (
                <div>
                  <p className="text-[#6B6B6B] text-xs mb-1">Client Notes</p>
                  <p className="text-[#A0A0A0] text-sm italic">&ldquo;{photo.notes}&rdquo;</p>
                </div>
              )}

              <div className="h-px bg-[#2A2A2A]" />

              {/* Trainer Annotations */}
              <div>
                <p className="text-[#F0F0F0] text-sm font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare size={14} className="text-[#00AEEF]" />
                  Trainer Annotations
                </p>

                <div className="space-y-3">
                  <div>
                    <Label className="text-[#6B6B6B] text-[10px]">Trainer Notes</Label>
                    <Textarea
                      value={trainerNotes}
                      onChange={(e) => setTrainerNotes(e.target.value)}
                      placeholder="Add your observations..."
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0] min-h-[80px] text-xs mt-1"
                    />
                  </div>

                  <ToggleRowInline
                    title="Mark as Milestone"
                    icon={<Star size={14} className="text-[#EAB308]" />}
                    checked={isMilestone}
                    onChange={setIsMilestone}
                  />
                  <ToggleRowInline
                    title="Goal Achieved"
                    icon={<Trophy size={14} className="text-[#22C55E]" />}
                    checked={isGoalAchieved}
                    onChange={setIsGoalAchieved}
                  />

                  <Button className="w-full bg-[#00AEEF] hover:bg-[#009BD6] text-white mt-2" onClick={handleSave}>
                    Save Annotations
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ToggleRowInline({
  title,
  icon,
  checked,
  onChange,
}: {
  title: string
  icon: React.ReactNode
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all ${
        checked ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.08)]' : 'border-[#2A2A2A] bg-[#1A1A1A]'
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[#F0F0F0] text-xs">{title}</span>
      </div>
      <div className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-[#00AEEF]' : 'bg-[#2A2A2A]'}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'right-0.5' : 'left-0.5'}`} />
      </div>
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════
   Comparison Mode
   ═══════════════════════════════════════════════════════════ */

function ComparisonView({
  left,
  right,
  onClose,
}: {
  left: ProgressPhoto
  right: ProgressPhoto
  onClose: () => void
}) {
  const weightDelta = right.weight && left.weight ? right.weight - left.weight : null
  const bfDelta = right.bodyFatPercentage && left.bodyFatPercentage ? right.bodyFatPercentage - left.bodyFatPercentage : null
  const days = daysBetween(left.date, right.date)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease }}
      className="space-y-4"
    >
      {/* Header Bar */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left info */}
        <div className="text-center lg:text-left">
          <p className="text-[#6B6B6B] text-xs mb-1">Before</p>
          <p className="text-[#F0F0F0] font-mono text-sm font-semibold">{fmtDate(left.date)}</p>
          <p className="text-[#A0A0A0] text-xs font-mono">{left.weight} kg · {left.bodyFatPercentage}% BF</p>
        </div>

        {/* Delta */}
        <div className="text-center">
          <p className="text-[#6B6B6B] text-xs mb-1">{days} days between photos</p>
          <div className="flex items-center gap-4 justify-center">
            {weightDelta !== null && (
              <p className={`font-semibold font-mono text-lg ${weightDelta < 0 ? 'text-[#22C55E]' : weightDelta > 0 ? 'text-[#EF4444]' : 'text-[#A0A0A0]'}`}>
                {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
              </p>
            )}
            {bfDelta !== null && (
              <p className={`font-semibold font-mono text-lg ${bfDelta < 0 ? 'text-[#22C55E]' : bfDelta > 0 ? 'text-[#EF4444]' : 'text-[#A0A0A0]'}`}>
                {bfDelta > 0 ? '+' : ''}{bfDelta.toFixed(1)}% BF
              </p>
            )}
          </div>
          {weightDelta !== null && weightDelta < 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(34,197,94,0.15)] text-[#22C55E]">
              Progress!
            </span>
          )}
        </div>

        {/* Right info */}
        <div className="text-center lg:text-right">
          <p className="text-[#6B6B6B] text-xs mb-1">After</p>
          <p className="text-[#F0F0F0] font-mono text-sm font-semibold">{fmtDate(right.date)}</p>
          <p className="text-[#A0A0A0] text-xs font-mono">{right.weight} kg · {right.bodyFatPercentage}% BF</p>
        </div>

        {/* Close */}
        <Button variant="ghost" size="sm" className="text-[#A0A0A0] hover:text-[#F0F0F0]" onClick={onClose}>
          <X size={16} className="mr-1" />
          Close
        </Button>
      </div>

      {/* Photo Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl overflow-hidden">
          <div className="relative">
            <img src={left.url} alt="" className="w-full h-[400px] lg:h-[500px] object-contain bg-[#0A0A0A]" />
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 rounded-md text-xs text-white font-medium">
              {left.category} · {fmtDate(left.date)}
            </div>
          </div>
        </div>
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl overflow-hidden">
          <div className="relative">
            <img src={right.url} alt="" className="w-full h-[400px] lg:h-[500px] object-contain bg-[#0A0A0A]" />
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 rounded-md text-xs text-white font-medium">
              {right.category} · {fmtDate(right.date)}
            </div>
            {right.isGoalAchieved && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-[rgba(34,197,94,0.9)] rounded-md text-xs text-white font-medium flex items-center gap-1">
                <Trophy size={12} /> Goal!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" className="border-[#2A2A2A] text-[#A0A0A0]">
          <Download size={16} className="mr-2" />
          Download Comparison
        </Button>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Photo Card (Gallery Grid)
   ═══════════════════════════════════════════════════════════ */

function PhotoCard({
  photo,
  index,
  compareMode,
  selected,
  onSelect,
  onClick,
}: {
  photo: ProgressPhoto
  index: number
  compareMode: boolean
  selected: boolean
  onSelect: () => void
  onClick: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease }}
      className={`group relative bg-[#141414] border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
        selected ? 'border-[#00AEEF] ring-2 ring-[rgba(0,174,239,0.3)]' : 'border-[#2A2A2A] hover:border-[rgba(0,174,239,0.3)]'
      }`}
      onClick={() => {
        if (compareMode) {
          onSelect()
        } else {
          onClick()
        }
      }}
    >
      {/* Image */}
      <div className="relative h-[240px] overflow-hidden">
        <img
          src={photo.thumbnailUrl}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Compare checkbox */}
        {compareMode && (
          <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
              selected ? 'bg-[#00AEEF] border-[#00AEEF]' : 'bg-black/50 border-white/50'
            }`}>
              {selected && <Check size={14} className="text-white" />}
            </div>
          </div>
        )}

        {/* Milestone badges */}
        {(photo.isMilestone || photo.isGoalAchieved) && (
          <div className="absolute top-3 right-3 flex gap-1 z-10">
            {photo.isMilestone && <Star size={14} className="text-[#EAB308] fill-[#EAB308]" />}
            {photo.isGoalAchieved && <Trophy size={14} className="text-[#22C55E] fill-[#22C55E]" />}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.9)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-xs font-mono">{fmtDate(photo.date)}</p>
              {photo.weight && <p className="text-white/80 text-[10px] font-mono">{photo.weight} kg · {photo.bodyFatPercentage}% BF</p>}
            </div>
            {!compareMode && (
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <Columns2 size={12} />
                </button>
                <button className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <Download size={12} />
                </button>
                <button className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:text-[#EF4444] hover:bg-white/20 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="p-3 flex items-center justify-between">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(0,174,239,0.15)] text-[#00AEEF]">
          {photo.category}
        </span>
        {photo.notes && (
          <span className="text-[#6B6B6B] text-[10px] truncate max-w-[120px]">{photo.notes}</span>
        )}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Main Photos Page
   ═══════════════════════════════════════════════════════════ */

export default function PhotosPage() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>(demoPhotos)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [comparePair, setComparePair] = useState<[ProgressPhoto, ProgressPhoto] | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<PhotoCategory | 'All'>('All')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Filtered + sorted photos
  const filtered = useMemo(() => {
    let list = [...photos]
    if (categoryFilter !== 'All') {
      list = list.filter((p) => p.category === categoryFilter)
    }
    list.sort((a, b) => {
      const da = new Date(a.date).getTime()
      const db = new Date(b.date).getTime()
      return sortOrder === 'newest' ? db - da : da - db
    })
    return list
  }, [photos, categoryFilter, sortOrder])

  const handleUpload = useCallback((newPhotos: ProgressPhoto[]) => {
    setPhotos((prev) => [...newPhotos, ...prev])
  }, [])

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id)
      }
      if (prev.length >= 2) {
        return [prev[1], id]
      }
      return [...prev, id]
    })
  }

  const startComparison = () => {
    if (selectedIds.length !== 2) return
    const a = photos.find((p) => p.id === selectedIds[0])
    const b = photos.find((p) => p.id === selectedIds[1])
    if (a && b) {
      const left = new Date(a.date) <= new Date(b.date) ? a : b
      const right = new Date(a.date) <= new Date(b.date) ? b : a
      setComparePair([left, right])
    }
  }

  const handleUpdatePhoto = (id: string, updates: Partial<ProgressPhoto>) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const lightboxPhoto = lightboxIdx !== null ? filtered[lightboxIdx] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[#F0F0F0] text-2xl font-semibold mb-1">Progress Photos</h1>
        <p className="text-[#6B6B6B] text-sm">Sarah Johnson — Visual transformation tracking</p>
      </div>

      {/* Stats */}
      <StatsBar photos={photos} />

      {/* Comparison Active Bar */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-[rgba(0,174,239,0.08)] border border-[rgba(0,174,239,0.3)] rounded-xl p-4 flex items-center justify-between">
              <p className="text-[#00AEEF] text-sm">
                Select 2 photos to compare · <span className="font-medium">{selectedIds.length}/2 selected</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#A0A0A0]"
                  onClick={() => { setCompareMode(false); setSelectedIds([]) }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-[#00AEEF] hover:bg-[#009BD6] text-white"
                  disabled={selectedIds.length !== 2}
                  onClick={startComparison}
                >
                  <Columns2 size={14} className="mr-1" />
                  Compare
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison View */}
      <AnimatePresence>
        {comparePair && (
          <div className="mb-6">
            <ComparisonView
              left={comparePair[0]}
              right={comparePair[1]}
              onClose={() => { setComparePair(null); setCompareMode(false); setSelectedIds([]) }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      {!comparePair && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Button className="bg-[#00AEEF] hover:bg-[#009BD6] text-white" onClick={() => setUploadOpen(true)}>
              <Upload size={16} className="mr-2" />
              Upload Photos
            </Button>
            <Button
              variant={compareMode ? 'default' : 'outline'}
              className={compareMode ? 'bg-[#00AEEF] text-white' : 'border-[#2A2A2A] text-[#A0A0A0] hover:text-[#F0F0F0]'}
              onClick={() => { setCompareMode(!compareMode); setSelectedIds([]) }}
            >
              <Columns2 size={16} className="mr-2" />
              Compare
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#6B6B6B]" />
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as PhotoCategory | 'All')}>
              <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0] h-8 text-xs w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                <SelectItem value="All">All Categories</SelectItem>
                {(['Front', 'Back', 'Side', 'Other'] as const).map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={() => setSortOrder((o) => (o === 'newest' ? 'oldest' : 'newest'))}
              className="flex items-center gap-1 h-8 px-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md text-xs text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors"
            >
              <ArrowUpDown size={12} />
              {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <AnimatePresence mode="wait">
        {!comparePair && (
          <motion.div
            key={`${categoryFilter}-${sortOrder}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {filtered.map((photo, i) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={i}
                compareMode={compareMode}
                selected={selectedIds.includes(photo.id)}
                onSelect={() => handleSelect(photo.id)}
                onClick={() => setLightboxIdx(i)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {filtered.length === 0 && (
        <EmptyState
          icon={<Camera size={48} />}
          title="No photos match"
          description="Try adjusting your filters or upload new photos."
          action={
            <Button variant="outline" className="border-[#00AEEF] text-[#00AEEF] hover:bg-[rgba(0,174,239,0.1)]" onClick={() => { setCategoryFilter('All') }}>
              Clear Filters
            </Button>
          }
        />
      )}

      {/* Upload Modal */}
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUpload={handleUpload} />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && lightboxIdx !== null && (
          <Lightbox
            photo={lightboxPhoto}
            onClose={() => setLightboxIdx(null)}
            onPrev={() => setLightboxIdx((i) => Math.max(0, (i ?? 1) - 1))}
            onNext={() => setLightboxIdx((i) => Math.min(filtered.length - 1, (i ?? 0) + 1))}
            hasPrev={lightboxIdx > 0}
            hasNext={lightboxIdx < filtered.length - 1}
            onUpdate={handleUpdatePhoto}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
