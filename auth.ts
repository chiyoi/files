import { IRequest, error } from "itty-router"
import { verifyTOTP } from "totp-basic"
import { Env } from "."
import { Volume } from "./volumes"

export function withAuth(op?: 'get' | 'put' | 'delete') {
  return async (request: IRequest, env: Env) => {
    const { params: { volume } } = request
    const data = await env.volumes.get(volume)
    if (data === null) {
      return error(404, 'Volume not exist.')
    }
    const { no_auth, secret } = Volume.parse(await data.json())
    if (
      no_auth !== null &&
      op !== undefined &&
      no_auth.some(o => o == op)
    ) return

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
}

export async function withPrivilege(request: IRequest, env: Env) {
  const [scheme, token] = request.headers.get('Authorization')?.split(' ') ?? []
  switch (scheme) {
  case 'Secret':
    const encoder = new TextEncoder()
    return crypto.subtle.timingSafeEqual(
      encoder.encode(token),
      encoder.encode(env.PRIVILEGE_SECRET),
    ) ? void 0 : error(403, 'Invalid token.')
  }
  return error(401, 'Missing or malformed authorization token.')
}
