import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const css = `
  html, body { background-color: #0F172A; }

  /* Chrome, Edge, Safari */
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 999px;
    border: 2px solid #0F172A;
  }
  ::-webkit-scrollbar-thumb:hover { background: #22C55E; }
  ::-webkit-scrollbar-corner { background: transparent; }

  /* Firefox */
  @supports not selector(::-webkit-scrollbar) {
    * { scrollbar-width: thin; scrollbar-color: #334155 transparent; }
  }
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="uk">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  );
}