import type { APIRoute } from "astro";

/** Language switch: remembers the choice for a year and returns to the same page. */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const lang = form.get("lang") === "en" ? "en" : "ar";
  const back = String(form.get("back") || "/");
  cookies.set("lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return redirect(back.startsWith("/") && !back.startsWith("//") ? back : "/", 303);
};
