import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Project } from '../data/resume'
import { DATA } from '../data/resume'
import { Icons } from './Icons'
import { Reveal } from './Reveal'
import { Section } from './Section'
import styles from './Projects.module.css'

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

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

function Details({ project }: { project: Project }) {
  return (
    <div key={project.title} className={styles.details}>
      <h4 className={styles.projectTitle}>
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
    </div>
  )
}

interface FolderProps {
  group: ProjectFolderGroup
  open: boolean
  onToggle: () => void
  onOpen: () => void
}

/**
 * A folder that opens on hover (or tap). Its screenshots rise out of it,
 * stacking upward and drifting slightly right like a Downloads stack fanning
 * out of the Dock, and the glass flap shows the chosen project's details.
 */
function ProjectFolder({ group, open, onToggle, onOpen }: FolderProps) {
  const [selected, setSelected] = useState(0)
  const { projects, dates } = group
  const many = projects.length > 1
  const infoId = `folder-${slug(dates)}`
  const current = projects[selected]

  return (
    <article
      className={styles.folder}
      data-open={open || undefined}
      data-folder={dates}
      data-count={projects.length}
      aria-label={dates}
    >
      <div className={styles.stage}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={infoId}
          aria-label={`${open ? 'Close' : 'Open'} the ${dates} folder (${projects.map((p) => p.title).join(', ')})`}
          onClick={onToggle}
        />
        <div className={styles.back} aria-hidden="true" />
        {/* Reversed so the first project sits in front of the ones that rise behind it. */}
        {projects
          .map((p, i) => ({ p, i }))
          .reverse()
          .map(({ p, i }) => {
            const style = { '--i': i } as CSSProperties
            const picture = <img src={p.image} alt="" loading="lazy" />
            return many ? (
              <button
                key={p.title}
                type="button"
                className={styles.pic}
                style={style}
                data-selected={i === selected || undefined}
                aria-label={`Show ${p.title}`}
                aria-pressed={i === selected}
                // Hovering previews a project; once one is clicked, it stays chosen until another is clicked.
                onPointerEnter={() => !open && setSelected(i)}
                onFocus={() => !open && setSelected(i)}
                onClick={() => {
                  setSelected(i)
                  onOpen()
                }}
              >
                {picture}
                <span className={styles.caption}>{p.title}</span>
              </button>
            ) : (
              <div key={p.title} className={styles.pic} style={style} data-selected aria-hidden="true">
                {picture}
                <span className={styles.caption}>{p.title}</span>
              </div>
            )
          })}
        <div className={styles.front}>
          <div className={styles.cover}>
            <h3 className={styles.date}>{dates}</h3>
            <p className={styles.count}>{many ? `${projects.length} projects` : '1 project'}</p>
          </div>
          <div id={infoId} className={styles.info}>
            <Details project={current} />
          </div>
        </div>
      </div>
    </article>
  )
}

export function Projects() {
  const groups = groupProjects(DATA.projects)
  const [open, setOpen] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // A click anywhere outside the open folder (the page background, another folder) puts it away.
  useEffect(() => {
    if (open === null) return
    const onDown = (e: PointerEvent) => {
      const folder = gridRef.current?.querySelector(`[data-folder="${CSS.escape(open)}"]`)
      if (!folder?.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  return (
    <Section id="projects" eyebrow="Projects" title="Things I’ve built.">
      <div ref={gridRef} className={styles.grid}>
        {groups.map((g, i) => (
          <Reveal key={g.dates} delay={(i % 2) * 80}>
            <ProjectFolder
              group={g}
              open={open === g.dates}
              onToggle={() => setOpen((cur) => (cur === g.dates ? null : g.dates))}
              onOpen={() => setOpen(g.dates)}
            />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
