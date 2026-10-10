import { load, save } from '../../lib/store.mjs';
import { publishOne } from '../../lib/publish.mjs';

// roda a cada hora (UTC) e publica no máximo 1 post por execução (limite de 30 s da Netlify)
export const config = { schedule: '@hourly' };

const H = 36e5;

export default async () => {
  const posts = await load('posts', []);
  const now = Date.now();
  // trava anti-rajada: nada sai se outro post foi enviado nas últimas 20 h
  const ultimo = Math.max(0, ...posts.filter((x) => x.enviado_em).map((x) => +new Date(x.enviado_em)));
  if (now - ultimo < 20 * H) return;
  const vencidos = posts
    .filter((x) => x.status === 'aprovado' && x.agendar_em && new Date(x.agendar_em) <= now)
    .sort((a, b) => new Date(a.agendar_em) - new Date(b.agendar_em));
  let mudou = false;
  // post muito atrasado (mais de 36 h) não sai sozinho: vira "atrasado" e espera decisão manual
  for (const x of vencidos) if (now - new Date(x.agendar_em) > 36 * H) { x.status = 'atrasado'; mudou = true; }
  const p = vencidos.find((x) => x.status === 'aprovado');
  if (p) {
    mudou = true;
    try { p.urn = await publishOne(p); p.status = 'enviado'; p.enviado_em = new Date().toISOString(); p.erro = null; }
    catch (e) { p.status = 'erro'; p.erro = String(e.message).slice(0, 300); }
  }
  if (mudou) await save('posts', posts);
};
