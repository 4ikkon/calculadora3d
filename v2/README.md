# PrintCalc 3D v2

Versao mobile ready da calculadora de custo de impressao 3D.

## O que esta pronto

- Web app responsiva
- Tema escuro
- Historico salvo localmente
- PWA instalavel
- Cache offline com service worker
- Estrutura para deploy estatico
- Configuracao base do Capacitor para Android

## Estrutura

- `index.html`: interface principal
- `style.css`: visual responsivo
- `script.js`: calculos, historico e instalacao PWA
- `sw.js`: cache offline
- `manifest.webmanifest`: metadados do app instalavel
- `assets/`: icones do app
- `capacitor.config.json`: configuracao do wrapper Android

## Publicar na web

### GitHub Pages

1. Suba o conteudo da pasta `v2`.
2. Ative o GitHub Pages para a branch desejada.
3. Sirva a raiz do projeto ou a pasta publicada correspondente.

### Netlify

1. Crie um novo site apontando para a pasta `v2`.
2. Como e um site estatico, nao precisa comando de build.
3. Publish directory: `v2`

### Vercel

1. Importe o repositorio.
2. Configure como projeto estatico.
3. Output directory: `v2`

## Rodar localmente

Se voce tiver Node instalado:

```bash
npm install
npm run serve
```

Depois abra o endereco exibido no terminal. O service worker precisa de HTTP local ou HTTPS para funcionar corretamente.

## Gerar app Android com Capacitor

Pre-requisitos:

- Node.js instalado
- Android Studio instalado
- SDK Android configurado

Passos:

```bash
npm install
npx cap add android
npx cap copy
npx cap open android
```

Depois disso, o Android Studio abre o projeto nativo para build, emulador ou APK.

## Observacoes

- O historico continua local por dispositivo.
- Para sincronizar historico entre aparelhos, a proxima evolucao seria integrar login e banco de dados.
