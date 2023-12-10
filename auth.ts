import { IRequest, error } from "itty-router"
import { verifyTOTP } from "totp-basic"
import { Env } from "."

export async function withTOTPQueryAuthed(request: IRequest, env: Env) {
  const otp = request.query['otp']
  if (typeof otp !== 'string') {
    return error(401, 'Exactly one query `otp` is needed.')
  }
  if (!await verifyTOTP(env.SECRET, otp)) {
    return error(403, 'Invalid OTP.')
  }
}

export async function withTOTPHeaderAuthed(request: IRequest, env: Env) {
  const auth = request.headers.get('Authorization')
  const [schema, otp] = auth?.split(' ') ?? []
  if (schema !== 'TOTP') {
    return error(401, 'Header `Authorization` with schema `TOTP` is needed.')
  }
  if (!await verifyTOTP(env.SECRET, otp)) {
    return error(403, 'Invalid OTP.')
  }
}
