<script lang="ts">
  export let form;
</script>

<div class="center">
  <p>You're now part of {form?.course}.</p>
  <a href="/">Home</a>
</div>

<style>
  .center {
    display: flex;
    flex-direction: column;
    margin: auto;
  }

  a {
    color: rgb(var(--m3-scheme-primary));
  }
</style>
