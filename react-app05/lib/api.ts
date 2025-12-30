import { toast } from "sonner";

// 1. 定义后端基础地址
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface RequestOptions extends RequestInit {
  body?: any;
}

/**
 * 通用请求函数
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = localStorage.getItem("app_token");
  if (token) {
    // @ts-ignore
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body !== "string") {
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 1. 网络层面的错误 (HTTP 404, 500 等)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.msg || `请求失败: ${response.status}`;
      throw new Error(errorMessage);
    }

    // 2. 解析 JSON
    const data = await response.json();

    // 3. 业务层面的错误
    // 后端返回: { code: 0/1, success: true/false, msg: "..." }
    // 假设 code=1 或 success=true 为成功
    // 根据您的 Result 类，code=1 是成功，code=0 是失败
    // 这里我们做一个兼容判断
    const isSuccess = (data.code === 1) || (data.success === true);

    if (!isSuccess) {
        throw new Error(data.msg || "操作失败");
    }

    return data;
  } catch (error: any) {
    console.error("API Request Error:", error);
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: "GET" }),
    
  post: <T>(endpoint: string, body: any, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: "POST", body }),
    
  put: <T>(endpoint: string, body: any, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: "PUT", body }),
    
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: "DELETE" }),
};