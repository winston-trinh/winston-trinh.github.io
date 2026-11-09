import { useEffect } from 'react'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { Education } from './components/Education'
import { Experience } from './components/Experience'
import { Hero } from './components/Hero'
import { NavBar } from './components/NavBar'
import { Projects } from './components/Projects'
import { handleSectionLinks } from './lib/scrollToSection'

export default function App() {
  // Arriving from another page at /#section: the browser looked for the anchor
  // before React rendered it, so go there once the sections exist. Instantly:
  // gliding down the whole page while it is still loading would stutter.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    const frame = requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' }),
    )
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(handleSectionLinks, [])

  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
    </>
  )
}
