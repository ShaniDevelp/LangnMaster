'use client'
import { useState, useTransition } from 'react'
import { assignGroups } from '@/lib/admin/actions'

export function AssignGroupsButton() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string; details?: string } | null>(null)

  function handleAssign() {
    setResult(null)
    startTransition(async () => {
      const res = await assignGroups()
      setResult(res)
    })
  }

  if (result?.success) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="bg-green-100 border border-green-200 text-green-800 rounded-xl px-4 py-2.5 text-sm">
          <p className="font-semibold">✓ {result.message}</p>
          {result.details && <p className="text-xs mt-0.5 text-green-600">{result.details}</p>}
        </div>
        <button
          onClick={() => setResult(null)}
          className="text-xs text-purple-600 hover:text-purple-800"
        >
          Assign more →
        </button>
      </div>
    )
  }

  if (result && !result.success) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm">
          <p className="font-semibold">✗ {result.message}</p>
        </div>
        <button
          onClick={() => setResult(null)}
          className="text-xs text-purple-600 hover:text-purple-800"
        >
          Retry →
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleAssign}
      disabled={isPending}
      className="flex items-center gap-2 bg-[#6c4ff5] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5c3de8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-purple-200 flex-shrink-0"
    >
      {isPending ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Assigning…
        </>
      ) : (
        <>⚡ Assign Groups</>
      )}
    </button>
  )
}
