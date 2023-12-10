import { error, IRequest, json, Router } from 'itty-router'
import { verifyTOTP } from 'totp-basic'
import { z } from 'zod'

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => router()
    .handle(request, env, ctx)
    .catch(error)
}

function router() {
  const router = Router()
  router.all('/ping', () => json('Pong!'))
  router.all('/version', (_, env: Env) => json(env.VERSION))

  router.post('/directory/:volume', registerVolume)
  router.get('/directory/:volume', auth, getVolume)
  router.gut('/directory/:volume', auth, putVolume)
  router.all('/directory/:volume', () => error(405, 'Method not allowed.'))
  router.get('/directory/:volume/:filename', auth, getFile)
  router.put('/directory/:volume/:filename', auth, putFile)
  router.all('/directory/:volume/:filename', () => error(405, 'Method not allowed.'))

  router.get('/bucket/:id', getItem)
  router.post('/bucket', postItem)

  router.all('*', () => error(404, 'Invalid path.'))
  return router
}

async function registerVolume(request: IRequest, env: Env) {
  const { params: { volume } } = request
  if (await env.volumes.get(volume) !== null) {
    return error(409, 'Volume exist.')
  }

  const v = Volume.safeParse(await request.json())
  if (!v.success) {
    return error(400, 'Malformed request.')
  }
  await env.volumes.put(volume, JSON.stringify(v.data))
}

async function auth(request: IRequest, env: Env) {
  const { params: { volume } } = request
  const data = await env.volumes.get(volume)
  if (data === null) {
    return error(404, 'Volume not exist.')
  }
  const { secret } = Volume.parse(await data.json())

  const otp = request.query['otp']
  if (typeof otp === 'string' && await verifyTOTP(secret, otp)) return

  const [scheme, token] = request.headers.get('Authorization')?.split(' ') ?? []
  switch (scheme) {
  case 'TOTP':
    return await verifyTOTP(secret, token) ? void 0 : error(403, 'Invalid token.')
  case 'Secret':
    const encoder = new TextEncoder()
    return crypto.subtle.timingSafeEqual(
      encoder.encode(token),
      encoder.encode(secret),
    ) ? void 0 : error(403, 'Invalid token.')
  }
  return error(401, 'Missing or malformed authorization token.')
}

const Volume = z.object({
  protected: z.enum(['get', 'put', 'both', 'none']),
  secret: z.string(),
})

export interface Env {
  SECRET: string,
  VERSION: string,
  volumes: R2Bucket,
  directory: R2Bucket,
  bucket: R2Bucket,
}
