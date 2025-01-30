import { themeSessionResolver } from "~/utils/theme-session.server";
import { ActionFunction } from "@vercel/remix";
import { createThemeAction } from "remix-themes";
export const action: ActionFunction = createThemeAction(themeSessionResolver);
