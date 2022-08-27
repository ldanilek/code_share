import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  changes: defineTable({
    fromA: s.number(),
    toA: s.number(),
    cursorKey: s.string(),
    clientRevision: s.number(),
    inserted: s.string(),
    parentRevision: s.number(),
    revision: s.number(),
  }).index('by_revision', ['revision']),

  cursors: defineTable({
    cursorKey: s.string(),
    lastSeen: s.number(),  // timestamp
    position: s.number(),
    toPosition: s.number(),
    parentRevision: s.number(),
    clientRevision: s.number(),
  }).index('by_key', ['cursorKey'])
  .index('by_last_seen', ['lastSeen']),
});