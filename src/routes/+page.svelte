<script lang="ts">
  export let data;
</script>

<svelte:head>
  <title>PracticeYeet</title>
</svelte:head>
{#if !data.auth}
  <form method="post">
    <input
      name="id"
      type="text"
      placeholder="Student ID"
      pattern={"[0-9]{7}"}
      required
    />
    <button>Log in</button>
  </form>
{/if}
<div class="problems">
  {#each data.problems as problem}
    <a href="/problem/{problem.id}" class:completed={problem.completed}
      >{problem.title}</a
    >
  {/each}
</div>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    width: 100%;
    max-width: 40rem;
    align-self: center;
  }
  form > * {
    display: flex;
    align-items: center;

    background-color: rgb(var(--m3-scheme-surface-container));

    height: 2.5rem;
    padding: 0 1rem;
    border-radius: 2.5rem;
  }
  form > button {
    background-color: rgb(var(--m3-scheme-primary));
    color: rgb(var(--m3-scheme-on-primary));

    font-weight: 500;

    border-radius: 2.5rem;
  }

  .problems {
    display: flex;
    flex-direction: column;

    width: 100%;
    max-width: 40rem;
    align-self: center;
  }
  .problems > a {
    display: flex;
    align-items: center;
    color: rgb(var(--m3-scheme-primary));
    height: 2rem;
  }
  .problems > a.completed {
    text-decoration: line-through;
  }
</style>
