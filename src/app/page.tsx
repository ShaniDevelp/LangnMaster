import Link from 'next/link'

const features = [
  { icon: '🎯', title: 'Small-Group Sessions', desc: 'Learn in pairs with max 2 students per class for focused attention.' },
  { icon: '🎥', title: 'Live Video Classes', desc: 'Real-time video sessions with your teacher and study partner.' },
  { icon: '📅', title: 'Scheduled Weekly', desc: '3 sessions per week on a consistent schedule that fits your life.' },
  { icon: '👨‍🏫', title: 'Expert Teachers', desc: 'Native and certified language teachers assigned to your group.' },
]

const courses = [
  { lang: '🇬🇧', name: 'English', levels: ['Beginner', 'Intermediate', 'Advanced'], color: 'from-blue-500 to-indigo-600' },
  { lang: '🇪🇸', name: 'Spanish', levels: ['Beginner', 'Intermediate'], color: 'from-red-500 to-orange-500' },
  { lang: '🇫🇷', name: 'French', levels: ['Beginner', 'Intermediate'], color: 'from-blue-600 to-blue-800' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-[#6c4ff5]">LangMaster</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">
              Sign in
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-[#6c4ff5] text-white px-4 py-2 rounded-full hover:bg-[#5c3de8] transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          Live sessions available now
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-3xl mb-6">
          Speak a new language<br />
          <span className="text-[#6c4ff5]">in weeks, not years.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mb-10">
          Live video classes in small groups of 2 students + 1 expert teacher. Real conversation practice that actually works.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/register?role=student" className="bg-[#6c4ff5] text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-[#5c3de8] transition-colors shadow-lg shadow-purple-200">
            Start Learning
          </Link>
          <Link href="/register?role=teacher" className="bg-white text-gray-800 font-semibold px-8 py-4 rounded-2xl text-lg border border-gray-200 hover:border-purple-300 hover:text-purple-700 transition-colors">
            Teach with us
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="flex flex-col items-start p-6 rounded-2xl bg-gray-50 hover:bg-purple-50 transition-colors group">
                <span className="text-3xl mb-4">{f.icon}</span>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-700">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Available Languages</h2>
          <p className="text-center text-gray-500 mb-12">New cohorts start every Monday</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {courses.map(c => (
              <div key={c.name} className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                <div className={`h-32 bg-gradient-to-br ${c.color} flex items-center justify-center text-5xl`}>
                  {c.lang}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3">{c.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {c.levels.map(l => (
                      <span key={l} className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{l}</span>
                    ))}
                  </div>
                  <Link href="/register?role=student" className="mt-4 block text-center text-sm font-semibold text-[#6c4ff5] hover:text-[#5c3de8]">
                    Enroll now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#6c4ff5] text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start speaking?</h2>
        <p className="text-purple-200 mb-8 max-w-md mx-auto">Join thousands of students who achieved fluency through live conversation practice.</p>
        <Link href="/register" className="inline-block bg-white text-purple-700 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-purple-50 transition-colors">
          Enroll Today — Free Trial
        </Link>
      </section>

      <footer className="py-8 px-4 text-center text-sm text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} LangMaster. All rights reserved.
      </footer>
    </div>
  )
}
