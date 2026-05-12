'use client'
import type { GroupMeta } from '@/lib/chat/actions'

type Participant = {
  user_id: string
  profiles: {
    id: string
    name: string
    avatar_url: string | null
    role: string
  } | null
}

type Props = {
  groupMeta: GroupMeta
  participants: Participant[]
  teacherId: string | null
  onlineUsers: Set<string>
  onClose: () => void
}

function MemberAvatar({ name, url, online }: { name: string; url: string | null; online: boolean }) {
  return (
    <div className="relative flex-shrink-0">
      {url ? (
        <img src={url} alt={name} className="w-9 h-9 rounded-full object-cover" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
      )}
    </div>
  )
}

export function GroupInfoPanel({ groupMeta, participants, teacherId, onlineUsers, onClose }: Props) {
  const sorted = [...participants].sort((a, b) => {
    const aIsTeacher = a.user_id === teacherId
    const bIsTeacher = b.user_id === teacherId
    if (aIsTeacher !== bIsTeacher) return aIsTeacher ? -1 : 1
    return (a.profiles?.name ?? '').localeCompare(b.profiles?.name ?? '')
  })

  const weekLabel = groupMeta.weekStart
    ? new Date(groupMeta.weekStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="absolute inset-0 bg-black/30 z-20 lg:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="
        absolute right-0 top-0 bottom-0 z-30
        w-[min(300px,85%)]
        lg:static lg:z-auto lg:w-72 lg:flex-shrink-0
        bg-white border-l border-gray-100 flex flex-col shadow-xl lg:shadow-none
      ">
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-bold text-gray-900">Group Info</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Course card */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xl mx-auto mb-3">
              👥
            </div>
            <p className="text-sm font-bold text-gray-900 text-center leading-tight">{groupMeta.courseName}</p>
            <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
              {groupMeta.courseLanguage && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 px-2 py-0.5 rounded-md">
                  {groupMeta.courseLanguage}
                </span>
              )}
              {groupMeta.courseLevel && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">
                  {groupMeta.courseLevel}
                </span>
              )}
            </div>
            {weekLabel && (
              <p className="text-[11px] text-gray-400 text-center mt-2">Started {weekLabel}</p>
            )}
          </div>

          {/* Members */}
          <div className="p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              {participants.length} member{participants.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-1">
              {sorted.map(p => {
                const profile = p.profiles
                if (!profile) return null
                const isTeacher = p.user_id === teacherId
                const online = onlineUsers.has(p.user_id)
                return (
                  <div key={p.user_id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <MemberAvatar name={profile.name} url={profile.avatar_url} online={online} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{profile.name}</p>
                      <p className="text-[11px] text-gray-400 leading-tight">
                        {online ? (
                          <span className="text-emerald-500 font-medium">Online</span>
                        ) : (
                          isTeacher ? 'Teacher' : 'Student'
                        )}
                      </p>
                    </div>
                    {isTeacher && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md flex-shrink-0">
                        Teacher
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
