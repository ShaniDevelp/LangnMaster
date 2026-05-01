'use client'

import { useState, useTransition } from 'react'
import type { Profile, Enrollment, Course } from '@/lib/supabase/types'
// We will need a server action to process the manual assignment
import { assignManualGroup } from '@/lib/admin/phase2-actions'

type EnrollmentRow = Enrollment & {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url'> | null
  courses: Pick<Course, 'id' | 'name' | 'language' | 'level' | 'max_group_size' | 'sessions_per_week' | 'duration_weeks'> | null
}

type TeacherData = {
  id: string
  name: string
  avatar_url: string | null
  availability: string[]
  languages_taught: { lang: string; proficiency: string }[]
}

type Props = {
  pending: EnrollmentRow[]
  teachers: TeacherData[]
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`)

export function GroupBuilder({ pending, teachers }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  // Group pending by course
  const pendingByCourse = pending.reduce<Record<string, EnrollmentRow[]>>((acc, e) => {
    const key = e.course_id
    acc[key] = acc[key] ?? []
    acc[key].push(e)
    return acc
  }, {})

  const selectedEnrollments = pending.filter(e => selectedIds.has(e.id))
  const activeCourse = selectedEnrollments.length > 0 ? selectedEnrollments[0].courses : null
  const requiredSessions = activeCourse?.sessions_per_week ?? 0

  // Teachers matching course language
  const matchingTeachers = teachers.filter(t => 
    !activeCourse || t.languages_taught.some(l => l.lang.toLowerCase() === activeCourse.language.toLowerCase())
  )
  const activeTeacher = teachers.find(t => t.id === teacherId)

  function toggleStudent(id: string, courseId: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      // If clicking a different course, clear selection
      const first = [...next][0]
      if (first && pending.find(e => e.id === first)?.course_id !== courseId) {
        next.clear()
      }
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSlotToggle(key: string) {
    if (!activeTeacher?.availability.includes(key)) return // Can only pick from available slots
    setSlots(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  function handleSubmit() {
    if (!activeCourse || !teacherId || slots.length !== requiredSessions) return
    startTransition(async () => {
      const res = await assignManualGroup({
        enrollmentIds: Array.from(selectedIds),
        courseId: activeCourse.id,
        teacherId,
        slots
      })
      if (res.error) {
        setMsg({ type: 'error', text: res.error })
      } else {
        setMsg({ type: 'success', text: 'Group created successfully!' })
        setTimeout(() => {
          setStep(1)
          setSelectedIds(new Set())
          setTeacherId(null)
          setSlots([])
          setMsg(null)
        }, 2000)
      }
    })
  }

  if (pending.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
        <p className="text-green-700 font-semibold">✓ All enrollments assigned</p>
        <p className="text-green-600 text-sm mt-1">No pending enrollments right now.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-purple-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header / Stepper */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-purple-900 text-lg">Group Builder</h2>
          <p className="text-sm text-purple-700 mt-0.5">Custom assignment workflow</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-[#6c4ff5] text-white' : 'bg-gray-200 text-gray-500'}`}>1. Students</span>
          <span className="text-gray-300">→</span>
          <span className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-[#6c4ff5] text-white' : 'bg-gray-200 text-gray-500'}`}>2. Teacher</span>
          <span className="text-gray-300">→</span>
          <span className={`px-3 py-1 rounded-full ${step === 3 ? 'bg-[#6c4ff5] text-white' : 'bg-gray-200 text-gray-500'}`}>3. Schedule</span>
        </div>
      </div>

      <div className="p-6">
        {msg && (
          <div className={`p-4 rounded-xl mb-6 font-semibold text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {msg.text}
          </div>
        )}

        {/* STEP 1: Select Students */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">Select students for a new group</p>
              <span className="text-sm text-gray-500">{selectedIds.size} selected</span>
            </div>
            
            <div className="space-y-4">
              {Object.entries(pendingByCourse).map(([courseId, rows]) => {
                const course = rows[0].courses
                const isActiveCourse = activeCourse ? activeCourse.id === courseId : true
                if (!isActiveCourse) return null // Hide other courses once one is selected

                return (
                  <div key={courseId} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                      <div>
                        <p className="font-bold text-gray-900">{course?.name}</p>
                        <p className="text-xs text-gray-500">{course?.language} · {course?.level} · Max {course?.max_group_size}/group</p>
                      </div>
                      {selectedIds.size > 0 && activeCourse?.id === courseId && (
                        <button onClick={() => setSelectedIds(new Set())} className="text-xs font-semibold text-gray-400 hover:text-gray-600">Clear</button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {rows.map(e => {
                        const isSelected = selectedIds.has(e.id)
                        const disabled = !isSelected && selectedIds.size >= (course?.max_group_size ?? 2)
                        return (
                          <button key={e.id} onClick={() => toggleStudent(e.id, courseId)} disabled={disabled}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-left ${
                              isSelected ? 'border-[#6c4ff5] bg-purple-50' : 
                              disabled ? 'border-gray-100 opacity-50 cursor-not-allowed' : 'border-gray-200 hover:border-purple-200'
                            }`}>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                              {e.profiles?.name?.charAt(0).toUpperCase() ?? '?'}
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-[#6c4ff5]' : 'text-gray-700'}`}>{e.profiles?.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button disabled={selectedIds.size === 0} onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold disabled:opacity-30 hover:bg-gray-800 transition-colors">
                Continue to Teacher →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Teacher */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">Select a Teacher for {activeCourse?.name}</p>
              <button onClick={() => setStep(1)} className="text-sm font-medium text-gray-400 hover:text-gray-700">← Back</button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {matchingTeachers.length === 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 p-4 rounded-xl col-span-2">No teachers teach {activeCourse?.language}. Add languages to teacher profiles.</p>
              ) : matchingTeachers.map(t => {
                const isSelected = teacherId === t.id
                return (
                  <button key={t.id} onClick={() => setTeacherId(t.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected ? 'border-[#6c4ff5] bg-purple-50' : 'border-gray-200 hover:border-purple-200'
                    }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold ${isSelected ? 'text-[#6c4ff5]' : 'text-gray-900'}`}>{t.name}</p>
                        <p className="text-xs text-gray-500">{t.availability.length} hours available/week</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button disabled={!teacherId} onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold disabled:opacity-30 hover:bg-gray-800 transition-colors">
                Continue to Schedule →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Select Schedule */}
        {step === 3 && activeTeacher && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">Select {requiredSessions} weekly session times</p>
                <p className="text-sm text-gray-500 mt-1">Pick times from <span className="font-semibold">{activeTeacher.name}&apos;s</span> availability.</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-bold ${slots.length === requiredSessions ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {slots.length} / {requiredSessions} selected
                </span>
                <button onClick={() => setStep(2)} className="text-sm font-medium text-gray-400 hover:text-gray-700">← Back</button>
              </div>
            </div>

            {/* Read-only availability grid where admin clicks to select slots */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <div className="min-w-[600px]">
                <div className="grid bg-gray-50 border-b border-gray-100" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                  <div className="px-2 py-2.5 text-xs font-semibold text-gray-400 text-center">Time</div>
                  {DAYS.map(d => <div key={d} className="py-2.5 text-xs font-bold text-gray-600 text-center border-l border-gray-100">{d}</div>)}
                </div>
                {HOURS.map(hour => (
                  <div key={hour} className="grid border-b border-gray-50 last:border-0" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                    <div className="px-2 py-2 text-xs text-gray-400 text-center self-center">{hour}</div>
                    {DAYS.map(day => {
                      const key = `${day}-${hour}`
                      const isTeacherAvailable = activeTeacher.availability.includes(key)
                      const isSelected = slots.includes(key)
                      
                      return (
                        <div key={key} onClick={() => handleSlotToggle(key)}
                          className={`border-l border-gray-50 h-8 transition-colors ${
                            isSelected ? 'bg-[#6c4ff5] cursor-pointer' :
                            isTeacherAvailable ? 'bg-emerald-50 hover:bg-emerald-100 cursor-pointer' : 'bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">✓</div>}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-50 rounded" /> Teacher available</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#6c4ff5] rounded" /> Selected slot</div>
              </div>
              <button disabled={slots.length !== requiredSessions || isPending} onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-[#6c4ff5] text-white text-sm font-bold disabled:opacity-30 hover:bg-[#5c3de8] transition-colors shadow-md">
                {isPending ? 'Creating Group…' : 'Publish Group'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
