/**
 * Vercel Serverless Function — proxy ảnh Sofascore
 * Route: /api/image-proxy?type=player&id=12345
 *        /api/image-proxy?type=team&id=12345
 *        /api/image-proxy?type=tournament&id=626&theme=dark
 */
export default async function handler(req, res) {
  const { type, id, theme = 'dark' } = req.query;

  if (!type || !id) {
    return res.status(400).json({ error: 'Missing type or id' });
  }

  const url = type === 'team'
    ? `https://api.sofascore.app/api/v1/team/${id}/image`
    : type === 'player'
    ? `https://api.sofascore.app/api/v1/player/${id}/image`
    : `https://api.sofascore.app/api/v1/unique-tournament/${id}/image/${theme}`;

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.sofascore.com/',
        'Origin': 'https://www.sofascore.com',
      },
    });

    if (!response.ok) {
      return res.status(response.status).end();
    }

    const contentType = response.headers.get('content-type') ?? 'image/png';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
