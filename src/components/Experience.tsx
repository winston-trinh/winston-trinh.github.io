import type { Company, Role } from '../data/resume'
import { DATA } from '../data/resume'
import { folderStyles, FolderGrid, type FolderData } from './Folder'
import { Icons } from './Icons'
import { Section } from './Section'
import styles from './Experience.module.css'

const dates = (role: Role) => `${role.start} – ${role.end}`

/** The sheet for one role: a little document with the company's logo on top. */
function RoleSheet({ company, role }: { company: Company; role: Role }) {
  return (
    <span className={styles.sheet}>
      <img className={styles.sheetLogo} src={company.logoUrl} alt="" width={28} height={28} loading="lazy" />
      <span className={styles.sheetTitle}>{role.title}</span>
      <span className={styles.sheetDates}>{dates(role)}</span>
      <span className={styles.sheetLines} />
    </span>
  )
}

function RoleDetails({ company, role }: { company: Company; role: Role }) {
  return (
    <>
      <h4 className={folderStyles.title}>{role.title}</h4>
      <p className={styles.meta}>
        <span>{dates(role)}</span>
        <span>{role.location}</span>
      </p>
      <ul className={styles.bullets}>
        {role.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <div className={folderStyles.links}>
        <a href={company.href} target="_blank" rel="noreferrer">
          {company.company} <Icons.arrowUpRight width={12} height={12} />
        </a>
      </div>
    </>
  )
}

/** One folder per company; its roles are the sheets inside, newest in front. */
function companyFolder(company: Company): FolderData {
  const [first] = company.roles
  const many = company.roles.length > 1
  return {
    name: company.company,
    cover: (
      <div className={styles.cover}>
        <img className={styles.logo} src={company.logoUrl} alt="" width={44} height={44} loading="lazy" />
        <div>
          <h3 className={folderStyles.name}>{company.company}</h3>
          <p className={folderStyles.count}>{many ? `${company.roles.length} roles` : first.title}</p>
        </div>
      </div>
    ),
    files: company.roles.map((role) => ({
      name: role.title,
      sheet: <RoleSheet company={company} role={role} />,
      details: <RoleDetails company={company} role={role} />,
    })),
  }
}

export function Experience() {
  return (
    <Section id="experience" eyebrow="Experience" title="Where I’ve worked.">
      <FolderGrid className={styles.grid} folders={DATA.experience.map(companyFolder)} />
    </Section>
  )
}
