import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { decrypt } from "@/app/lib/session";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/receipts/[id]">,
) {
  // Not verifySession(): that redirects to /login, which is wrong for a
  // resource loaded as an image or link target. A plain 401 is.
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get("session")?.value);
  if (!session?.userId) {
    return new Response(null, { status: 401 });
  }

  const { id } = await ctx.params;
  const payment = await prisma.payment.findUnique({
    where: { id: Number(id) },
    select: { receiptName: true, receiptType: true, receiptData: true },
  });

  if (!payment?.receiptData) {
    return new Response(null, { status: 404 });
  }

  return new Response(new Uint8Array(payment.receiptData), {
    headers: {
      "Content-Type": payment.receiptType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(
        payment.receiptName || "receipt",
      )}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
