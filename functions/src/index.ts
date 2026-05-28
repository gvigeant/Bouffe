import { onRequest } from 'firebase-functions/v2/https'
import * as https from 'https'
import * as http from 'http'

export const fetchUrl = onRequest(
  {
    cors: true,
    timeoutSeconds: 30,
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const { url } = req.body as { url?: string }

    if (!url || !/^https?:\/\//i.test(url)) {
      res.status(400).json({ error: 'URL invalide' })
      return
    }

    try {
      const html = await fetchHTML(url)
      res.json({ html })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Fetch error'
      res.status(500).json({ error: msg })
    }
  }
)

function fetchHTML(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const reqOptions = new URL(url)
    const options = {
      hostname: reqOptions.hostname,
      path: reqOptions.pathname + reqOptions.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BoutteBot/1.0)',
        'Accept': 'text/html',
      },
    }

    const req = client.get(options, (resp) => {
      let data = ''
      resp.on('data', (chunk: string) => { data += chunk })
      resp.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Timeout')) })
  })
}
