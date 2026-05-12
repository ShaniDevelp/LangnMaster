import Link from 'next/link'

export function AssignGroupsButton() {
  return (
    <Link
      href="/admin/enrollments"
      className="flex items-center gap-2 bg-[#6c4ff5] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5c3de8] transition-colors shadow-lg shadow-purple-200 flex-shrink-0"
    >
      ⚡ Review Suggestions →
    </Link>
  )
}
