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
|   |-- hero-loop.mp4          (video do hero, 720p)
|   |-- hero-loop-mobile.mp4   (video do hero, 480p, telas ate 768px)
|   |-- hero-poster.webp       (primeiro frame do hero)
|   |-- dj-loop.mp4
|   |-- dj-poster.webp         (primeiro frame do dj-loop)
|   |-- hero-desktop.png
|   |-- hero-mobile.jpg
|   |-- track.mp3
|-- src/
|   |-- App.tsx
|   |-- main.tsx
|   |-- Player.tsx
|   |-- LoopVideo.tsx
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

## Videos (Performance)

Os videos de fundo devem ser H.264, sem audio e leves (o hero original tinha 49 MB em AV1 1080p60). Para trocar um video, gere as versoes com ffmpeg:

```bash
# hero desktop (720p) e mobile (480p)
ffmpeg -i original.mp4 -an -vf "fps=30,scale=1280:720,setsar=1" -c:v libx264 -preset slower -crf 29 -pix_fmt yuv420p -movflags +faststart public/hero-loop.mp4
ffmpeg -i original.mp4 -an -vf "fps=30,scale=854:480,setsar=1" -c:v libx264 -preset slower -crf 30 -pix_fmt yuv420p -movflags +faststart public/hero-loop-mobile.mp4

# poster (primeiro frame)
ffmpeg -i public/hero-loop.mp4 -frames:v 1 -c:v libwebp -quality 75 public/hero-poster.webp
```

O componente `LoopVideo` so baixa o video quando ele chega perto da tela e pausa quando sai dela.
