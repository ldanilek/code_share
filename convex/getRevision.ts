import { query } from './_generated/server'
import { INITIAL_CODE, lastRevision, mergeChange } from '../merge';

export default query(async ({ db }): Promise<number> => {
  return await lastRevision(db);
});
