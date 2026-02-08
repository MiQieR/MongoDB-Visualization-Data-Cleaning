import { MongoClient } from "mongodb"

const adminUri = process.env.MONGODB_URI_ADMIN || process.env.MONGODB_URI
const readonlyUri = process.env.MONGODB_URI_READONLY || adminUri
const dbName = process.env.MONGODB_DB || "food_admin"
const collectionName = process.env.MONGODB_COLLECTION || "foods"

const globalForMongo = globalThis

if (!globalForMongo.mongoClients) {
  globalForMongo.mongoClients = {}
}

export function getCollection({ readonly } = { readonly: true }) {
  const uri = readonly ? readonlyUri : adminUri
  if (!uri) {
    throw new Error("Missing MongoDB URI")
  }
  if (!globalForMongo.mongoClients[uri]) {
    const client = new MongoClient(uri)
    globalForMongo.mongoClients[uri] = client.connect()
  }
  return globalForMongo.mongoClients[uri].then((client) =>
    client.db(dbName).collection(collectionName)
  )
}

export function requireEditToken(headers) {
  const token = process.env.MONGODB_EDIT_TOKEN
  if (!token) {
    return
  }
  const provided = headers.get("x-edit-token")
  if (provided !== token) {
    const error = new Error("Unauthorized")
    error.status = 401
    throw error
  }
}
