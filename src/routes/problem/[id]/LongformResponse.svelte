<script lang="ts">
  import type { editor } from "monaco-editor";
  import { afterUpdate, onMount } from "svelte";
  import { enhance } from "$app/forms";
  import AltLoader from "./AltLoader.svelte";

  export let problem: {
    solution_template: string;
    solution_default: string;
  };
  export let lastAttempt:
    | {
        guesses: string[];
      }
    | undefined;
  export let solved: boolean;
  export let feedback: string | undefined;

  let loading = false;
  let text = lastAttempt?.guesses[0] || problem.solution_default;

  let divEl: HTMLElement;
  let editor: editor.IStandaloneCodeEditor;

  const loadMonaco = async () => {
    const Monaco = await import("monaco-editor");
    const { default: worker } = await import(
      "monaco-editor/esm/vs/editor/editor.worker?worker"
    );
    window.MonacoEnvironment = { getWorker: () => new worker() };

    const isDark = matchMedia("(prefers-color-scheme: dark)").matches;
    const getColor = (name: string) => {
      const rgb = getComputedStyle(document.body)
        .getPropertyValue(`--m3-scheme-${name}`)
        .trim();
      return (
        "#" +
        rgb
          .split(" ")
          .map((x) => parseInt(x).toString(16).padStart(2, "0"))
          .join("")
      );
    };
    const colors = {
      "editor.background": getColor("surface"),
      "editor.foreground": getColor("on-surface"),
      foreground: getColor("on-surface"),
      "editorLineNumber.foreground": getColor("secondary") + "b0",
      "editorLineNumber.activeForeground": getColor("on-surface"),
      "editorLineNumber.dimmedForeground": getColor("secondary") + "40",
      "editorCursor.foreground": getColor("on-surface"),
      "editor.lineHighlightBackground": getColor("primary") + "20",

      "editor.selectionBackground": isDark ? "#16512c" : "#b3f1be",
      "selection.background": isDark ? "#16512c" : "#b3f1be",
      "editor.inactiveSelectionBackground":
        getColor("primary-container") + "80",
      "editor.selectionHighlightBackground":
        getColor("primary-container") + "80",
      "editor.findMatchBackground": isDark ? "#204d56" : "#bdeaf5",
      "editor.findMatchBorder": isDark ? "#204d56" : "#bdeaf5",
      "editor.findMatchHighlightBackground":
        getColor("tertiary-container") + "80",
      "editor.foldBackground": getColor("tertiary-container") + "80",
      "inputValidation.infoBackground": getColor("primary-container"),
      "inputValidation.infoForeground": getColor("on-primary-container"),
      "inputValidation.infoBorder": getColor("primary"),

      "editorBracketMatch.background": "#00000000",
      "editorBracketMatch.border": isDark
        ? getColor("primary")
        : getColor("primary") + "50",
      "editorBracketHighlight.foreground1": isDark ? "#fdb87c" : "#8e4e00", // orange
      "editorBracketHighlight.foreground2": isDark ? "#97cdf4" : "#216388", // cyan
      "editorBracketHighlight.foreground3": isDark ? "#c1cd81" : "#566406", // lime?
      "editorBracketHighlight.foreground4": isDark ? "#d0bdfb" : "#65548e", // purple
      "editorBracketHighlight.foreground5": isDark ? "#89d5c2" : "#006a5a", // teal
      "editorBracketHighlight.foreground6": isDark ? "#ffb0c8" : "#a03861", // red

      "editorLink.activeForeground": getColor("primary"),
    };
    Monaco.editor.defineTheme("harmonized", {
      base: isDark ? "vs-dark" : "vs",
      inherit: true,
      rules: [
        { token: "keyword", foreground: getColor("primary") },
        { token: "comment", foreground: isDark ? "#d8e0bf" : "#323922" },
        { token: "string", foreground: isDark ? "#cee698" : "#2b3c00" },
        { token: "invalid", foreground: "#0000f0" },
      ],
      colors,
    });
    editor = Monaco.editor.create(divEl, {
      value: text,
      language: "java",
      theme: "harmonized",
      minimap: { enabled: false },
    });

    const rect = divEl.parentElement!.getBoundingClientRect();
    editor.layout({ width: rect.width, height: rect.height });

    editor.onDidChangeModelContent(() => {
      text = editor.getValue();
    });
  };
  onMount(() => {
    loadMonaco();
    return () => {
      if (editor) editor.dispose();
    };
  });

  afterUpdate(() => {
    if (editor) {
      editor.layout({ width: 0, height: 0 });
      window.requestAnimationFrame(() => {
        const rect = divEl.parentElement!.getBoundingClientRect();
        editor.layout({ width: rect.width, height: rect.height });
      });
    }
  });

  $: if (editor) {
    editor.updateOptions({
      readOnly: solved || loading,
    });
  }
</script>

<div class="spacer" />
{#if solved}
  <div class="banner">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.25rem"
      height="1.25rem"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        d="m9.55 15.15l8.475-8.475q.3-.3.7-.3t.7.3t.3.713t-.3.712l-9.175 9.2q-.3.3-.7.3t-.7-.3L4.55 13q-.3-.3-.288-.712t.313-.713t.713-.3t.712.3z"
      />
    </svg>
    Solved
  </div>
{:else if loading}
  <AltLoader />
{:else if feedback}
  <pre class="feedback">{feedback}</pre>
{/if}
<div class="parent">
  <div bind:this={divEl} />
</div>
{#if !(solved || loading)}
  <form
    method="post"
    use:enhance={() => {
      loading = true;
      return async ({ update }) => {
        await update();
        loading = false;
      };
    }}
  >
    <input
      type="hidden"
      name="text"
      value={problem.solution_template.replace("{{INPUT}}", text)}
    />
    <button>Check</button>
  </form>
{/if}

<style>
  .spacer {
    height: 3.5rem;
  }
  .banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    background-color: rgb(var(--m3-scheme-primary) / 0.25);
    height: 2.5rem;
    border-radius: 2.5rem;
    margin-bottom: 1rem;
  }
  .feedback {
    background-color: rgb(var(--m3-scheme-error-container) / 0.25);
    padding: 0.5rem 1rem;
    border-radius: 1.25rem;
    margin-bottom: 1rem;
  }

  .parent {
    flex-grow: 1;
    min-height: 15rem;
  }

  form {
    display: flex;
    flex-direction: column;
  }
  button {
    display: flex;
    align-items: center;
    justify-content: center;

    background-color: rgb(var(--m3-scheme-primary));
    color: rgb(var(--m3-scheme-on-primary));

    font-weight: 500;

    height: 2.5rem;
    padding: 0 1rem;
    border-radius: 2.5rem;
  }
</style>
