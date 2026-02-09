# 📦 Electron Babylon Configurator

Mini **configurateur 3D desktop** développé avec **Electron**, **Vue 3**, **TypeScript** et **BabylonJS**.  
Le projet met l’accent sur **l’architecture**, la **séparation des responsabilités** et l’**intégration desktop sécurisée** (IPC).

Ce POC a été conçu pour démontrer :

- la compréhension d’Electron (main / preload / renderer)

- l’intégration d’un moteur 3D (BabylonJS)

- une architecture UI propre et maintenable

- une vraie fonctionnalité desktop (import de fichiers via dialog système)

----------

## 🎯 Objectifs du projet

- Afficher un viewport 3D interactif

- Permettre l’édition d’objets simples (formes primitives, couleur)

- Importer un modèle 3D (`.glb` / `.gltf`) depuis le système de fichiers

- Garder une architecture claire, sécurisée et scalable

----------

## 🧱 Stack technique

- **Electron** (Electron Forge + Webpack)

- **Vue 3** (`<script setup>`)

- **TypeScript**

- **BabylonJS** (`@babylonjs/core`, `@babylonjs/loaders`)

- **IPC sécurisé** (`contextIsolation`, `preload`)

----------

## 🗂️ Architecture globale

`src/
├─ index.ts # Main process (Electron) ├─ preload.ts # Bridge sécurisé IPC ├─ env.d.ts # Types globaux (Vue + window.api) │
├─ App.vue # Orchestrateur (state global) │
├─ components/
│   ├─ ViewportBabylon.vue # Rendu 3D BabylonJS │   └─ EditorPanel.vue # UI (panneau d’édition)`

### Principe clé

👉 **Le renderer (Vue) n’accède jamais directement au système**  
👉 Toute interaction OS passe par le **main process via IPC**

----------

## 🔐 Sécurité Electron (IPC)

- Le **renderer** ne peut pas :

  - accéder au filesystem

  - ouvrir de dialog système

- Le **preload** expose une API minimale :

    `window.api.openModelDialog()`

- Le **main process** gère :

  - `dialog.showOpenDialog`

  - la logique système

➡️ Architecture conforme aux bonnes pratiques Electron.

----------

## 🧠 Gestion de l’état (UI)

- L’état global (`shape`, `color`, `hasImportedModel`) est centralisé dans **`App.vue`**

- Les composants enfants :

  - **reçoivent des props**

  - **émettent des événements**

- Flux de données **unidirectionnel** :

  - données ↓

  - événements ↑

### Avantages

- pas de couplage UI ↔ moteur 3D

- lisible et testable

- facile à faire évoluer (presets, undo/redo, save/load…)

----------

## 🎛️ EditorPanel.vue (UI)

Rôle :

- afficher les contrôles (forme, couleur, import)

- **ne contient aucune logique 3D**

- émet uniquement des intentions utilisateur

Exemples d’événements :

- `update:shape`

- `update:color`

- `import-model`

- `reset-to-primitive`

----------

## 🎥 ViewportBabylon.vue (3D)

Rôle :

- initialiser BabylonJS (engine, scene, caméra, lumière)

- créer des **formes primitives**

- charger des modèles 3D importés

- exposer une API minimale au parent :

    `loadModel(path: string) resetToPrimitives()`

### Import de modèles 3D

- Le chemin du fichier vient du **main process**

- Babylon nécessite :

    `rootUrl + fileName`

- Le chemin système est donc découpé avant chargement

----------

## 📥 Import de modèles 3D

Formats supportés :

- `.glb`

- `.gltf`

Processus :

1. L’utilisateur clique sur **Import**

2. `EditorPanel` émet un événement

3. `App.vue` appelle `window.api.openModelDialog()`

4. Le main process ouvre une dialog système

5. Le chemin est renvoyé au renderer

6. Babylon charge le modèle

----------

## ▶️ Lancer le projet

`npm install
npm run start`

----------

## 🚀 Évolutions possibles

- Sauvegarde / chargement de configuration (JSON)

- Presets de formes / matériaux

- Import de textures

- Undo / Redo

- Inspector Babylon (mode debug)

- Packaging Windows / macOS

----------

## 📌 Note

Ce projet est un **POC technique**, orienté démonstration d’architecture et d’intégration Electron + 3D, et non un produit final.

----------

----------

# 📦 Electron Babylon Configurator (EN)

A small **desktop 3D configurator** built with **Electron**, **Vue 3**, **TypeScript**, and **BabylonJS**.  
This project focuses on **architecture**, **clear separation of concerns**, and **secure desktop integration** using IPC.

----------

## 🎯 Project Goals

- Display an interactive 3D viewport

- Edit simple primitives (shape, color)

- Import a 3D model (`.glb` / `.gltf`) from the local filesystem

- Demonstrate clean, scalable Electron architecture

----------

## 🧱 Tech Stack

- **Electron** (Electron Forge + Webpack)

- **Vue 3** (`<script setup>`)

- **TypeScript**

- **BabylonJS**

- **Secure IPC** (`preload`, `contextIsolation`)

----------

## 🗂️ Global Architecture

`src/
├─ index.ts # Electron main process ├─ preload.ts # Secure IPC bridge ├─ env.d.ts # Global types │
├─ App.vue # State orchestrator │
├─ components/
│   ├─ ViewportBabylon.vue # BabylonJS renderer │   └─ EditorPanel.vue # Editor UI`

----------

## 🔐 Electron Security Model

- The **renderer** never accesses system APIs directly

- All OS interactions go through **IPC**

- The preload exposes a minimal API:

    `window.api.openModelDialog()`

----------

## 🧠 State Management

- Global state lives in **`App.vue`**

- Child components:

  - receive data via props

  - emit events upward

- **Unidirectional data flow** (Vue best practice)

----------

## 🎛️ EditorPanel.vue

Role:

- Display editor controls

- Emit user intentions only

- No rendering or Babylon logic

----------

## 🎥 ViewportBabylon.vue

Role:

- Initialize BabylonJS engine and scene

- Render primitives

- Load imported 3D models

- Expose minimal methods to parent:

    `loadModel(path) resetToPrimitives()`

----------

## 📥 3D Model Import

Supported formats:

- `.glb`

- `.gltf`

Flow:

1. User clicks **Import**

2. Renderer requests file via IPC

3. Main process opens native dialog

4. File path is returned

5. Babylon loads the model

----------

## ▶️ Run the project

`npm install
npm run start`

----------

## 🚀 Possible Improvements

- Save / load configurations

- Material presets

- Texture import

- Undo / redo

- Babylon inspector

- App packaging

----------

## 📌 Note

This is a **technical proof of concept**, designed to demonstrate Electron + Vue + BabylonJS integration and clean architecture practices.

Made by **Zakaria Oubbéa** with **💗**
