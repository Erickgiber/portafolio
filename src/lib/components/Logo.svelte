<script lang="ts">
  let { size = 36, class: className = "" } = $props<{
    size?: number;
    class?: string;
  }>();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 128 128"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class={`select-none shrink-0 ${className}`}
  aria-hidden="true"
>
  <defs>
    <linearGradient id="compBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"></stop>
      <stop offset="100%" stop-color="#020617"></stop>
    </linearGradient>

    <linearGradient id="compBrand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"></stop>
      <stop offset="45%" stop-color="#0ea5e9"></stop>
      <stop offset="75%" stop-color="#34d399"></stop>
      <stop offset="100%" stop-color="#10b981"></stop>
    </linearGradient>

    <filter id="compGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3.5" flood-color="#38bdf8" flood-opacity="0.35"
      ></feDropShadow>
    </filter>
  </defs>

  <rect
    x="6"
    y="6"
    width="116"
    height="116"
    rx="28"
    fill="url(#compBg)"
    stroke="#38bdf8"
    stroke-opacity="0.25"
    stroke-width="1.5"
  ></rect>

  <g
    filter="url(#compGlow)"
    stroke="url(#compBrand)"
    stroke-width="10.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- Letter E -->
    <path d="M56 43 H32 V85 H56 M32 64 H51"></path>

    <!-- Letter R -->
    <path d="M72 85 V43 H84 C94 43 94 64 84 64 H72 M82 64 L96 85"></path>
  </g>
</svg>
