export default async (url) => {
  const r = await fetch(url);
  const text = await r.text();

  const main =
    `<h2 class="problemtitle"` +
    text.split(`<h2 class="problemtitle"`)[1].split("<!-- problemarea -->")[0];
  return main.replace(/\n\s*\n/g, "\n");
};
