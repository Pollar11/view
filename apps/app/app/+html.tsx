import { type PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

/** Web document shell. Locks the background dark so there's no white flash. */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0A0A0A" />
        <title>View</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: bodyCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const bodyCss = `
html, body { background-color: #0A0A0A; color-scheme: dark; }
body { overscroll-behavior-y: none; -webkit-font-smoothing: antialiased; }
::selection { background: rgba(91,123,255,0.35); }
`;
