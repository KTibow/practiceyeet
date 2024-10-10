<script lang="ts">
  export let text: string;

  const escape = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const latexParse = (latex: string) => {
    let html = latex;
    const texts: string[] = [];

    // Remove text to prevent formatting
    html = html.replace(/\\text\{(.+?)\}/g, (match, p1) => {
      texts.push(p1);
      return "TEXT" + (texts.length - 1);
    });

    // Handle fractions
    html = html.replace(
      /\\frac\{(.+?)\}\{(.+?)\}/g,
      '<span class="frac"><span>$1</span><span class="bottom">$2</span></span>',
    );

    // Handle square roots
    html = html.replace(
      /\\sqrt\{([^}]+)\}/g,
      '<span class="sqrt"><span class="sqrt-stem">$1</span></span>',
    );

    // Handle superscripts
    html = html
      .replace(/\^(\{[^}]+\}|[^\s])/g, "<sup>$1</sup>")
      .replace(/\{|\}/g, "");

    // Handle subscripts
    html = html
      .replace(/_(\{[^}]+\}|[^\s])/g, "<sub>$1</sub>")
      .replace(/\{|\}/g, "");

    // Handle dot
    html = html.replaceAll("\\cdot", "·");

    // Handle ellipsis
    html = html.replaceAll("\\cdots", "...");
    html = html.replaceAll("\\ldots", "...");

    // Handle plus-minus sign
    html = html.replaceAll("\\pm", '<span class="pm">±</span>');

    // Remove extra backslashes
    html = html.replaceAll("\\", "");

    // Restore text
    html = html.replace(/TEXT(\d+)/g, (match, p1) => texts[+p1]);

    // Wrap in math class
    html = '<span class="math">' + html + "</span>";

    return html;
  };
  const parse = (text: string) => {
    text = text
      .trim()
      .replace(/ +\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n");

    let final = "";
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      if (line.startsWith("```")) {
        let codeBlock = "";
        i++;
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeBlock += lines[i] + "\n";
          i++;
        }
        final += `<pre>${escape(codeBlock.trimEnd())}</pre>`;
      } else if (line.startsWith(">")) {
        let blockquote = "";
        while (i < lines.length && lines[i].startsWith(">")) {
          blockquote += lines[i].slice(2) + "\n";
          i++;
        }
        final += `<blockquote>${parse(blockquote.trim())}</blockquote>`;
      } else {
        // Handle inline code and bold text
        line = line.replace(/`(.+?)`/g, "<code>$1</code>");
        line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        line = line.replace(/\*(.*?)\*/g, "<em>$1</em>");
        line = line.replace(/\\\((.+?)\\\)/g, (_, n1) => {
          return latexParse(n1);
        });
        line = line.replace(/\\\[(.+?)\\\]/g, (_, n1) => {
          return latexParse(n1);
        });
        final += `<p>${line}</p>`;
      }
    }
    return final;
  };
</script>

<div>{@html parse(text)}</div>

<style>
  div {
    overflow: hidden;
    white-space: pre-wrap;
    min-height: 1.5rem;
    flex-shrink: 0;
  }
  div :global(p) {
    margin-bottom: 1rem;
  }
  div :global(blockquote) {
    border-left: 4px solid rgb(var(--m3-scheme-primary));
    padding-left: 1rem;
    margin-left: 0;
    margin-bottom: 1rem;
    color: rgb(var(--m3-scheme-on-surface-variant));
  }
  div :global(pre) {
    background-color: rgb(var(--m3-scheme-surface-container-highest));
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-bottom: 1rem;
  }
  div :global(code) {
    font-family: monospace;
    background-color: rgba(var(--m3-scheme-surface-container-highest), 0.5);
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
  }
  div :global(.math) {
    font-family: "Times New Roman", Times, serif;
  }
  div :global(.sqrt::before) {
    content: "√";
    color: rgb(var(--m3-scheme-outline) / 0.8);
  }
  div :global(.sqrt-stem) {
    border-top: solid 1px rgb(var(--m3-scheme-outline) / 0.8);
  }
  div :global(.frac) {
    display: inline-block;
    vertical-align: middle;
    text-align: center;
  }
  div :global(.frac > span) {
    display: block;
    padding: 0.1rem;
  }
  div :global(.frac > span.bottom) {
    border-top: solid 1px rgb(var(--m3-scheme-outline) / 0.8);
  }
</style>
