<script lang="ts">
  import Markdown from "./Markdown.svelte";

  export let data;
  export let form;

  $: lastAttempt = data.attempts?.at(-1);
  $: solved = lastAttempt?.correct;
</script>

<svelte:head>
  {#if data.problem}
    <title>{data.problem.title}</title>
  {/if}
</svelte:head>

{#if data.problem}
  {@const problem = data.problem}
  <main>
    <h1>{problem.title}</h1>
    <Markdown text={problem.problem} />
    {#if problem.type == "shortform"}
      <form inert={solved} method="post">
        {#if solved}
          <div class="banner">Solved</div>
        {/if}
        {#each problem.response_fields as field, i}
          {@const value = lastAttempt?.guesses?.[i] || ""}
          <div>
            <p>{field.title}</p>
            {#if field.type == "large"}
              <textarea name="response-{i}" rows="5" {value} />
            {:else if field.type == "small"}
              <input name="response-{i}" type="text" {value} />
            {:else if field.type == "checkbox"}
              <input
                name="response-{i}"
                type="checkbox"
                checked={value == "yes"}
              />
            {:else if field.type == "select"}
              <select name="response-{i}">
                {#each field.options as option}
                  <option selected={value == option} value={option}
                    >{option}</option
                  >
                {/each}
              </select>
            {/if}
          </div>
        {/each}
        {#if !solved && data.auth}
          <button>Check</button>
        {:else if !data.auth}
          <p><a href="/">Log in</a> to solve</p>
        {/if}
      </form>
    {/if}
    {#if data.attempts.length}
      <h2>Past attempts</h2>
      {#each data.attempts as attempt}
        <p>
          {attempt.correct ? "Correct" : "Incorrect"} on {new Date(
            attempt.created_at,
          ).toLocaleDateString()}
        </p>
      {/each}
    {/if}
    <p class="copyright">© {problem.author}</p>
  </main>
{:else}
  <div class="center">
    <p>Problem not found</p>
  </div>
{/if}

<style>
  main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    width: 100%;
    max-width: 40rem;
    align-self: center;
  }
  h1 {
    margin-bottom: 2rem;
  }
  .banner {
    display: flex;
    align-items: center;
    justify-content: center;

    background-color: rgb(var(--m3-scheme-primary) / 0.25);
    height: 2.5rem;
    border-radius: 2.5rem;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 4rem;
  }
  form > div {
    display: flex;
    gap: 1rem;
  }
  form p {
    font-weight: bold;
  }
  form textarea,
  form input[type="text"] {
    flex-grow: 1;

    background-color: rgb(var(--m3-scheme-surface-container));
    padding: 0.5rem;
    border-radius: 0.5rem;
  }
  form[inert] textarea,
  form[inert] input[type="text"] {
    background-color: rgb(var(--m3-scheme-on-background) / 0.4);
    color: rgb(var(--m3-scheme-on-background) / 0.9);
  }
  form input[type="checkbox"] {
    width: 1.5rem;
    height: 1.5rem;
    margin-left: auto;
  }
  form select {
    min-width: 0;
  }
  form button {
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
  h2 {
    font-size: 1rem;
    margin-top: 1rem;
  }
  .copyright {
    margin-top: auto;
    padding-top: 4rem;
    opacity: 0.5;
  }

  a {
    color: rgb(var(--m3-scheme-primary));
  }

  .center {
    margin: auto;
  }
</style>
