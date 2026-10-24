const STORAGE_URL = "https://zoaxdegcwadmiwmznvrb.supabase.co/storage/v1/object/public/updates";
export const RUMBO_MANIFEST_URL = `${STORAGE_URL}/rumbo/latest.json`;
const PART_RETRIES = 3;
const RETRY_DELAY_MS = 1200;
const SPEED_WINDOW_MS = 4000;

export type InstallerPart = {
  url: string;
  size: number;
};

export type InstallerManifest = {
  version: string;
  fileName: string;
  size: number;
  sha256: string;
  publishedAt: string;
  parts: InstallerPart[];
};

export type DownloadProgress = {
  loaded: number;
  total: number;
  bytesPerSecond: number;
};

export async function loadManifest(
  signal?: AbortSignal,
  manifestUrl: string = RUMBO_MANIFEST_URL,
): Promise<InstallerManifest> {
  const response = await fetch(`${manifestUrl}?t=${Date.now()}`, { signal, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Manifest answered ${response.status}`);
  }

  return (await response.json()) as InstallerManifest;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchPart(
  part: InstallerPart,
  signal: AbortSignal,
  onBytes: (count: number) => void,
): Promise<Blob> {
  const response = await fetch(part.url, { signal });
  if (!response.ok || !response.body) {
    throw new Error(`Part answered ${response.status}`);
  }

  const reader = response.body.getReader();
  const pieces: BlobPart[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    pieces.push(value);
    received += value.byteLength;
    onBytes(value.byteLength);
  }

  if (received !== part.size) {
    throw new Error(`Part is ${received} bytes, expected ${part.size}`);
  }

  return new Blob(pieces);
}

export async function downloadInstaller(
  manifest: InstallerManifest,
  signal: AbortSignal,
  onProgress: (progress: DownloadProgress) => void,
): Promise<Blob> {
  const samples: { at: number; loaded: number }[] = [];
  const parts: Blob[] = [];
  let loaded = 0;

  const report = () => {
    const now = performance.now();
    samples.push({ at: now, loaded });
    while (samples.length > 2 && now - samples[0].at > SPEED_WINDOW_MS) {
      samples.shift();
    }

    const elapsedSeconds = (now - samples[0].at) / 1000;
    const bytesPerSecond = elapsedSeconds > 0 ? (loaded - samples[0].loaded) / elapsedSeconds : 0;
    onProgress({ loaded, total: manifest.size, bytesPerSecond });
  };

  for (const part of manifest.parts) {
    for (let attempt = 1; ; attempt++) {
      const loadedBeforePart = loaded;
      try {
        parts.push(
          await fetchPart(part, signal, (count) => {
            loaded += count;
            report();
          }),
        );
        break;
      } catch (error) {
        if (signal.aborted || attempt >= PART_RETRIES) {
          throw error;
        }

        loaded = loadedBeforePart;
        report();
        await wait(RETRY_DELAY_MS * attempt);
      }
    }
  }

  const installer = new Blob(parts, { type: "application/vnd.microsoft.portable-executable" });
  if (installer.size !== manifest.size) {
    throw new Error(`Installer is ${installer.size} bytes, expected ${manifest.size}`);
  }

  return installer;
}

export function saveFile(file: Blob, fileName: string): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
