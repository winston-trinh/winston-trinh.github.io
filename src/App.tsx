import { useEffect } from 'react'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { Education } from './components/Education'
import { Experience } from './components/Experience'
import { Hero } from './components/Hero'
import { NavBar } from './components/NavBar'
import { Projects } from './components/Projects'

export default function App() {
  // Arriving from another page at /#section: the browser looked for the anchor
  // before React rendered it, so go there once the sections exist.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Education />
        <Projects />
        <Contact />
      </main>
    </>
  )
}
