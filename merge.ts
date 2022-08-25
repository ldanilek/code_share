import { Document } from './convex/_generated/dataModel';
import { DatabaseReader } from './convex/_generated/server';

export const INITIAL_CODE = "console.log('hello world!);";

export const mergeChange = (
    initialCode: string,
    fromA: number,
    toA: number,
    inserted: string,
): string => {
    const newCode = initialCode.slice(0, fromA) + inserted + initialCode.slice(toA);
    return newCode;
}

export const offsetPosition = (
    position: number,
    parentRevision: number,
    revision: number,
    changes: Document<'changes'>[],
): number => {
    for (let change of changes) {
        if (change.revision > parentRevision && change.revision <= revision && change.fromA < position) {
            position += (change.inserted.length - (change.toA - change.fromA));
        }
    }
    return position;
};

export const lastRevision = async (
    db: DatabaseReader,
): Promise<number> => {
    const lastChange = await db.table('changes').order('desc').first();
    return lastChange ? lastChange.revision : 0;
};
