import { getCollection, requireEditToken } from "../../../../lib/mongo"
import { normalizeId } from "../../../../lib/food"

export const dynamic = "force-dynamic"

export async function POST(request) {
  requireEditToken(request.headers)
  const { ids } = await request.json()
  const normalized = Array.isArray(ids) ? ids.map(normalizeId) : []
  const collection = await getCollection({ readonly: false })
  const res = await collection.deleteMany({ id: { $in: normalized } })
  return Response.json({ deletedCount: res.deletedCount })
}
