<script lang="ts">
  import { page } from "$app/stores";

  export let problem: {
    response_fields: { title: string; type: string; options?: string[] }[];
  };
  export let lastAttempt:
    | {
        guesses: string[];
      }
    | undefined;
  export let solved: boolean;

  const nonUndefined = <T,>(x: T | undefined) => {
    if (!x) throw new Error("undefined");
    return x;
  };
</script>

<form inert={solved} method="post">
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
  {/if}
  {#each problem.response_fields as field, i}
    {@const value = lastAttempt?.guesses?.[i] || ""}
    <div class="field">
      <p>{field.title}</p>
      {#if field.type == "large"}
        <textarea name="response-{i}" rows="5" {value} />
      {:else if field.type == "small"}
        <input name="response-{i}" type="text" {value} />
      {:else if field.type == "checkbox"}
        <input name="response-{i}" type="checkbox" checked={value == "yes"} />
      {:else if field.type == "select"}
        <select name="response-{i}">
          {#each nonUndefined(field.options) as option}
            <option selected={value == option} value={option}>{option}</option>
          {/each}
        </select>
      {/if}
    </div>
  {/each}
  {#if $page.data.auth}
    {#if !solved}
      <button>Check</button>
    {/if}
  {:else}
    <p><a href="/">Log in</a> to solve</p>
  {/if}
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 4rem;
  }
  .banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    background-color: rgb(var(--m3-scheme-primary) / 0.25);
    height: 3rem;
    border-radius: 3rem;
  }
  .field {
    display: flex;
    gap: 1rem;
  }
  .field p {
    font-weight: bold;
  }
  textarea,
  input[type="text"] {
    flex-grow: 1;

    background-color: rgb(var(--m3-scheme-surface-container));
    padding: 0.5rem;
    border-radius: 0.5rem;
  }
  form[inert] textarea,
  form[inert] input[type="text"] {
    background-color: rgb(var(--m3-scheme-surface-container-highest));
    color: rgb(var(--m3-scheme-on-background) / 0.9);
  }
  input[type="checkbox"] {
    width: 1.5rem;
    height: 1.5rem;
    margin-left: auto;
  }
  select {
    min-width: 0;
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
  a {
    color: rgb(var(--m3-scheme-primary));
  }
</style>
