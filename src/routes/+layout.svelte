<script>
  import { page } from "$app/stores";
  import "../app.css";
</script>

<div class="header">
  <a href="/">PracticeYeet</a>
  <span>by Kendell</span>
  {#if $page.data.auth}
    <div class="spacer" />
    <span>Have fun, {$page.data.auth}</span>
  {/if}
</div>
<slot />

<style>
  .header {
    display: flex;
    height: 3rem;
    margin: -1rem -1rem 0 -1rem;
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
  .spacer {
    flex-grow: 1;
  }
</style>
