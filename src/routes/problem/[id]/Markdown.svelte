<script lang="ts">
  export let text: string;

  const escape = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

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
</style>
