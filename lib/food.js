export function normalizeId(input) {
  if (input === undefined || input === null) return input
  const num = Number(input)
  if (!Number.isNaN(num) && String(num) === String(input)) {
    return num
  }
  return input
}

export function buildSearchFilter(search) {
  if (!search) return {}
  const regex = new RegExp(search, "i")
  const numeric = Number(search)
  const or = [{ name: regex }, { code: regex }]
  if (!Number.isNaN(numeric)) {
    or.push({ id: numeric })
  }
  return { $or: or }
}

export function buildRangeFilter(field, min, max) {
  const normalizedMin = min === null || min === "" ? undefined : min
  const normalizedMax = max === null || max === "" ? undefined : max
  if (normalizedMin === undefined && normalizedMax === undefined) return null
  const range = {}
  if (normalizedMin !== undefined) range.$gte = Number(normalizedMin)
  if (normalizedMax !== undefined) range.$lte = Number(normalizedMax)
  return { [field]: range }
}

export function buildMultiFieldRange(fields, min, max) {
  const normalizedMin = min === null || min === "" ? undefined : min
  const normalizedMax = max === null || max === "" ? undefined : max
  if (normalizedMin === undefined && normalizedMax === undefined) return null
  const range = {}
  if (normalizedMin !== undefined) range.$gte = Number(normalizedMin)
  if (normalizedMax !== undefined) range.$lte = Number(normalizedMax)
  return { $or: fields.map((field) => ({ [field]: range })) }
}
