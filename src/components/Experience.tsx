import type { Company, Role } from '../data/resume'
import { DATA } from '../data/resume'
import { Reveal } from './Reveal'
import { Section } from './Section'
import styles from './Experience.module.css'

function RoleBody({ role }: { role: Role }) {
  return (
    <>
      <p className={styles.location}>{role.location}</p>
      <p className={styles.meta}>
        {role.start} – {role.end}
      </p>
      <ul className={styles.bullets}>
        {role.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </>
  )
}

export function CompanyCard({ company }: { company: Company }) {
  const [first] = company.roles
  const multi = company.roles.length > 1
  return (
    <article className={`card ${styles.card}`} aria-label={company.company}>
      <header className={styles.header}>
        {/* Same destination as the name link, so it's hidden from keyboard and screen readers. */}
        <a className={styles.logoLink} href={company.href} target="_blank" rel="noreferrer" tabIndex={-1} aria-hidden="true">
          <img className={styles.logo} src={company.logoUrl} alt="" width={56} height={56} loading="lazy" />
        </a>
        <div>
          <h3 className={styles.company}>
            <a className={styles.nameLink} href={company.href} target="_blank" rel="noreferrer">
              {company.company}
            </a>
          </h3>
          <p className={styles.subtitle}>
            {multi ? `${company.roles.length} roles` : first.title}
          </p>
        </div>
      </header>
      {multi ? (
        <ol className={styles.timeline}>
          {company.roles.map((role) => (
            <li key={role.title} className={styles.role}>
              <h4 className={styles.roleTitle}>{role.title}</h4>
              <RoleBody role={role} />
            </li>
          ))}
        </ol>
      ) : (
        <RoleBody role={first} />
      )}
    </article>
  )
}

export function Experience() {
  return (
    <Section id="experience" eyebrow="Experience" title="Where I’ve worked.">
      <div className={styles.list}>
        {DATA.experience.map((c, i) => (
          <Reveal key={c.company} delay={Math.min(i, 2) * 60}>
            <CompanyCard company={c} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
