<script>
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import "../app.css";

  let title = $page.url.pathname.startsWith("/problem") ? "Problem" : "";
  $: if (browser && $page) {
    title = document.title;
  }
</script>

<div class="header">
  <a href="/">PracticeYeet</a>
  <span>by Kendell</span>
  <span style:margin="auto">{title}</span>
  {#if $page.data.auth}
    <span>Have fun, {$page.data.auth}</span>
  {/if}
</div>
<slot />

<style>
  .header {
    display: flex;
    height: 4rem;
    margin: -1rem -1rem 2rem -1rem;
    padding-right: 1rem;
  }
  .header > * {
    display: flex;
    align-items: center;
  }
  a {
    color: rgb(var(--m3-scheme-primary));
    padding: 0 1rem;
    font-weight: bold;
  }
</style>
