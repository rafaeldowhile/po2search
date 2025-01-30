import type { LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from "react";
import { PreventFlashOnWrongTheme, ThemeProvider, useTheme } from "remix-themes";
import { themeSessionResolver } from "~/utils/theme-session.server";
import { Theme } from "remix-themes";

import tailwind from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: tailwind, as: "style" },
];

export const meta: MetaFunction = () => {
  return [
    { charset: "utf-8" },
    { title: "PoE2 Trade Search" },
    { viewport: "width=device-width,initial-scale=1" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const themeSession = await themeSessionResolver(request);
  const theme = await themeSession.getTheme() || Theme.LIGHT;
  const session = await themeSession.commit();

  return json(
    {
      theme,
      env: {
        NODE_ENV: process.env.NODE_ENV,
      }
    },
    {
      headers: {
        "Set-Cookie": session,
      },
    }
  );
};

const HTMLRender = ({
  ssrTheme,
  children,
}: {
  ssrTheme: boolean;
  children: React.ReactNode;
}) => {
  const [theme] = useTheme();
  return (
    <html lang="en" className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={ssrTheme} />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme } = useRouteLoaderData<typeof loader>("root") ?? {};
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider
        disableTransitionOnThemeChange
        specifiedTheme={theme}
        themeAction="/api/theme"
      >
        <HTMLRender ssrTheme={!!theme}>{children}</HTMLRender>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default function App() {
  const { env } = useLoaderData<typeof loader>();
  return <Outlet context={{ env }} />;
}
