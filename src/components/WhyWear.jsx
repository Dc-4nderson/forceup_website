import { useEffect, useRef, useState } from 'react'
import { Sparkles, Crown, ArrowUp, Brain } from 'lucide-react'

const reasons = [
  { icon: Sparkles, text: "I'm really trying to be better" },
  { icon: Crown, text: "I'm a Leader" },
  { icon: ArrowUp, text: "I'm going Higher" },
  { icon: Brain, text: "Next-level thinking" },
]

export default function WhyWear() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-28 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-medium">The Movement</span>
          <h2 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Why Wear Force Up?
          </h2>
        </div>

        <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 delay-200 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <p className="text-lg text-gray-400 leading-relaxed">
            You don't wear Force Up to look cool — you wear it to remind yourself and others who
            you are and that you are working on <span className="text-white font-semibold">leveling up</span>!
          </p>
        </div>

        {/* Reason cards */}
        <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 delay-300 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {reasons.map((reason, i) => (
            <div key={i} className="group text-center p-8 border border-white/10 rounded-2xl hover:border-white/25 hover:bg-white/[0.02] transition-all">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-xl mb-5 group-hover:bg-white/15 transition-colors">
                <reason.icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-white font-semibold text-lg">{reason.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`text-center mt-16 transition-all duration-700 delay-500 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
            Shop the Movement. Wear the Mindset.
          </p>
          <div className="w-16 h-0.5 bg-white/20 mx-auto mt-4" />
        </div>
      </div>
    </section>
  )
}
