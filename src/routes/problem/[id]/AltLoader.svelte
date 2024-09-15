<script>
  import { onMount } from "svelte";

  let start = 0;
  let progress = 0;
  let mounted = true;

  function update() {
    const now = performance.now();
    progress = 1 - 2 ** ((now - start) / -2500);
    if (mounted) requestAnimationFrame(update);
  }

  onMount(() => {
    start = performance.now();
    mounted = true;
    update();

    return () => {
      mounted = false;
    };
  });
</script>

<div class="progress" style:--progress={progress}>Checking...</div>

<style>
  .progress {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 2.5rem;
    border-radius: 2.5rem;
    background-color: rgb(var(--m3-scheme-surface-container-low));

    position: relative;
    overflow: hidden;

    margin-bottom: 1rem;
  }
  .progress::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: calc(var(--progress) * 100%);
    height: 100%;
    border-radius: 2.5rem;
    background-color: rgb(var(--m3-scheme-primary) / 0.25);
  }
</style>
