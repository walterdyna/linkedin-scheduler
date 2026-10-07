import { save } from '../../lib/store.mjs';
import { authUrl } from '../../lib/linkedin.mjs';

export default async (req) => {
  if (new URL(req.url).searchParams.get('key') !== process.env.ADMIN_KEY) return new Response('forbidden', { status: 403 });
  const state = crypto.randomUUID();
  await save('oauth-state', { state });
  return Response.redirect(authUrl(state), 302);
};
