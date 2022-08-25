import { lastRevision } from '../merge';
import { mutation } from './_generated/server'

export default mutation(
  async ({ db }, 
    fromA: number, 
    toA: number, 
    fromB: number, 
    toB: number, 
    inserted: string, 
    revision: number,
  ) => {
    let nextRevision = await lastRevision(db) + 1;
    db.insert('changes', {
        fromA,
        toA,
        fromB,
        toB,
        inserted,
        parentRevision: revision,
        revision: nextRevision,
    });
  }
)
