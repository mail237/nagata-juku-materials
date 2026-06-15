import { head, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import type { StoredAppData } from "@/lib/storage-types";

const BLOB_PATH = "materials-app/data.json";

function isAuthorized(request: Request): boolean {
  const expected = process.env.DATA_SYNC_KEY?.trim();
  if (!expected) return false;
  return request.headers.get("x-sync-key") === expected;
}

function blobUnavailable() {
  return NextResponse.json(
    { error: "クラウド保存が未設定です（BLOB_READ_WRITE_TOKEN / DATA_SYNC_KEY）" },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return blobUnavailable();
  }

  try {
    const meta = await head(BLOB_PATH);
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const payload = (await res.json()) as StoredAppData;
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return blobUnavailable();
  }

  try {
    const payload = (await request.json()) as StoredAppData;
    await put(BLOB_PATH, JSON.stringify(payload), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return NextResponse.json({ ok: true, updatedAt: payload.updatedAt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Save failed" },
      { status: 500 },
    );
  }
}
