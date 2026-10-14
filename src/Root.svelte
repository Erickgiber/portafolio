<script lang="ts">
  import { fade } from "svelte/transition";
  import App from "./App.svelte";
  import VitralPage from "./VitralPage.svelte";
  import GamepadHub from "./lib/components/GamepadHub.svelte";
  import { router } from "./lib/stores/router.svelte";

  router.start();
</script>

{#key router.route}
  <div in:fade={{ duration: 220 }}>
    {#if router.route === "vitral"}
      <VitralPage />
    {:else}
      <App />
    {/if}
  </div>
{/key}

<GamepadHub />
