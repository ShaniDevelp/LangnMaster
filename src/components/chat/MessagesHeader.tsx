'use client'
import { useState } from 'react'
import { StudentNewConversationModal, TeacherNewConversationModal } from './NewConversationModal'
import type { StudentChatPartner, TeacherGroupPartners } from '@/lib/chat/actions'

interface StudentProps {
  role: 'student'
  partners: StudentChatPartner[]
  basePath: string
}

interface TeacherProps {
  role: 'teacher'
  groups: TeacherGroupPartners[]
  basePath: string
}

type Props = StudentProps | TeacherProps

export function MessagesHeader(props: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Messages</h1>
        <button
          onClick={() => setOpen(true)}
          className="w-8 h-8 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors text-xl leading-none"
          title="New conversation"
        >
          +
        </button>
      </div>

      {open && props.role === 'student' && (
        <StudentNewConversationModal
          partners={props.partners}
          basePath={props.basePath}
          onClose={() => setOpen(false)}
        />
      )}

      {open && props.role === 'teacher' && (
        <TeacherNewConversationModal
          groups={props.groups}
          basePath={props.basePath}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
