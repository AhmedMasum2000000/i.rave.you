// Tell IndexNow search engines (Bing, Yandex, Seznam, Naver…) that the sitemap's URLs changed.
// usage: node scripts/indexnow.mjs   (after a deploy; the key file lives in public/)
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const host = "iraveyou.online";
const pub = resolve(import.meta.dirname, "../public");
const key = readdirSync(pub).find((f) => /^[0-9a-f]{32}\.txt$/.test(f))?.slice(0, -4);
if (!key) throw new Error("IndexNow key file missing from public/");
const urls = [...readFileSync(resolve(pub, "sitemap.xml"), "utf8").matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList: urls }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urls.length} URLs`);
