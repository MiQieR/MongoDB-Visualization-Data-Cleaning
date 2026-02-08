import { getCollection } from "../../../lib/mongo"
import { buildMultiFieldRange, buildSearchFilter } from "../../../lib/food"

export const dynamic = "force-dynamic"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const category = searchParams.get("category") || ""
  const page = Number(searchParams.get("page") || 1)
  const pageSize = Math.min(Number(searchParams.get("pageSize") || 24), 200)
  const preferMaterials = searchParams.get("preferMaterials") === "1"
  const minCalory = searchParams.get("minCalory")
  const maxCalory = searchParams.get("maxCalory")
  const minProtein = searchParams.get("minProtein")
  const maxProtein = searchParams.get("maxProtein")
  const minFat = searchParams.get("minFat")
  const maxFat = searchParams.get("maxFat")
  const minCarb = searchParams.get("minCarb")
  const maxCarb = searchParams.get("maxCarb")

  const filter = {}
  const searchFilter = buildSearchFilter(search)
  if (Object.keys(searchFilter).length) {
    filter.$and = filter.$and || []
    filter.$and.push(searchFilter)
  }
  if (category) {
    filter.categories = { $in: category.split(",").filter(Boolean) }
  }
  const rangeFilters = [
    buildMultiFieldRange(["calory", "calorie", "energy"], minCalory, maxCalory),
    buildMultiFieldRange(["protein"], minProtein, maxProtein),
    buildMultiFieldRange(["fat"], minFat, maxFat),
    buildMultiFieldRange(["carbohydrate", "carb", "carbs"], minCarb, maxCarb)
  ].filter(Boolean)

  if (rangeFilters.length) {
    filter.$and = filter.$and || []
    filter.$and.push(...rangeFilters)
  }

  const collection = await getCollection({ readonly: true })
  const total = await collection.countDocuments(filter)
  const projection = {
    _id: 0,
    id: 1,
    name: 1,
    code: 1,
    thumb_image_url: 1,
    image_url: 1,
    image: 1,
    calory: 1,
    calorie: 1,
    energy: 1,
    protein: 1,
    fat: 1,
    carbohydrate: 1,
    carb: 1,
    carbs: 1,
    categories: 1
  }

  let items = []
  if (preferMaterials) {
    items = await collection
      .aggregate([
        { $match: filter },
        {
          $addFields: {
            hasMaterials: {
              $gt: [{ $size: { $ifNull: ["$materials", []] } }, 0]
            }
          }
        },
        { $sort: { hasMaterials: -1, _id: 1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
        { $project: { ...projection, hasMaterials: 0 } }
      ])
      .toArray()
  } else {
    items = await collection
      .find(filter, { projection })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray()
  }

  return Response.json({ items, total, page, pageSize })
}
