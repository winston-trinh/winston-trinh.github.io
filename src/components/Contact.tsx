import { DATA } from '../data/resume'
import { GlassLink } from './GlassLink'
import { socialIcon } from './Icons'
import { Reveal } from './Reveal'
import styles from './Contact.module.css'

export function Contact() {
  return (
    <section id="contact" className={`section section-alt ${styles.contact}`} aria-labelledby="contact-title">
      <div className="container">
        <Reveal>
          <p className="eyebrow">Contact</p>
          <h2 id="contact-title" className="section-title">
            Say hello!
          </h2>
          <p className={styles.lede}>
            I’m always interested in collaboration opportunities and meeting others.
          </p>
          <ul className={styles.links}>
            {DATA.social.map((s) => {
              const Icon = socialIcon[s.name as keyof typeof socialIcon]
              return (
                <li key={s.name}>
                  <GlassLink
                    href={s.url}
                    size="large"
                    variant={s.name === 'Email' ? 'filled' : 'glass'}
                    icon={<Icon width={18} height={18} />}
                  >
                    {s.label}
                  </GlassLink>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>
      <footer className={styles.footer}>
        <div className="container">
          © {new Date().getFullYear()} {DATA.name}. Built with React, TypeScript & Vite.
        </div>
      </footer>
    </section>
  )
}
