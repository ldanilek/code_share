import { query } from './_generated/server'
import { INITIAL_CODE, mergeChange, offsetPosition } from '../merge';

export default query(async ({ db }): Promise<string> => {
  let code = INITIAL_CODE;
  const changes = await db
    .table('changes').collect();
  for (let change of changes) {
    code = mergeChange(
      code, 
      offsetPosition(change.fromA, change.parentRevision, change.revision-1, changes),
      offsetPosition(change.toA, change.parentRevision, change.revision-1, changes), 
      change.inserted,
    );
  }
  return code;
});
