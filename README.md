# linkedin-scheduler

Agendador de posts do LinkedIn em **Netlify Functions + Netlify Blobs**, usando a API oficial (OAuth 2.0, `w_member_social`).
Sem servidor próprio: painel estático, funções serverless e uma função agendada (`@hourly`, UTC) que publica 1 post vencido por execução.

## Como funciona
- `auth-start` / `auth-callback`: OAuth 2.0 (3-legged). O token (60 dias, sem refresh) fica no Netlify Blobs.
- `api`: painel protegido por `ADMIN_KEY` (importar, agendar, aprovar, publicar agora).
- `publisher`: função agendada; sobe a imagem (`/rest/images`) e cria o post (`/rest/posts`).
- Nada sai sem status **aprovado**.

## Configuração
1. LinkedIn: crie uma Página, depois um app em linkedin.com/developers ligado a ela. Em *Products* adicione **Share on LinkedIn** e **Sign In with LinkedIn using OpenID Connect**.
2. No app, em *Auth*, cadastre o Redirect URL: `https://SEU-SITE.netlify.app/.netlify/functions/auth-callback`
3. Netlify: *Add new site → Import from Git* com este repositório. Em *Site configuration → Environment variables*:
   `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `ADMIN_KEY` (uma senha longa sua) e, se usar domínio próprio, `SITE_URL`.
4. Abra o site, entre com a `ADMIN_KEY`, clique em **Conectar LinkedIn** e autorize.
5. Cole o Markdown exportado do documento dos posts, **Importar**, escolha a primeira terça-feira e **Agendar**.

## Rodar local
```bash
npm install
npx netlify-cli dev
```

## Observações
- O token expira em 60 dias: o painel mostra os dias restantes; reconecte antes.
- Imagens em `public/media/post-NN.png`.
- Cron da Netlify é em UTC: 08:00 em Brasília = 11:00 UTC.
