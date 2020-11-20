<!-- HEALTH:HIGH __page__home -->
<template>
  <div
    class="__page__home min-h-screen flex items-center container p-5 mx-auto"
  >
    <section
      class="md:flex md:items-stretch rounded-lg overflow-hidden shadow-2xl bg-white p-6"
    >
      <pre class="text-sm">{{ document }}</pre>
    </section>
  </div>
</template>

<script>
export default {
  async asyncData({ $prismic }) {
    const document = await $prismic.api.getByUID("page", "home");

    return { document };
  }
};
</script>
