import { load, save, ok, isAdmin } from '../../lib/store.mjs';
import { publishOne } from '../../lib/publish.mjs';

export const config = { path: '/api/*' };

export default async (req) => {
  if (!isAdmin(req)) return ok({ erro: 'não autorizado' }, 401);
  const { pathname } = new URL(req.url);
  const posts = await load('posts', []);
  if (pathname === '/api/state') {
    const t = await load('token', null);
    return ok({ posts, conta: t && { nome: t.name, dias: Math.floor((t.expires_at - Date.now()) / 864e5) } });
  }
  if (req.method === 'POST' && pathname === '/api/posts') {
    await save('posts', await req.json());
    return ok({ ok: true });
  }
  if (req.method === 'POST' && pathname === '/api/post-now') {
    const { n } = await req.json();
    const p = posts.find((x) => x.n === n);
    if (!p) return ok({ erro: 'post não encontrado' }, 404);
    try { p.urn = await publishOne(p); p.status = 'enviado'; p.enviado_em = new Date().toISOString(); p.erro = null; }
    catch (e) { p.status = 'erro'; p.erro = String(e.message).slice(0, 300); }
    await save('posts', posts);
    return ok({ post: p });
  }
  return ok({ erro: 'rota inexistente' }, 404);
};
