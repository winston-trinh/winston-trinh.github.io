import { useEffect, useRef } from 'react'
import { useGaze } from '../hooks/useGaze'
import { allGazeSrcs, gazeSrc } from '../lib/gaze'
import styles from './GazeFace.module.css'

export function GazeFace({ name }: { name: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const gaze = useGaze(ref)

  // Warm the cache so every direction swaps instantly.
  useEffect(() => {
    const imgs = allGazeSrcs().map((src) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = src
      return img
    })
    return () => imgs.forEach((img) => (img.src = ''))
  }, [])

  return (
    <div ref={ref} className={styles.face}>
      <img
        src={gazeSrc(gaze)}
        alt={`Portrait of ${name}, eyes following your pointer`}
        width={640}
        height={640}
        draggable={false}
        data-gaze={`${gaze.px},${gaze.py}`}
      />
    </div>
  )
}
