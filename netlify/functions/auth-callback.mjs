import { load, save } from '../../lib/store.mjs';
import { exchange, userinfo, siteUrl } from '../../lib/linkedin.mjs';

export default async (req) => {
  const q = new URL(req.url).searchParams;
  const saved = await load('oauth-state', {});
  if (!q.get('code') || q.get('state') !== saved.state) return new Response('state inválido', { status: 400 });
  const t = await exchange(q.get('code'));
  const me = await userinfo(t.access_token);
  await save('token', { access_token: t.access_token, expires_at: Date.now() + t.expires_in * 1000, sub: me.sub, name: me.name });
  return Response.redirect(`${siteUrl()}/?conectado=1`, 302);
};
