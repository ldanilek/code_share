import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useQuery, useMutation } from '../convex/_generated/react'
import { useCallback, useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { Text, EditorSelection, Transaction } from '@codemirror/state';
import { INITIAL_CODE, mergeChange } from '../merge'
import compressCode from '../convex/compressCode'

const Home: NextPage = () => {
  const code = useQuery('getCode') ?? INITIAL_CODE;
  const revision = useQuery('getRevision') ?? 0;
  const [cursorKey, _] = useState(Math.random().toString());
  const cursor = useQuery('getCursor', cursorKey) ?? [0, 0];
  const [activeTime, setActiveTime] = useState(new Date().getTime());
  const countActive = useQuery('countActive', activeTime);
  const [staleCountActive, setStaleCountActive] = useState(1);
  const compressCode = useMutation('compressCode');
  useEffect(() => {
    if (countActive !== undefined) {
      setStaleCountActive(countActive);
    }
  }, [countActive])
  const [lastCompressTime, setLastCompressTime] = useState(new Date().getTime());
  const setCursor = useMutation('setCursor').withOptimisticUpdate(
    (localStore, cursorKey, position, toPosition, revision, clientRevision) => {
      localStore.setQuery('getCursor', [cursorKey], [position, toPosition]);
    }
  );
  const [clientRevision, setClientRevision] = useState(0);
  const [editor, setEditor] = useState<EditorView | null>(null);
  const typeCode = useMutation('typeCode').withOptimisticUpdate(
    (localStore, fromA, toA, cursorKey, clientRevision, inserted) => {
      let localCode = localStore.getQuery('getCode', []) ?? INITIAL_CODE;
      let newCode = mergeChange(localCode, fromA, toA, inserted);
      localStore.setQuery('getCode', [], newCode);
    });
  const textToString = (t: Text): string => {
    let lines = [];
    for (let line of t) {
      lines.push(line);
    }
    return lines.join('');
  };
  /// Respond to server change by updating editor.
  useEffect(() => {
    if (!editor) {
      return;
    }
    const currentDoc = textToString(editor.state.doc);
    if (currentDoc !== code) {
      editor.dispatch({changes: editor.state.changes({
        from: 0, to: currentDoc.length, insert: code,
      })});
    }
    const currentRange = editor.state.selection.main;
    const newDoc = textToString(editor.state.doc);
    if (currentRange.from !== cursor[0] || currentRange.to !== cursor[1]) {
      const localCursor = Math.min(cursor[0], newDoc.length);
      const localCursorTo = Math.min(cursor[1], newDoc.length);
      editor.dispatch({selection: EditorSelection.single(localCursor, localCursorTo)});
    }
  }, [code, cursor, editor]);

  /// Respond to user action by updating server.
  const onUpdate = (viewUpdate: ViewUpdate) => {
    for (let transaction of viewUpdate.transactions) {
      // Don't respond to server-triggered actions (the transactions above).
      if (!transaction.isUserEvent("select") 
      && !transaction.isUserEvent("input") 
      && !transaction.isUserEvent("delete")
      && !transaction.isUserEvent("move")
      && !transaction.isUserEvent("undo")
      && !transaction.isUserEvent("redo")) {
        continue;
      }
      transaction.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
        typeCode(fromA, toA, cursorKey, clientRevision, textToString(inserted), revision);
        setClientRevision(clientRevision+1);
      });
      const selection = transaction.newSelection;
      const range = selection.main;
      //if (cursor[0] !== range.from || cursor[1] !== range.to) {
      setCursor(cursorKey, range.from, range.to, revision, clientRevision);
      //}
    }
  };
  /// Periodically set cursor to indicate we are active.
  useEffect(() => {
    if (!editor) {
      return;
    }
    const range = editor.state.selection.main;
    setCursor(cursorKey, range.from, range.to, revision, clientRevision);
  }, [activeTime, editor]);
  useEffect(() => {
    setTimeout(() => {
      setActiveTime(new Date().getTime());
    }, 5 * 1000);
  }, [activeTime]);
  /// Compress periodically.
  useEffect(() => {
    compressCode();
    setTimeout(() => {
      setLastCompressTime(new Date().getTime());
    }, 10 * 60 * 1000);
  }, [lastCompressTime]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Code Share</title>
        <meta name="description" content="Shared code editor, with Convex server-side conflict resolution" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <p>Magic Code Editor</p>
        <p>{staleCountActive} current editor{staleCountActive === 1 ? '' : 's'}</p>
        <CodeMirror
          className={styles.editor}
          height="400px"
          extensions={[javascript({ jsx: true })]}
          onUpdate={onUpdate}
          onCreateEditor={(view) => setEditor(view)}
        />
      </main>

      <footer className={styles.footer}>
        <div><a
          href="https://www.convex.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/convex.svg" alt="Convex Logo" width={90} height={18} />
          </span>
        </a>
        <a href="https://github.com/ldanilek/code_share">
          Open sourced&nbsp;<span className={styles.footerLink}>on Github</span>
        </a>
        </div>
      </footer>
    </div>
  )
}

export default Home
