/**
 * Vercel Serverless Function — proxy ảnh Sofascore, strip Referer để tránh bị block.
 * Route: /api/sofascore-proxy/[...path]
 * Ví dụ: /api/sofascore-proxy/player/12345/image
 */
export default async function handler(req, res) {
  const { path } = req.query;
  const sofascorePath = Array.isArray(path) ? path.join('/') : path;
  const url = `https://api.sofascore.app/api/v1/${sofascorePath}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        // Không set Referer — đây là lý do chính để dùng serverless thay vì rewrite
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
  } catch {
    res.status(500).end();
  }
}
