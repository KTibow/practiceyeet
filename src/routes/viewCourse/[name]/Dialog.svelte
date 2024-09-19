<script lang="ts">
  export let headline: string;
  export let open: boolean;

  let dialog: HTMLDialogElement;
  $: {
    if (!dialog) break $;
    if (open) dialog.showModal();
    else dialog.close();
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog
  on:cancel={(e) => {
    open = false;
  }}
  on:click|self={() => {
    open = false;
  }}
  bind:this={dialog}
>
  <div class="m3-container">
    <p class="headline">{headline}</p>
    <div class="content">
      <slot />
    </div>
    <div class="buttons">
      <button
        on:click={() => {
          open = false;
        }}
      >
        Close
      </button>
    </div>
  </div>
</dialog>

<style>
  dialog {
    display: flex;
    background-color: rgb(var(--m3-scheme-surface-container-high));
    border: none;
    border-radius: 1.75rem;
    min-width: 17.5rem;
    max-width: 35rem;
    padding: 0;
    margin: auto;
    overflow: auto;
  }
  .m3-container {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    width: 100%;
  }

  .m3-container > :global(svg) {
    color: rgb(var(--m3-scheme-secondary));
    width: 1.5rem;
    height: 1.5rem;

    flex-shrink: 0;
    align-self: center;
    margin-bottom: 1rem;
  }
  .headline {
    font-size: 1.5rem;
    color: rgb(var(--m3-scheme-on-surface));
    margin-top: 0;
    margin-bottom: 1rem;
  }
  .content {
    color: rgb(var(--m3-scheme-on-surface-variant));
    margin-bottom: 1.5rem;
  }
  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  button {
    display: flex;
    align-items: center;

    height: 2.5rem;
    padding: 0 1rem;
    border-radius: 1.25rem;
    color: rgb(var(--m3-scheme-primary));
    transition: background-color 200ms;
  }
  button:hover {
    background-color: rgb(var(--m3-scheme-primary) / 0.08);
  }
  button:focus-visible,
  button:active {
    background-color: rgb(var(--m3-scheme-primary) / 0.12);
  }

  dialog {
    position: fixed;
    inset: 0;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
      opacity 200ms,
      visibility 200ms;
  }
  dialog[open] {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    animation:
      dialogIn 500ms cubic-bezier(0.05, 0.7, 0.1, 1),
      opacity 100ms cubic-bezier(0.05, 0.7, 0.1, 1);
  }
  dialog[open] .headline {
    animation: opacity 150ms;
  }
  dialog[open] .content {
    animation: opacity 200ms;
  }
  dialog[open] .buttons {
    position: relative;
    animation:
      buttonsIn 500ms cubic-bezier(0.05, 0.7, 0.1, 1),
      opacity 200ms 100ms backwards;
  }
  dialog::backdrop {
    background-color: rgb(var(--m3-scheme-scrim) / 0.3);
    animation: opacity 400ms;
  }
  @keyframes dialogIn {
    0% {
      transform: translateY(-3rem) scaleY(90%);
      clip-path: inset(0 0 100% 0 round 1.75rem);
    }
    100% {
      transform: translateY(0) scaleY(100%);
      clip-path: inset(0 0 0 0 round 1.75rem);
    }
  }
  @keyframes buttonsIn {
    0% {
      bottom: 100%;
    }
    100% {
      bottom: 0;
    }
  }
  @keyframes opacity {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>
