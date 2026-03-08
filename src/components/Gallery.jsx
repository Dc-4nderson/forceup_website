import { useEffect, useRef, useState } from 'react'

const galleryImages = [
  { src: '/images/gallery1.jpg', alt: 'Force Up community member' },
  { src: '/images/gallery-crew.jpg', alt: 'Force Up crew repping the movement' },
  { src: '/images/gallery-trio.jpg', alt: 'Force Up community members' },
  { src: '/images/gallery-camera.jpg', alt: 'Force Up supporters with camera' },
  { src: '/images/gallery-brick.jpg', alt: 'Force Up member filming content' },
  { src: '/images/gallery-school.jpg', alt: 'Force Up supporter at school' },
  { src: '/images/gallery-style.jpg', alt: 'Force Up member styling the tee' },
  { src: '/images/gallery-navy.jpg', alt: 'Force Up supporter in navy tee' },
  { src: '/images/gallery-mirror.jpg', alt: 'Force Up member mirror selfie' },
  { src: '/images/gallery-jacket.jpg', alt: 'Force Up supporter in jacket' },
  { src: '/images/gallery-selfie.jpg', alt: 'Force Up duo selfie' },
  { src: '/images/gallery-pointing.jpg', alt: 'Force Up supporter pointing to the logo' },
  { src: '/images/gallery-bowtie.jpg', alt: 'Young Force Up member in navy tee with bowtie' },
  { src: '/images/gallery-smile.jpg', alt: 'Force Up supporter smiling in navy tee' },
  { src: '/images/gallery-three-navy.jpg', alt: 'Three Force Up supporters in matching navy tees' },
  { src: '/images/gallery-booth.jpg', alt: 'Force Up merch booth with banner' },
  { src: '/images/gallery-banner.jpg', alt: 'Supporter standing next to Force Up banner' },
  { src: '/images/gallery-friends.jpg', alt: 'Force Up friends repping the movement outdoors' },
  { src: '/images/gallery-duo-mural.jpg', alt: 'Force Up duo posing by a mural' },
  { src: '/images/gallery-table.jpg', alt: 'Force Up crew at the table' },
  { src: '/images/gallery-field.jpg', alt: 'Force Up member showing off the white tee on the field' },
  { src: '/images/gallery-bleachers.jpg', alt: 'Force Up group photo on the bleachers' },
  { src: '/images/gallery-redhead.jpg', alt: 'Force Up supporters hanging out on the field' },
  { src: '/images/gallery-church.jpg', alt: 'Force Up supporter at an event' },
]

export default function Gallery() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.05 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="gallery" ref={sectionRef} className="relative py-28 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-medium">Community</span>
          <h2 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Force Up Family
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
            Real people wearing the movement. Join the next generation of leaders.
          </p>
        </div>

        <div className={`columns-2 md:columns-3 gap-4 space-y-4 transition-all duration-700 delay-200 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {galleryImages.map((image, i) => (
            <div
              key={i}
              className="group relative rounded-2xl overflow-hidden bg-zinc-900 break-inside-avoid"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
