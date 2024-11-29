import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/react";
import type { LinksFunction } from "@remix-run/server-runtime";
import { Theme } from "@radix-ui/themes";

import "./modern-normalize.css";
import "@radix-ui/themes/styles.css";
import "./main.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Quicksand:wght@300..700&display=swap",
  },
];

export async function loader() {
  return json({
    ENV: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
      VITE_APP_ENV: process.env.VITE_APP_ENV,
      VITE_DOG_API_BASE_URL: process.env.VITE_DOG_API_BASE_URL,
    },
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData() as any;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Theme accentColor="amber" radius="large" scaling="110%">
          {children}
          <ScrollRestoration />
          <Scripts />
          <Analytics />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(data?.ENV ?? {})}`,
            }}
          />
        </Theme>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
