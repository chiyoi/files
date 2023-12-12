import { IRequest, error, json } from "itty-router"
import { Env } from "."

export async function getFile(request: IRequest, env: Env) {
  const { params: { volume, filename } } = request
  const key = [volume, filename].join('/')
  if (!!request.query['list']) {
    const list = await env.files.list({ prefix: key })
    return json(list.objects.map(item => item.key))
  }

  const item = await env.files.get(key)
  if (item === null) return error(404, 'File not found.')
  const headers = new Headers()
  item.writeHttpMetadata(headers)
  return new Response(item.body, { headers })
}

export async function putFile(request: IRequest, env: Env) {
  const { params: { volume, filename } } = request
  const key = [volume, filename].join('/')
  await env.files.put(key, request.body)
  return json(`Put ${key}.`)
}

export async function deleteFile(request: IRequest, env: Env) {
  const { params: { volume, filename } } = request
  const key = [volume, filename].join('/')
  await env.files.delete(key)
  return json(`Deleted ${key}.`)
}
