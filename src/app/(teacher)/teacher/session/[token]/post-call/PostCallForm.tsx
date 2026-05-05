'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { savePostCall } from '@/lib/teacher/session-actions'

type Student = { id: string; name: string }
type AttendanceStatus = 'present' | 'late' | 'no_show'

const ATTENDANCE_OPTIONS: { key: AttendanceStatus; label: string; icon: string; style: string; activeStyle: string }[] = [
  { 
    key: 'present',  
    label: 'Present',   
    icon: '✓', 
    style: 'bg-slate-50 text-slate-400 border-slate-100 hover:border-emerald-200 hover:text-emerald-500', 
    activeStyle: 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
  },
  { 
    key: 'late',     
    label: 'Late',      
    icon: '!', 
    style: 'bg-slate-50 text-slate-400 border-slate-100 hover:border-amber-200 hover:text-amber-500', 
    activeStyle: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' 
  },
  { 
    key: 'no_show',  
    label: 'Absent',    
    icon: '×', 
    style: 'bg-slate-50 text-slate-400 border-slate-100 hover:border-red-200 hover:text-red-500', 
    activeStyle: 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' 
  },
]

type Props = {
  sessionId: string
  groupId: string
  roomToken: string
  courseName: string
  language: string
  scheduledAt: string
  students: Student[]
  existingNotes: string
  existingHomeworkText: string
  existingHomeworkUrl: string
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-indigo-500/10">
      {name.charAt(0)}
    </div>
  )
}

export function PostCallForm(props: Props) {
  const {
    sessionId, groupId, courseName, scheduledAt, students,
    existingNotes, existingHomeworkText, existingHomeworkUrl,
  } = props

  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(students.map(s => [s.id, 'present']))
  )
  const [sessionNotes, setSessionNotes] = useState(existingNotes)
  const [homeworkText, setHomeworkText] = useState(existingHomeworkText)
  const [homeworkUrl, setHomeworkUrl] = useState(existingHomeworkUrl)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function setStudentAttendance(studentId: string, status: AttendanceStatus) {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await savePostCall(sessionId, groupId, {
        session_notes: sessionNotes,
        homework_text: homeworkText,
        homework_url:  homeworkUrl,
        attendance: students.map(s => ({ student_id: s.id, status: attendance[s.id] ?? 'present' })),
      })
      if (result && 'error' in result) setError(result.error ?? 'Unknown error')
    })
  }

  const formattedDate = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })

  const presentCount = Object.values(attendance).filter(v => v === 'present').length

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* ── Premium Header ── */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center text-white font-black text-sm">LM</div>
            <span className="text-slate-300 font-light text-xl">/</span>
            <span className="text-slate-900 font-black text-sm uppercase tracking-widest">Recap</span>
          </div>
          <Link href="/teacher/dashboard" className="text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-all">
            Skip for now
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-12">
          
          <div className="space-y-10">
            {/* ── Page Intro ── */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Class Success
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 font-bold text-sm">{formattedDate}</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{courseName}</h1>
              <p className="text-slate-500 font-medium mt-1">Finalize the session details to update student records.</p>
            </div>

            {/* ── Internal Notes ── */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-10 space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Private Recap</h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Personal observations not visible to students.</p>
              </div>
              <textarea
                value={sessionNotes}
                onChange={e => setSessionNotes(e.target.value)}
                rows={4}
                placeholder="How did the lesson go? Any specific student feedback or areas to revisit?"
                className="w-full bg-slate-50 border-none rounded-[2rem] px-8 py-6 text-slate-900 font-bold placeholder-slate-300 focus:ring-2 focus:ring-brand-500 transition-all resize-none"
              />
            </div>

            {/* ── Student Deliverables ── */}
            <div className="bg-indigo-600 rounded-[3.5rem] p-10 text-white shadow-2xl shadow-indigo-600/20 space-y-8 relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Student Action Items</h2>
                  <p className="text-indigo-200 text-sm font-medium mt-1">This will be posted to the student&apos;s session history.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Homework Description</label>
                    <textarea
                      value={homeworkText}
                      onChange={e => setHomeworkText(e.target.value)}
                      rows={3}
                      placeholder="e.g. Complete the exercise on page 42..."
                      className="w-full bg-white/10 border border-white/10 rounded-[1.5rem] px-6 py-4 text-white font-bold placeholder-indigo-300/50 focus:ring-2 focus:ring-white transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Resource Link (Optional)</label>
                    <input
                      type="url"
                      value={homeworkUrl}
                      onChange={e => setHomeworkUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white/10 border border-white/10 rounded-[1.5rem] px-6 py-4 text-white font-bold placeholder-indigo-300/50 focus:ring-2 focus:ring-white transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 font-bold rounded-2xl p-6 animate-shake">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-10">
            {/* Attendance Card */}
            <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Attendance Roll</h3>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                  {presentCount}/{students.length} Present
                </span>
              </div>
              
              <div className="space-y-8">
                {students.map(student => {
                  const current = attendance[student.id] ?? 'present'
                  return (
                    <div key={student.id} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={student.name} />
                        <p className="text-sm font-bold text-slate-900">{student.name}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {ATTENDANCE_OPTIONS.map(opt => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setStudentAttendance(student.id, opt.key)}
                            className={`flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest ${
                              current === opt.key ? opt.activeStyle : opt.style
                            }`}
                          >
                            <span className="text-lg font-normal mb-0.5">{opt.icon}</span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {students.length === 0 && (
                   <p className="text-center text-slate-400 text-xs font-medium py-4 italic">No students assigned to this group.</p>
                )}
              </div>
            </div>

            {/* Finalize Card */}
            <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-2xl shadow-indigo-500/10 flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-3xl mb-8 shadow-xl shadow-emerald-500/10">
                 🏁
               </div>
               <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Finish Summary</h3>
               <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 px-4">
                 Ready to close the session? Students will be notified and can view their homework.
               </p>
               <button
                 onClick={handleSubmit}
                 disabled={isPending}
                 className="w-full py-6 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-widest rounded-[2.5rem] shadow-2xl transition-all active:scale-95 disabled:opacity-30"
               >
                 {isPending ? 'Syncing...' : 'Save & Close Session'}
               </button>
               <Link href="/teacher/dashboard" className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">
                  Return to Dashboard
               </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
