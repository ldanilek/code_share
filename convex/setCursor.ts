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
    let cursor = await db.table('cursors').filter(q => q.eq(q.field('cursorKey'), cursorKey)).first();
    if (cursor === null) {
        db.insert('cursors', {
            parentRevision: revision,
            cursorKey,
            position,
            toPosition,
            clientRevision,
        });
        return;
    }
    db.patch(cursor._id, {
        parentRevision: revision,
        position,
        clientRevision,
    });
  }
)
