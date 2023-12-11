import { IRequest, error, json } from "itty-router"
import { z } from "zod"
import { Env } from "."

export async function getVolume(request: IRequest, env: Env) {
  const { params: { volume } } = request
  if (request.query['method'] === 'list') {
    const list = await env.files.list({ prefix: volume })
    return json(list.objects.map(item => item.key))
  }

  const v = await env.volumes.get(volume)
  if (v === null) return error(404, 'Volume not found.')
  return json(Volume.parse(await v.json()))
}

export async function putVolume(request: IRequest, env: Env) {
  const { params: { volume } } = request
  const v = Volume.safeParse(await request.json())
  if (!v.success) return error(400, 'Malformed request.')
  await env.volumes.put(volume, JSON.stringify(v.data))
}

export async function registerVolume(request: IRequest, env: Env) {
  const { params: { volume } } = request
  if (await env.volumes.get(volume) !== null) return error(409, 'Volume exist.')
  const v = Volume.safeParse(await request.json())
  if (!v.success) return error(400, 'Malformed request.')
  await env.volumes.put(volume, JSON.stringify(v.data))
}

export const Volume = z.object({
  protected: z.enum(['get', 'put', 'both', 'none']),
  secret: z.string(),
})
