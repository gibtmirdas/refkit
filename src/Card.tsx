import type { Signal } from './signals'

const BASE = import.meta.env.BASE_URL

interface Props {
  signal: Signal
  index: number
  total: number
  isBack: boolean
  showDesc: boolean
  onFlip: () => void
}

export default function Card({ signal, index, total, isBack, showDesc, onFlip }: Props) {
  const label = signal.rule === '—' ? 'Wash-out' : `Rule ${signal.rule}`
  const two = signal.imgs.length > 1

  return (
    <button
      type="button"
      className={`card ${signal.family}`}
      aria-pressed={isBack}
      aria-label={`${label} — ${signal.fr}. Retourner la carte.`}
      onClick={onFlip}
    >
      <div className="inner">
        <div className="face front">
          <div className="strip" />
          <div className={two ? 'plate two' : 'plate'}>
            {signal.imgs.map((src, n) => (
              <span className="pan" key={src}>
                <img
                  src={`${BASE}signals/${src}`}
                  alt={two ? `${signal.fr} — temps ${n + 1}` : `Signal ${signal.rule} — ${signal.fr}`}
                  loading={index < 8 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                />
                {two && <span className="no">{n + 1}</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="face back">
          <div className="band">
            <span className="r">{label.toUpperCase()}</span>
            <span className="x">
              {index + 1}/{total}
            </span>
          </div>
          <div className="body">
            <p className="nm">{signal.fr}</p>
            <p className="nm-en">{signal.en}</p>
            <div className="rule-line" />
            {showDesc && (
              <>
                <p className="d-fr">{signal.desc}</p>
                {signal.memo && <div className="memo">{signal.memo}</div>}
              </>
            )}
          </div>
          <div className="foot">
            <span>{FAMILY_LABEL[signal.family]}</span>
            <span>p. {signal.page}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

const FAMILY_LABEL: Record<Signal['family'], string> = {
  hit: 'Charges & coups',
  stick: 'Crosse & obstruction',
  cond: 'Conduite & jeu',
  play: 'Jeu & lignes',
}
