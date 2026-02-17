import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Message from './components/Message'
import About from './components/About'
import ForceUpCode from './components/ForceUpCode'
import WhyWear from './components/WhyWear'
import Shop from './components/Shop'
import Gallery from './components/Gallery'
import Footer from './components/Footer'

function App() {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <Hero />
      <Message />
      <About />
      <ForceUpCode />
      <WhyWear />
      <Shop />
      <Gallery />
      <Footer />
    </div>
  )
}

export default App
