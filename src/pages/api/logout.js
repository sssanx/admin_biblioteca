export const prerender = false;

export async function POST() {
  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': 'sesion=; Path=/; HttpOnly; Max-Age=0',
      Location: '/home',
    },
  });
}
