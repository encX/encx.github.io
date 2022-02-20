<script lang="ts">
  export let flip: boolean = false;
</script>

<div class="divider-spikes">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 100"
    preserveAspectRatio="none"
    style="transform: rotateY({flip ? '180deg' : '0'})"
  >
    <path d="M1200 0 L0 0 300 30 z" />
    <path d="M1200 0 L600 0 1100 60 z" opacity=".25" />
    <path d="M1200 0 L200 0 700 80 z" opacity=".25" />
    <path d="M800 0 L0 0 400 100 z" opacity=".25" />
    <path d="M1200 50 L1200 0 200 0 z" opacity=".2" />
    <path d="M800 0 L0 0 0 100 z" opacity=".2" />
  </svg>
</div>

<style>
  .divider-spikes {
    width: 100%;
    overflow: hidden;
    line-height: 0;
    transform: rotate(180deg);
  }

  .divider-spikes svg {
    height: 100px;
    width: 100%;
  }

  .divider-spikes path {
    fill: var(--color, #0f0);
  }
</style>
