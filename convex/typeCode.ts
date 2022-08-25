import { mutation } from './_generated/server'

export default mutation(
  async ({ db }, fromA: number, toA: number, fromB: number, toB: number, inserted: string) => {
    db.insert('changes', {
        fromA,
        toA,
        fromB,
        toB,
        inserted,
    });
  }
)
