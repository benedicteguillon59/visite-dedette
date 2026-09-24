# Visite à Dédette

Application web mobile (Android et iPhone) : un calendrier partagé où chacun voit les visites prévues à Dédette, avec le nom des inscrits, et peut s'inscrire lui-même. Tout est en français.

## Fichiers

- `index.html` : toute l'application (HTML, CSS et JavaScript dans un seul fichier, sans bibliothèque à part les scripts Firebase chargés depuis gstatic.com).
- `manifest.webmanifest` et `icons/` : installation sur l'écran d'accueil (icônes 192, 512, apple-touch 180, favicon 32). Icônes générées avec Pillow (maison vert sarcelle, cœur corail, fond jaune `#ffd45c`).
- `firestore.rules` : copie des règles de sécurité Firestore. Le code d'accès y est remplacé par `CHANGER-MOI` ; le vrai code n'existe que dans la console Firebase.
- `.claude/launch.json` : lance un serveur local (`python -m http.server 8765`) pour tester.

## Fonctions

- Calendrier mensuel (lundi en premier), pastilles de couleur par inscrit (10 couleurs, choisies d'après le nom), jour actuel en corail.
- Panneau du jour : liste des inscrits (heure, nom, précision) et formulaire d'inscription (nom, code d'accès à la première fois, heure, précision facultative).
- Annulation de sa propre inscription (double clic de confirmation, sans boîte de dialogue).
- Après inscription : boutons « Google Agenda », « Outlook » et « Copier les détails » (durée 1 h, fuseau Europe/Paris).
- « Prochaines visites » : liste des 30 prochaines.
- En-tête : lien Google Maps et itinéraire vers la Résidence Les Hauts d'Amandie, Faches-Thumesnil.
- Mode clair et mode sombre automatiques.

## Comment elle tourne (en ligne depuis le 24/09/2026)

- Site : https://benedicteguillon59.github.io/visite-dedette/ (GitHub Pages, dépôt public `benedicteguillon59/visite-dedette`, branche `main`, racine).
- Base de données : Firebase, projet `visite-dedette`, Firestore en édition Standard.
- La configuration Firebase (`firebaseConfig` dans `index.html`) n'est pas secrète : ce sont les règles Firestore qui protègent les données.

### Fonctionnement des données

- Connexion anonyme Firebase (Authentication > Anonyme activée) : chaque appareil a un `uid`.
- Collection `visites`, un document par inscription : `date` AAAA-MM-JJ, `time` HH:MM, `name`, `note`, `uid`, `createdAt`.
- Visites récurrentes : à l'inscription, une visite (un document) est créée par date, dans un seul lot (`db.batch()`), avec en plus `serie` (identifiant commun) et `every` (7 ou 14 jours). Annulation : « celle-ci seulement » ou « celle-ci et les suivantes » (mêmes `serie` et `uid`, date ≥). Google Agenda reçoit une règle `RRULE` pour toute la série. Les règles Firestore n'ont pas eu besoin de changer.
- Couleurs des inscrits : attribuées par ordre de première inscription (`assignTones`, tri sur `createdAt`), 10 couleurs, donc jamais deux personnes identiques tant qu'elles sont moins de 10.
- Collection `membres`, un document par appareil (identifiant = `uid`) : créé à la première inscription si le code d'accès est bon. Les règles n'autorisent la création d'une inscription que si ce document existe, et la suppression que pour son propre `uid`.
- Lecture du calendrier : ouverte à toute personne connectée (donc à toute personne qui a le lien). Seule l'inscription est protégée par le code.

## Mettre à jour le site

1. Modifier `index.html` (et tester en local avec `preview_start` sur `visite-dedette`, puis recharger avec le cache vidé).
2. Sur GitHub : dépôt `visite-dedette` > Add file > Upload files > glisser le fichier modifié > Commit changes. Le site se met à jour en une à deux minutes.
3. Envoyer seulement `index.html`, `manifest.webmanifest` et `icons/`. Ne jamais envoyer `CLAUDE.md`, `firestore.rules`, `.claude/` ni le code d'accès.

## Changer le code d'accès ou les règles

- Firebase > Firestore Database > onglet Règles : modifier la valeur entre guillemets simples dans `request.resource.data.code == '...'`, puis Publier. Les personnes déjà inscrites gardent leur accès.
- Après une modification de `firestore.rules`, mettre à jour la copie du dépôt sans y écrire le vrai code.

## Si un nouveau domaine est utilisé

Ajouter le domaine dans Firebase > Authentication > Paramètres > Domaines autorisés (sans `https://` ni chemin). Sans cela, l'inscription échoue.

## Pièges connus

- La fonction `h()` accepte des tableaux d'enfants : sans cela, la liste des inscrits s'affichait en `[object HTMLSpanElement]`.
- Un `label` a `display: grid` ; l'attribut `hidden` seul ne le cache pas, d'où la règle `label[hidden] { display: none; }`.
- Le navigateur local garde l'ancienne page en cache : recharger avec `location.reload(true)`.
- Le volet Navigateur peut afficher un autre onglet que celui de l'appli : passer `tabId` explicitement.

## Consignes

- Garder le français, un ton simple et chaleureux, pas de jargon.
- Garder l'application en un seul fichier tant qu'elle reste petite.
- Ne jamais mettre de clés secrètes ni le code d'accès dans le code ou sur GitHub.
