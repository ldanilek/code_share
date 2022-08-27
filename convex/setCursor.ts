import { lastRevision } from '../merge';
import { mutation } from './_generated/server'

export default mutation(
  async ({ db }, 
    cursorKey: string,
    position: number,
    toPosition: number,
    revision: number,
    clientRevision: number,
  ) => {
    let cursor = await db.table('cursors').index('by_key')
        .range(q => q.eq('cursorKey', cursorKey)).first();
    if (cursor === null) {
        db.insert('cursors', {
            parentRevision: revision,
            cursorKey,
            position,
            toPosition,
            clientRevision,
            lastSeen: new Date().getTime(),
        });
        return;
    }
    // use replace so typechecker will warn on new fields
    db.replace(cursor._id, {
        parentRevision: revision,
        cursorKey,
        position,
        toPosition,
        clientRevision,
        lastSeen: new Date().getTime(),
    });
  }
)
