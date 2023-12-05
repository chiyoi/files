/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { error, IRequest, json, Router } from 'itty-router'
import { verifyTOTP } from 'totp-basic'

export interface Env {
  SECRET: string
  VERSION: string

  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // kv_namespace: KVNamespace
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  files: R2Bucket
  assets: R2Bucket
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  //
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  // MY_QUEUE: Queue;
}

export default {
  fetch: (req: Request, env: Env, ctx: ExecutionContext) => router()
    .handle(req, env, ctx)
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

async function withAuth(req: IRequest, env: Env) {
  const otp = req.query['otp']
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

async function getFile(req: IRequest & { bucket: R2Bucket }) {
  const { params: { filename }, bucket } = req
  const file = await bucket.get(filename)
  if (file === null) {
    return error(404, 'No such file.')
  }
  const headers = new Headers()
  file.writeHttpMetadata(headers)
  return new Response(file.body, { headers })
}

async function putFile(req: IRequest, env: Env) {
  const { params: { filename } } = req
  await env.files.put(filename, req.body)
  return json(`Put ${filename} successfully!`)
}

async function deleteFile(req: IRequest, env: Env) {
  const { params: { filename } } = req
  const head = await env.files.head(filename)
  if (head === null) {
    return error(404, 'No such file.')
  }
  await env.files.delete(filename)
  return json('Deleted!')
}
