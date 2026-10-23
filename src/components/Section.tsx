import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

interface SectionProps {
  id: string
  eyebrow: string
  title: string
  alt?: boolean
  children: ReactNode
}

export function Section({ id, eyebrow, title, alt, children }: SectionProps) {
  return (
    <section id={id} className={`section${alt ? ' section-alt' : ''}`} aria-labelledby={`${id}-title`}>
      <div className="container">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`} className="section-title">
            {title}
          </h2>
        </Reveal>
        {children}
      </div>
    </section>
  )
}
