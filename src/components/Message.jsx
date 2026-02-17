import { useEffect, useRef, useState } from 'react'
import { TrendingUp, Target, Zap } from 'lucide-react'

export default function Message() {
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
    <section id="message" ref={sectionRef} className="relative py-28 bg-black">
      {/* Subtle top border */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-medium">Our Message</span>
          <h2 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Next Gen… Next Level.
          </h2>
        </div>

        {/* Main content */}
        <div className={`max-w-3xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <p className="text-lg text-gray-400 leading-relaxed mb-8">
            Force Up isn't just a brand — it's a reminder that we don't stay stuck. Not in bad grades,
            not in fear, and not in excuses. Our generation is built to grow. We level up in the
            classroom, on the field, in leadership, in discipline, and in how we carry ourselves.
          </p>
          <p className="text-lg text-gray-400 leading-relaxed mb-8">
            It takes real work to be a good kid, so our effort is <span className="text-white font-semibold">non-negotiable</span>.
          </p>
          <p className="text-xl text-white font-medium leading-relaxed border-l-4 border-white/20 pl-6">
            So when issues around us seem to want to push us down, we push higher and we
            refuse to just be average! That's what <span className="font-bold">Force Up</span> means.
          </p>
        </div>

        {/* Value cards */}
        <div className={`grid md:grid-cols-3 gap-8 mt-20 transition-all duration-700 delay-400 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {[
            {
              icon: TrendingUp,
              title: 'Level Up',
              desc: 'We grow in the classroom, on the field, in leadership, and in how we carry ourselves.'
            },
            {
              icon: Target,
              title: 'Stay Focused',
              desc: 'Our effort is non-negotiable. We don\'t coast — we commit to excellence in everything.'
            },
            {
              icon: Zap,
              title: 'Push Higher',
              desc: 'When the world pushes down, we push higher. We refuse to be average.'
            }
          ].map((card, i) => (
            <div key={i} className="group p-8 border border-white/10 rounded-2xl hover:border-white/20 transition-all hover:bg-white/[0.02]">
              <card.icon className="w-8 h-8 text-white/60 mb-5 group-hover:text-white transition-colors" />
              <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
              <p className="text-gray-500 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
