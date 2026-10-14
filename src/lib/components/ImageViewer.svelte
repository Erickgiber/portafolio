<script lang="ts">
  import { tick, untrack } from "svelte";
  import { fade } from "svelte/transition";
  import Icon from "@iconify/svelte";
  import { lockPageScroll } from "../scroll/pageScroll";
  import { gamepadLayers } from "../stores/gamepadLayers.svelte";
  import { i18nStore } from "../stores/i18n.svelte";
  import {
    IDENTITY,
    MAX_SCALE,
    classifySwipe,
    clampPan,
    distance,
    midpoint,
    wrapIndex,
    zoomAround,
    type Point,
    type Size,
    type ViewTransform,
  } from "../viewer/gestures";
  import type { ViewerCopy, ViewerImage } from "../viewer/types";

  type Gesture = {
    start: Point;
    time: number;
    origin: ViewTransform;
    pinchDistance: number;
    pinchCenter: Point;
    moved: boolean;
    onImage: boolean;
  };

  let {
    images,
    index = $bindable(null),
    copy,
  }: { images: ViewerImage[]; index: number | null; copy: ViewerCopy } = $props();

  const ZOOM_STEP = 1.6;
  const DOUBLE_TAP_ZOOM = 2.5;
  const DOUBLE_TAP_MS = 300;
  const DOUBLE_TAP_DISTANCE_PX = 30;
  const TAP_DISTANCE_PX = 10;
  const WHEEL_ZOOM_FACTOR = 0.0018;
  const STICK_PAN_PX_PER_MS = 1.2;
  const DRAG_UP_RESISTANCE = 0.2;
  const DRAG_FADE_DISTANCE_PX = 400;
  const MAX_DRAG_FADE = 0.6;

  let root = $state<HTMLDivElement>();
  let stage = $state<HTMLDivElement>();
  let image = $state<HTMLImageElement>();
  let closeButton = $state<HTMLButtonElement>();
  let nextButton = $state<HTMLButtonElement>();
  let view = $state<ViewTransform>(IDENTITY);
  let drag = $state<Point>({ x: 0, y: 0 });
  let interacting = $state(false);

  const pointers = new Map<number, Point>();
  let gesture: Gesture | null = null;
  let lastTap: { point: Point; time: number } | null = null;

  const open = $derived(index !== null);
  const current = $derived(index === null ? null : images[index]);
  const zoomed = $derived(view.scale > 1);
  const counter = $derived(
    index === null
      ? ""
      : copy.counter
          .replace("{current}", String(index + 1))
          .replace("{total}", String(images.length))
  );
  const backdropOpacity = $derived(
    1 - Math.min(MAX_DRAG_FADE, Math.max(0, drag.y) / DRAG_FADE_DISTANCE_PX)
  );

  function contentSize(): Size {
    return { width: image?.offsetWidth ?? 0, height: image?.offsetHeight ?? 0 };
  }

  function viewportSize(): Size {
    return { width: stage?.clientWidth ?? 0, height: stage?.clientHeight ?? 0 };
  }

  function toStage(point: Point): Point {
    const rect = stage?.getBoundingClientRect();
    if (!rect) {
      return { x: 0, y: 0 };
    }
    return { x: point.x - (rect.left + rect.width / 2), y: point.y - (rect.top + rect.height / 2) };
  }

  function resetView() {
    view = IDENTITY;
    drag = { x: 0, y: 0 };
  }

  function show(next: number) {
    index = wrapIndex(next, images.length);
    resetView();
  }

  function go(step: number) {
    if (index !== null && images.length > 1) {
      show(index + step);
    }
  }

  function close() {
    index = null;
    resetView();
  }

  function zoomTo(scale: number, focus: Point = { x: 0, y: 0 }) {
    view = zoomAround(view, scale, focus, contentSize(), viewportSize());
  }

  function toggleZoom(focus: Point = { x: 0, y: 0 }) {
    if (zoomed) {
      view = IDENTITY;
    } else {
      zoomTo(DOUBLE_TAP_ZOOM, focus);
    }
  }

  function pan(dx: number, dy: number) {
    view = clampPan(
      { scale: view.scale, x: view.x + dx, y: view.y + dy },
      contentSize(),
      viewportSize()
    );
  }

  $effect(() => {
    if (!open) {
      return;
    }

    return untrack(openSession);
  });

  function openSession() {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const unlock = lockPageScroll();
    const legend = () => i18nStore.t.gamepad.legend;
    const release = gamepadLayers.push({
      scope: () => root,
      exclusive: true,
      actions: {
        back: { label: () => legend().close, run: close },
        shoulders: { label: () => legend().image, run: (direction) => go(direction) },
        west: { label: () => legend().zoom, run: () => toggleZoom() },
      },
      stick: (x, y, elapsed) => {
        if (view.scale > 1) {
          pan(-x * STICK_PAN_PX_PER_MS * elapsed, -y * STICK_PAN_PX_PER_MS * elapsed);
        }
      },
      stickLabel: () => legend().pan,
    });
    tick().then(() => (nextButton ?? closeButton)?.focus({ preventScroll: true }));
    return () => {
      release();
      unlock();
      pointers.clear();
      gesture = null;
      opener?.focus({ preventScroll: true });
    };
  }

  $effect(() => {
    if (index === null || images.length < 2) {
      return;
    }

    [index - 1, index + 1].forEach((neighbor) => {
      const preload = new Image();
      preload.src = images[wrapIndex(neighbor, images.length)].src;
    });
  });

  $effect(() => {
    const element = stage;
    if (!element) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomTo(
        view.scale * Math.exp(-event.deltaY * WHEEL_ZOOM_FACTOR),
        toStage({ x: event.clientX, y: event.clientY })
      );
    };
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  });

  function beginGesture(onImage: boolean) {
    const [first, second] = Array.from(pointers.values());
    gesture = {
      start: first,
      time: performance.now(),
      origin: view,
      pinchDistance: second ? distance(first, second) : 0,
      pinchCenter: toStage(second ? midpoint(first, second) : first),
      moved: false,
      onImage,
    };
    interacting = true;
  }

  function handlePointerDown(event: PointerEvent) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    try {
      stage?.setPointerCapture(event.pointerId);
    } catch {}
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const onImage = event.target instanceof Node && !!image?.contains(event.target);
    const wasPinching = pointers.size > 1;
    beginGesture(gesture?.onImage ?? onImage);
    if (gesture && wasPinching) {
      gesture.moved = true;
    }
  }

  function handlePointerMove(event: PointerEvent) {
    if (!pointers.has(event.pointerId) || !gesture) {
      return;
    }

    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = Array.from(pointers.values());
    if (points.length >= 2 && gesture.pinchDistance > 0) {
      const center = toStage(midpoint(points[0], points[1]));
      const scaled = zoomAround(
        gesture.origin,
        (gesture.origin.scale * distance(points[0], points[1])) / gesture.pinchDistance,
        gesture.pinchCenter,
        contentSize(),
        viewportSize()
      );
      view = clampPan(
        {
          scale: scaled.scale,
          x: scaled.x + center.x - gesture.pinchCenter.x,
          y: scaled.y + center.y - gesture.pinchCenter.y,
        },
        contentSize(),
        viewportSize()
      );
      gesture.moved = true;
      return;
    }

    const dx = event.clientX - gesture.start.x;
    const dy = event.clientY - gesture.start.y;
    gesture.moved ||= Math.hypot(dx, dy) > TAP_DISTANCE_PX;
    if (!gesture.moved) {
      return;
    }

    if (gesture.origin.scale > 1) {
      view = clampPan(
        { scale: gesture.origin.scale, x: gesture.origin.x + dx, y: gesture.origin.y + dy },
        contentSize(),
        viewportSize()
      );
    } else if (images.length > 1 || dy > 0) {
      drag = { x: images.length > 1 ? dx : 0, y: dy > 0 ? dy : dy * DRAG_UP_RESISTANCE };
    }
  }

  function handleTap(point: Point, onImage: boolean) {
    const now = performance.now();
    if (
      lastTap &&
      now - lastTap.time < DOUBLE_TAP_MS &&
      distance(lastTap.point, point) < DOUBLE_TAP_DISTANCE_PX
    ) {
      lastTap = null;
      toggleZoom(toStage(point));
      return;
    }

    lastTap = { point, time: now };
    if (!onImage && !zoomed) {
      close();
    }
  }

  function handlePointerUp(event: PointerEvent) {
    if (!pointers.has(event.pointerId)) {
      return;
    }

    pointers.delete(event.pointerId);
    if (pointers.size > 0) {
      beginGesture(gesture?.onImage ?? false);
      if (gesture) {
        gesture.moved = true;
      }
      return;
    }

    const finished = gesture;
    gesture = null;
    interacting = false;
    drag = { x: 0, y: 0 };
    if (!finished) {
      return;
    }

    const point = { x: event.clientX, y: event.clientY };
    if (!finished.moved) {
      handleTap(point, finished.onImage);
      return;
    }

    if (finished.origin.scale === 1 && view.scale === 1) {
      const intent = classifySwipe(
        point.x - finished.start.x,
        point.y - finished.start.y,
        performance.now() - finished.time
      );
      if (intent === "close") {
        close();
      } else if (intent) {
        go(intent === "next" ? 1 : -1);
      }
    }
  }

  function handlePointerCancel(event: PointerEvent) {
    pointers.delete(event.pointerId);
    if (pointers.size === 0) {
      gesture = null;
      interacting = false;
      drag = { x: 0, y: 0 };
    }
  }

  function trapFocus(event: KeyboardEvent) {
    const focusable = Array.from(
      root?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? []
    );
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Tab") {
      trapFocus(event);
      return;
    }

    const actions: Record<string, () => void> = {
      Escape: close,
      ArrowRight: () => go(1),
      ArrowLeft: () => go(-1),
      "+": () => zoomTo(view.scale * ZOOM_STEP),
      "=": () => zoomTo(view.scale * ZOOM_STEP),
      "-": () => zoomTo(view.scale / ZOOM_STEP),
      "0": resetView,
    };
    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  }

  function handleResize() {
    if (open) {
      view = clampPan(view, contentSize(), viewportSize());
    }
  }

  const controlClass =
    "grid place-items-center w-9 h-9 rounded-full text-white/90 hover:bg-white/15 hover:text-white active:scale-95 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent";
  const arrowClass =
    "absolute top-1/2 z-10 -translate-y-1/2 grid place-items-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all cursor-pointer";
</script>

<svelte:window onresize={handleResize} />

{#if open && current}
  <div
    bind:this={root}
    class="fixed inset-0 z-[85] flex flex-col text-white overscroll-contain"
    role="dialog"
    aria-modal="true"
    aria-label={copy.label}
    tabindex="-1"
    data-lenis-prevent
    data-testid="image-viewer"
    onkeydown={handleKeydown}
    transition:fade={{ duration: 200 }}
  >
    <div
      class="absolute inset-0 bg-slate-950/92 backdrop-blur-md"
      style:opacity={backdropOpacity}
      aria-hidden="true"
    ></div>

    <div class="relative z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <p
        class="text-sm font-semibold tabular-nums text-white/85"
        aria-live="polite"
        data-testid="viewer-counter"
      >
        {counter}
      </p>
      <div
        class="flex items-center gap-0.5 p-0.5 rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur-md"
      >
        <button
          type="button"
          class={controlClass}
          aria-label={copy.zoomOut}
          title={copy.zoomOut}
          disabled={!zoomed}
          data-testid="viewer-zoom-out"
          onclick={() => zoomTo(view.scale / ZOOM_STEP)}
        >
          <Icon icon="mdi:magnify-minus-outline" class="w-5 h-5" />
        </button>
        <button
          type="button"
          class={controlClass}
          aria-label={copy.zoomIn}
          title={copy.zoomIn}
          disabled={view.scale >= MAX_SCALE}
          data-testid="viewer-zoom-in"
          onclick={() => zoomTo(view.scale * ZOOM_STEP)}
        >
          <Icon icon="mdi:magnify-plus-outline" class="w-5 h-5" />
        </button>
        <button
          bind:this={closeButton}
          type="button"
          class={controlClass}
          aria-label={copy.close}
          title={copy.close}
          data-testid="viewer-close"
          onclick={close}
        >
          <Icon icon="mdi:close" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div
      bind:this={stage}
      class="relative flex-1 min-h-0 flex items-center justify-center px-3 sm:px-20 touch-none select-none overflow-hidden {zoomed
        ? interacting
          ? 'cursor-grabbing'
          : 'cursor-grab'
        : 'cursor-zoom-in'}"
      data-testid="viewer-stage"
      data-scale={view.scale.toFixed(2)}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerCancel}
    >
      {#key index}
        <img
          bind:this={image}
          src={current.src}
          alt={current.alt}
          width="1600"
          height="900"
          draggable="false"
          class="max-w-full max-h-full w-auto h-auto rounded-xl shadow-2xl shadow-black/60 will-change-transform"
          style:transform="translate3d({view.x + drag.x}px, {view.y + drag.y}px, 0) scale({view.scale})"
          style:transition={interacting ? "none" : "transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)"}
          data-testid="viewer-image"
          in:fade={{ duration: 180 }}
        />
      {/key}
    </div>

    {#if images.length > 1}
      <button
        type="button"
        class="{arrowClass} left-2 sm:left-5"
        aria-label={copy.previous}
        title={copy.previous}
        data-testid="viewer-previous"
        onclick={() => go(-1)}
      >
        <Icon icon="mdi:chevron-left" class="w-7 h-7" />
      </button>
      <button
        bind:this={nextButton}
        type="button"
        class="{arrowClass} right-2 sm:right-5"
        aria-label={copy.next}
        title={copy.next}
        data-testid="viewer-next"
        onclick={() => go(1)}
      >
        <Icon icon="mdi:chevron-right" class="w-7 h-7" />
      </button>
    {/if}

    <div class="relative z-10 px-4 pt-3 pb-5 sm:pb-6 text-center">
      <p class="font-semibold" data-testid="viewer-title">{current.title}</p>
      <p class="text-sm text-white/70">{current.text}</p>
      {#if images.length > 1}
        <div class="mt-3 flex justify-center gap-2">
          {#each images as item, itemIndex (item.src)}
            <button
              type="button"
              class="w-16 h-10 sm:w-20 sm:h-12 rounded-lg overflow-hidden ring-2 transition-all cursor-pointer {itemIndex ===
              index
                ? 'ring-sky-400 opacity-100'
                : 'ring-transparent opacity-50 hover:opacity-90'}"
              aria-label={item.title}
              aria-current={itemIndex === index}
              data-testid="viewer-thumbnail"
              onclick={() => show(itemIndex)}
            >
              <img src={item.src} alt="" class="w-full h-full object-cover" draggable="false" />
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
