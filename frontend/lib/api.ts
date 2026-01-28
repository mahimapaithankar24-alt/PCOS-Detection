import { getCookie } from "./cookies";

export async function predictPCOS(formData: FormData) {
  const token = getCookie("pcos_token");
  
  const res = await fetch("http://127.0.0.1:8000/api/pcos/predict", {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

export async function parseMedicalDocument(file: File) {
  const token = getCookie("pcos_token");
  const fd = new FormData();
  fd.append("document", file);

  const res = await fetch("http://127.0.0.1:8000/api/pcos/parse-document", {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: fd,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

/**
 * Generic fetch with authentication
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getCookie("pcos_token");
  
  const headers = {
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  return fetch(url, { ...options, headers });
}
