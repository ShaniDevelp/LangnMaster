import Link from 'next/link'
import { BayyanLogo } from '@/components/BayyanLogo'
import { Reveal } from '@/components/landing/Reveal'

// ── Content ─────────────────────────────────────────────────────────────────

const whyNow = [
  { icon: '🤖', title: 'AI does the typing now', desc: 'Grammar and writing are getting automated. The skill that still pays, the one AI can’t fake for you, is speaking with confidence.' },
  { icon: '💵', title: 'Remote jobs pay in dollars', desc: 'Global teams hire across borders. But the offer only comes after you can talk to them clearly, on a call, in English.' },
  { icon: '🌐', title: 'You’re a freelancing nation', desc: 'Pakistan is among the world’s top freelancing countries. Don’t lose a client in the first 60 seconds of a Zoom call.' },
  { icon: '🎓', title: 'One skill gates them all', desc: 'Scholarships, interviews, promotions, presentations all run on spoken English. Master it, and the doors stop being locked.' },
]

const usps = [
  { icon: '🇵🇰', title: 'Mentors who’ve been in your shoes', desc: 'Pakistani English experts who learned it as a second language, so they know exactly where you get stuck.' },
  { icon: '🎲', title: 'Fun, activity based classes', desc: 'Roleplays, debates and games, not silent grammar drills. Learning that feels like hanging out, not homework.' },
  { icon: '🎤', title: 'You speak from day one', desc: 'Live video sessions, never recordings. Small groups mean you can’t hide. You talk every single class.' },
  { icon: '🌙', title: 'Cohorts that fit your life', desc: 'Evening and weekend groups built around university timetables and 9-to-5 jobs.' },
]

const steps = [
  { icon: '📝', title: 'Enroll in minutes', desc: 'Pick your level and pay easily with Easypaisa, JazzCash or card.' },
  { icon: '👥', title: 'Join your level group', desc: 'We place you in a small cohort of learners at exactly your stage.' },
  { icon: '🧑‍🏫', title: 'Meet your Pakistani mentor', desc: 'An expert who gets the journey, because they’ve walked it too.' },
  { icon: '🚀', title: 'Speak, play & grow', desc: 'Live weekly sessions where you practise real conversations, not theory.' },
]

const activities = [
  '🎭 Roleplays', '💬 Debates', '🎤 Mock interviews', '📊 Presentations',
  '🧩 Speaking games', '📰 Story building', '☎️ Client calls', '🛫 Real life scenarios',
  '🤝 Group challenges', '🗣️ Pronunciation labs',
]

const personas = [
  { icon: '🎓', title: 'University & college students', desc: 'Walk into presentations, vivas and interviews without that knot in your stomach. Build the confidence your degree assumes you already have.', accent: 'from-brand-500 to-indigo-600' },
  { icon: '💼', title: 'Fresh graduates & job seekers', desc: 'Turn “good on paper” into “great in the room.” Speak in interviews the way your CV promises, and stand out from the stack.', accent: 'from-emerald-500 to-teal-600' },
  { icon: '📈', title: 'Working professionals', desc: 'Lead the meeting, win the client, earn the raise. Communicate with global teams and step into rooms you used to stay quiet in.', accent: 'from-amber-500 to-orange-600' },
]

const mentors = [
  { name: 'Adeel', tag: 'IELTS 8.5 · Interview prep', color: 'from-brand-500 to-indigo-600' },
  { name: 'Ms. Hina', tag: 'Spoken English · Confidence', color: 'from-pink-500 to-rose-600' },
  { name: 'Sir Usman', tag: 'Business English · Freelancers', color: 'from-emerald-500 to-teal-600' },
  { name: 'Ms. Sana', tag: 'Accent & pronunciation', color: 'from-amber-500 to-orange-600' },
  { name: 'Sir Ahsan', tag: 'Grammar made simple', color: 'from-violet-500 to-fuchsia-600' },
  { name: 'Ms. Maryam', tag: 'Academic & exam English', color: 'from-cyan-500 to-blue-600' },
]

const testimonials = [
  { name: 'Hamza', city: 'Lahore', body: 'Six weeks ago I’d freeze on a call. Last week I closed my first international client, in English, without my heart racing.', color: 'from-brand-500 to-indigo-600' },
  { name: 'Ayesha', city: 'Karachi', body: 'I stopped translating every sentence in my head. Now I just… speak. My viva went better than I ever imagined.', color: 'from-pink-500 to-rose-600' },
  { name: 'Bilal', city: 'Islamabad', body: 'Got the promotion. My manager literally said my communication had “leveled up.” The group sessions made it click.', color: 'from-emerald-500 to-teal-600' },
]

const courses = [
  {
    name: 'English for Beginners',
    desc: 'Break the fear and speak your first full sentences with confidence.',
    features: ['Small group cohort', '36 live sessions over 12 weeks', 'Everyday vocabulary & basics', 'Activity based curriculum', 'Session recordings', 'Completion certificate'],
    highlight: false,
  },
  {
    name: 'Intermediate English',
    desc: 'Hold real conversations and think in English, not translate.',
    features: ['Small group cohort', '36 live sessions over 12 weeks', 'Conversation & fluency drills', 'Priority mentor matching', 'Session recordings', 'Completion certificate'],
    highlight: true,
  },
  {
    name: 'Advanced English Fluency',
    desc: 'Command the room in interviews, meetings and presentations.',
    features: ['Small group cohort', '36 live sessions over 12 weeks', 'Business & interview prep', 'Accent & pronunciation polish', '1:1 review every 2 weeks', 'Completion certificate'],
    highlight: false,
  },
]

const faq = [
  { q: 'My English is weak and I’m scared of making mistakes. Is this for me?', a: 'Especially for you. Your mentor learned English as a second language and your group is at your level, so nobody is judging. Mistakes are the lesson, not the embarrassment.' },
  { q: 'Why Pakistani mentors instead of native speakers?', a: 'A native speaker never struggled to learn English, so they can’t feel why a tense or sound confuses you. Our mentors did, so they know exactly where Urdu and Punjabi speakers get stuck, and how to make it finally click.' },
  { q: 'I have classes / a full-time job. Will the timings work?', a: 'Yes. We run evening and weekend cohorts built around university timetables and 9-to-5 jobs. You pick the group that fits your routine.' },
  { q: 'How do I pay?', a: 'Easypaisa, JazzCash or debit/credit card. You only pay once your group is confirmed, and there’s a 7 day money back window.' },
  { q: 'What do I need to join?', a: 'A phone or laptop with a camera and a stable internet connection. We run a quick device check before your first session.' },
  { q: 'How big are the groups?', a: 'Small, on purpose. Fewer learners means far more speaking time for you, the opposite of a 40 student classroom where you never get to talk.' },
]

// ── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 glass border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/"><BayyanLogo size={30} /></Link>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
            <a href="#why" className="hover:text-brand-600 transition-colors">Why English</a>
            <a href="#different" className="hover:text-brand-600 transition-colors">Why Bayyan</a>
            <a href="#how" className="hover:text-brand-600 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-brand-600 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2">Sign in</Link>
            <Link href="/register" className="text-sm font-semibold bg-brand-500 text-white px-4 py-2 rounded-full hover:bg-brand-600 transition-colors shadow-sm shadow-purple-200">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-white">
        {/* animated blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-300/40 blur-3xl animate-blob" />
          <div className="absolute top-10 right-0 w-[28rem] h-[28rem] rounded-full bg-fuchsia-300/30 blur-3xl animate-blob blob-delay-2" />
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-emerald-300/30 blur-3xl animate-blob blob-delay-4" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-brand-100 text-brand-700 text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-sm">
                <span className="text-base leading-none">🇵🇰</span>
                Made in Pakistan · Taught by Pakistani experts
              </div>

              <h1 className="text-[2rem] leading-[1.08] sm:text-5xl lg:text-[3.4rem] font-extrabold text-gray-900 tracking-tight mb-5">
                Your skills are exceptional.
                <br className="hidden sm:block" />{' '}
                Is your{' '}
                <span className="bg-gradient-to-r from-brand-500 via-fuchsia-500 to-emerald-500 bg-clip-text text-transparent animate-gradient">
                  English
                </span>
                ?
              </h1>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                In an AI driven world, the best jobs, clients and scholarships go to people who can <span className="font-semibold text-gray-800">speak</span> English, not only write it. Bayyan gets you speaking with confidence in <span className="font-semibold text-gray-800">fun, live group sessions</span> led by Pakistani mentors who learned English exactly like you.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start max-w-md mx-auto lg:mx-0">
                <Link href="/register" className="group bg-brand-500 text-white font-semibold px-7 py-4 rounded-2xl text-base sm:text-lg hover:bg-brand-600 transition-all shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5">
                  Start speaking <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <a href="#how" className="bg-white text-gray-800 font-semibold px-7 py-4 rounded-2xl text-base sm:text-lg border border-gray-200 hover:border-brand-300 hover:text-brand-700 transition-colors">
                  See how it works
                </a>
              </div>

              <p className="text-xs text-gray-400 mt-4">Free to join · pay only when you enroll · 7 day money back</p>

              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs sm:text-sm text-gray-500">
                <span className="inline-flex items-center gap-1.5"><span className="text-emerald-500">✦</span> Pakistani expert mentors</span>
                <span className="inline-flex items-center gap-1.5"><span className="text-emerald-500">✦</span> New cohorts every Monday</span>
                <span className="inline-flex items-center gap-1.5"><span className="text-emerald-500">✦</span> Easypaisa & JazzCash</span>
              </div>
            </div>

            {/* live-session mock */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <LiveSessionMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── Why English now (Problem → Agitate) ──────────────── */}
      <section id="why" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">The world just changed</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">English isn’t a school subject anymore. It’s your career.</h2>
            <p className="text-base sm:text-lg text-gray-500">Talent is everywhere in Pakistan. Opportunity goes to the ones who can speak up.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {whyNow.map((w, i) => (
              <Reveal key={w.title} delay={i * 90}>
                <div className="h-full bg-white rounded-2xl p-6 border border-gray-100 hover:border-brand-200 hover:shadow-lg hover:-translate-y-1 transition-all">
                  <span className="text-3xl block mb-4">{w.icon}</span>
                  <h3 className="font-bold text-gray-900 mb-2">{w.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{w.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120} className="mt-10 text-center">
            <p className="text-lg sm:text-xl font-semibold text-gray-800 max-w-2xl mx-auto">
              The cost of waiting isn’t zero. It’s every opportunity that quietly goes to someone who spoke up first.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── The empathy difference (Solution) ────────────────── */}
      <section id="different" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">Why Bayyan is different</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">A native speaker never struggled. Your mentor did.</h2>
            <p className="text-base sm:text-lg text-gray-500">That’s the whole difference. Empathy you can feel in every correction.</p>
          </Reveal>

          <Reveal>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {/* the usual */}
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xl">🌍</span>
                  <h3 className="font-bold text-gray-700">A typical native tutor</h3>
                </div>
                <ul className="space-y-3.5">
                  {[
                    'Never had to learn English, can’t feel why it’s hard',
                    'Speaks fast, assumes context you don’t have',
                    'Foreign accent, foreign examples',
                    'You stay nervous, afraid to sound “wrong”',
                  ].map(t => (
                    <li key={t} className="flex items-start gap-3 text-sm text-gray-500">
                      <span className="text-gray-300 mt-0.5 flex-shrink-0">✕</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* bayyan */}
              <div className="relative rounded-3xl border-2 border-brand-300 bg-gradient-to-br from-brand-50 to-white p-6 sm:p-8 shadow-lg shadow-purple-100">
                <span className="absolute -top-3 left-6 text-[10px] font-bold uppercase tracking-wider bg-brand-500 text-white px-3 py-1 rounded-full">The Bayyan way</span>
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xl">🇵🇰</span>
                  <h3 className="font-bold text-brand-900">A Pakistani Bayyan mentor</h3>
                </div>
                <ul className="space-y-3.5">
                  {[
                    'Learned English as a second language, just like you',
                    'Knows exactly where Urdu & Punjabi speakers get stuck',
                    'Explains it in a way that finally clicks',
                    'Patient, relatable, completely on your side',
                  ].map(t => (
                    <li key={t} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          {/* USP grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
            {usps.map((u, i) => (
              <Reveal key={u.title} delay={i * 90}>
                <div className="h-full bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                  <span className="text-3xl block mb-3">{u.icon}</span>
                  <h3 className="font-bold text-gray-900 mb-1.5 text-[15px]">{u.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{u.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Activity marquee ─────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-brand-900 overflow-hidden">
        <Reveal className="text-center max-w-2xl mx-auto px-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Learning that feels like hanging out</h2>
          <p className="text-brand-200">No silent grammar drills. Every session is built around real, fun activities.</p>
        </Reveal>
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex shrink-0 gap-4 pr-4 animate-marquee">
            {[...activities, ...activities].map((a, i) => (
              <span key={i} className="whitespace-nowrap text-sm sm:text-base font-semibold text-white bg-white/10 border border-white/15 px-5 py-2.5 rounded-full">
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">How it works</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">From nervous to speaking in four steps</h2>
            <p className="text-base sm:text-lg text-gray-500">Sign up today, meet your group and mentor this week.</p>
          </Reveal>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <li className="relative h-full bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{s.icon}</span>
                    <span className="text-xs font-bold text-brand-500 bg-brand-50 px-2.5 py-1 rounded-full">Step {i + 1}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Who it's for ─────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">Who it’s for</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">Wherever you are, English is the next level</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {personas.map((p, i) => (
              <Reveal key={p.title} delay={i * 110}>
                <div className="group h-full rounded-3xl border border-gray-100 p-7 hover:shadow-xl transition-all overflow-hidden relative">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${p.accent}`} />
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.accent} flex items-center justify-center text-2xl mb-5 group-hover:scale-105 transition-transform`}>
                    {p.icon}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mentors ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">Your mentors</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">Pakistani experts who get the struggle</h2>
            <p className="text-base sm:text-lg text-gray-500">Vetted, certified, and genuinely invested in you speaking up.</p>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {mentors.map((m, i) => (
              <Reveal key={m.name} delay={(i % 3) * 90}>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                    {m.name.replace(/^(Ustad|Sir|Ms\.)\s/, '').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm sm:text-base">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.tag}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">Real wins</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">From “I freeze” to “I just speak”</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 110}>
                <figure className="h-full bg-white rounded-2xl p-6 border border-gray-100 flex flex-col">
                  <div className="text-amber-400 mb-3 text-sm">★★★★★</div>
                  <blockquote className="text-gray-700 text-[15px] leading-relaxed mb-5 flex-1">“{t.body}”</blockquote>
                  <figcaption className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}>{t.name[0]}</span>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.city}</div>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">Pricing</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">An investment in the one skill that pays for itself</h2>
            <p className="text-base sm:text-lg text-gray-500">Pick your level. Every course is the same flat price. No subscriptions. Easypaisa, JazzCash or card.</p>
            <div className="inline-flex items-center gap-2 mt-5 bg-red-50 text-red-600 font-bold text-sm px-4 py-2 rounded-full ring-1 ring-red-200">
              🔥 Limited time launch offer · Save ₨5,000 on every course
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto items-stretch">
            {courses.map((t, i) => (
              <Reveal key={t.name} delay={i * 100} className={t.highlight ? 'md:-mt-3' : ''}>
                <div className={`relative h-full rounded-3xl p-7 sm:p-8 flex flex-col ${t.highlight ? 'bg-brand-500 text-white shadow-2xl shadow-purple-300 ring-4 ring-brand-500/20' : 'bg-white text-gray-900 border border-gray-200'}`}>
                  <div className="absolute -top-3 right-5 whitespace-nowrap text-[11px] font-extrabold uppercase tracking-wider bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg shadow-red-300/50">
                    20% OFF
                  </div>
                  {t.highlight && <span className="inline-block self-start text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full mb-3">Most popular</span>}
                  <h3 className={`text-xl font-bold mb-1 ${t.highlight ? 'text-white' : 'text-gray-900'}`}>{t.name}</h3>
                  <p className={`text-sm mb-5 ${t.highlight ? 'text-purple-100' : 'text-gray-500'}`}>{t.desc}</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-base font-semibold line-through ${t.highlight ? 'text-purple-200' : 'text-red-400'}`}>₨25,000</span>
                    <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${t.highlight ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>Save ₨5,000</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold">₨</span>
                    <span className="text-4xl font-extrabold">20,000</span>
                  </div>
                  <p className={`text-sm mb-1 ${t.highlight ? 'text-purple-100' : 'text-gray-500'}`}>12 weeks · 3 sessions / week</p>
                  <p className={`text-xs mb-6 font-medium ${t.highlight ? 'text-purple-50' : 'text-gray-600'}`}>Pay in full or 3 installments of ₨6,667.</p>
                  <ul className={`space-y-2.5 text-sm mb-7 flex-1 ${t.highlight ? 'text-purple-50' : 'text-gray-600'}`}>
                    {t.features.map(f => (
                      <li key={f} className="flex items-start gap-2">
                        <span className={t.highlight ? 'text-white' : 'text-emerald-500'}>✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={`block text-center font-semibold px-5 py-3.5 rounded-xl transition-colors ${t.highlight ? 'bg-white text-brand-600 hover:bg-purple-50' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                    Enroll now
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120} className="text-center mt-8">
            <p className="text-sm text-gray-500">7 day money back guarantee · Cancel anytime before your cohort starts</p>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">Questions</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">Honest answers, before you start</h2>
          </Reveal>
          <div className="space-y-3">
            {faq.map(item => (
              <details key={item.q} className="group bg-white rounded-2xl px-5 py-4 sm:px-6 sm:py-5 border border-gray-100 open:border-brand-200 open:shadow-sm transition-all">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-gray-900 text-sm sm:text-base">
                  <span>{item.q}</span>
                  <span className="text-brand-500 text-xl leading-none transition-transform group-open:rotate-45 flex-shrink-0">+</span>
                </summary>
                <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 sm:py-28 px-4 sm:px-6 lg:px-8 bg-brand-600 text-white text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full bg-fuchsia-400/30 blur-3xl animate-blob" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl animate-blob blob-delay-2" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <Reveal>
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight">A year from now, you’ll wish you started today.</h2>
            <p className="text-purple-100 text-base sm:text-lg mb-9">
              Your next cohort starts Monday. The version of you that speaks with confidence is one decision away.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Link href="/register" className="bg-white text-brand-600 font-bold px-8 py-4 rounded-2xl text-base sm:text-lg hover:bg-purple-50 transition-all hover:-translate-y-0.5 shadow-lg">
                Start speaking today
              </Link>
              <Link href="/login" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-base sm:text-lg transition-colors backdrop-blur">
                I already have an account
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-12 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-3"><BayyanLogo size={26} tone="light" /></div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xs">Live, group based English taught by Pakistani experts who’ve walked the path you’re on.</p>
          </div>
          <FooterCol title="Explore" links={[['Why English', '#why'], ['Why Bayyan', '#different'], ['How it works', '#how'], ['Pricing', '#pricing']]} />
          <FooterCol title="Account" links={[['Sign in', '/login'], ['Get started', '/register'], ['FAQ', '#faq']]} />
          <FooterCol title="Company" links={[['About', '#'], ['Contact', '#'], ['Privacy', '#'], ['Terms', '#']]} />
        </div>
        <div className="max-w-7xl mx-auto pt-6 sm:pt-8 border-t border-gray-800 text-xs sm:text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Bayyan. All rights reserved.</span>
          <span>Speak with confidence. 🇵🇰</span>
        </div>
      </footer>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function LiveSessionMock() {
  return (
    <div className="relative">
      {/* floating reaction chips */}
      <div className="absolute -top-3 -left-3 z-10 bg-white rounded-full px-3 py-1.5 shadow-lg text-sm font-semibold text-gray-700 animate-floaty">👏 Great!</div>
      <div className="absolute -bottom-4 -right-2 z-10 bg-white rounded-full px-3 py-1.5 shadow-lg text-sm font-semibold text-gray-700 animate-floaty" style={{ animationDelay: '-2.5s' }}>🔥 You got this</div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-purple-200/60 p-4 sm:p-5">
        {/* header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE
            </span>
            <span className="text-xs font-medium text-gray-400">Speaking Lab · 14:32</span>
          </div>
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-full">Group B2</span>
        </div>

        {/* tiles */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="col-span-2 relative rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 h-28 flex items-end p-3">
            <span className="text-white text-sm font-semibold">Adeel · Mentor</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] font-bold text-white/90 bg-black/20 px-2 py-0.5 rounded-full">Speaking</span>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 h-20 flex items-end p-2.5">
            <span className="text-white text-xs font-semibold">You</span>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 h-20 flex items-end p-2.5">
            <span className="text-white text-xs font-semibold">Ayesha</span>
          </div>
        </div>

        {/* activity prompt */}
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Today’s activity</p>
          <p className="text-sm font-semibold text-gray-800">🎭 Roleplay: Acing a job interview</p>
        </div>
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
