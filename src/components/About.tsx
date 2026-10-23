import { DATA } from '../data/resume'
import { renderInlineMarkdown } from '../lib/inlineMarkdown'
import { Icons } from './Icons'
import { Reveal } from './Reveal'
import { Section } from './Section'
import styles from './About.module.css'

export function About() {
  return (
    <Section id="about" eyebrow="About" title="Get to know me." alt>
      <div className={styles.grid}>
        <Reveal>
          <div className={styles.copy}>
            {DATA.summary.map((p, i) => (
              <p key={i}>{renderInlineMarkdown(p)}</p>
            ))}
            <a className={styles.location} href={DATA.locationLink} target="_blank" rel="noreferrer">
              <Icons.pin width={18} height={18} /> {DATA.location}
            </a>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className={`card ${styles.skills}`}>
            <h3>Skills</h3>
            {/* The empty touch handler lets iOS Safari apply :active on tap. */}
            <ul onTouchStart={() => {}}>
              {DATA.skills.map((s) => (
                <li key={s} className={`chip ${styles.skill}`}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
