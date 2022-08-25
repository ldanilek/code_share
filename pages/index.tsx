import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useQuery, useMutation } from '../convex/_generated/react'
import { useCallback, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { ViewUpdate } from '@codemirror/view';
import { Text } from '@codemirror/state';
import { INITIAL_CODE } from '../merge'

const Home: NextPage = () => {
  const code = useQuery('getCode') ?? INITIAL_CODE;
  const typeCode = useMutation('typeCode');
  const textToString = (t: Text): string => {
    let lines = [];
    for (let line of t) {
      lines.push(line);
    }
    return lines.join('');
  };
  const onChange = (value: string, viewUpdate: ViewUpdate) => {
    viewUpdate.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
      typeCode(fromA, toA, fromB, toB, textToString(inserted));
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Next.js with Convex</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <p>Magic Code Editor</p>
        <CodeMirror
          value={code}
          height="200px"
          width="400px"
          extensions={[javascript({ jsx: true })]}
          onChange={onChange}
        />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://www.convex.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/convex.svg" alt="Convex Logo" width={90} height={18} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home
