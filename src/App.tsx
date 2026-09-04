import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import Card from "./Card";
import Sheet from "./Sheet";
import { SIGNALS } from "./signals";
import { SHEETS, THEMES, type Theme } from "./sheets";
import { SYSTEMS, SYSTEM_GROUPS, type SystemGroup } from "./systems";
import {
  PENALTIES,
  FAMILIES,
  SANCTIONS,
  type Family,
} from "./penalties";
import { highlightHtml, highlightNodes } from "./highlight";
import { usePersisted } from "./usePersisted";

type Side = "front" | "back";
type Section = "signals" | "sheets" | "systems" | "penalties";

/** Lowercase and accent-free — the search indexes are stored that way. */
const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const THEME_LABEL = Object.fromEntries(
  THEMES.map((t) => [t.key, t.label]),
) as Record<Theme, string>;
const GROUP = Object.fromEntries(
  SYSTEM_GROUPS.map((g) => [g.key, g]),
) as Record<SystemGroup, (typeof SYSTEM_GROUPS)[number]>;
const SANCTION = Object.fromEntries(
  SANCTIONS.map((s) => [s.key, s]),
) as Record<string, (typeof SANCTIONS)[number]>;

const BASE = import.meta.env.BASE_URL;

/**
 * Nombre de colonnes, aux memes seuils que l'ancien `column-count`. Les
 * colonnes sont rendues explicitement plutot que laissees au multi-colonnes
 * CSS : celui-ci recalcule la repartition a chaque changement de hauteur, si
 * bien qu'ouvrir une fiche faisait sauter les suivantes d'une colonne a
 * l'autre.
 */
function useColumnCount(): number {
  const read = () =>
    typeof window === "undefined"
      ? 1
      : window.matchMedia("(min-width: 1320px)").matches
        ? 3
        : window.matchMedia("(min-width: 900px)").matches
          ? 2
          : 1;
  const [cols, setCols] = useState(read);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1320px)");
    const mid = window.matchMedia("(min-width: 900px)");
    const sync = () => setCols(read());
    wide.addEventListener("change", sync);
    mid.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      mid.removeEventListener("change", sync);
    };
  }, []);
  return cols;
}

/**
 * Repartit les fiches en tranches contigues : la colonne 1 prend le debut, la
 * colonne 2 la suite. La coupe se fait sur le rang, jamais sur la hauteur —
 * une fiche ne change donc jamais de colonne, et l'ordre de lecture reste
 * celui du paquet, colonne par colonne.
 */
function intoColumns<T>(items: T[], cols: number): T[][] {
  if (cols <= 1) return [items];
  const base = Math.floor(items.length / cols);
  const extra = items.length % cols;
  const out: T[][] = [];
  let i = 0;
  for (let c = 0; c < cols; c++) {
    const size = base + (c < extra ? 1 : 0);
    out.push(items.slice(i, i + size));
    i += size;
  }
  return out;
}

/** Le paquet imprimable, servi depuis public/pdf — precache, donc lisible hors ligne. */
const PDFS = [
  {
    file: "fiches-arbitre-planches-A4.pdf",
    label: "Planches A4",
    hint: "8 cartes par feuille, à découper",
  },
  {
    file: "fiches-arbitre-cartes.pdf",
    label: "Cartes A7",
    hint: "une carte par page",
  },
  {
    file: "fiches-arbitre-penalites-A4.pdf",
    label: "Table des codes",
    hint: "les 47 infractions, 2 pages A4",
  },
];

export default function App() {
  const [section, setSection] = usePersisted<Section>("hs.section", "signals");
  const [menuOpen, setMenuOpen] = useState(false);

  // --- deck of signals ---
  const [order, setOrder] = useState<number[]>(() => SIGNALS.map((_, i) => i));
  const [side, setSide] = usePersisted<Side>("hs.side", "front");
  const [showDesc, setShowDesc] = usePersisted<boolean>("hs.desc", true);
  const [flipped, setFlipped] = useState<Set<string>>(() => new Set());

  // --- pocket sheets and officiating systems ---
  const [theme, setTheme] = useState<Theme | "all">("all");
  const [group, setGroup] = useState<SystemGroup | "all">("all");
  const [fam, setFam] = useState<Family | "all">("all");
  const [penDetails, setPenDetails] = usePersisted<boolean>("hs.pendet", true);
  // Fiche a rejoindre depuis un renvoi de la table des infractions.
  const [jumpTo, setJumpTo] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  const [toggled, setToggled] = useState<Set<number>>(() => new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- navigation dans les occurrences surlignees ---
  // Les <mark> sont poses par Sheet.tsx au rendu ; on les relit ensuite dans
  // le DOM, ce qui donne l'ordre d'affichage sans avoir a numeroter les
  // fiches une a une.
  const listRef = useRef<HTMLDivElement>(null);
  const marksRef = useRef<HTMLElement[]>([]);
  const [hit, setHit] = useState(0);
  const [hits, setHits] = useState(0);

  const onSheets = section === "sheets";
  const onSystems = section === "systems";
  const onPen = section === "penalties";
  const onList = onSheets || onSystems || onPen;
  const onCards = onSheets || onSystems;

  const visible = useMemo(() => order.map((i) => SIGNALS[i]), [order]);

  const terms = useMemo(
    () => fold(query).split(/\s+/).filter(Boolean),
    [query],
  );
  const sheets = useMemo(
    () =>
      SHEETS.filter(
        (s) =>
          (theme === "all" || s.theme === theme) &&
          terms.every((t) => s.search.includes(t)),
      ),
    [theme, terms],
  );
  const systems = useMemo(
    () =>
      SYSTEMS.filter(
        (s) =>
          (group === "all" || s.group === group) &&
          terms.every((t) => s.search.includes(t)),
      ),
    [group, terms],
  );

  const penalties = useMemo(
    () =>
      PENALTIES.filter(
        (p) =>
          (fam === "all" || p.fam === fam) &&
          terms.every((t) => p.search.includes(t)),
      ),
    [fam, terms],
  );

  const total = onPen
    ? PENALTIES.length
    : onSystems
      ? SYSTEMS.length
      : SHEETS.length;
  const shown = onPen
    ? penalties.length
    : onSystems
      ? systems.length
      : sheets.length;

  const cols = useColumnCount();
  const sheetCols = useMemo(() => intoColumns(sheets, cols), [sheets, cols]);
  const systemCols = useMemo(() => intoColumns(systems, cols), [systems, cols]);

  // A search opens every match; like the deck, a tap then toggles against that
  // base rather than setting an absolute state.
  const openBase = expandAll || terms.length > 0;

  const shuffle = useCallback(() => {
    setOrder((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
    setFlipped(new Set());
  }, []);

  const resetOrder = useCallback(() => {
    setOrder(SIGNALS.map((_, i) => i));
    setFlipped(new Set());
  }, []);

  const setSideAll = useCallback(
    (s: Side) => {
      setSide(s);
      setFlipped(new Set());
    },
    [setSide],
  );

  const flip = useCallback((id: string) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleCard = useCallback((n: number) => {
    setToggled((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }, []);

  const paintHit = useCallback((i: number, scroll: boolean) => {
    const marks = marksRef.current;
    marks.forEach((m) => m.classList.remove("hl-cur"));
    const cur = marks[i];
    if (!cur) return;
    cur.classList.add("hl-cur");
    if (scroll) cur.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  const goHit = useCallback(
    (delta: number) => {
      const n = marksRef.current.length;
      if (!n) return;
      const next = (((hit + delta) % n) + n) % n;
      setHit(next);
      paintHit(next, true);
    },
    [hit, paintHit],
  );

  const search = useCallback((value: string) => {
    setQuery(value);
    setToggled(new Set());
  }, []);

  const goTo = useCallback(
    (
      next: Section,
      filter: Theme | SystemGroup | Family | "all" = "all",
    ) => {
      setSection(next);
      setTheme(next === "sheets" ? (filter as Theme | "all") : "all");
      setGroup(next === "systems" ? (filter as SystemGroup | "all") : "all");
      setFam(next === "penalties" ? (filter as Family | "all") : "all");
      setQuery("");
      setToggled(new Set());
      setMenuOpen(false);
      window.scrollTo({ top: 0 });
    },
    [setSection],
  );

  /** Renvoi « fiche N » de la table des infractions : ouvrir cette fiche seule. */
  const openSheet = useCallback(
    (n: number) => {
      setSection("sheets");
      setTheme("all");
      setGroup("all");
      setFam("all");
      setQuery("");
      setExpandAll(false);
      setToggled(new Set([n]));
      setMenuOpen(false);
      setJumpTo(n);
    },
    [setSection],
  );

  // Recense les occurrences apres chaque rendu qui peut les changer, et
  // repeint la courante — React recree les <mark> des que les termes bougent.
  useEffect(() => {
    const root = listRef.current;
    marksRef.current = root
      ? Array.from(root.querySelectorAll<HTMLElement>("mark.hl"))
      : [];
    const n = marksRef.current.length;
    setHits(n);
    const i = hit < n ? hit : 0;
    if (i !== hit) setHit(i);
    paintHit(i, false);
  }, [
    terms,
    section,
    theme,
    group,
    fam,
    toggled,
    expandAll,
    sheets,
    systems,
    penalties,
    penDetails,
    hit,
    paintHit,
  ]);

  // Une nouvelle recherche, ou un changement de section ou de filtre, repart
  // de la premiere occurrence.
  useEffect(() => {
    setHit(0);
  }, [terms, section, theme, group, fam]);

  // Rejoint la fiche demandee une fois qu'elle est rendue et ouverte.
  useEffect(() => {
    if (jumpTo == null) return;
    document
      .getElementById(`sh-${jumpTo}`)
      ?.closest(".sheet")
      ?.scrollIntoView({ block: "start", behavior: "smooth" });
    setJumpTo(null);
  }, [jumpTo, sheetCols]);

  // Close the menu on Escape or on a click outside it.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      const typing =
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);
      if (typing) {
        if (e.key === "Escape") {
          search("");
          el!.blur();
        }
        return;
      }
      if (onList) {
        if (e.key === "/") {
          e.preventDefault();
          searchRef.current?.focus();
        }
        return;
      }
      const k = e.key.toLowerCase();
      if (k === "m") shuffle();
      else if (k === "r") setSideAll(side === "front" ? "back" : "front");
      else if (k === "d") setShowDesc(!showDesc);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onList, shuffle, setSideAll, side, showDesc, setShowDesc, search]);

  return (
    <>
      <div className="jersey" />
      <div className="wrap">
        <header className="top">
          <h1>
            {onPen ? (
              <>
                Codes &amp; <em>pénalités</em>
              </>
            ) : onSystems ? (
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
            {onPen ? (
              <>
                Feuille de match SIHF · sanctions <b>2026/27</b>
              </>
            ) : onSystems ? (
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
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
              {onPen
                ? "Pénalités"
                : onSystems
                  ? "Systèmes"
                  : onSheets
                    ? "Fiches"
                    : "Signaux"}
            </button>

            {menuOpen && (
              <div className="menu-panel" id="nav">
                <div className="menu-sec">
                  <button
                    className="menu-item"
                    aria-current={section === "signals"}
                    onClick={() => goTo("signals")}
                  >
                    <span className="mi-t">Signaux de l’arbitre</span>
                    <span className="mi-s">
                      {SIGNALS.length} cartes · gestes en photo
                    </span>
                  </button>
                </div>

                <div className="menu-sec">
                  <button
                    className="menu-item"
                    aria-current={onSheets && theme === "all"}
                    onClick={() => goTo("sheets")}
                  >
                    <span className="mi-t">Fiches de poche</span>
                    <span className="mi-s">
                      {SHEETS.length} fiches · règles &amp; procédures
                    </span>
                  </button>
                  <div className="menu-themes">
                    {THEMES.map((t) => (
                      <button
                        key={t.key}
                        className={`th-chip th-${t.key}`}
                        aria-current={onSheets && theme === t.key}
                        onClick={() => goTo("sheets", t.key)}
                      >
                        <span className="dot" />
                        {t.short}
                      </button>
                    ))}
                  </div>

                  <div className="menu-pdf">
                    <span className="pdf-cap">PDF &agrave; imprimer</span>
                    {PDFS.map((p) => (
                      <a
                        key={p.file}
                        className="pdf-link"
                        href={`${BASE}pdf/${p.file}`}
                        target="_blank"
                        rel="noreferrer"
                        title={`${p.label} \u2014 ${p.hint}`}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 3v5h5"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {p.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="menu-sec">
                  <button
                    className="menu-item"
                    aria-current={onPen && fam === "all"}
                    onClick={() => goTo("penalties")}
                  >
                    <span className="mi-t">Codes &amp; pénalités</span>
                    <span className="mi-s">
                      {PENALTIES.length} infractions · code, sanctions, critère
                    </span>
                  </button>
                  <div className="menu-themes">
                    {FAMILIES.map((f) => (
                      <button
                        key={f.key}
                        className="th-chip th-c"
                        aria-current={onPen && fam === f.key}
                        onClick={() => goTo("penalties", f.key)}
                      >
                        <span className="dot" />
                        {f.short}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="menu-sec">
                  <button
                    className="menu-item"
                    aria-current={onSystems && group === "all"}
                    onClick={() => goTo("systems")}
                  >
                    <span className="mi-t">Systèmes d’arbitrage</span>
                    <span className="mi-s">
                      {SYSTEMS.length} fiches · placement &amp; procédures
                    </span>
                  </button>
                  <div className="menu-themes">
                    {SYSTEM_GROUPS.map((g) => (
                      <button
                        key={g.key}
                        className={`th-chip ${g.tone}`}
                        aria-current={onSystems && group === g.key}
                        onClick={() => goTo("systems", g.key)}
                      >
                        <span className="dot" />
                        {g.short}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {onList ? (
            <>
              <label className="find">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  />
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
                  placeholder={
                    onSystems
                      ? "Chercher un placement, un rôle…"
                      : "Chercher une faute, une règle, un code…"
                  }
                  aria-label="Chercher dans les fiches"
                  autoComplete="off"
                  onChange={(e) => search(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    goHit(e.shiftKey ? -1 : 1);
                  }}
                />
                {query && (
                  <button
                    type="button"
                    className="x"
                    aria-label="Effacer la recherche"
                    onClick={() => {
                      search("");
                      searchRef.current?.focus();
                    }}
                  >
                    ×
                  </button>
                )}
              </label>

              {terms.length > 0 && hits > 0 && (
                <div className="hits" role="group" aria-label="Occurrences trouvées">
                  <button
                    type="button"
                    onClick={() => goHit(-1)}
                    title="Occurrence précédente (Maj+Entrée)"
                    aria-label="Occurrence précédente"
                  >
                    &#8249;
                  </button>
                  <span aria-live="polite">
                    {hit + 1}<span className="hs-sep">/</span>{hits}
                  </span>
                  <button
                    type="button"
                    onClick={() => goHit(1)}
                    title="Occurrence suivante (Entrée)"
                    aria-label="Occurrence suivante"
                  >
                    &#8250;
                  </button>
                </div>
              )}

              {onSheets && theme !== "all" && (
                <button
                  className={`th-chip on th-${theme}`}
                  onClick={() => setTheme("all")}
                  title="Voir toutes les fiches"
                >
                  <span className="dot" />
                  {THEME_LABEL[theme]} ×
                </button>
              )}
              {onPen && fam !== "all" && (
                <button
                  className="th-chip on th-c"
                  onClick={() => setFam("all")}
                  title="Voir toutes les infractions"
                >
                  <span className="dot" />
                  {FAMILIES.find((f) => f.key === fam)?.short} ×
                </button>
              )}
              {onSystems && group !== "all" && (
                <button
                  className={`th-chip on ${GROUP[group].tone}`}
                  onClick={() => setGroup("all")}
                  title="Voir toutes les fiches"
                >
                  <span className="dot" />
                  {GROUP[group].short} ×
                </button>
              )}

              {onPen ? (
                <button
                  className="tgl"
                  aria-pressed={penDetails}
                  onClick={() => setPenDetails(!penDetails)}
                  title={
                    penDetails
                      ? "Masquer le critère et le renvoi de fiche"
                      : "Afficher le critère et le renvoi de fiche"
                  }
                >
                  Détails
                </button>
              ) : (
                <button
                  className="tgl"
                  aria-pressed={expandAll}
                  onClick={() => {
                    setExpandAll(!expandAll);
                    setToggled(new Set());
                  }}
                  title="Ouvrir toutes les fiches"
                >
                  Déplier
                </button>
              )}
              <span className="tally">
                {shown === total
                  ? `${total} ${onPen ? "infractions" : "fiches"}`
                  : `${shown} / ${total}`}
              </span>
            </>
          ) : (
            <>
              <button
                className="go"
                onClick={shuffle}
                title="Mélanger le paquet (M)"
              >
                ↺ Mélanger
              </button>
              <button
                onClick={resetOrder}
                title="Revenir à l’ordre du règlement"
              >
                Ordre
              </button>
              <button
                className="tgl"
                aria-pressed={side === "back"}
                onClick={() => setSideAll(side === "back" ? "front" : "back")}
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

        {onPen ? (
          <>
            <div
              className={`pen${penDetails ? "" : " pen-lite"}`}
              ref={listRef}
            >
              <div className="pen-hd" aria-hidden="true">
                <span>Code</span>
                <span>Infraction</span>
                <span>Sanctions possibles</span>
              </div>
              {penalties.map((p) => (
                <article className="pen-row" key={p.code}>
                  <span className="pen-code">{p.code}</span>
                  <div className="pen-main">
                    <h3 className="pen-fr">{highlightNodes(p.fr, terms)}</h3>
                    {penDetails && (
                      <>
                        <p className="pen-en">{highlightNodes(p.en, terms)}</p>
                        <p
                          className="pen-crit"
                          dangerouslySetInnerHTML={{
                            __html: highlightHtml(p.crit, terms),
                          }}
                        />
                        <button
                          type="button"
                          className="pen-ref"
                          onClick={() => openSheet(p.fiche)}
                          title={`Ouvrir la fiche ${p.fiche} — ${p.ficheTitre}`}
                        >
                          fiche {p.fiche} · {p.ficheTitre}
                        </button>
                      </>
                    )}
                  </div>
                  <ul className="pen-sanc">
                    {p.sanctions.map((k) => (
                      <li key={k} className={SANCTION[k].tone} title={SANCTION[k].label}>
                        {k === "---" ? "sans" : k}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            {shown === 0 && (
              <p className="empty">
                <b>Aucune infraction</b> ne correspond à cette recherche.
              </p>
            )}
            <div className="pen-key">
              <b>Légende</b>
              {SANCTIONS.map((x) => (
                <span key={x.key} className="pen-kv">
                  <i className={x.tone}>{x.key === "---" ? "sans" : x.key}</i>
                  {x.label}
                </span>
              ))}
            </div>
          </>
        ) : onCards ? (
          <>
            <div className="sheets" ref={listRef}>
              {onSystems
                ? systemCols.map((col, c) => (
                    <div className="sh-col" key={c}>
                      {col.map((s) => (
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
                          terms={terms}
                        />
                      ))}
                    </div>
                  ))
                : sheetCols.map((col, c) => (
                    <div className="sh-col" key={c}>
                      {col.map((s) => (
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
                          terms={terms}
                        />
                      ))}
                    </div>
                  ))}
            </div>
            {shown === 0 && (
              <p className="none">
                {onSystems
                  ? "Aucune fiche. Essaie « icing », « engagement », « zone », « L2 », « wash-out »."
                  : "Aucune fiche. Essaie « icing », « méconduite », « engagement », ou un numéro de règle."}
              </p>
            )}
            <p className="hint">
              Touchez le bandeau pour ouvrir une fiche
              <span className="kbdhint">
                {" "}
                · <kbd>/</kbd> chercher · <kbd>Esc</kbd> effacer
              </span>
            </p>
            <p className="credit">
              {onSystems
                ? "IIHF Officiating Procedure Manual — Three Officials System et Four Officials System, v1.0, 05/2023. Résumé en français ; le manuel officiel fait foi."
                : "Aide-mémoire tiré des cours de base SIHF (« Règles générales », « Autres infractions »), du règlement de jeu SEAF, des directives et aide-mémoires SIHF et du IIHF Official Rule Book 2026/27. En cas de doute, les documents officiels font foi."}
            </p>
          </>
        ) : (
          <>
            <div className={showDesc ? "grid" : "grid hide-desc"}>
              {visible.map((s, i) => (
                <Card
                  key={s.id}
                  signal={s}
                  index={i}
                  total={visible.length}
                  isBack={flipped.has(s.id) !== (side === "back")}
                  showDesc={showDesc}
                  onFlip={() => flip(s.id)}
                />
              ))}
            </div>

            <p className="hint">
              Touchez une carte pour la retourner
              <span className="kbdhint">
                {" "}
                · <kbd>M</kbd> mélanger · <kbd>R</kbd> tout retourner ·{" "}
                <kbd>D</kbd> nom seul
              </span>
            </p>
            <p className="credit">
              Photos et textes : IIHF Official Rule Book 2026/27, annexe I.
              Descriptions traduites en français. Usage personnel de formation.
            </p>
          </>
        )}
      </div>
      <UpdateToast />
    </>
  );
}

/** Tells you when the app is ready offline, and when a new version is waiting. */
function UpdateToast() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="toast" role="status">
      <span>
        {needRefresh
          ? "Nouvelle version disponible."
          : "Prêt pour le hors ligne."}
      </span>
      {needRefresh ? (
        <button className="go" onClick={() => updateServiceWorker(true)}>
          Recharger
        </button>
      ) : (
        <button onClick={() => setOfflineReady(false)}>OK</button>
      )}
      {needRefresh && (
        <button onClick={() => setNeedRefresh(false)}>Plus tard</button>
      )}
    </div>
  );
}
