import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DJANGO_API = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000";

/**
 * POST /api/manifest/[ref]/share
 * Proxies manifest share link generation and email dispatch to Django.
 * The Django host is never exposed — the browser only calls this Next.js route.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;

  const session = await getServerSession(authOptions);
  const sessionUser = (session as any)?.user;
  if (!sessionUser?.token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  try {
    const upstream = await fetch(
      `${DJANGO_API}/api/v1/schedules/${ref}/share/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${sessionUser.token}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const data = await upstream.json();

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    return NextResponse.json(
      { detail: `Proxy error: ${String(err)}` },
      { status: 502 }
    );
  }
}
