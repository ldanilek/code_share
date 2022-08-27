import { query } from './_generated/server'
import { getCode, INITIAL_CODE, mergeChange, offsetForChange, offsetPosition } from '../merge';

export default query(async ({ db }): Promise<string> => {
  const changes = await db
    .table('changes').index('by_revision').range(q => q).collect();
  return getCode(changes);
});
