<script>
  import { page } from "$app/stores";
</script>

<form action="/setCourse" method="post">
  <p>What course are you in?</p>
  <select name="course">
    {#each $page.data.allCourses as course}
      <option>{course}</option>
    {/each}
  </select>
  <button>Set</button>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    width: 100%;
    max-width: 40rem;
    align-self: center;
  }
  select {
    display: flex;
    align-items: center;

    background-color: rgb(var(--m3-scheme-surface-container));

    height: 2.5rem;
    padding: 0 1rem;
    border-radius: 2.5rem;
  }
  button {
    background-color: rgb(var(--m3-scheme-primary));
    color: rgb(var(--m3-scheme-on-primary));

    font-weight: 500;

    height: 2.5rem;
    padding: 0 1rem;
    border-radius: 2.5rem;
  }
</style>
