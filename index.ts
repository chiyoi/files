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
  SECRET?: string

  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // kv_namespace: KVNamespace
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  files: R2Bucket
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  //
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  // MY_QUEUE: Queue;
}

const router = Router()

async function withAuth(req: IRequest, env: Env) {
  const otp = req.query['otp']
  if (typeof otp !== 'string') {
    return error(401, 'Missing or malformed query `otp`.')
  }
  if (env.SECRET === undefined) {
    return error(500, 'Internal error: Missing env `SECRET`.')
  }
  if (!await verifyTOTP(env.SECRET, otp)) {
    return error(403, 'OTP is rejected.')
  }
}

router.get('/ping', () => json('Pong!'))

router.all('/ping', () => error(405, 'Endpoint `ping` only supports GET.'))

router.get('/files', withAuth, async (req: IRequest, env: Env) => {
  const files = await env.files.list()
  return json(files.objects.map(file => file.key))
})

router.all('/files', withAuth, () => error(405, 'Endpoint `files` only supports GET.'))

router.get('/:filename', withAuth, async (req: IRequest, env: Env) => {
  const { params: { filename } } = req
  const file = await env.files.get(filename)
  if (file === null) {
    return error(404, 'No such file.')
  }
  const headers = new Headers()
  file.writeHttpMetadata(headers)
  return new Response(file.body, { headers })
})

router.put('/:filename', withAuth, async (req: IRequest, env: Env) => {
  const { params: { filename } } = req
  await env.files.put(filename, req.body)
  return json(`Put ${filename} successfully!`)
})

router.delete('/:filename', withAuth, async (req: IRequest, env: Env) => {
  const { params: { filename } } = req
  const head = await env.files.head(filename)
  if (head === null) {
    return error(404, 'No such file.')
  }
  await env.files.delete(filename)
  return json('Deleted!')
})

router.all('*', () => error(404, 'Invalid path.'))

export default {
  fetch: (req: Request, env: Env, ctx: ExecutionContext) => router
    .handle(req, env, ctx)
    .catch(error)
}
