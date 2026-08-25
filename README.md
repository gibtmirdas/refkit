# Signaux de l'arbitre — IIHF 2026/27

Application web installable (PWA) pour réviser les **35 signaux officiels** de l'annexe I du
règlement IIHF 2026/27 : photo au recto, nom FR / EN et description du geste au verso.
Mélange, filtres par famille, tout face photo ou tout face réponse. **Fonctionne entièrement
hors ligne** une fois ouverte — utile dans une patinoire sans réseau.

React + TypeScript + Vite, service worker via `vite-plugin-pwa`, déployée sur GitHub Pages.

## Démarrer

```bash
npm install
npm run dev          # http://localhost:5173/hockeyref/
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
<https://gibtmirdas.github.io/hockeyref/>.

Le chemin de base est fixé dans `vite.config.ts` :

```ts
const BASE = '/hockeyref/'
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
| `src/Card.tsx` | la carte et son retournement |
| `src/App.tsx` | état du paquet : ordre, faces, filtres, persistance |
| `public/signals/` | les 38 photos extraites de l'annexe I |

Les descriptions françaises sont une traduction du texte officiel anglais. Les mémos
(`memo`) signalent les gestes qu'on confond : 44 derrière le genou / 57 sous le genou,
60 et 80 identiques, 64 et 75 identiques.

Raccourcis clavier : `M` mélanger, `R` tout retourner, `D` nom seul / nom + geste.

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
