import { load, save } from '../../lib/store.mjs';
import { publishOne } from '../../lib/publish.mjs';

// roda a cada hora (UTC): publica no máximo 1 post vencido por execução (limite de 30 s da Netlify)
export const config = { schedule: '@hourly' };

export default async () => {
  const posts = await load('posts', []);
  const p = posts.find((x) => x.status === 'aprovado' && x.agendar_em && new Date(x.agendar_em) <= new Date());
  if (!p) return;
  try { p.urn = await publishOne(p); p.status = 'enviado'; p.enviado_em = new Date().toISOString(); p.erro = null; }
  catch (e) { p.status = 'erro'; p.erro = String(e.message).slice(0, 300); }
  await save('posts', posts);
};
