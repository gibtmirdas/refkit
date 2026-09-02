import { useMemo } from 'react'
import { highlightHtml, highlightNodes } from './highlight'

const BASE = import.meta.env.BASE_URL

interface Props {
  /** Printed number of the card, shown in the header badge. */
  n: number
  title: string
  /**
   * Static generated fragment — see sheets.ts / systems.ts. Never user input.
   * Image sources are written `@/…` and resolved against the deployed base
   * path here, the same way Card.tsx builds the signal photo URLs.
   */
  html: string
  /** Colour class: `th-a` … `th-f`, which sets `--tc`. */
  tone: string
  domId: string
  footLeft: string
  footRight: string
  open: boolean
  onToggle: () => void
  /** Termes cherchés, repliés — surlignés dans le titre et dans le corps. */
  terms: string[]
}

/**
 * One collapsible card, used by both the pocket sheets and the officiating
 * systems. Presentation only: the open state is owned by App.tsx.
 */
export default function Sheet({
  n,
  title,
  html,
  tone,
  domId,
  footLeft,
  footRight,
  open,
  onToggle,
  terms,
}: Props) {
  const body = useMemo(() => {
    const withBase = html.split('src="@/').join(`src="${BASE}`)
    return highlightHtml(withBase, terms)
  }, [html, terms])
  const heading = useMemo(() => highlightNodes(title, terms), [title, terms])

  return (
    <article className={`sheet ${tone}`}>
      <h3 className="sh-hd">
        <button type="button" aria-expanded={open} aria-controls={domId} onClick={onToggle}>
          <span className="sh-n">{n}</span>
          <span className="sh-t">{heading}</span>
          <svg className="sh-c" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </button>
      </h3>

      {open && (
        <div className="sh-open" id={domId}>
          <div className="sh-body" dangerouslySetInnerHTML={{ __html: body }} />
          <div className="sh-foot">
            <span>{footLeft}</span>
            <span>{footRight}</span>
          </div>
        </div>
      )}
    </article>
  )
}
