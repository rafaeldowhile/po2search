import { createCookieSessionStorage } from "@vercel/remix";
import { createThemeSessionResolver } from "remix-themes";


const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: ["theme_secret_k3y_f0r_s3cur1ty_2024"], // randomly generated secret
    secure: process.env.NODE_ENV === "production",
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage); 