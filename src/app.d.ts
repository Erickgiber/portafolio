// See https://kit.svelte.dev/docs/types#app for information about these interfaces
// This file can be edited to add global app declarations

// Extend Svelte's HTML event attributes to recognize our custom event from the action.
// The name must match the dispatched event name exactly: 'visibilityprogress'.

import type { VisibilityProgressDetail } from "./lib/actions/visibilityProgress";

declare global {
  namespace svelteHTML {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface HTMLAttributes<T> {
      "on:visibilityprogress"?: (event: CustomEvent<VisibilityProgressDetail>) => void;
    }
  }
}

export {};
