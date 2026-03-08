import { Mail, Settings } from 'lucide-react'
import { SiTiktok } from 'react-icons/si'

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/logo.png" alt="Force Up" className="h-10 w-auto" />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              A movement for the next generation. We don't stay stuck, we level up in school,
              sports, leadership, and life.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <div className="space-y-3">
              {[
                { name: 'Home', href: '#home' },
                { name: 'Our Message', href: '#message' },
                { name: 'About Jackson', href: '#about' },
                { name: 'The Code', href: '#code' },
                { name: 'Shop', href: '#shop' },
                { name: 'Gallery', href: '#gallery' },
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-gray-500 hover:text-white text-sm transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Connect</h4>
            <p className="text-gray-500 text-sm mb-4">
              Follow the movement and join the next generation of leaders.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.tiktok.com/@thee.flyjay?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-lg text-gray-500 hover:text-white hover:border-white/30 transition-colors"
              >
                <SiTiktok className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@forceup.com"
                className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-lg text-gray-500 hover:text-white hover:border-white/30 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Force Up™. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-gray-600 text-xs tracking-widest uppercase">
              Next Gen… Next Level
            </p>
            <a
              href="/admin"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-300 transition-colors text-xs uppercase tracking-wider"
            >
              <Settings className="w-4 h-4" />
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
