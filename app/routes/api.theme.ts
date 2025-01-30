import { ActionFunction } from "@vercel/remix";
import { createThemeAction } from "remix-themes";
import { themeSessionResolver } from "~/utils/theme-session.server";

export const action: ActionFunction = async (args) => {
  const response = await createThemeAction(themeSessionResolver)(args);
  return response;
};
