import { DATA } from '../data/resume'
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
            Always happy to talk shop, trade ideas, or hear what you’re building.
          </p>
          <ul className={styles.links}>
            {DATA.social.map((s) => {
              const Icon = socialIcon[s.name as keyof typeof socialIcon]
              const external = s.url.startsWith('http') || s.url.endsWith('.pdf')
              return (
                <li key={s.name}>
                  <a
                    className={s.name === 'Email' ? 'btn btn-primary' : 'btn btn-secondary'}
                    href={s.url}
                    {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    <Icon width={18} height={18} /> {s.label}
                  </a>
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
