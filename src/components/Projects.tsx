import type { Project } from '../data/resume'
import { DATA } from '../data/resume'
import { Icons } from './Icons'
import { Reveal } from './Reveal'
import { Section } from './Section'
import styles from './Projects.module.css'

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={`card ${styles.card}`}>
      <div className={styles.media}>
        <img src={project.image} alt={`${project.title} screenshot`} loading="lazy" />
      </div>
      <div className={styles.body}>
        <p className={styles.dates}>{project.dates}</p>
        <h3 className={styles.title}>
          {project.href ? (
            <a href={project.href} target="_blank" rel="noreferrer">
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h3>
        <p className={styles.description}>{project.description}</p>
        <ul className={styles.tags} aria-label="Technologies">
          {project.technologies.map((t) => (
            <li key={t} className="chip chip-sm">
              {t}
            </li>
          ))}
        </ul>
        {project.links.length > 0 && (
          <div className={styles.links}>
            {project.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                {l.type === 'Source' ? <Icons.github width={14} height={14} /> : null}
                {l.type} <Icons.arrowUpRight width={12} height={12} />
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export function Projects() {
  return (
    <Section id="projects" eyebrow="Projects" title="Things I’ve built.">
      <div className={styles.grid}>
        {DATA.projects.map((p, i) => (
          <Reveal key={p.title} delay={(i % 2) * 80}>
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
