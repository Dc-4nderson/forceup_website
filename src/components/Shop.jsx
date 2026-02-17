import { useEffect, useRef, useState } from 'react'
import { ShoppingBag, Star, Shirt, Shield, Paintbrush, Users, Minus, Plus } from 'lucide-react'
import { PRODUCTS, PAYMENT_LINK } from '../config/stripe'

const colorways = [
  { name: 'Black', image: '/images/shirt-black.png' },
  { name: 'Navy', image: '/images/shirt-navy.png' },
  { name: 'White', image: '/images/shirt-white.png' },
]

const sizeCategories = {
  Adult: ['S', 'M', 'L', 'XL'],
  Kid: ['YS', 'YM', 'YL', 'YXL'],
}
const features = [
  { icon: Shirt, text: 'Soft, breathable cotton blend' },
  { icon: Star, text: 'Athletic unisex fit' },
  { icon: Shield, text: 'Durable print built to last' },
  { icon: Paintbrush, text: 'Clean, bold design for everyday wear' },
  { icon: Users, text: 'Designed by youth. Built for growth.' },
]

const PRICE = 16

export default function Shop() {
  const [isVisible, setIsVisible] = useState(false)
  const [sizeCategory, setSizeCategory] = useState('Adult')
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const handleCheckout = async () => {
    setIsProcessing(true)
    try {
      if (PAYMENT_LINK) {
        window.location.href = PAYMENT_LINK
        return
      }
      alert(
        `Stripe checkout coming soon!\n\nOrder Summary:\n` +
        `Force Up™ Signature Tee (${colorways[selectedColor].name})\n` +
        `Size: ${selectedSize}\n` +
        `Quantity: ${quantity}\n` +
        `Total: $${(PRICE * quantity).toFixed(2)}`
      )
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout is not yet configured. Stripe credentials will be added soon.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <section id="shop" ref={sectionRef} className="relative py-28 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-medium">Shop</span>
          <h2 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Wear the Movement
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900 aspect-[3/4]">
              <img
                src={colorways[selectedColor].image}
                alt={`Force Up Signature Tee - ${colorways[selectedColor].name}`}
                className="w-full h-full object-cover object-top transition-opacity duration-500"
              />
            </div>
            <div className="flex gap-3 mt-4">
              {colorways.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedColor === i ? 'border-white' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img src={color.image} alt={color.name} className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          </div>

          <div className={`transition-all duration-700 delay-400 ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
            <div className="sticky top-28">
              <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs text-gray-400 uppercase tracking-wider mb-4">
                Signature Collection
              </div>

              <h3 className="text-3xl sm:text-4xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                FORCE UP™ Signature Tee
              </h3>
              <p className="text-gray-500 text-sm mb-4">Next Gen… Next Level.</p>

              <p className="text-3xl font-bold text-white mb-6">${PRICE.toFixed(2)}</p>

              <p className="text-gray-400 leading-relaxed mb-8">
                More than a shirt, Force Up is about leveling up in school, sports, leadership, and life.
                It's for the next generation that refuses to stay average. Work hard, stay disciplined
                and keep rising because we don't stay stuck… We Force Up.
              </p>

              <div className="mb-8">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Color</p>
                <div className="flex gap-3">
                  {colorways.map((color, i) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(i)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        selectedColor === i
                          ? 'bg-white text-black'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Size</p>
                <div className="flex gap-3 mb-3">
                  {Object.keys(sizeCategories).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSizeCategory(cat); setSelectedSize(sizeCategories[cat][1]) }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        sizeCategory === cat
                          ? 'bg-white text-black'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  {sizeCategories[sizeCategory].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 rounded-xl text-sm font-bold transition-all ${
                        selectedSize === size
                          ? 'bg-white text-black'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Quantity</p>
                <div className="inline-flex items-center border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-3 text-white font-medium min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 px-8 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                {isProcessing ? 'Processing...' : `Buy Now, $${(PRICE * quantity).toFixed(2)}`}
              </button>

              <p className="text-center text-gray-600 text-xs mt-3">
                Secure checkout powered by Stripe
              </p>

              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Product Features</p>
                <div className="space-y-3">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <feature.icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-400 text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
