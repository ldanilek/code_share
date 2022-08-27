import { query } from './_generated/server'
import { INITIAL_CODE, lastRevision, mergeChange, offsetForCursor, offsetPosition } from '../merge';

// current time for cache invalidation.
export default query(async ({ db }, currentTime: number): Promise<number> => {
  const activeTimeout = 10 * 1000;
  const activeCutoff = new Date().getTime() - activeTimeout;
  const cursors = await db
    .table('cursors').filter(q => q.gte(q.field('lastSeen'), activeCutoff)).collect();
  return cursors.length;
});
