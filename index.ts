import { error, json, Router } from 'itty-router'
import { getVolume, putVolume, registerVolume } from './volumes'
import { auth } from './auth'
import { getFile, putFile } from './files'

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => router()
    .handle(request, env, ctx)
    .catch(error)
}

function router() {
  const router = Router()
  router.all('/ping', () => json('Pong!'))
  router.all('/version', (_, env: Env) => json(env.VERSION))

  router.get('/:volume', auth, getVolume)
  router.put('/:volume', registerVolume)
  router.patch('/:volume', auth, updateVolume)
  router.delete('/:volume', auth, deleteVolume)
  router.all('/:volume', () => error(405, 'Method not allowed.'))

  router.get('/:volume/:filename', auth, getFile)
  router.put('/:volume/:filename', auth, putFile)
  router.delete('/:volume/:filename', auth, deleteFile)
  router.all('/:volume/:filename', () => error(405, 'Method not allowed.'))

  router.all('*', () => error(404, 'Invalid path.'))
  return router
}

export interface Env {
  SECRET: string,
  VERSION: string,
  volumes: R2Bucket,
  files: R2Bucket,
}
