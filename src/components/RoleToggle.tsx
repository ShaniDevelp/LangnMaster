'use client'

export type AuthRole = 'student' | 'teacher'

/**
 * Student/Teacher segmented toggle shared by the login and register screens.
 * Drives both the Google sign-in role and the email/password role.
 */
export function RoleToggle({
  role,
  setRole,
  disabled,
}: {
  role: AuthRole
  setRole: (r: AuthRole) => void
  disabled?: boolean
}) {
  return (
    <div className="flex bg-gray-100 rounded-2xl p-1 mb-6 gap-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setRole('student')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          role === 'student' ? 'bg-white text-[#6c4ff5] shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        🎓 Student
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setRole('teacher')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          role === 'teacher' ? 'bg-white text-[#6c4ff5] shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        👨‍🏫 Teacher
      </button>
    </div>
  )
}
