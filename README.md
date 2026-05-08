# KVICE — DJ Site

Site oficial do DJ KVICE. Construído em **React + TypeScript + Vite**.

## 🎧 Estética

Brutalist / electronic music poster. Tipografia oversized (Anton + Syne + JetBrains Mono),
preto profundo com acento ciano elétrico, layouts assimétricos, animações de scroll e hero
em tela cheia com a foto ao vivo.

## 🚀 Como rodar

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## 📁 Estrutura

```
kvice-site/
├── public/
│   └── hero.png          # Foto principal (fundo do hero)
├── src/
│   ├── App.tsx           # Componente principal com todas as seções
│   ├── main.tsx          # Entry point React
│   └── styles.css        # Toda a estética do site
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## ✏️ Editar conteúdo

Os dados de **shows** e **tracks** ficam no topo do `src/App.tsx` como arrays tipados —
basta editar os arrays para atualizar a tour ou a discografia. Trocar o e-mail de booking
no JSX da seção `.booking`.

## 🎨 Trocar cores

Todas as cores estão em CSS variables no topo de `src/styles.css`:

```css
--ink: #0a0a0a;        /* preto base */
--bone: #f4f1ea;       /* creme/branco */
--acid: #00ffcc;       /* ciano elétrico (acento) */
--hot: #ff2d5f;        /* rosa quente (alerta) */
```
