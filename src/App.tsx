import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import Card from './Card'
import { FAMILIES, SIGNALS, type Family } from './signals'
import { usePersisted } from './usePersisted'

type Side = 'front' | 'back'
type Filter = Family | 'all'

export default function App() {
  const [order, setOrder] = useState<number[]>(() => SIGNALS.map((_, i) => i))
  const [family, setFamily] = usePersisted<Filter>('hs.fam', 'all')
  const [side, setSide] = usePersisted<Side>('hs.side', 'front')
  const [showDesc, setShowDesc] = usePersisted<boolean>('hs.desc', true)
  const [flipped, setFlipped] = useState<Set<string>>(() => new Set())

  const visible = useMemo(
    () => order.map((i) => SIGNALS[i]).filter((s) => family === 'all' || s.family === family),
    [order, family],
  )

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 'm') shuffle()
      else if (k === 'r') setSideAll(side === 'front' ? 'back' : 'front')
      else if (k === 'd') setShowDesc(!showDesc)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shuffle, setSideAll, side, showDesc, setShowDesc])

  return (
    <>
      <div className="jersey" />
      <div className="wrap">
        <header className="top">
          <div>
            <h1>
              Signaux de<br />l’<em>arbitre</em>
            </h1>
            <p className="sub">
              Les 35 signaux officiels de l’annexe I du règlement IIHF 2026/27. Touchez une carte
              pour la retourner : la photo seule au recto, le nom et le geste au verso.
            </p>
          </div>
          <div className="meta">
            IIHF Official Rule Book
            <br />
            <b>2026/27 — Appendix I</b>
            <br />
            pp. 163–169
          </div>
        </header>

        <div className="bar">
          <div className="grp">
            <button className="go" onClick={shuffle}>
              ↺ Mélanger
            </button>
            <button onClick={resetOrder}>Ordre du règlement</button>
          </div>

          <div className="grp">
            <span className="lbl">Faces</span>
            <div className="seg" role="group" aria-label="Orientation des cartes">
              <button aria-pressed={side === 'front'} onClick={() => setSideAll('front')}>
                Photos
              </button>
              <button aria-pressed={side === 'back'} onClick={() => setSideAll('back')}>
                Réponses
              </button>
            </div>
          </div>

          <div className="grp">
            <span className="lbl">Verso</span>
            <div className="seg" role="group" aria-label="Contenu du verso">
              <button aria-pressed={showDesc} onClick={() => setShowDesc(true)}>
                Nom + geste
              </button>
              <button aria-pressed={!showDesc} onClick={() => setShowDesc(false)}>
                Nom seul
              </button>
            </div>
          </div>

          <div className="grp filters" role="group" aria-label="Famille de signaux">
            {FAMILIES.map((f) => (
              <button
                key={f.key}
                className="chip"
                aria-pressed={family === f.key}
                onClick={() => setFamily(f.key)}
              >
                {f.key !== 'all' && <span className={`dot ${f.key}`} />}
                {f.label}
              </button>
            ))}
          </div>

          <span className="count">
            {visible.length} carte{visible.length > 1 ? 's' : ''}
          </span>
        </div>

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
            {' '}· <kbd>M</kbd> mélanger · <kbd>R</kbd> tout retourner · <kbd>D</kbd> nom seul
          </span>
        </p>
        <p className="credit">
          Photos et textes : IIHF Official Rule Book 2026/27, annexe I. Descriptions traduites en
          français. Usage personnel de formation.
        </p>
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
