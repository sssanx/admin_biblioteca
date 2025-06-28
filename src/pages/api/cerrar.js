export const prerender = false;

import db from '../../lib/db';

export async function GET({ cookies }) {
  const token = cookies.get('session')?.value;

  if (token) {
    await db.query('DELETE FROM sesiones WHERE token = $1', [token]);
  }

  return new Response(null, {
    status: 303,
    headers: {
      'Set-Cookie': 'session=; Path=/; Max-Age=0',
      'Location': '/'
    }
  });
}
