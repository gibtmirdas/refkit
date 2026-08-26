# RefKit — signaux & fiches de l'arbitre, IIHF 2026/27

Application web installable (PWA) avec trois sections, au choix dans le menu de la barre :

- **Signaux** — les **35 signaux officiels** de l'annexe I du règlement IIHF 2026/27 :
  photo au recto, nom FR / EN et description du geste au verso. Mélange, tout face photo
  ou tout face réponse.
- **Fiches** — les **42 fiches de poche** SIHF / SEAF / IIHF (pénalités et codes, règles de
  jeu, procédures, équipement, gestion de match), dépliables et cherchables, dans la même
  numérotation que le jeu de cartes A7 imprimé.

- **Systèmes** — les **29 fiches** tirées des *IIHF Officiating Procedure Manuals* (systèmes
  à 3 et à 4 officiels) : ce qui est commun aux deux, puis les procédures propres à chacun —
  placement, engagements, zones de responsabilité, icing, tir de pénalité, vidéo.

**Fonctionne entièrement hors ligne** une fois ouverte — utile dans une patinoire sans réseau.

React + TypeScript + Vite, service worker via `vite-plugin-pwa`, déployée sur GitHub Pages.

## Démarrer

```bash
npm install
npm run dev          # http://localhost:5173/refkit/
```

```bash
npm run build        # typecheck + build dans dist/
npm run preview      # sert dist/ pour tester le service worker
```

Le service worker n'est actif que sur le build (`preview`), pas en mode `dev`.

## Déploiement GitHub Pages

Le workflow `.github/workflows/deploy.yml` construit et publie `dist/` à chaque push sur `main`.

À faire une seule fois, dans le dépôt : **Settings → Pages → Build and deployment → Source :
GitHub Actions**. Le site est ensuite publié sur
<https://gibtmirdas.github.io/refkit/>.

Le chemin de base est fixé dans `vite.config.ts` :

```ts
const BASE = '/refkit/'
```

Il doit correspondre au nom du dépôt. Si le dépôt est renommé, changez cette constante —
sinon le manifest et la portée du service worker pointent à côté et l'installation échoue.

## Installer sur le téléphone

- **iOS / Safari** : ouvrir le site, bouton Partager → *Sur l'écran d'accueil*.
- **Android / Chrome** : menu ⋮ → *Installer l'application*.

Au premier passage en ligne, l'app télécharge et garde les 38 photos (environ 860 ko au total) ;
ensuite elle s'ouvre et fonctionne sans réseau. Quand une nouvelle version est publiée, une
bannière *Nouvelle version disponible* propose de recharger.

## Contenu

| Fichier | Rôle |
| --- | --- |
| `src/signals.ts` | les 35 signaux : numéro de règle, nom FR / EN, description, mémo, famille, photos |
| `src/sheets.ts` | les 42 fiches de poche : numéro, thème, titre, contenu HTML, texte de recherche |
| `src/systems.ts` | les 29 fiches des systèmes à 3 et 4 officiels, même structure |
| `public/systems/` | 8 figures découpées des deux manuels OPM (placement, zones, icing, tir de pénalité) |
| `src/Card.tsx` | la carte de signal et son retournement |
| `src/Sheet.tsx` | une fiche dépliable (fiches de poche et systèmes) |
| `src/App.tsx` | état de l'app : section courante, paquet (ordre, faces), recherche et filtres des fiches |
| `public/signals/` | les 38 photos extraites de l'annexe I |
| `src/styles.css` | le système visuel sombre : jetons de couleur, typographie, formes |
| `brand/maskable.svg` | source de l'icône masquable (les PNG de `public/icons/` en sont tirés) |

Les descriptions françaises sont une traduction du texte officiel anglais. Les mémos
(`memo`) signalent les gestes qu'on confond : 44 derrière le genou / 57 sous le genou,
60 et 80 identiques, 64 et 75 identiques.

Les fiches de poche sont tirées du **cours de base SIHF « Règles générales » (NWA ON01)** —
source de référence en cas de divergence —, du règlement de jeu SEAF, des directives et
aide-mémoires SIHF et du IIHF Official Rule Book 2026/27 ; elles reprennent la numérotation du
jeu de cartes A7 imprimé. Les fiches « systèmes » résument les deux *Officiating Procedure Manuals* de l'IIHF
(v1.0, 05/2023), y compris le système de secours à 2 arbitres + 1 juge de lignes ; huit
figures y sont reprises telles quelles des manuels, avec la mention de leur numéro.
Comme les photos de l'annexe I, elles restent la propriété de l'IIHF et sont ici à usage
personnel de formation.
En cas de doute, les documents officiels font foi.

Raccourcis clavier — signaux : `M` mélanger, `R` tout retourner, `D` nom seul / nom + geste ;
fiches : `/` chercher, `Esc` effacer.

## Identité visuelle

Thème **sombre uniquement** — pas de variante claire. La palette reprend celle de
[sihf.ch](https://www.sihf.ch/) : fond nuit `#0d0d1a`, surfaces `#1a1c2e`, rouge de marque
`#fe2941`, et des blocs d'accent clairs qui portent un texte presque noir. Typographie
*Funnel Sans* (la police de corps de la SIHF) et *Barlow Condensed* pour les titres.
Tout est déclaré en jetons CSS dans `:root`, en tête de `src/styles.css`.

Les icônes se régénèrent depuis les sources SVG :

```bash
rsvg-convert -w 192 -h 192 public/favicon.svg -o public/icons/icon-192.png
rsvg-convert -w 512 -h 512 public/favicon.svg -o public/icons/icon-512.png
rsvg-convert -w 180 -h 180 public/favicon.svg -o public/apple-touch-icon.png
rsvg-convert -w 512 -h 512 brand/maskable.svg -o public/icons/maskable-512.png
```

## À propos des images

Les photos proviennent du *IIHF Official Rule Book 2026/27*, annexe I, et restent la propriété
de l'IIHF. Elles sont ici à usage personnel de formation.

⚠️ **Un site GitHub Pages est public**, même quand le dépôt est privé (l'accès restreint aux
Pages n'existe que sur GitHub Enterprise Cloud). Publier ce dépôt sur Pages revient donc à
rediffuser ces photos publiquement. Deux alternatives si ce n'est pas souhaitable : garder
l'app en local (`npm run preview -- --host` puis ouvrir l'adresse du réseau local depuis le
téléphone), ou l'héberger derrière une authentification (Cloudflare Access, Netlify avec
mot de passe, etc.).

À noter aussi : GitHub Pages sur un dépôt **privé** demande un plan payant (Pro / Team /
Enterprise). Sur un compte gratuit, il faut rendre le dépôt public pour que Pages fonctionne.
