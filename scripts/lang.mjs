/**
 * Language of parts (WCAG 3.1.2): every run of Bengali text in the page's
 * body sits inside an element marked lang="bn", so screen readers switch
 * voice for অপূর্ব and the other Bengali words. Text already inside a
 * lang="bn" element is left as it is; attributes, <title>, scripts and
 * styles are never touched.
 */
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["script", "style", "title", "textarea"]);
const RUN = /[ঀ-৿]+(?:[\s‌‍]+[ঀ-৿]+)*/g;

export function bnLang(html) {
  const stack = [];
  let raw = null;
  return html
    .split(/(<[^>]*>)/)
    .map((part) => {
      if (part.startsWith("<")) {
        const m = /^<(\/?)([a-zA-Z][\w-]*)([^>]*)>$/.exec(part);
        if (!m) return part;
        const [, close, rawName, attrs] = m;
        const name = rawName.toLowerCase();
        if (raw) {
          if (close && name === raw) raw = null;
          return part;
        }
        if (close) {
          const at = stack.map((e) => e.name).lastIndexOf(name);
          if (at >= 0) stack.length = at;
        } else if (!VOID.has(name) && !/\/\s*$/.test(attrs)) {
          if (RAW.has(name)) raw = name;
          else {
            const lang = /\blang="([^"]*)"/.exec(attrs)?.[1];
            stack.push({ name, lang });
          }
        }
        return part;
      }
      if (raw || !part) return part;
      const lang = [...stack].reverse().find((e) => e.lang !== undefined)?.lang;
      if (lang === "bn") return part;
      return part.replace(RUN, (run) => `<span lang="bn">${run}</span>`);
    })
    .join("");
}
