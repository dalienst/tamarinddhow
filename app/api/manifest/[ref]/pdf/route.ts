import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DJANGO_API = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000";

/**
 * GET /api/manifest/[ref]/pdf
 * Proxies PDF download from Django backend to the browser as a Blob.
 * Forwards either the manager Authorization token (private portal)
 * or the X-Manifest-Token (public supervisor link) — never exposes the Django host.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;

  // Build upstream headers
  const upstreamHeaders: Record<string, string> = {};

  // 1. Try authenticated session token (manager portal)
  const session = await getServerSession(authOptions);
  const sessionUser = (session as any)?.user;
  if (sessionUser?.token) {
    upstreamHeaders["Authorization"] = `Token ${sessionUser.token}`;
  } else {
    // 2. Fall back to manifest share token from query param (supervisor public link)
    const manifestToken = request.nextUrl.searchParams.get("token");
    if (manifestToken) {
      upstreamHeaders["X-Manifest-Token"] = manifestToken;
    }
  }

  try {
    const upstream = await fetch(
      `${DJANGO_API}/api/v1/schedules/${ref}/download-pdf/`,
      { headers: upstreamHeaders, cache: "no-store" }
    );

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json(
        { detail: `Failed to generate manifest PDF: ${text}` },
        { status: upstream.status }
      );
    }

    const pdfBuffer = await upstream.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sailing-manifest-${ref}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { detail: `Proxy error: ${String(err)}` },
      { status: 502 }
    );
  }
}
