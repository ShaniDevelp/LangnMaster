'use client'

import { useState, useTransition } from 'react'
import { requestToTeachCourse } from '@/lib/teacher/actions'

export function TeacherRequestButton({ 
  courseId, 
  initialStatus 
}: { 
  courseId: string, 
  initialStatus: 'none' | 'pending' | 'approved' | 'rejected' 
}) {
  const [status, setStatus] = useState(initialStatus)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleRequest() {
    setError(null)
    startTransition(async () => {
      const result = await requestToTeachCourse(courseId)
      if (result && 'error' in result) {
        setError(result.error ?? 'Failed to submit request')
      } else {
        setStatus('pending')
      }
    })
  }

  if (status === 'approved') {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg">✓</div>
        <div>
          <p className="font-bold text-emerald-900">Approved to Teach</p>
          <p className="text-sm text-emerald-600">You are an active teacher for this course.</p>
        </div>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-lg">⏳</div>
        <div>
          <p className="font-bold text-amber-900">Request Pending</p>
          <p className="text-sm text-amber-600">Admin is reviewing your application.</p>
        </div>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-lg">✕</div>
        <div>
          <p className="font-bold text-red-900">Request Declined</p>
          <p className="text-sm text-red-600">You are not approved to teach this course at this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>
      )}
      <button
        onClick={handleRequest}
        disabled={isPending}
        className="w-full bg-brand-500 text-white font-bold py-4 rounded-2xl text-base hover:bg-brand-600 transition-colors shadow-lg shadow-purple-200 disabled:opacity-50"
      >
        {isPending ? 'Submitting Request...' : 'Apply to Teach this Course'}
      </button>
      <p className="text-center text-xs text-gray-400">
        Your application will be reviewed by the administration.
      </p>
    </div>
  )
}
