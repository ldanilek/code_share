import { getCode, INITIAL_CODE, lastRevision } from '../merge';
import { mutation } from './_generated/server'

export default mutation(
  async ({ db }) => {
    // Assume clients that haven't been seen for this long will
    // not come back and create a change or cursor with an old parentRevision.
    const cursorTimeout = 10 * 60 * 1000;
    const cursorCutoff = new Date().getTime() - cursorTimeout;
    let cursors = await db.table('cursors').index('by_last_seen')
        .range(q => q.gte('lastSeen', cursorCutoff)).collect();
    let lastWritableRevision = await lastRevision(db);
    for (let cursor of cursors) {
        lastWritableRevision = Math.min(lastWritableRevision, cursor.parentRevision);
    }
    const writable = await db.table('changes')
        .index('by_revision')
        .range(q => q.gte('revision', lastWritableRevision)).collect();
    let lastReadableRevision = lastWritableRevision;
    for (let writeDoc of writable) {
        lastReadableRevision = Math.min(lastReadableRevision, writeDoc.parentRevision);
    }
    const toCompress = await db.table('changes')
        .index('by_revision')
        .range(q => q.lt('revision', lastReadableRevision)).collect();
    if (toCompress.length === 0) {
        return;
    }
    const lastDeletedRevision = toCompress[toCompress.length-1].revision;
    console.log(`Deleting ${toCompress.length} revisions up to ${lastDeletedRevision}`);
    let newCode = getCode(toCompress);
    for (let toDelete of toCompress) {
        db.delete(toDelete._id);
    }
    db.insert('changes', {
        fromA: 0,
        toA: INITIAL_CODE.length,
        cursorKey: 'COMPRESS',
        clientRevision: 0,
        inserted: newCode,
        parentRevision: 0,
        revision: lastDeletedRevision,
    });
  }
)
