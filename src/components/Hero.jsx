import { ChevronDown } from 'lucide-react'

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.03) 35px, rgba(255,255,255,0.03) 70px)`
        }} />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Logo icon */}
        <div className="animate-fade-in-up mb-8">
          <img src="/images/logo.png" alt="Force Up Logo" className="w-32 h-auto mx-auto mb-6" />
        </div>

        {/* Main headline */}
        <h1 className="animate-fade-in-up animation-delay-200">
          <span className="block text-7xl sm:text-8xl md:text-9xl font-black text-white tracking-tight leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            FORCE UP
          </span>
          <span className="block text-3xl sm:text-4xl md:text-5xl font-light text-white/60 mt-2" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.15em' }}>
            EVERY DAY
          </span>
        </h1>

        {/* Divider */}
        <div className="animate-fade-in-up animation-delay-400 flex items-center justify-center gap-4 my-8">
          <div className="w-16 h-px bg-white/30" />
          <div className="w-2 h-2 bg-white/50 rotate-45" />
          <div className="w-16 h-px bg-white/30" />
        </div>

        {/* Subtext */}
        <p className="animate-fade-in-up animation-delay-400 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Force Up is a movement for the next generation and is a reminder that you don't stay stuck.
          Whether it's in school, sports, leadership, or life, you're not here to coast, you're here to <span className="text-white font-semibold">level up</span>.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up animation-delay-600 flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <a
            href="#shop"
            className="group bg-white text-black px-10 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-all hover:scale-105"
          >
            Shop the Movement
          </a>
          <a
            href="#message"
            className="group border border-white/30 text-white px-10 py-4 rounded-full text-sm font-medium uppercase tracking-widest hover:border-white hover:bg-white/5 transition-all"
          >
            Our Story
          </a>
        </div>

        {/* Tagline badge */}
        <div className="animate-fade-in animation-delay-600 mt-16">
          <span className="inline-block px-6 py-2 border border-white/10 rounded-full text-xs text-gray-500 uppercase tracking-[0.3em]">
            Next Gen… Next Level
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-white/30" />
      </div>
    </section>
  )
}
