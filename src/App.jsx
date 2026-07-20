import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Intro from './components/Intro.jsx'
import ThemeYear from './components/ThemeYear.jsx'
import Schedule from './components/Schedule.jsx'
import Ministries from './components/Ministries.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <main className="wrap">
        <Intro />
        <ThemeYear />
        <Schedule />
        <Ministries />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
