import type { Sheet as SheetData } from './sheets'

interface Props {
  sheet: SheetData
  total: number
  themeLabel: string
  open: boolean
  onToggle: () => void
}

/**
 * One pocket sheet: a coloured header that opens the content. The body is the
 * static fragment built into `sheets.ts` — generated content, never user input.
 */
export default function Sheet({ sheet, total, themeLabel, open, onToggle }: Props) {
  return (
    <article className={`sheet th-${sheet.theme}`}>
      <h3 className="sh-hd">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`sh-${sheet.n}`}
          onClick={onToggle}
        >
          <span className="sh-n">{sheet.n}</span>
          <span className="sh-t">{sheet.title}</span>
          <svg className="sh-c" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </button>
      </h3>

      {open && (
        <div className="sh-open" id={`sh-${sheet.n}`}>
          <div className="sh-body" dangerouslySetInnerHTML={{ __html: sheet.html }} />
          <div className="sh-foot">
            <span>{themeLabel}</span>
            <span>
              fiche {sheet.n} / {total}
            </span>
          </div>
        </div>
      )}
    </article>
  )
}
