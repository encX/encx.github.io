<script lang="ts">
  import Section from './elements/Section.svelte';
  import Spikes from './dividers/Spikes.svelte';
</script>

<main class="min-h-screen">
  <header class="bg-gray-900 text-gray-400 ">
    <div class="p-16 pt-24 text-center">
      <h1 class="text-6xl">Some Shouting Text</h1>
      <h1 class="text-2xl">probably my name and positions</h1>
    </div>
    <Spikes --color="rgb(185 28 28)" />
  </header>
  <Section classes="bg-red-700">
    <p slot="content">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vel
      purus quis metus consectetur cursus eu quis leo. Fusce ipsum ex,
      pellentesque eu mi eget, imperdiet tempus justo. Aliquam at tellus eget
      libero accumsan tempus. Ut mattis eros hendrerit, consectetur neque eget,
      condimentum risus. Morbi euismod erat ac enim auctor, in pretium elit
      faucibus. Aliquam erat volutpat. Pellentesque elit diam, dignissim quis
      gravida at, faucibus non tortor. Nulla facilisi. Class aptent taciti
      sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
      Suspendisse et augue eu dui luctus feugiat. Vivamus elementum metus eros,
      ut mattis nisl sollicitudin nec. Sed enim libero, vulputate sed efficitur
      nec, gravida sed sem. In ac dui eu lorem tincidunt ullamcorper a quis
      sapien.
    </p>
    <Spikes --color="rgb(37 99 235)" slot="divider" />
  </Section>
  <Section classes="bg-blue-600">
    <p slot="content">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vel
      purus quis metus consectetur cursus eu quis leo. Fusce ipsum ex,
      pellentesque eu mi eget, imperdiet tempus justo. Aliquam at tellus eget
      libero accumsan tempus. Ut mattis eros hendrerit, consectetur neque eget,
      condimentum risus. Morbi euismod erat ac enim auctor, in pretium elit
      faucibus. Aliquam erat volutpat. Pellentesque elit diam, dignissim quis
      gravida at, faucibus non tortor. Nulla facilisi. Class aptent taciti
      sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
      Suspendisse et augue eu dui luctus feugiat. Vivamus elementum metus eros,
      ut mattis nisl sollicitudin nec. Sed enim libero, vulputate sed efficitur
      nec, gravida sed sem. In ac dui eu lorem tincidunt ullamcorper a quis
      sapien.
    </p>
    <Spikes --color="rgb(131 24 67)" slot="divider" flip />
  </Section>
  <Section classes="bg-pink-900">
    <p slot="content">
      Integer facilisis quam vel magna accumsan, quis cursus orci fermentum.
      Vivamus eget magna dapibus, convallis nibh at, euismod enim. Phasellus
      massa eros, tristique id tellus at, venenatis ultrices lorem. Sed pretium
      interdum dolor sed euismod. Mauris malesuada fermentum orci eu ultrices.
      Phasellus pharetra nibh nec ipsum lobortis imperdiet. Aliquam semper nisl
      sed justo malesuada vulputate. In in volutpat libero. Duis ac urna
      elementum, tristique dui vitae, aliquet nibh. Phasellus eget ullamcorper
      arcu. Sed ut felis enim. Pellentesque blandit, sem eu imperdiet aliquet,
      turpis purus feugiat odio, a pulvinar dui velit consequat felis. Proin a
      quam vitae metus consequat euismod. Morbi convallis sollicitudin aliquam.
      Integer fringilla diam ut luctus mollis.
    </p>
    <Spikes --color="rgb(21 128 61)" slot="divider" />
  </Section>

  <Section classes="bg-green-700">
    <p slot="content">
      In bibendum id arcu ut congue. Nullam ornare lacus sit amet nunc
      facilisis, finibus ornare lectus feugiat. Nunc a metus leo. Duis facilisis
      pharetra feugiat. Praesent nec augue eu diam finibus ultricies eget
      egestas quam. Nullam semper dui vel porttitor fringilla. Aenean at libero
      ex. Fusce tempor arcu viverra purus pellentesque, nec fringilla odio
      blandit. Duis rutrum orci risus, at hendrerit lacus pulvinar dapibus. Sed
      suscipit libero nunc, eget commodo enim ornare sit amet. Curabitur finibus
      massa non nulla pulvinar, quis convallis purus venenatis. Nunc ultricies
      malesuada diam, eu convallis nisi malesuada ac. Mauris accumsan diam
      dolor, id auctor dolor congue sed. Mauris vitae lobortis lectus.
    </p>
    <Spikes --color="rgb(17 24 39)" slot="divider" />
  </Section>

  <footer class="bg-gray-900 text-sm text-gray-400 p-16 text-center">
    Footer text that no one's gonna look at
  </footer>
</main>

<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
