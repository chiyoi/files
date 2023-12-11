import { IRequest, error, json } from "itty-router"
import { z } from "zod"
import { Env } from "."

export async function listVolumes(request: IRequest, env: Env) {
  const list = await env.volumes.list()
  return json(list.objects.map(item => item.key))
}

export async function registerVolume(request: IRequest, env: Env) {
  const { params: { volume } } = request
  if (await env.volumes.get(volume) !== null) return error(409, 'Volume exist.')
  const v = Volume.safeParse(request.parsed)
  if (!v.success) {
    console.warn(v.error)
    return error(400, 'Malformed request.')
  }
  await env.volumes.put(volume, JSON.stringify(v.data))
  return json(`Registered ${volume}.`)
}

export async function getVolume(request: IRequest, env: Env) {
  const { params: { volume } } = request
  if (!!request.query['list']) {
    const list = await env.files.list({ prefix: volume })
    return json(list.objects.map(item => item.key))
  }

  const v = await env.volumes.get(volume)
  if (v === null) return error(404, 'Volume not exist.')
  return json(Volume.parse(await v.json()))
}

export async function updateVolume(request: IRequest, env: Env) {
  const { params: { volume } } = request
  const req = z.object({
    no_auth: z.enum(['get', 'put', 'delete']).array().refine(distinct).nullable().default(null).optional(),
    secret: z.string().optional(),
  }).safeParse(request.parsed)
  if (!req.success) {
    console.warn(req.error)
    return error(400, 'Malformed request.')
  }
  const { data: update } = req

  const v = Volume.parse(await (await env.volumes.get(volume))!.json())
  if (update.no_auth !== undefined) v.no_auth = update.no_auth
  if (update.secret !== undefined) v.secret = update.secret
  await env.volumes.put(volume, JSON.stringify(v))
  return json(`Updated ${volume}.`)
}

export async function deleteVolume(request: IRequest, env: Env) {
  const { params: { volume } } = request
  await env.volumes.delete(volume)
  return json(`Deleted ${volume}.`)
}

function distinct(a: any[]) {
  const s = new Set()
  for (const e of a) {
    if (s.has(e)) throw new Error('Distinct verification failed.')
    s.add(e)
  }
  return a
}

export const Volume = z.object({
  no_auth: z.enum(['get', 'put', 'delete']).array().refine(distinct).nullable().default(null),
  secret: z.string(),
})
