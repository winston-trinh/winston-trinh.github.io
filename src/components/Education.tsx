import { DATA } from '../data/resume'
import { Reveal } from './Reveal'
import { Section } from './Section'
import styles from './Education.module.css'

export function Education() {
  return (
    <Section id="education" eyebrow="Education" title="Where I studied." alt>
      {DATA.education.map((e) => (
        <Reveal key={e.school}>
          <article className={`card ${styles.card}`}>
            <a className={styles.logoLink} href={e.href} target="_blank" rel="noreferrer" tabIndex={-1} aria-hidden="true">
              <img className={styles.logo} src={e.logoUrl} alt="" width={72} height={72} loading="lazy" />
            </a>
            <div>
              <h3 className={styles.school}>
                <a className={styles.nameLink} href={e.href} target="_blank" rel="noreferrer">
                  {e.school}
                </a>
              </h3>
              <p className={styles.degree}>{e.degree}</p>
              <p className={styles.meta}>Graduated {e.end}</p>
              <p className={styles.meta}>{e.description}</p>
            </div>
          </article>
        </Reveal>
      ))}
    </Section>
  )
}
