# CONFIGURATOR

## 🎯 Objectif du projet

**Configurator** est un projet expérimental développé en **Electron + Vue 3**, avec un viewport 3D basé sur **BabylonJS**.

L’objectif n’est pas de produire un outil fini ou industriel, mais plutôt :

* d’explorer la création d’une **application desktop cross‑platform**
* de mettre en place une **architecture Electron propre et sécurisée**
* de manipuler un **éditeur visuel / viewport 3D**, dans l’esprit des logiciels métiers que l’on retrouve dans certaines entreprises industrielles.

Le choix de BabylonJS est volontaire :

* parce que c’est **fun** à utiliser
* parce que le moteur est très adapté aux **éditeurs**, outils internes et visualisations techniques
* et parce que certaines entreprises comme **Caldera** développent des logiciels avec ce type d’approche (éditeurs, outils internes, interfaces techniques).

Ce projet est donc une tentative de faire *« un truc du style »*, sans prétention autre que l’apprentissage et l’expérimentation tout en m'amusant.

---

## 🧱 Architecture générale

L’application suit une séparation stricte des responsabilités, recommandée pour Electron.

### 1. Main process (Electron)

Responsabilités :

* création de la fenêtre principale
* gestion du cycle de vie de l’application
* gestion des dialogues natifs (open/save)
* accès au système de fichiers
* gestion de la sécurité (CSP, sandbox, isolation)

📁 Fichiers principaux :

* `src/index.ts`

---

### 2. Preload (bridge sécurisé)

Le preload est le **seul point de contact** entre le renderer et le monde Node/Electron.

Il expose une API contrôlée via `contextBridge` :

* pas d’accès direct à Node depuis Vue
* communication uniquement via IPC typé

📁 Fichier principal :

* `src/preload.ts`

---

### 3. Renderer (Vue 3)

Responsabilités :

* interface utilisateur
* logique UI
* viewport 3D BabylonJS
* édition / interaction avec la scène

Aucun accès direct au système :

* tout passe par l’API exposée dans le preload

📁 Exemples de fichiers :

* `src/renderer/App.vue`
* `src/renderer/components/*`

---

## 🧠 BabylonJS & viewport 3D

BabylonJS est utilisé pour :

* afficher une scène 3D
* manipuler des objets simples
* tester l’import de modèles 3D
* poser les bases d’un futur éditeur visuel

Le viewport est pensé comme un **outil**, pas comme un jeu :

* caméra contrôlée
* scène lisible
* logique orientée édition

---

## 🔐 Sécurité & contraintes Electron

Le projet a volontairement été confronté à des problématiques réelles d’Electron, notamment :

### CSP (Content Security Policy)

* gestion des restrictions en **production**
* assouplissement contrôlé en **développement**
* problématiques liées aux ressources `blob:` et `data:`

Ces contraintes ont posé des difficultés, notamment pour :

* l’affichage de modèles 3D
* le chargement de ressources BabylonJS

Elles ont été volontairement affrontées pour mieux comprendre :

* les limites d’Electron
* les bonnes pratiques de sécurité
* les compromis nécessaires entre sécurité et fonctionnalités

---

## 🧪 État du projet

* Projet **en cours / expérimental**
* Certaines parties sont volontairement perfectibles
* Le but principal reste l’apprentissage et la compréhension

Ce repository sert autant de **POC** que de **terrain d’expérimentation**.

---

## 🛠️ Stack technique

* Electron
* Vue 3
* TypeScript
* BabylonJS
* Electron Forge
* Webpack

---

## 🚀 Installation & démarrage en local

### Prérequis

* **Node.js** (version LTS recommandée)
* **Git**

### Installation

```bash
git clone git@github.com:ZakAuMiel/CONFIGURATOR.git
cd CONFIGURATOR
npm install
```

### Lancer en développement

```bash
npm run start
```

### Build / packaging

```bash
npm run package
npm run make
```

> Remarque : en **développement**, le projet assouplit la **CSP** pour autoriser certaines sources nécessaires au chargement de ressources 3D (ex: `blob:` / `data:`). En **production**, la CSP est plus stricte et le chargement se fait dans un contexte packagé.

---

## 📌 Remarques finales

Ce projet n’a pas vocation à être un produit fini.
Il reflète une démarche de :

* montée en compétences
* exploration technique
* compréhension des architectures desktop modernes

Toute amélioration, refactorisation ou itération future se fera dans cette logique.
