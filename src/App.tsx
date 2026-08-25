import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import Card from './Card'
import Sheet from './Sheet'
import { SIGNALS } from './signals'
import { SHEETS, THEMES, type Theme } from './sheets'
import { SYSTEMS, SYSTEM_GROUPS, type SystemGroup } from './systems'
import { usePersisted } from './usePersisted'

type Side = 'front' | 'back'
type Section = 'signals' | 'sheets' | 'systems'

/** Lowercase and accent-free — the search indexes are stored that way. */
const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const THEME_LABEL = Object.fromEntries(THEMES.map((t) => [t.key, t.label])) as Record<
  Theme,
  string
>
const GROUP = Object.fromEntries(SYSTEM_GROUPS.map((g) => [g.key, g])) as Record<
  SystemGroup,
  (typeof SYSTEM_GROUPS)[number]
>

export default function App() {
  const [section, setSection] = usePersisted<Section>('hs.section', 'signals')
  const [menuOpen, setMenuOpen] = useState(false)

  // --- deck of signals ---
  const [order, setOrder] = useState<number[]>(() => SIGNALS.map((_, i) => i))
  const [side, setSide] = usePersisted<Side>('hs.side', 'front')
  const [showDesc, setShowDesc] = usePersisted<boolean>('hs.desc', true)
  const [flipped, setFlipped] = useState<Set<string>>(() => new Set())

  // --- pocket sheets and officiating systems ---
  const [theme, setTheme] = useState<Theme | 'all'>('all')
  const [group, setGroup] = useState<SystemGroup | 'all'>('all')
  const [query, setQuery] = useState('')
  const [expandAll, setExpandAll] = useState(false)
  const [toggled, setToggled] = useState<Set<number>>(() => new Set())
  const searchRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const onSheets = section === 'sheets'
  const onSystems = section === 'systems'
  const onCards = onSheets || onSystems

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
  const systems = useMemo(
    () =>
      SYSTEMS.filter(
        (s) =>
          (group === 'all' || s.group === group) && terms.every((t) => s.search.includes(t)),
      ),
    [group, terms],
  )

  const total = onSystems ? SYSTEMS.length : SHEETS.length
  const shown = onSystems ? systems.length : sheets.length

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

  const toggleCard = useCallback((n: number) => {
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
    (next: Section, filter: Theme | SystemGroup | 'all' = 'all') => {
      setSection(next)
      setTheme(next === 'sheets' ? (filter as Theme | 'all') : 'all')
      setGroup(next === 'systems' ? (filter as SystemGroup | 'all') : 'all')
      setQuery('')
      setToggled(new Set())
      setMenuOpen(false)
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
      if (onCards) {
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
  }, [onCards, shuffle, setSideAll, side, showDesc, setShowDesc, search])

  return (
    <>
      <div className="jersey" />
      <div className="wrap">
        <header className="top">
          <h1>
            {onSystems ? (
              <>
                Syst&egrave;mes d’<em>arbitrage</em>
              </>
            ) : onSheets ? (
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
            {onSystems ? (
              <>
                IIHF Procedure Manual <b>2023</b> · 3 &amp; 4 officiels
              </>
            ) : onSheets ? (
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
              {onSystems ? 'Systèmes' : onSheets ? 'Fiches' : 'Signaux'}
            </button>

            {menuOpen && (
              <div className="menu-panel" id="nav">
                <button
                  className="menu-item"
                  aria-current={section === 'signals'}
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

                <button
                  className="menu-item"
                  aria-current={onSystems && group === 'all'}
                  onClick={() => goTo('systems')}
                >
                  <span className="mi-t">Systèmes d’arbitrage</span>
                  <span className="mi-s">{SYSTEMS.length} fiches · placement &amp; procédures</span>
                </button>
                <div className="menu-themes">
                  {SYSTEM_GROUPS.map((g) => (
                    <button
                      key={g.key}
                      className={`th-chip ${g.tone}`}
                      aria-current={onSystems && group === g.key}
                      onClick={() => goTo('systems', g.key)}
                    >
                      <span className="dot" />
                      {g.short}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {onCards ? (
            <>
              <label className="find">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
                  <path
                    d="M20 20l-4.3-4.3"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  placeholder={onSystems ? 'Chercher un placement, un rôle…' : 'Chercher une faute, une règle, un code…'}
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

              {onSheets && theme !== 'all' && (
                <button
                  className={`th-chip on th-${theme}`}
                  onClick={() => setTheme('all')}
                  title="Voir toutes les fiches"
                >
                  <span className="dot" />
                  {THEME_LABEL[theme]} ×
                </button>
              )}
              {onSystems && group !== 'all' && (
                <button
                  className={`th-chip on ${GROUP[group].tone}`}
                  onClick={() => setGroup('all')}
                  title="Voir toutes les fiches"
                >
                  <span className="dot" />
                  {GROUP[group].short} ×
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
                {shown === total ? `${total} fiches` : `${shown} / ${total}`}
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

        {onCards ? (
          <>
            <div className="sheets">
              {onSystems
                ? systems.map((s) => (
                    <Sheet
                      key={s.n}
                      n={s.n}
                      title={s.title}
                      html={s.html}
                      tone={GROUP[s.group].tone}
                      domId={`sy-${s.n}`}
                      footLeft={GROUP[s.group].label}
                      footRight={`fiche ${s.n} / ${SYSTEMS.length}`}
                      open={toggled.has(s.n) !== openBase}
                      onToggle={() => toggleCard(s.n)}
                    />
                  ))
                : sheets.map((s) => (
                    <Sheet
                      key={s.n}
                      n={s.n}
                      title={s.title}
                      html={s.html}
                      tone={`th-${s.theme}`}
                      domId={`sh-${s.n}`}
                      footLeft={THEME_LABEL[s.theme]}
                      footRight={`fiche ${s.n} / ${SHEETS.length}`}
                      open={toggled.has(s.n) !== openBase}
                      onToggle={() => toggleCard(s.n)}
                    />
                  ))}
            </div>
            {shown === 0 && (
              <p className="none">
                {onSystems
                  ? 'Aucune fiche. Essaie « icing », « engagement », « zone », « L2 », « wash-out ».'
                  : 'Aucune fiche. Essaie « icing », « méconduite », « engagement », ou un numéro de règle.'}
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
              {onSystems
                ? 'IIHF Officiating Procedure Manual — Three Officials System et Four Officials System, v1.0, 05/2023. Résumé en français ; le manuel officiel fait foi.'
                : 'Aide-mémoire tiré du règlement de jeu SEAF, des directives et aide-mémoires SIHF et du IIHF Official Rule Book 2026/27. En cas de doute, les documents officiels font foi.'}
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
