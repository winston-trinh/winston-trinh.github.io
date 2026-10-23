import { useEffect, useId, useRef, useState } from 'react'
import { useResolvedTheme } from '../hooks/useResolvedTheme'
import { loadMermaid } from './loadMermaid'

/** Renders a Mermaid diagram, re-drawing it when the theme changes. Mermaid loads only on pages that use it. */
export function Mermaid({ chart, label }: { chart: string; label: string }) {
  const theme = useResolvedTheme()
  const ref = useRef<HTMLDivElement>(null)
  const id = 'mmd' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadMermaid()
      .then(async (mermaid) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'neutral',
          fontFamily: getComputedStyle(document.body).fontFamily,
          securityLevel: 'strict',
          // HTML labels live inside <foreignObject>, which strict sanitizing empties; plain SVG text survives.
          htmlLabels: false,
          flowchart: { htmlLabels: false },
        })
        const { svg } = await mermaid.render(`${id}-${theme}`, chart)
        if (!cancelled && ref.current) ref.current.innerHTML = svg
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [chart, theme, id])

  return (
    <div ref={ref} role="img" aria-label={label} className="mermaid-diagram">
      {failed ? <pre>{chart}</pre> : null}
    </div>
  )
}
