<script lang="ts">
  import { onMount } from "svelte";
  import { PUBLIC_NAMES_URL } from "$env/static/public";
  import Dialog from "./Dialog.svelte";
  import { page } from "$app/stores";

  export let data;
  let transpose = false;

  let names: Record<string, string> = {};
  let dialogData = { author: "", code: "" };
  let dialogOpen = false;

  onMount(() => {
    fetch(PUBLIC_NAMES_URL)
      .then((r) => r.json())
      .then((r) => {
        names = r;
      });
  });

  const icons = {
    complete:
      "m9.55 15.15l8.475-8.475q.3-.3.7-.3t.7.3t.3.713t-.3.712l-9.175 9.2q-.3.3-.7.3t-.7-.3L4.55 13q-.3-.3-.288-.712t.313-.713t.713-.3t.712.3z",
    tried:
      "m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z",
  };

  const getStatusIcon = (status: "complete" | "tried" | "not-attempted") => {
    if (status == "complete" || status == "tried") {
      return icons[status];
    }
    return "";
  };
</script>

<svelte:head>
  <title>{$page.params.name}</title>
</svelte:head>

<p class="center">Student progress</p>
<p class="center">Students who haven't attempted problems are omitted</p>
<p class="center">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1rem"
    height="1rem"
    viewBox="0 0 24 24"
  >
    <path fill="currentColor" d={getStatusIcon("complete")} />
  </svg>
  was correctly completed, while
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1rem"
    height="1rem"
    viewBox="0 0 24 24"
  >
    <path fill="currentColor" d={getStatusIcon("tried")} />
  </svg>
  has been attempted
</p>
<label class="center">
  <input type="checkbox" bind:checked={transpose} /> Transpose
</label>
<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th>{transpose ? "Student" : "Problem"}</th>
        {#if transpose}
          {#each data.matrix as item}
            <th>{item.title.replace("BJP4 ", "")}</th>
          {/each}
        {:else}
          {#each data.users as id}
            <th>{names[id] || `User ${id}`}</th>
          {/each}
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each transpose ? data.users : data.matrix as item}
        <tr>
          <svelte:element this={transpose ? "th" : "td"}
            >{transpose
              ? names[item] || `User ${item}`
              : item.title.replace("BJP4 ", "")}</svelte:element
          >
          {#each transpose ? data.matrix : data.users as subItem}
            {@const status = transpose
              ? subItem.tracking[item].status
              : item.tracking[subItem].status}
            {@const code = transpose
              ? subItem.tracking[item].code
              : item.tracking[subItem].code}
            {@const iconPath = getStatusIcon(status)}
            <td
              class={status == "not-attempted" ? "" : status}
              class:clickable={code}
              on:click={() => {
                if (!code) return;

                dialogData = {
                  author: transpose
                    ? names[item] || `User ${item}`
                    : names[subItem] || `User ${subItem}`,
                  code,
                };
                dialogOpen = true;
              }}
            >
              {#if iconPath}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1rem"
                  height="1rem"
                  viewBox="0 0 24 24"
                >
                  <path fill="currentColor" d={iconPath} />
                </svg>
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<Dialog
  headline="{dialogData.author.split(' ')[0]}'s code"
  bind:open={dialogOpen}
>
  <pre>{dialogData.code}</pre>
</Dialog>

<style>
  .center {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    align-self: center;
    margin-bottom: 0.5rem;
  }

  .table-wrap {
    white-space: nowrap;
    width: 100%;
    max-width: fit-content;
    overflow-x: auto;

    align-self: center;
  }
  table {
    border-collapse: collapse;
  }
  th,
  td {
    border-width: 1px;
    border-color: rgb(var(--m3-scheme-surface-container));
  }
  th {
    text-align: left;
  }
  .complete {
    background-color: rgb(var(--m3-scheme-primary) / 0.25);
    text-align: center;
  }
  .tried {
    background-color: rgb(var(--m3-scheme-tertiary) / 0.25);
    text-align: center;
  }
  .clickable {
    cursor: pointer;
  }
  .complete svg,
  .tried svg {
    display: block;
    margin: 0 auto;
  }

  pre {
    white-space: pre-wrap;
    background-color: rgb(var(--m3-scheme-surface-container-low));
    padding: 0.5rem;
    border-radius: 0.5rem;
  }
</style>
