export function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | null, offsetSeconds = 10) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  const exp = payload.exp as number;
  const now = Math.floor(Date.now() / 1000);
  return now >= exp - offsetSeconds;
}
