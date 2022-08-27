import { query } from './_generated/server'
import { INITIAL_CODE, mergeChange, offsetForChange, offsetPosition } from '../merge';

export default query(async ({ db }): Promise<string> => {
  let code = INITIAL_CODE;
  const changes = await db
    .table('changes').collect();
  for (let change of changes) {
    code = mergeChange(
      code, 
      offsetForChange(change.fromA, change, changes),
      offsetForChange(change.toA, change, changes), 
      change.inserted,
    );
  }
  return code;
});
