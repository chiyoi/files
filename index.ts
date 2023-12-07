import { error, IRequest, json, Router } from 'itty-router'
import { verifyTOTP } from 'totp-basic'

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => router()
    .handle(request, env, ctx)
    .catch(error)
}

function router() {
  const router = Router()

  router.get('/ping', () => json('Pong!'))
  router.all('/ping', () => error(405, 'Readonly endpoint `ping`.'))

  router.get('/version', (_, env: Env) => json(env.VERSION))
  router.all('/version', () => error(405, 'Readonly endpoint `version`.'))

  router.get('/files', withAuth, listFiles)
  router.all('/files', withAuth, () => error(405, 'Readonly endpoint `files`.'))

  router.get('/assets/:filename', withBucket('assets'), getFile)

  router.get('/:filename', withAuth, withBucket('files'), getFile)
  router.put('/:filename', withAuth, putFile)
  router.delete('/:filename', withAuth, deleteFile)

  router.all('*', () => error(404, 'Invalid path.'))
  return router
}

async function withAuth(request: IRequest, env: Env) {
  const otp = request.query['otp']
  if (typeof otp !== 'string') {
    return error(401, 'Missing or malformed query `otp`.')
  }
  if (!await verifyTOTP(env.SECRET, otp)) {
    return error(403, 'OTP is rejected.')
  }
}

function withBucket(bucket: 'files' | 'assets') {
  return (req: IRequest & { bucket: R2Bucket }, env: Env) => {
    req.bucket = env[bucket]
  }
}

async function listFiles(_: IRequest, env: Env) {
  const files = await env.files.list()
  return json(files.objects.map(file => file.key))
}

async function getFile(request: IRequest & { bucket: R2Bucket }) {
  const { params: { filename }, bucket } = request
  const file = await bucket.get(filename)
  if (file === null) {
    return error(404, 'No such file.')
  }
  const headers = new Headers()
  file.writeHttpMetadata(headers)
  return new Response(file.body, { headers })
}

async function putFile(request: IRequest, env: Env) {
  const { params: { filename } } = request
  await env.files.put(filename, request.body)
  return json(`Put ${filename} successfully!`)
}

async function deleteFile(request: IRequest, env: Env) {
  const { params: { filename } } = request
  const head = await env.files.head(filename)
  if (head === null) {
    return error(404, 'No such file.')
  }
  await env.files.delete(filename)
  return json('Deleted!')
}

export interface Env {
  SECRET: string
  VERSION: string

  files: R2Bucket
  assets: R2Bucket
}
