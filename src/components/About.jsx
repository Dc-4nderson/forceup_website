import { useEffect, useRef, useState } from 'react'

// Drop your photos into public/images/ as founder.jpg and family.jpg
const founderImg = '/images/founder.jpg'
const familyImg = '/images/family.jpg'

export default function About() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" ref={sectionRef} className="relative py-28 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-medium">The Founder</span>
          <h2 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Meet Jackson
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Image side */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={founderImg}
                  alt="Jackson Hardwick - Founder of Force Up"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white font-bold text-xl">Jackson Hardwick</p>
                  <p className="text-gray-300 text-sm">Founder, Force Up</p>
                </div>
              </div>

              {/* Secondary image */}
              <div className="mt-6 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={familyImg}
                  alt="Force Up family and supporters"
                  className="w-full h-64 object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className={`transition-all duration-700 delay-400 ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
            <div className="space-y-6">
              <p className="text-lg text-gray-400 leading-relaxed">
                My name is <span className="text-white font-semibold">Jackson Hardwick</span>, and my parents have always encouraged me in the
                areas of leadership, service, character, and academics.
              </p>

              <p className="text-gray-400 leading-relaxed">
                I am an honor student and have maintained good grades since kindergarten. I've been
                inducted into the <span className="text-white">National Junior Honor Society</span> and selected for the <span className="text-white">Omega
                Lamplighters Leadership Program</span>, where I continue developing as a young leader
                committed to excellence.
              </p>

              <p className="text-gray-400 leading-relaxed">
                I serve as a youth leader at my church because I believe leadership is about helping
                others grow — not just being in charge. I am also on a competitive <span className="text-white">STEM robotics
                team</span>, where I've learned teamwork, innovation, and how to solve problems under pressure.
              </p>

              <p className="text-gray-400 leading-relaxed">
                I participate in Speech and Debate, College Prep, NSBE Jr., and I've been invited to
                advanced academic programs including AP Capstone, AICE, Early College, and IB
                preparation as I approach high school.
              </p>

              <div className="border-l-4 border-white/20 pl-6 py-2 my-8">
                <p className="text-white text-lg font-medium italic leading-relaxed">
                  "Force Up is about showing young people that it is cool to be a good kid and that hard
                  work matters if you really want to level up."
                </p>
              </div>

              <p className="text-gray-400 leading-relaxed">
                I'm not just trying to have a clothing brand — I want my friends and family to join me in
                building a mindset. And I want to see Force Up worn by young leaders everywhere who
                are committed to becoming their best.
              </p>

              <div className="pt-6 border-t border-white/10">
                <p className="text-white font-bold text-lg">Next Gen… Next Level.</p>
                <p className="text-gray-500 mt-1">— Jackson Hardwick</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
