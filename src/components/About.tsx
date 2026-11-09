import { DATA } from '../data/resume'
import { renderInlineMarkdown } from '../lib/inlineMarkdown'
import { Icons } from './Icons'
import { Reveal } from './Reveal'
import { Section } from './Section'
import { Skills } from './Skills'
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
          <div className={styles.skills}>
            <h3>Skills</h3>
            <Skills skills={DATA.skills} />
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
