<script lang="ts">
  import LogIn from "./LogIn.svelte";
  import SetCourse from "./SetCourse.svelte";

  export let data;
</script>

<svelte:head>
  <title
    >{data.problems
      ? "PracticeYeet problems"
      : "PracticeYeet educator view"}</title
  >
</svelte:head>

{#if !data.auth}
  <LogIn />
{:else if data.auth != "educator" && !data.course}
  <SetCourse />
{/if}
{#if data.problems}
  <div class="list">
    {#each data.problems as problem}
      <a href="/problem/{problem.id}" class:completed={problem.completed}>
        {problem.title}
      </a>
    {/each}
  </div>
{:else}
  <div class="list">
    {#each data.allCourses as course}
      <a href="/viewCourse/{course}">{course}</a>
    {/each}
  </div>
{/if}

<style>
  .list {
    display: flex;
    flex-direction: column;

    width: 100%;
    max-width: 40rem;
    align-self: center;
  }
  .list > a {
    display: flex;
    align-items: center;
    color: rgb(var(--m3-scheme-primary));
    height: 2rem;
  }
  .list > a.completed {
    text-decoration: line-through;
  }
</style>
