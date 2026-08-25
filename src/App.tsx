import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import Card from './Card'
import Sheet from './Sheet'
import { SIGNALS } from './signals'
import { SHEETS, THEMES, type Theme } from './sheets'
import { usePersisted } from './usePersisted'

type Side = 'front' | 'back'
type Section = 'signals' | 'sheets'

/** Lowercase and accent-free — the sheets' search index is stored that way. */
const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const THEME_LABEL = Object.fromEntries(THEMES.map((t) => [t.key, t.label])) as Record<
  Theme,
  string
>

export default function App() {
  const [section, setSection] = usePersisted<Section>('hs.section', 'signals')
  const [menuOpen, setMenuOpen] = useState(false)

  // --- deck of signals ---
  const [order, setOrder] = useState<number[]>(() => SIGNALS.map((_, i) => i))
  const [side, setSide] = usePersisted<Side>('hs.side', 'front')
  const [showDesc, setShowDesc] = usePersisted<boolean>('hs.desc', true)
  const [flipped, setFlipped] = useState<Set<string>>(() => new Set())

  // --- pocket sheets ---
  const [theme, setTheme] = useState<Theme | 'all'>('all')
  const [query, setQuery] = useState('')
  const [expandAll, setExpandAll] = useState(false)
  const [toggled, setToggled] = useState<Set<number>>(() => new Set())
  const searchRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const visible = useMemo(() => order.map((i) => SIGNALS[i]), [order])

  const terms = useMemo(() => fold(query).split(/\s+/).filter(Boolean), [query])
  const sheets = useMemo(
    () =>
      SHEETS.filter(
        (s) =>
          (theme === 'all' || s.theme === theme) && terms.every((t) => s.search.includes(t)),
      ),
    [theme, terms],
  )

  // A search opens every match; like the deck, a tap then toggles against that
  // base rather than setting an absolute state.
  const openBase = expandAll || terms.length > 0

  const shuffle = useCallback(() => {
    setOrder((prev) => {
      const next = [...prev]
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[next[i], next[j]] = [next[j], next[i]]
      }
      return next
    })
    setFlipped(new Set())
  }, [])

  const resetOrder = useCallback(() => {
    setOrder(SIGNALS.map((_, i) => i))
    setFlipped(new Set())
  }, [])

  const setSideAll = useCallback(
    (s: Side) => {
      setSide(s)
      setFlipped(new Set())
    },
    [setSide],
  )

  const flip = useCallback((id: string) => {
    setFlipped((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSheet = useCallback((n: number) => {
    setToggled((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }, [])

  const search = useCallback((value: string) => {
    setQuery(value)
    setToggled(new Set())
  }, [])

  const goTo = useCallback(
    (next: Section, t: Theme | 'all' = 'all') => {
      setSection(next)
      setTheme(t)
      setMenuOpen(false)
      setToggled(new Set())
      window.scrollTo({ top: 0 })
    },
    [setSection],
  )

  // Close the menu on Escape or on a click outside it.
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      const typing =
        !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if (typing) {
        if (e.key === 'Escape') {
          search('')
          el!.blur()
        }
        return
      }
      if (section === 'sheets') {
        if (e.key === '/') {
          e.preventDefault()
          searchRef.current?.focus()
        }
        return
      }
      const k = e.key.toLowerCase()
      if (k === 'm') shuffle()
      else if (k === 'r') setSideAll(side === 'front' ? 'back' : 'front')
      else if (k === 'd') setShowDesc(!showDesc)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [section, shuffle, setSideAll, side, showDesc, setShowDesc, search])

  const onSheets = section === 'sheets'

  return (
    <>
      <div className="jersey" />
      <div className="wrap">
        <header className="top">
          <div className="brand">
            <svg className="mark" viewBox="0 0 100 100" aria-hidden="true">
              <rect width="100" height="100" rx="12" fill="var(--surface)" />
              <g fill="var(--ink)">
                <polygon points="22.8,10 35.6,10 22.4,90 9.6,90" />
                <polygon points="46,10 58.8,10 45.6,90 32.8,90" />
                <polygon points="81.2,10 94,10 80.8,90 68,90" />
              </g>
              <polygon points="65.2,10 74.8,10 61.6,90 52,90" fill="var(--brand)" />
            </svg>
            <span className="wordmark">
              Ref<em>Kit</em>
            </span>
            <span className="tag">Aide-mémoire de l’arbitre</span>
          </div>
          <h1>
            {onSheets ? (
              <>
                Fiches de <em>poche</em>
              </>
            ) : (
              <>
                Signaux de l’<em>arbitre</em>
              </>
            )}
          </h1>
          <div className="meta">
            {onSheets ? (
              <>
                SEAF / Swiss Ice Hockey · IIHF <b>2026/27</b>
              </>
            ) : (
              <>
                IIHF Rule Book <b>2026/27</b> · Appendix I
              </>
            )}
          </div>
        </header>

        <div className="bar">
          <div className="menu" ref={menuRef}>
            <button
              className="go menu-btn"
              aria-expanded={menuOpen}
              aria-controls="nav"
              onClick={() => setMenuOpen((o) => !o)}
              title="Changer de section"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
              {onSheets ? 'Fiches' : 'Signaux'}
            </button>

            {menuOpen && (
              <div className="menu-panel" id="nav">
                <button
                  className="menu-item"
                  aria-current={!onSheets}
                  onClick={() => goTo('signals')}
                >
                  <span className="mi-t">Signaux de l’arbitre</span>
                  <span className="mi-s">{SIGNALS.length} cartes · gestes en photo</span>
                </button>
                <button
                  className="menu-item"
                  aria-current={onSheets && theme === 'all'}
                  onClick={() => goTo('sheets')}
                >
                  <span className="mi-t">Fiches de poche</span>
                  <span className="mi-s">{SHEETS.length} fiches · règles &amp; procédures</span>
                </button>
                <div className="menu-themes">
                  {THEMES.map((t) => (
                    <button
                      key={t.key}
                      className={`th-chip th-${t.key}`}
                      aria-current={onSheets && theme === t.key}
                      onClick={() => goTo('sheets', t.key)}
                    >
                      <span className="dot" />
                      {t.short}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {onSheets ? (
            <>
              <label className="find">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
                  <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  placeholder="Chercher une faute, une règle, un code…"
                  aria-label="Chercher dans les fiches"
                  autoComplete="off"
                  onChange={(e) => search(e.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    className="x"
                    aria-label="Effacer la recherche"
                    onClick={() => {
                      search('')
                      searchRef.current?.focus()
                    }}
                  >
                    ×
                  </button>
                )}
              </label>
              {theme !== 'all' && (
                <button
                  className={`th-chip on th-${theme}`}
                  onClick={() => setTheme('all')}
                  title="Voir toutes les fiches"
                >
                  <span className="dot" />
                  {THEME_LABEL[theme]} ×
                </button>
              )}
              <button
                className="tgl"
                aria-pressed={expandAll}
                onClick={() => {
                  setExpandAll(!expandAll)
                  setToggled(new Set())
                }}
                title="Ouvrir toutes les fiches"
              >
                Déplier
              </button>
              <span className="tally">
                {sheets.length === SHEETS.length
                  ? `${SHEETS.length} fiches`
                  : `${sheets.length} / ${SHEETS.length}`}
              </span>
            </>
          ) : (
            <>
              <button className="go" onClick={shuffle} title="Mélanger le paquet (M)">
                ↺ Mélanger
              </button>
              <button onClick={resetOrder} title="Revenir à l’ordre du règlement">
                Ordre
              </button>
              <button
                className="tgl"
                aria-pressed={side === 'back'}
                onClick={() => setSideAll(side === 'back' ? 'front' : 'back')}
                title="Tout retourner côté réponse (R)"
              >
                Réponses
              </button>
              <button
                className="tgl"
                aria-pressed={showDesc}
                onClick={() => setShowDesc(!showDesc)}
                title="Description du geste au verso (D)"
              >
                Geste
              </button>
            </>
          )}
        </div>

        {onSheets ? (
          <>
            <div className="sheets">
              {sheets.map((s) => (
                <Sheet
                  key={s.n}
                  sheet={s}
                  total={SHEETS.length}
                  themeLabel={THEME_LABEL[s.theme]}
                  open={toggled.has(s.n) !== openBase}
                  onToggle={() => toggleSheet(s.n)}
                />
              ))}
            </div>
            {sheets.length === 0 && (
              <p className="none">
                Aucune fiche. Essaie « icing », « méconduite », « engagement », ou un numéro de
                règle.
              </p>
            )}
            <p className="hint">
              Touchez le bandeau pour ouvrir une fiche
              <span className="kbdhint">
                {' '}
                · <kbd>/</kbd> chercher · <kbd>Esc</kbd> effacer
              </span>
            </p>
            <p className="credit">
              Aide-mémoire tiré du règlement de jeu SEAF, des directives et aide-mémoires SIHF et du
              IIHF Official Rule Book 2026/27. En cas de doute, les documents officiels font foi.
            </p>
          </>
        ) : (
          <>
            <div className={showDesc ? 'grid' : 'grid hide-desc'}>
              {visible.map((s, i) => (
                <Card
                  key={s.id}
                  signal={s}
                  index={i}
                  total={visible.length}
                  isBack={flipped.has(s.id) !== (side === 'back')}
                  showDesc={showDesc}
                  onFlip={() => flip(s.id)}
                />
              ))}
            </div>

            <p className="hint">
              Touchez une carte pour la retourner
              <span className="kbdhint">
                {' '}
                · <kbd>M</kbd> mélanger · <kbd>R</kbd> tout retourner · <kbd>D</kbd> nom seul
              </span>
            </p>
            <p className="credit">
              Photos et textes : IIHF Official Rule Book 2026/27, annexe I. Descriptions traduites en
              français. Usage personnel de formation.
            </p>
          </>
        )}
      </div>
      <UpdateToast />
    </>
  )
}

/** Tells you when the app is ready offline, and when a new version is waiting. */
function UpdateToast() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="toast" role="status">
      <span>{needRefresh ? 'Nouvelle version disponible.' : 'Prêt pour le hors ligne.'}</span>
      {needRefresh ? (
        <button className="go" onClick={() => updateServiceWorker(true)}>
          Recharger
        </button>
      ) : (
        <button onClick={() => setOfflineReady(false)}>OK</button>
      )}
      {needRefresh && <button onClick={() => setNeedRefresh(false)}>Plus tard</button>}
    </div>
  )
}
