import { getStore } from '@netlify/blobs';

const store = () => getStore({ name: 'linkedin', consistency: 'strong' });
export const load = async (k, fallback) => (await store().get(k, { type: 'json' })) ?? fallback;
export const save = (k, v) => store().setJSON(k, v);
export const ok = (o, status = 200) => Response.json(o, { status });
export const isAdmin = (req) => !!process.env.ADMIN_KEY && req.headers.get('x-admin-key') === process.env.ADMIN_KEY;
