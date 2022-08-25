import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  changes: defineTable({
    fromA: s.number(),
    toA: s.number(),
    fromB: s.number(),
    toB: s.number(),
    inserted: s.string(),
  }),
});