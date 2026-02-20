import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'

const codeItems = [
  "I don't quit when it gets hard.",
  "I respect my parents, teachers, and friends.",
  "I study and show up prepared.",
  "I put in work to get better.",
  "I am honest.",
  "I level up daily.",
]

export default function ForceUpCode() {
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
    <section id="code" ref={sectionRef} className="relative py-28 bg-black">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-black" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-medium">Live By It</span>
          <h2 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            The Force Up Code
          </h2>
        </div>

        {/* Code items */}
        <div className={`space-y-4 max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {codeItems.map((item, i) => (
            <div
              key={i}
              className="group flex items-center gap-5 p-5 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.02] transition-all"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <p className="text-white text-lg font-medium">{item}</p>
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div className={`text-center mt-16 transition-all duration-700 delay-400 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="inline-block px-8 py-4 border border-white/10 rounded-full">
            <p className="text-gray-400 text-sm uppercase tracking-[0.2em]">
              This is how we carry ourselves
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
