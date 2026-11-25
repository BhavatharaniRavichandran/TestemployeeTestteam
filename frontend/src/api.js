// Small helper that calls the backend and attaches the login token
export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch("/api" + path, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) {
      localStorage.clear();
      window.location.reload();
    }
    throw new Error(data.error || "Something went wrong.");
  }
  return data;
}
