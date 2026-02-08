import { getCollection, requireEditToken } from "../../../../lib/mongo"
import { normalizeId } from "../../../../lib/food"

export const dynamic = "force-dynamic"

export async function GET(_request, { params }) {
  const id = normalizeId(params.id)
  const collection = await getCollection({ readonly: true })
  const doc = await collection.findOne({ id }, { projection: { _id: 0 } })
  return Response.json({ item: doc })
}

export async function PATCH(request, { params }) {
  requireEditToken(request.headers)
  const id = normalizeId(params.id)
  const payload = await request.json()
  const collection = await getCollection({ readonly: false })
  await collection.updateOne({ id }, { $set: payload })
  const doc = await collection.findOne({ id }, { projection: { _id: 0 } })
  return Response.json({ item: doc })
}

export async function DELETE(request, { params }) {
  requireEditToken(request.headers)
  const id = normalizeId(params.id)
  const collection = await getCollection({ readonly: false })
  const res = await collection.deleteOne({ id })
  return Response.json({ deletedCount: res.deletedCount })
}
