import type { CSSProperties } from 'react'
import { DATA } from '../data/resume'
import { useGlass } from '../hooks/useGlass'
import { GazeFace } from './GazeFace'
import { GlassLink } from './GlassLink'
import { Icons, socialIcon } from './Icons'
import styles from './Hero.module.css'

/**
 * A native range input dressed as an iOS 26 slider. The browser moves the
 * thumb itself, so it stays glued to the pointer; the fill and the glass
 * update in the same frame without rendering React.
 */
function GlassSlider() {
  const { initial, setTranslucency } = useGlass()
  // Clear on the left, frosted on the right: the slider reads "frost", the inverse of translucency.
  const frost = 1 - initial
  return (
    <div className={styles.glass}>
      <span className={styles.glassEnd} title="Clear">
        <Icons.drop width={18} height={18} />
        <span className="visually-hidden">Clear</span>
      </span>
      <input
        type="range"
        aria-label="Glass, from clear to frosted"
        className={styles.slider}
        min={0}
        max={100}
        step="any"
        defaultValue={Math.round(frost * 100)}
        aria-valuetext={`${Math.round(frost * 100)}% frosted`}
        style={{ '--p': frost } as CSSProperties}
        onChange={(e) => {
          const f = e.currentTarget.valueAsNumber / 100
          e.currentTarget.style.setProperty('--p', String(f))
          e.currentTarget.setAttribute('aria-valuetext', `${Math.round(f * 100)}% frosted`)
          setTranslucency(1 - f)
        }}
      />
      <span className={styles.glassEnd} title="Frosted">
        <Icons.snowflake width={18} height={18} />
        <span className="visually-hidden">Frosted</span>
      </span>
    </div>
  )
}

export function Hero() {
  const resume = DATA.social.find((s) => s.name === 'Resume')!
  return (
    <section id="top" className={styles.hero} aria-label="Introduction">
      <div className={styles.ambient} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <GazeFace name={DATA.name} />
        <p className={styles.hint} aria-hidden="true">
          Move your cursor. I’ll keep an eye on it.
        </p>
        <GlassSlider />
        <h1 className={styles.title}>
          Hi, I’m <span className={styles.name}>{DATA.name.split(' ')[0]}.</span>
        </h1>
        <p className={styles.lede}>{DATA.description}</p>
        <div className={styles.ctas}>
          <GlassLink href="#contact" variant="filled" size="large">
            Get in touch
          </GlassLink>
          <GlassLink href={resume.url} size="large">
            Resume <Icons.arrowUpRight width={16} height={16} />
          </GlassLink>
        </div>
        <ul className={styles.social} aria-label="Social links">
          {DATA.social
            .filter((s) => s.name === 'GitHub' || s.name === 'LinkedIn')
            .map((s) => {
              const Icon = socialIcon[s.name as keyof typeof socialIcon]
              return (
                <li key={s.name}>
                  <GlassLink href={s.url} aria-label={s.label} size="large" icon={<Icon width={22} height={22} />} />
                </li>
              )
            })}
        </ul>
      </div>
    </section>
  )
}
