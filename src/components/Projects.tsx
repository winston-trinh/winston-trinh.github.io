import type { Project } from '../data/resume'
import { DATA } from '../data/resume'
import { folderStyles as styles, FolderGrid, type FolderData } from './Folder'
import { Icons } from './Icons'
import { Section } from './Section'

export interface ProjectFolderGroup {
  dates: string
  projects: Project[]
}

/** One folder per date: projects from the same month share it, in data order. */
export function groupProjects(projects: Project[]): ProjectFolderGroup[] {
  const groups = new Map<string, Project[]>()
  for (const p of projects) groups.set(p.dates, [...(groups.get(p.dates) ?? []), p])
  return [...groups].map(([dates, list]) => ({ dates, projects: list }))
}

function Details({ project }: { project: Project }) {
  return (
    <>
      <h4 className={styles.title}>
        {project.href ? (
          <a href={project.href} target="_blank" rel="noreferrer">
            {project.title}
          </a>
        ) : (
          project.title
        )}
      </h4>
      <p className={styles.description}>{project.description}</p>
      <ul className={styles.tags} aria-label="Technologies">
        {project.technologies.map((t) => (
          <li key={t}>{t}</li>
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
    </>
  )
}

const folders: FolderData[] = groupProjects(DATA.projects).map(({ dates, projects }) => ({
  name: dates,
  cover: (
    <>
      <h3 className={styles.name}>{dates}</h3>
      <p className={styles.count}>{projects.length > 1 ? `${projects.length} projects` : '1 project'}</p>
    </>
  ),
  files: projects.map((p) => ({
    name: p.title,
    caption: p.title,
    sheet: <img src={p.image} alt="" loading="lazy" />,
    details: <Details project={p} />,
  })),
}))

export function Projects() {
  return (
    <Section id="projects" eyebrow="Projects" title="Things I’ve built." alt>
      <FolderGrid folders={folders} />
    </Section>
  )
}
