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
    cursorKey: string,
    clientRevision: number,
    changes: Document<'changes'>[],
): number => {
    for (let change of changes) {
        // We're figuring out whether the position should be pushed by the change.
        // First, did the change happen after the position should be determined.
        if (change.revision > revision) {
            continue;
        }
        // If the position is earlier in the document than the change, it's not affected.
        if (position <= change.fromA) {
            continue;
        }
        // Consider: does the position already take the change into account.
        // i.e. should the client know about the change.
        // Did the client receive the change from the server already?
        if (change.revision <= parentRevision) {
            continue;
        }
        // Did the client perform the change itself?
        if (change.cursorKey === cursorKey && change.clientRevision <= clientRevision) {
            continue;
        }

        position += (change.inserted.length - (change.toA - change.fromA));
    }
    return position;
};

export const offsetForChange = (
    position: number,
    change: Document<'changes'>,
    changes: Document<'changes'>[],
): number => {
    return offsetPosition(
        position,
        change.parentRevision,
        change.revision-1,
        change.cursorKey,
        change.clientRevision,
        changes,
    );
}

export const offsetForCursor = (
    position: number,
    cursor: Document<'cursors'>,
    changes: Document<'changes'>[],
    currentRevision: number,
): number => {
    return offsetPosition(
        position,
        cursor.parentRevision,
        currentRevision,
        cursor.cursorKey,
        cursor.clientRevision,
        changes,
    );
}

export const lastRevision = async (
    db: DatabaseReader,
): Promise<number> => {
    const lastChange = await db.table('changes').order('desc').first();
    return lastChange ? lastChange.revision : 0;
};
