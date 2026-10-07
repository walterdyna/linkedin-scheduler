import { load } from './store.mjs';
import { uploadImage, createPost, siteUrl } from './linkedin.mjs';

export async function publishOne(p) {
  const t = await load('token', null);
  if (!t || t.expires_at < Date.now()) throw new Error('token do LinkedIn ausente ou expirado: reconecte no painel');
  const owner = `urn:li:person:${t.sub}`;
  const img = await fetch(`${siteUrl()}/media/post-${String(p.n).padStart(2, '0')}.png`);
  if (!img.ok) throw new Error(`imagem do post ${p.n} não encontrada`);
  const image = await uploadImage(t.access_token, owner, Buffer.from(await img.arrayBuffer()));
  return createPost(t.access_token, owner, p.texto, image, p.titulo);
}
