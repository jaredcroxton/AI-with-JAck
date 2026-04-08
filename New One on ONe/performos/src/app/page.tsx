import Link from "next/link";

function NavBar() {
  return (
    <nav className="w-full px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-bg" />
        <span className="text-xl font-semibold text-[var(--text-on-dark)] tracking-tight">
          Perform<span className="gradient-text">OS</span>
        </span>
      </div>
      <Link
        href="/login"
        className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-on-dark)] transition-colors"
      >
        Sign in
      </Link>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="bg-[var(--navy)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-blue)]/5 via-transparent to-[var(--accent-green)]/5" />
      <NavBar />
      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5">
          <span className="text-sm text-[var(--text-secondary)]">
            Built for managers who care
          </span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-[var(--text-on-dark)] leading-tight tracking-tight max-w-3xl mx-auto">
          Structured one-on-ones.{" "}
          <span className="gradient-text">Safer teams.</span>
        </h1>
        <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Run performance conversations that surface what matters early.
          PerformOS helps managers detect disengagement, burnout, and
          psychological safety risks before they escalate.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login?role=manager"
            className="group relative inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-semibold text-white transition-all gradient-bg hover:opacity-90 hover:shadow-lg hover:shadow-[var(--accent-blue)]/20"
          >
            <ManagerIcon />
            I am a Manager
          </Link>
          <Link
            href="/login?role=team_member"
            className="group relative inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-semibold text-[var(--text-on-dark)] border border-white/15 bg-white/5 hover:bg-white/10 transition-all"
          >
            <TeamMemberIcon />
            I am a Team Member
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[var(--text-on-light)] tracking-tight">
            Everything you need for meaningful one-on-ones
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            From pre-meeting reflections to AI-powered risk detection, PerformOS
            gives you the tools to lead with empathy and insight.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ConversationIcon />}
            title="Structured sessions"
            description="Guide every one-on-one with a consistent framework. Capture notes, reflections, and action items in one place."
          />
          <FeatureCard
            icon={<ShieldIcon />}
            title="Risk detection"
            description="AI analyses conversation patterns to surface early signs of disengagement, burnout, or psychological safety concerns."
          />
          <FeatureCard
            icon={<ChartIcon />}
            title="Team health dashboard"
            description="Track session completion, mood trends, and open action items across your team at a glance."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 rounded-2xl border border-gray-100 bg-white shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-lg)] transition-shadow">
      <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-on-light)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section className="bg-[var(--navy)] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[var(--text-on-dark)] tracking-tight">
            How it works
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: "1",
              title: "Schedule",
              desc: "Set up recurring one-on-ones with each team member.",
            },
            {
              step: "2",
              title: "Reflect",
              desc: "Team members submit pre-meeting reflections on wins, challenges, and support needed.",
            },
            {
              step: "3",
              title: "Converse",
              desc: "Run the session with AI-generated coaching prompts and capture notes in real time.",
            },
            {
              step: "4",
              title: "Detect",
              desc: "AI flags early risk signals. Review your team health dashboard for patterns.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-on-dark)] mb-2">
                {item.title}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-teal)]/10 flex items-center justify-center mx-auto mb-6">
          <LockIcon />
        </div>
        <h2 className="text-3xl font-bold text-[var(--text-on-light)] tracking-tight">
          Privacy by design
        </h2>
        <p className="mt-4 text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
          Individual reflections are never visible to executives. The executive
          dashboard shows only aggregated team health scores and risk patterns.
          Your team members can trust that their honest reflections stay between
          them and their manager.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[var(--navy)] border-t border-white/5 py-8">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md gradient-bg" />
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Perform<span className="gradient-text">OS</span>
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Built for teams that value their people.
        </p>
      </div>
    </footer>
  );
}

// Icons
function ManagerIcon() {
  return (
    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function TeamMemberIcon() {
  return (
    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  );
}

function ConversationIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-8 h-8 text-[var(--accent-teal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PrivacySection />
      <Footer />
    </div>
  );
}
