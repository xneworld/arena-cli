import { loadConfig } from "./config.js";

export class ApiClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    const config = loadConfig();
    this.baseUrl = config.apiUrl;
    this.apiKey = config.apiKey;
  }

  private headers(auth = false): Record<string, string> {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (auth && this.apiKey) {
      h["Authorization"] = `Bearer ${this.apiKey}`;
    }
    return h;
  }

  async get<T>(path: string, auth = false): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: this.headers(auth),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`API ${res.status}: ${body}`);
    }
    return res.json();
  }

  async post<T>(path: string, body: unknown, auth = false): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.headers(auth),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text}`);
    }
    return res.json();
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }
}
