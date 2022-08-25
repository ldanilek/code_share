import { query } from './_generated/server'
import { INITIAL_CODE, mergeChange } from '../merge';

export default query(async ({ db }): Promise<string> => {
  let code = INITIAL_CODE;
  const changes = await db
    .table('changes').collect();
  for (let change of changes) {
    code = mergeChange(
      code, 
      change.fromA, 
      change.toA, 
      change.fromB,
      change.toB, 
      change.inserted,
    );
  }
  return code;
});
