import React from 'react';

const ValueProps: React.FC = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background Gradient Line */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/20 to-transparent hidden md:block" />

      <div className="max-w-7xl mx-auto px-6 space-y-32 py-32 relative z-10">

        {/* Section 1: Research & Strategy */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
            <div className="glass-panel p-8 rounded-3xl border border-white/10 relative z-10 transform hover:scale-[1.02] transition-transform duration-500">
              {/* Visual Representation of AI Role Play */}
              <div className="space-y-4 flex flex-col h-full bg-black/20 p-2 rounded-2xl">
                {/* User Bubble */}
                <div className="bg-white/10 p-3 rounded-2xl rounded-tr-sm self-end max-w-[85%] border border-white/5">
                  <p className="text-sm text-gray-200">"I'm not sure we have the budget this quarter..."</p>
                </div>
                
                {/* AI Coach Analysis */}
                <div className="flex items-start gap-3 mt-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50 flex-shrink-0 animate-[pulse_2s_ease-in-out_infinite]">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-2xl rounded-tl-sm border border-blue-500/20 w-full relative overflow-hidden">
                    <div className="text-[10px] text-blue-300 font-mono mb-1 uppercase tracking-wider">Neural Analysis</div>
                    <p className="text-sm text-blue-100 font-medium leading-tight mb-2">Price objection matched. Tone identified as hesitant.</p>
                    <div className="bg-black/40 px-2 py-1.5 rounded-lg border border-white/10 inline-block">
                      <span className="text-xs text-green-400"><span className="text-gray-500 mr-1">Pivot:</span>ROI Demonstration</span>
                    </div>
                  </div>
                </div>
                
                {/* Bottom Mic Input area */}
                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2 items-center">
                  <div className="flex-1 bg-black/50 h-10 rounded-full border border-white/10 flex items-center px-4">
                    <span className="text-gray-600 text-sm">Hold to respond...</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer relative group">
                    <div className="w-full h-full rounded-full bg-white/20 animate-ping absolute inset-0" />
                    <svg className="w-5 h-5 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium uppercase tracking-wider">
              01. Pocket Customer
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Sharpen Your Team's<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Sales Capability.</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Improve customer interactions through AI-powered roleplay, behavioural insight, and real-time coaching. Built for frontline teams who need to perform.
            </p>
          </div>
        </div>

        {/* Section 2: Daily Content */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium uppercase tracking-wider">
              02. PulseCheck 360
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Develop Leaders Who<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Drive Results.</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Build high-performing cultures and sustain team wellbeing. Access visual data and coaching tools to spot friction, fatigue, and team trust signals before small issues become big ones.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full" />
            <div className="glass-panel p-8 rounded-3xl border border-white/10 relative z-10 transform hover:scale-[1.02] transition-transform duration-500">
              {/* Visual Representation of Pulse Check */}
              <div className="flex gap-4 items-center mb-6 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-full p-[1px] bg-gradient-to-r from-cyan-400 to-blue-400">
                   <div className="w-full h-full bg-gray-800 rounded-full border border-gray-700"></div>
                </div>
                <div>
                    <div className="text-white font-medium">Team Wellbeing Check-in</div>
                    <div className="text-cyan-400 text-xs">Weekly Pulse</div>
                </div>
              </div>
              <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                      <span className="text-sm text-gray-300">Energy Levels</span>
                      <span className="text-sm text-green-400 font-bold">High (8/10)</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                      <span className="text-sm text-gray-300">Workload Capacity</span>
                      <span className="text-sm text-yellow-400 font-bold">Balanced</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                      <span className="text-sm text-gray-300">Team Trust Score</span>
                      <span className="text-sm text-cyan-400 font-bold">95%</span>
                  </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-2xl flex items-center gap-3 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-white text-sm font-medium">Wellbeing Optimized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Funnel Optimization */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute inset-0 bg-green-500/20 blur-[100px] rounded-full" />
            <div className="glass-panel p-8 rounded-3xl border border-white/10 relative z-10 transform hover:scale-[1.02] transition-transform duration-500">
              {/* Visual Representation of Revenue/Funnel */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Monthly Revenue</p>
                    <h3 className="text-4xl font-bold text-white">$42,500</h3>
                  </div>
                  <div className="text-green-400 flex items-center gap-1 text-sm font-medium bg-green-500/10 px-2 py-1 rounded-lg">
                    +128%
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>

                {/* Simple Chart Visualization */}
                <div className="flex items-end gap-2 h-32 pt-4 border-b border-white/5">
                  <div className="w-full bg-white/5 rounded-t hover:bg-green-500/40 transition-colors h-[30%]" />
                  <div className="w-full bg-white/5 rounded-t hover:bg-green-500/40 transition-colors h-[45%]" />
                  <div className="w-full bg-white/5 rounded-t hover:bg-green-500/40 transition-colors h-[40%]" />
                  <div className="w-full bg-white/5 rounded-t hover:bg-green-500/40 transition-colors h-[65%]" />
                  <div className="w-full bg-white/5 rounded-t hover:bg-green-500/40 transition-colors h-[55%]" />
                  <div className="w-full bg-green-500 rounded-t shadow-[0_0_20px_rgba(34,197,94,0.3)] h-[90%]" />
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium uppercase tracking-wider">
              03. Behavioural Intelligence Engine
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Track Patterns That<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Drive Action.</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Track patterns across leaders, frontline teams, and business units with data that drives action. Eliminate the performance gap between your best people and the rest of the team through consistent service and sales excellence.
            </p>
          </div>
        </div>

        {/* Section 4: AI-Driven L&D */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-medium uppercase tracking-wider">
              04. Digitalized Learning & Development
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Modernise Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Leadership Online.</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Transform traditional onboarding and leadership training into engaging, high-retention experiences. By leveraging interactive gamification and AI, we bring your capability frameworks to life—turning static L&D into a dynamic digital environment.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-pink-500/20 blur-[100px] rounded-full" />
            <div className="glass-panel p-8 rounded-3xl border border-white/10 relative z-10 transform hover:scale-[1.02] transition-transform duration-500 h-full flex flex-col justify-center min-h-[350px]">
              {/* Leaderboard / Gamification Visual */}
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white font-medium">Leadership Capability Profile</span>
                  <span className="text-pink-400 text-xs font-bold px-2 py-1 rounded bg-pink-500/20 border border-pink-500/30">Level 4</span>
                </div>
                
                {/* Skill Nodes */}
                <div className="space-y-3">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center border border-pink-500/50">
                        <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <span className="text-gray-300 text-sm">Strategic Thinking</span>
                    </div>
                    <span className="text-green-400 text-[10px] uppercase font-bold tracking-wider relative flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> UNLOCKED
                    </span>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/50">
                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      </div>
                      <span className="text-gray-300 text-sm">Conflict Resolution</span>
                    </div>
                    <div className="w-24 h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-3/4 animate-pulse"></div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between group opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center border border-gray-500/50">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <span className="text-gray-400 text-sm">Advanced Coaching</span>
                    </div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">LOCKED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ValueProps;
