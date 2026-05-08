# KVICE - DJ Site

Site oficial do DJ KVICE, construido em React, TypeScript e Vite.

## Como Rodar

```bash
npm install
npm run dev
```

Build de producao:

```bash
npm run build
npm run preview
```

## Deploy Na Vercel

Este repositorio esta pronto para importacao direta na Vercel.

Configuracoes esperadas:

- Framework Preset: `Vite`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

O arquivo `vercel.json` ja define essas configuracoes e inclui rewrite para `index.html`, mantendo rotas de SPA funcionando em producao.

## Estrutura

```text
kvice-site/
|-- public/
|   |-- dj-loop.mp4
|   |-- hero-desktop.png
|   |-- hero-mobile.jpg
|   |-- track.mp3
|-- src/
|   |-- App.tsx
|   |-- main.tsx
|   |-- Player.tsx
|   |-- Trail.tsx
|   |-- styles.css
|-- index.html
|-- package.json
|-- tsconfig.json
|-- vercel.json
|-- vite.config.ts
```

## Editar Conteudo

Os dados de shows e tracks ficam no topo de `src/App.tsx` como arrays tipados. Para atualizar a agenda ou discografia, edite esses arrays.

## Trocar Cores

As cores principais ficam em CSS variables no topo de `src/styles.css`.
