export async function fetchJson(url: string, options?: object) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(
      "fetchJson: http error: " + res.status + ": " + (await res.text()),
    );
  }
  return await res.json();
}
