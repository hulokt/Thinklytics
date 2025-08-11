/* Simple structured DB logger to trace every request clearly */

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null | undefined

function safe(obj: Json, maxLen = 1000): Json {
  try {
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj)
    if (str && str.length > maxLen) {
      return str.slice(0, maxLen) + `... [truncated ${str.length - maxLen} chars]`
    }
    return obj
  } catch {
    return '[Unserializable payload]'
  }
}

export function dbLogStart(context: string, action: string, payload?: Json) {
  const id = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
  console.info(`DB ▶ [${context}] [${id}] START: ${action}`, payload !== undefined ? safe(payload) : '')
  return id
}

export function dbLogSuccess(context: string, id: string, summary?: Json) {
  console.info(`DB ✔ [${context}] [${id}] SUCCESS`, summary !== undefined ? safe(summary) : '')
}

export function dbLogError(context: string, id: string, error: unknown, details?: Json) {
  const err = error instanceof Error ? { message: error.message, stack: error.stack } : error
  console.error(`DB ✖ [${context}] [${id}] ERROR`, safe(err), details !== undefined ? safe(details) : '')
}


