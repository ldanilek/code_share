import { query } from './_generated/server'
import { INITIAL_CODE, lastRevision, mergeChange, offsetForCursor, offsetPosition } from '../merge';

export default query(async ({ db }, cursorKey: string): Promise<[number, number]> => {
  let code = INITIAL_CODE;
  const cursor = await db
    .table('cursors').index('by_key').range(q => q.eq('cursorKey', cursorKey)).first();
  if (cursor === null) {
    return [0, 0];
  }
  let currentRevision = await lastRevision(db);
  const changes = await db.table('changes')
    .index('by_revision')
    .range(q => q.gt('revision', cursor.parentRevision))
    .collect();
  const newCursor = offsetForCursor(
    cursor.position, cursor, changes, currentRevision);
  const newCursorTo = offsetForCursor(
    cursor.toPosition, cursor, changes, currentRevision,
  );
  if (newCursor < 0 || newCursorTo < 0) {
    throw Error(`newCursor ${newCursor}, newCursorTo ${newCursorTo}`);
  }
  return [newCursor, newCursorTo];
});
