const API = 'https://api.linkedin.com';
export const siteUrl = () => process.env.SITE_URL || process.env.URL;
const redirectUri = () => `${siteUrl()}/.netlify/functions/auth-callback`;
const H = (t) => ({
  Authorization: `Bearer ${t}`,
  'LinkedIn-Version': process.env.LINKEDIN_VERSION || '202608',
  'X-Restli-Protocol-Version': '2.0.0',
  'Content-Type': 'application/json',
});

export const authUrl = (state) =>
  'https://www.linkedin.com/oauth/v2/authorization?' +
  new URLSearchParams({ response_type: 'code', client_id: process.env.LINKEDIN_CLIENT_ID, redirect_uri: redirectUri(), state, scope: 'openid profile w_member_social' });

export async function exchange(code) {
  const r = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, client_id: process.env.LINKEDIN_CLIENT_ID, client_secret: process.env.LINKEDIN_CLIENT_SECRET, redirect_uri: redirectUri() }),
  });
  if (!r.ok) throw new Error(`token ${r.status} ${await r.text()}`);
  return r.json();
}

export async function userinfo(token) {
  const r = await fetch(`${API}/v2/userinfo`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`userinfo ${r.status}`);
  return r.json();
}

// o campo "commentary" do LinkedIn trunca o texto se estes caracteres não forem escapados (# fica livre pras hashtags)
export const esc = (t) => t.replace(/[\\|{}@\[\]()<>*_~]/g, '\\$&');

export async function uploadImage(token, owner, buffer) {
  const r = await fetch(`${API}/rest/images?action=initializeUpload`, { method: 'POST', headers: H(token), body: JSON.stringify({ initializeUploadRequest: { owner } }) });
  if (!r.ok) throw new Error(`initializeUpload ${r.status} ${await r.text()}`);
  const { value } = await r.json();
  const put = await fetch(value.uploadUrl, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream' }, body: buffer });
  if (!put.ok) throw new Error(`upload ${put.status}`);
  return value.image;
}

export async function createPost(token, author, text, image, alt) {
  const r = await fetch(`${API}/rest/posts`, {
    method: 'POST',
    headers: H(token),
    body: JSON.stringify({
      author, commentary: esc(text), visibility: 'PUBLIC', lifecycleState: 'PUBLISHED', isReshareDisabledByAuthor: false,
      distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
      content: { media: { id: image, altText: alt } },
    }),
  });
  if (r.status !== 201) throw new Error(`post ${r.status} ${await r.text()}`);
  return r.headers.get('x-restli-id');
}
