<script lang="ts">
  import Markdown from "./Markdown.svelte";
  import ShortformResponse from "./ShortformResponse.svelte";
  import LongformResponse from "./LongformResponse.svelte";

  export let data;
  export let form;

  $: lastAttempt = data.attempts?.at(-1);
  $: solved = Boolean(lastAttempt?.correct);
</script>

<svelte:head>
  {#if data.problem}
    <title>{data.problem.title.replace("BJP4 ", "")}</title>
  {/if}
</svelte:head>

{#if data.problem}
  {@const problem = data.problem}
  <main>
    <Markdown text={problem.problem} />
    {#if problem.type == "shortform"}
      <ShortformResponse {problem} {lastAttempt} {solved} />
    {:else if problem.type == "longform"}
      <LongformResponse
        {problem}
        {lastAttempt}
        {solved}
        feedback={form?.feedback}
      />
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
  h2 {
    font-size: 1rem;
    margin-top: 2rem;
  }
  .copyright {
    margin-top: auto;
    padding-top: 4rem;
    opacity: 0.5;
  }

  .center {
    margin: auto;
  }
</style>
