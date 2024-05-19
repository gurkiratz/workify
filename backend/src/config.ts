import 'dotenv/config'

export const JWT_SECRET = process.env.JWT_SECRET ?? 'dangitsecret123'
export const WORKER_JWT_SECRET = JWT_SECRET + 'worker'
export const accessKeyId = process.env.ACCESS_KEY_ID ?? ''
export const secretAccessKey = process.env.ACCESS_SECRET ?? ''
export const TOTAL_DECIMALS = 1000_000

// 1/1000_000_000_000_000_000
