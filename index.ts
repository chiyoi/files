import { error, IRequest, json, Router } from 'itty-router'
import { withAuth, withPrivilege } from './auth'
import { registerVolume, getVolume, deleteVolume, listVolumes, updateVolume } from './volumes'
import { deleteFile, getFile, putFile } from './files'

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => router()
    .handle(request, env, ctx)
    .catch(error)
}

function router() {
  const router = Router()
  router.all('/ping', () => json('Pong!'))
  router.all('/version', (_, env: Env) => json(env.VERSION))

  router.get('/volumes', withPrivilege, listVolumes)
  router.all('/volumes', () => error(405, 'Privilege endpoint (List Volumes).'))

  router.post('/:volume', withParsed, registerVolume)
  router.get('/:volume', withAuth(), getVolume)
  router.patch('/:volume', withAuth(), withParsed, updateVolume)
  router.delete('/:volume', withAuth(), deleteVolume)
  router.all('/:volume', () => error(405, 'Method not allowed.'))

  router.get('/:volume/:filename', withAuth('get'), getFile)
  router.put('/:volume/:filename', withAuth('put'), putFile)
  router.delete('/:volume/:filename', withAuth('delete'), deleteFile)
  router.all('/:volume/:filename', () => error(405, 'Method not allowed.'))

  router.all('*', () => error(404, 'Invalid path.'))
  return router
}

async function withParsed(request: IRequest, env: Env) {
  try {
    request.parsed = await request.json()
  } catch (err) {
    console.warn(err)
    return error(400, 'Malformed request.')
  }
}

export interface Env {
  VERSION: string,
  PRIVILEGE_SECRET: string,
  volumes: R2Bucket,
  files: R2Bucket,
}
