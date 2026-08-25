import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import Card from './Card'
import { SIGNALS } from './signals'
import { usePersisted } from './usePersisted'

type Side = 'front' | 'back'

export default function App() {
  const [order, setOrder] = useState<number[]>(() => SIGNALS.map((_, i) => i))
  const [side, setSide] = usePersisted<Side>('hs.side', 'front')
  const [showDesc, setShowDesc] = usePersisted<boolean>('hs.desc', true)
  const [flipped, setFlipped] = useState<Set<string>>(() => new Set())

  const visible = useMemo(() => order.map((i) => SIGNALS[i]), [order])

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
          <h1>
            Signaux de l’<em>arbitre</em>
          </h1>
          <div className="meta">
            IIHF Rule Book <b>2026/27</b> · Appendix I
          </div>
        </header>

        <div className="bar">
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
