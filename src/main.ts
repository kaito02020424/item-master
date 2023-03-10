import { serve } from "https://deno.land/std@0.176.0/http/server.ts";
import { cors } from "https://deno.land/x/hono@v2.7.6/middleware.ts";
import { Hono } from "https://deno.land/x/hono@v2.7.6/mod.ts";
import { readJson } from "../utils/json.ts";

const app = new Hono();
const items = await readJson<Record<string, unknown>>("./dist/items.json");

app.use("/", cors());

app.get("/", (ctx) => {
  return ctx.json(items);
});

app.get("/:id", (ctx) => {
  const { id } = ctx.req.param();

  const item = items[id];
  if (!item) {
    return ctx.notFound();
  }

  return ctx.json(item);
});

app.get("/:id/texture", async (ctx) => {
  const { id } = ctx.req.param();

  const item = items[id];
  if (!item) {
    return ctx.notFound();
  }

  ctx.res.headers.set("Cache-Control", "max-age=2592000");
  ctx.res.headers.set("Content-Type", "image/png");

  return ctx.newResponse(await Deno.readFile(`./dist/textures/${id}.png`), 200);
});

serve(app.fetch);
