import { DATA } from '../data/resume'
import { GazeFace } from './GazeFace'
import { Icons, socialIcon } from './Icons'
import styles from './Hero.module.css'

export function Hero() {
  const email = DATA.social.find((s) => s.name === 'Email')!
  const resume = DATA.social.find((s) => s.name === 'Resume')!
  return (
    <section id="top" className={styles.hero} aria-label="Introduction">
      <div className={`container ${styles.inner}`}>
        <GazeFace name={DATA.name} />
        <p className={styles.hint} aria-hidden="true">
          Go ahead, move your cursor. I’m watching.
        </p>
        <h1 className={styles.title}>
          Hi, I’m <span className={styles.name}>{DATA.name.split(' ')[0]}.</span>
        </h1>
        <p className={styles.lede}>{DATA.description}</p>
        <div className={styles.ctas}>
          <a className="btn btn-primary" href={email.url}>
            Get in touch
          </a>
          <a className="btn btn-secondary" href={resume.url} target="_blank" rel="noreferrer">
            Resume <Icons.arrowUpRight width={16} height={16} />
          </a>
        </div>
        <ul className={styles.social} aria-label="Social links">
          {DATA.social
            .filter((s) => s.name === 'GitHub' || s.name === 'LinkedIn')
            .map((s) => {
              const Icon = socialIcon[s.name as keyof typeof socialIcon]
              return (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}>
                    <Icon width={22} height={22} />
                  </a>
                </li>
              )
            })}
        </ul>
      </div>
    </section>
  )
}
