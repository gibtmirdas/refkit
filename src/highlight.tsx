import type { ReactNode } from 'react'

/**
 * Surlignage des termes cherchés, dans les titres comme dans le corps des
 * fiches.
 *
 * Le filtre de App.tsx compare des textes replies (minuscules, sans accents).
 * Pour surligner, il faut retrouver la position du terme dans le texte
 * d'origine : `foldSame` replie donc caractère par caractère, en conservant la
 * longueur, si bien qu'un index dans le texte replié vaut aussi dans le texte
 * affiché.
 */
export function foldSame(s: string): string {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    const d = ch.normalize('NFD')
    const base = d.length > 1 ? d[0] : ch
    const low = base.toLowerCase()
    out += low.length === 1 ? low : low[0]
  }
  return out
}

/** Les entités qui restent encodées dans le HTML généré (voir build_app.py). */
const ENTITY = /&(?:#?\w+);/g

/**
 * Intervalles [début, fin) de tous les termes trouvés dans `text`, fusionnés
 * et triés. `skipEntities` écarte les correspondances qui tomberaient au
 * milieu d'une entité HTML, qu'un `<mark>` couperait en deux.
 */
export function matchRanges(
  text: string,
  terms: string[],
  skipEntities = false,
): [number, number][] {
  if (!terms.length || !text) return []

  const folded = foldSame(text)
  const found: [number, number][] = []
  for (const term of terms) {
    if (!term) continue
    let i = folded.indexOf(term)
    while (i !== -1) {
      found.push([i, i + term.length])
      i = folded.indexOf(term, i + 1)
    }
  }
  if (!found.length) return []

  let keep = found
  if (skipEntities) {
    const holes: [number, number][] = []
    ENTITY.lastIndex = 0
    for (let m = ENTITY.exec(text); m; m = ENTITY.exec(text)) {
      holes.push([m.index, m.index + m[0].length])
    }
    if (holes.length) {
      keep = found.filter(([a, b]) => !holes.some(([c, d]) => a < d && c < b))
      if (!keep.length) return []
    }
  }

  keep.sort((x, y) => x[0] - y[0] || y[1] - x[1])
  const merged: [number, number][] = []
  for (const [a, b] of keep) {
    const last = merged[merged.length - 1]
    if (last && a <= last[1]) last[1] = Math.max(last[1], b)
    else merged.push([a, b])
  }
  return merged
}

/**
 * Entoure les correspondances d'un `<mark class="hl">` dans un fragment HTML
 * généré. Le balayage ne traite que le texte : tout ce qui est entre `<` et
 * `>` — donc les balises et leurs attributs — est recopié tel quel.
 */
export function highlightHtml(html: string, terms: string[]): string {
  if (!terms.length) return html

  let out = ''
  let i = 0
  while (i < html.length) {
    if (html[i] === '<') {
      const close = html.indexOf('>', i)
      if (close === -1) {
        out += html.slice(i)
        break
      }
      out += html.slice(i, close + 1)
      i = close + 1
      continue
    }

    let next = html.indexOf('<', i)
    if (next === -1) next = html.length
    const seg = html.slice(i, next)
    const ranges = matchRanges(seg, terms, true)
    if (ranges.length) {
      let prev = 0
      for (const [a, b] of ranges) {
        out += seg.slice(prev, a)
        out += `<mark class="hl">${seg.slice(a, b)}</mark>`
        prev = b
      }
      out += seg.slice(prev)
    } else {
      out += seg
    }
    i = next
  }
  return out
}

/**
 * Même surlignage, mais en nœuds React — pour un titre, qui est du texte brut
 * et peut contenir « & » ou « < » sans être échappé.
 */
export function highlightNodes(text: string, terms: string[]): ReactNode {
  const ranges = matchRanges(text, terms)
  if (!ranges.length) return text

  const parts: ReactNode[] = []
  let prev = 0
  ranges.forEach(([a, b], k) => {
    if (a > prev) parts.push(text.slice(prev, a))
    parts.push(
      <mark className="hl" key={k}>
        {text.slice(a, b)}
      </mark>,
    )
    prev = b
  })
  if (prev < text.length) parts.push(text.slice(prev))
  return parts
}
