<script>
  let educator = false;
</script>

<form method="post">
  {#if educator}
    <button>Log in</button>
    <button type="button" class="secondary" on:click={() => (educator = false)}>
      I'm a student
    </button>
  {:else}
    <div class="buttons">
      <input
        name="id"
        type="text"
        placeholder="Student ID"
        pattern={"[0-9]{7}"}
        required
      />
      <button>Log in</button>
      <button
        type="button"
        class="secondary"
        on:click={() => (educator = true)}
      >
        I'm an educator
      </button>
    </div>
  {/if}
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    width: 100%;
    max-width: 40rem;
    align-self: center;
  }
  input {
    display: flex;
    align-items: center;

    background-color: rgb(var(--m3-scheme-surface-container));

    height: 2.5rem;
    padding: 0 1rem;
    border-radius: 2.5rem;
  }
  .buttons {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.25rem;
  }
  button {
    background-color: rgb(var(--m3-scheme-primary));
    color: rgb(var(--m3-scheme-on-primary));

    font-weight: 500;

    min-height: 2.5rem;
    padding: 0 1rem;
    border-radius: 1.25rem;
  }
  button:not(.secondary) {
    flex-grow: 1;
  }
  .secondary {
    grid-row: 1 / span 2;
    grid-column: 2;
    background-color: rgb(var(--m3-scheme-primary-container));
    color: rgb(var(--m3-scheme-on-primary-container));
  }
</style>
