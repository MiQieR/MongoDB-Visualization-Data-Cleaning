import { getCollection } from "../../../lib/mongo"

export const dynamic = "force-dynamic"

export async function GET() {
  const collection = await getCollection({ readonly: true })
  const categories = await collection.distinct("categories")
  return Response.json({
    categories: categories.filter(Boolean).sort()
  })
}
