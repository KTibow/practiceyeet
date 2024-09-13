<script>
  import { page } from "$app/stores";
  import "../app.css";
</script>

<div class="header">
  <a href="/">PracticeYeet</a> by Kendell
  {#if $page.data.auth}
    <p>Have fun, {$page.data.auth}</p>
  {/if}
</div>
<slot />

<style>
  .header {
    display: flex;
    height: 3rem;
  }
  a {
    color: rgb(var(--m3-scheme-primary));
    padding: 0 1rem;
    font-weight: bold;
  }
  p {
    margin-left: auto;
  }
</style>
