/**
 * 安全 JSON 解析与通用请求工具
 * 解决后端返回空响应或非 JSON 时引发的 `Unexpected end of JSON input` 问题
 */

/**
 * 安全解析 Response 为 JSON
 * - 对 204/205/304 或 Content-Length=0 返回 null
 * - 对非 `application/json` 尝试读取文本并 JSON.parse，失败返回 null
 */
/**
 * 安全解析 Response 为 JSON
 * @function safeJson
 * @description 处理 204/非 JSON 响应，避免 JSON 解析错误
 */
export async function safeJson<T = any>(res: Response): Promise<T | null> {
  try {
    const status = res.status;
    if (status === 204 || status === 205 || status === 304) return null;

    const len = res.headers.get('content-length');
    if (len !== null && Number(len) === 0) return null;

    const ct = res.headers.get('content-type') || '';
    if (ct.toLowerCase().includes('application/json')) {
      return await res.json();
    }

    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (_) {
      return null;
    }
  } catch (_) {
    return null;
  }
}

/**
 * 通用 JSON 请求封装
 * - 当响应非 2xx 或解析失败时返回提供的默认值
 */
/**
 * 发起 JSON 请求
 * @function fetchJSON
 * @description 包装 fetch，失败返回默认值
 */
export async function fetchJSON<T>(url: string, init?: RequestInit, defaultValue?: T): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) return defaultValue ?? null;
    const data = await safeJson<T>(res);
    return (data ?? defaultValue ?? null) as T | null;
  } catch (_) {
    return defaultValue ?? null;
  }
}

/**
 * 生成 API 完整地址
 * @function apiUrl
 * @description 当配置了 `VITE_API_BASE_URL` 时拼接为绝对地址
 */
export function apiUrl(path: string): string {
  const base = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined
  const p = path.startsWith('/') ? path : `/${path}`
  if (base && base.trim().length > 0) {
    const b = base.replace(/\/$/, '')
    return `${b}${p}`
  }
  return p
}
