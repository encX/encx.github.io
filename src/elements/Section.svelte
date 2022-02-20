<script lang="ts">
  export let classes = '';
</script>

<section class={classes}>
  <div class="container p-8 pt-12 mx-auto">
    <slot name="content" />
  </div>
  <slot name="divider" />
</section>
