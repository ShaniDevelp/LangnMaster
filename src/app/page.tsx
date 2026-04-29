import Link from 'next/link'

const steps = [
  {
    icon: '🔎',
    title: 'Pick your course',
    desc: 'Browse languages, levels and read teacher reviews before enrolling.',
  },
  {
    icon: '👥',
    title: 'Pair with a partner',
    desc: 'Matched with 1 other student of your level and timezone.',
  },
  {
    icon: '🧑‍🏫',
    title: 'Meet your teacher',
    desc: 'A native or certified teacher is assigned to your group every Monday.',
  },
  {
    icon: '🎥',
    title: 'Live sessions',
    desc: 'Speak from week one in real video classes with your group.',
  },
]

const valueProps = [
  { icon: '🎯', title: 'Group of 2', desc: 'Max 2 students per class. 5x more speaking time than a class of 10.' },
  { icon: '📅', title: 'Weekly cohorts', desc: 'New cohorts every Monday. No waiting around — start within 7 days.' },
  { icon: '🌍', title: 'Native teachers', desc: 'Vetted, certified, native or near-native teachers.' },
  { icon: '🎥', title: 'Live video, not recordings', desc: 'Real conversations. Real corrections. Real progress.' },
]

const courses = [
  { lang: '🇬🇧', name: 'English', tag: 'Most popular', levels: ['Beginner', 'Intermediate', 'Advanced'], price: 99, weeks: 8, rating: 4.9, reviews: 1240, color: 'from-blue-500 to-indigo-600' },
  { lang: '🇪🇸', name: 'Spanish', tag: 'New cohort', levels: ['Beginner', 'Intermediate'], price: 89, weeks: 8, rating: 4.8, reviews: 612, color: 'from-red-500 to-orange-500' },
  { lang: '🇫🇷', name: 'French', tag: null, levels: ['Beginner', 'Intermediate'], price: 89, weeks: 8, rating: 4.8, reviews: 480, color: 'from-blue-600 to-blue-800' },
  { lang: '🇩🇪', name: 'German', tag: null, levels: ['Beginner'], price: 89, weeks: 8, rating: 4.7, reviews: 218, color: 'from-yellow-500 to-amber-600' },
]

const teachers = [
  { name: 'Sofia M.', country: '🇪🇸', langs: 'Spanish · English', years: 8, rating: 4.9, color: 'from-pink-400 to-rose-500' },
  { name: 'Liam K.', country: '🇬🇧', langs: 'English · French', years: 6, rating: 4.9, color: 'from-blue-400 to-indigo-500' },
  { name: 'Amara O.', country: '🇫🇷', langs: 'French · English', years: 5, rating: 4.8, color: 'from-emerald-400 to-teal-500' },
  { name: 'Noah B.', country: '🇩🇪', langs: 'German · English', years: 9, rating: 4.9, color: 'from-amber-400 to-orange-500' },
  { name: 'Yuki T.', country: '🇯🇵', langs: 'Japanese · English', years: 7, rating: 4.9, color: 'from-violet-400 to-fuchsia-500' },
  { name: 'Carlos R.', country: '🇲🇽', langs: 'Spanish · English', years: 4, rating: 4.8, color: 'from-cyan-400 to-blue-500' },
]

const testimonials = [
  { name: 'Priya S.', course: 'Spanish · Intermediate', rating: 5, body: 'After 6 weeks I was holding real conversations on holiday. The group of 2 format means you cannot hide — you speak every session.', color: 'from-pink-400 to-rose-500' },
  { name: 'Daniel A.', course: 'English · Advanced', rating: 5, body: 'My teacher corrected pronunciation patterns I had carried for 10 years. Worth every dollar.', color: 'from-blue-400 to-indigo-500' },
  { name: 'Mei L.', course: 'French · Beginner', rating: 5, body: 'I tried apps for 2 years and learned more in one month here. The live feedback changes everything.', color: 'from-emerald-400 to-teal-500' },
]

const pricingTiers = [
  {
    name: 'Starter',
    price: 89,
    period: '/course',
    desc: '8-week course, 2 sessions/week.',
    features: ['Group of 2', '16 live sessions', 'Curriculum + homework', 'Email support'],
    cta: 'Start with Starter',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 149,
    period: '/course',
    desc: '8-week course, 3 sessions/week.',
    features: ['Group of 2', '24 live sessions', 'Session recordings', 'Priority teacher matching', 'Completion certificate'],
    cta: 'Choose Pro',
    highlight: true,
  },
  {
    name: 'Intensive',
    price: 249,
    period: '/course',
    desc: '8-week course, 5 sessions/week.',
    features: ['Group of 2', '40 live sessions', 'Recordings + transcripts', '1:1 review every 2 weeks', 'Certificate'],
    cta: 'Go Intensive',
    highlight: false,
  },
]

const faq = [
  {
    q: 'How does the group of 2 actually work?',
    a: 'Every Monday we match enrolled students by language, level and timezone into pairs. You and your partner stay together with the same teacher for the full course duration.',
  },
  {
    q: 'What if my partner drops out or cannot make a session?',
    a: 'If your partner cancels permanently, we re-pair you with another student within 7 days. If they miss a single session, the class continues 1:1 with your teacher at no extra cost.',
  },
  {
    q: 'Can I get a refund?',
    a: 'Full refund within 7 days of enrollment as long as you have attended fewer than 2 sessions. After that we offer pro-rated credit toward another course.',
  },
  {
    q: 'Do I need any equipment?',
    a: 'A laptop or phone with camera, microphone and a stable internet connection. We run a device check before your first session.',
  },
  {
    q: 'How do you choose my teacher?',
    a: 'We match based on your timezone, target level and learning goals. You can preview the teacher pool for any course before enrolling.',
  },
  {
    q: 'When do new cohorts start?',
    a: 'Every Monday. Enroll any day of the week and you will be placed in the next cohort that matches your level and timezone.',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="text-lg sm:text-xl font-bold text-brand-500">LangMaster</Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#how" className="hover:text-gray-900">How it works</a>
            <a href="#courses" className="hover:text-gray-900">Courses</a>
            <a href="#teachers" className="hover:text-gray-900">Teachers</a>
            <a href="#pricing" className="hover:text-gray-900">Pricing</a>
            <a href="#faq" className="hover:text-gray-900">FAQ</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2">
              Sign in
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-brand-500 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-brand-600 transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 rounded-full mb-5 sm:mb-6">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            Next cohort starts Monday
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] max-w-4xl mx-auto mb-5 sm:mb-6">
            Speak a new language in <span className="text-brand-500">groups of 2</span> with live native teachers.
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
            Real video classes. Two students. One expert teacher. Five times the speaking time of a normal class.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/register" className="bg-brand-500 text-white font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg hover:bg-brand-600 transition-colors shadow-lg shadow-purple-200">
              Start learning →
            </Link>
            <a href="#courses" className="bg-white text-gray-800 font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg border border-gray-200 hover:border-purple-300 hover:text-purple-700 transition-colors">
              Browse courses
            </a>
          </div>

          {/* Trust strip */}
          <div className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-10 gap-y-3 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-2"><span className="text-yellow-500">★★★★★</span><span>4.9 average rating</span></div>
            <div className="hidden sm:block w-px h-4 bg-gray-200" />
            <div>12,000+ students enrolled</div>
            <div className="hidden sm:block w-px h-4 bg-gray-200" />
            <div>200+ vetted teachers</div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {valueProps.map(v => (
              <div key={v.title} className="p-5 sm:p-6 rounded-2xl bg-gray-50 hover:bg-purple-50 transition-colors">
                <span className="text-2xl sm:text-3xl block mb-3 sm:mb-4">{v.icon}</span>
                <h3 className="font-bold text-gray-900 mb-1.5 sm:mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-base sm:text-lg text-gray-500">From signup to your first live session in under 7 days.</p>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((s, i) => (
              <li key={s.title} className="relative bg-white rounded-2xl p-5 sm:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-2xl sm:text-3xl">{s.icon}</span>
                  <span className="text-xs font-bold text-brand-500 bg-brand-50 px-2 py-1 rounded-full">Step {i + 1}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 sm:mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured courses */}
      <section id="courses" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Featured courses</h2>
              <p className="text-base sm:text-lg text-gray-500">New cohorts start every Monday.</p>
            </div>
            <Link href="/register" className="text-sm font-semibold text-brand-500 hover:text-brand-600">
              See all courses →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {courses.map(c => (
              <div key={c.name} className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white flex flex-col hover:shadow-md transition-shadow">
                <div className={`relative h-28 sm:h-32 bg-gradient-to-br ${c.color} flex items-center justify-center text-4xl sm:text-5xl`}>
                  {c.lang}
                  {c.tag && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 text-gray-800 px-2 py-1 rounded-full">
                      {c.tag}
                    </span>
                  )}
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg sm:text-xl text-gray-900">{c.name}</h3>
                    <span className="text-sm text-gray-700 font-medium">★ {c.rating}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{c.reviews.toLocaleString()} reviews · {c.weeks} weeks</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {c.levels.map(l => (
                      <span key={l} className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{l}</span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">${c.price}<span className="text-xs font-normal text-gray-500">/course</span></span>
                    <Link href="/register" className="text-sm font-semibold text-brand-500 hover:text-brand-600">
                      Enroll →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teachers strip */}
      <section id="teachers" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">Meet the teachers</h2>
            <p className="text-base sm:text-lg text-gray-500">Native, certified, and obsessed with helping you speak.</p>
          </div>

          {/* Mobile: horizontal scroll. Desktop: grid */}
          <div className="flex sm:hidden gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
            {teachers.map(t => <TeacherCard key={t.name} t={t} className="min-w-[220px] snap-start" />)}
          </div>
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
            {teachers.map(t => <TeacherCard key={t.name} t={t} />)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">Students who actually speak</h2>
            <p className="text-base sm:text-lg text-gray-500">Real reviews from real cohorts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map(t => (
              <figure key={t.name} className="bg-gray-50 rounded-2xl p-5 sm:p-6 flex flex-col">
                <div className="text-yellow-500 mb-3 text-sm">{'★'.repeat(t.rating)}</div>
                <blockquote className="text-gray-700 text-sm sm:text-base leading-relaxed mb-5 flex-1">
                  &ldquo;{t.body}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {t.name[0]}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.course}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">Simple per-course pricing</h2>
            <p className="text-base sm:text-lg text-gray-500">Pay once per course. No subscriptions. 7-day refund.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {pricingTiers.map(t => (
              <div
                key={t.name}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col ${
                  t.highlight
                    ? 'bg-brand-500 text-white shadow-xl shadow-purple-200 ring-4 ring-brand-500/20 md:scale-105'
                    : 'bg-white text-gray-900 border border-gray-100'
                }`}
              >
                {t.highlight && (
                  <span className="inline-block self-start text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-1 rounded-full mb-3">
                    Most popular
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-1 ${t.highlight ? 'text-white' : 'text-gray-900'}`}>{t.name}</h3>
                <p className={`text-sm mb-5 ${t.highlight ? 'text-purple-100' : 'text-gray-500'}`}>{t.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold">${t.price}</span>
                  <span className={`text-sm ${t.highlight ? 'text-purple-100' : 'text-gray-500'}`}>{t.period}</span>
                </div>
                <ul className={`space-y-2.5 text-sm mb-7 flex-1 ${t.highlight ? 'text-purple-50' : 'text-gray-600'}`}>
                  {t.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <span className={t.highlight ? 'text-white' : 'text-brand-500'}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center font-semibold px-5 py-3 rounded-xl transition-colors ${
                    t.highlight
                      ? 'bg-white text-brand-600 hover:bg-purple-50'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">Frequently asked</h2>
            <p className="text-base sm:text-lg text-gray-500">Everything you need to know before enrolling.</p>
          </div>
          <div className="space-y-3">
            {faq.map(item => (
              <details
                key={item.q}
                className="group bg-gray-50 rounded-2xl px-5 py-4 sm:px-6 sm:py-5 open:bg-purple-50 open:ring-1 open:ring-brand-200 transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-gray-900 text-sm sm:text-base">
                  <span>{item.q}</span>
                  <span className="text-brand-500 text-xl leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-brand-500 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Ready to start speaking?</h2>
          <p className="text-purple-100 text-base sm:text-lg mb-7 sm:mb-8">
            Next cohort starts this Monday. Enroll today, meet your group in 7 days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Link href="/register" className="bg-white text-brand-600 font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg hover:bg-purple-50 transition-colors">
              Enroll today
            </Link>
            <Link href="/login" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg transition-colors">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <div className="text-lg font-bold text-white mb-2">LangMaster</div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xs">Live small-group language learning that actually works.</p>
          </div>
          <FooterCol title="Product" links={[['Courses', '#courses'], ['Teachers', '#teachers'], ['Pricing', '#pricing'], ['FAQ', '#faq']]} />
          <FooterCol title="Account" links={[['Sign in', '/login'], ['Get started', '/register']]} />
          <FooterCol title="Company" links={[['About', '#'], ['Contact', '#'], ['Privacy', '#'], ['Terms', '#']]} />
        </div>
        <div className="max-w-7xl mx-auto pt-6 sm:pt-8 border-t border-gray-800 text-xs sm:text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} LangMaster. All rights reserved.</span>
          <span>Made for live language learning.</span>
        </div>
      </footer>
    </div>
  )
}

function TeacherCard({
  t,
  className = '',
}: {
  t: { name: string; country: string; langs: string; years: number; rating: number; color: string }
  className?: string
}) {
  return (
    <div className={`bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col items-center text-center ${className}`}>
      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-xl sm:text-2xl mb-3`}>
        {t.name[0]}
        <span className="absolute -bottom-1 -right-1 text-base sm:text-lg bg-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border border-gray-100">
          {t.country}
        </span>
      </div>
      <div className="font-bold text-gray-900 text-sm sm:text-base">{t.name}</div>
      <div className="text-xs text-gray-500 mb-2">{t.langs}</div>
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span>★ {t.rating}</span>
        <span className="text-gray-300">·</span>
        <span>{t.years}y exp</span>
      </div>
    </div>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="text-sm font-semibold text-white mb-3">{title}</div>
      <ul className="space-y-2 text-xs sm:text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:text-white transition-colors">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
