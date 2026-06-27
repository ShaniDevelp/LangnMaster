'use client'
import { useTransition } from 'react'
import { setEnrollmentPaymentStatus } from '@/lib/admin/actions'

export function MarkPaidButton({
  enrollmentId,
  paymentStatus,
}: {
  enrollmentId: string
  paymentStatus: 'paid' | 'unpaid' | 'refunded'
}) {
  const [isPending, startTransition] = useTransition()

  const isPaid = paymentStatus === 'paid'

  function toggle() {
    startTransition(async () => {
      const res = await setEnrollmentPaymentStatus(enrollmentId, isPaid ? 'unpaid' : 'paid')
      if (res && 'error' in res && res.error) alert(res.error)
    })
  }

  if (isPaid) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Paid</span>
        <button
          type="button"
          onClick={toggle}
          disabled={isPending}
          className="text-xs text-gray-400 hover:text-red-500 underline disabled:opacity-50"
        >
          {isPending ? '…' : 'undo'}
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? 'Saving…' : '✓ Verify payment'}
    </button>
  )
}
