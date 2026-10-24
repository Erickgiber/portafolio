import { tick } from "svelte";

export type Route = "home" | "rumbo";

type HistoryState = {
  index: number;
  scrollY: number;
  previous: Route | null;
};

type LeaveGuard = () => boolean;

const ROUTE_PATHS: Record<string, Route> = {
  "/": "home",
  "/index.html": "home",
  "/rumbo": "rumbo",
  "/rumbo/": "rumbo",
  "/rumbo/index.html": "rumbo",
};

export function routeFor(pathname: string): Route | null {
  return ROUTE_PATHS[pathname] ?? null;
}

function readState(): HistoryState {
  const state = history.state as Partial<HistoryState> | null;
  return {
    index: typeof state?.index === "number" ? state.index : 0,
    scrollY: typeof state?.scrollY === "number" ? state.scrollY : 0,
    previous: isRoute(state?.previous) ? state.previous : null,
  };
}

function isRoute(value: unknown): value is Route {
  return typeof value === "string" && Object.values(ROUTE_PATHS).includes(value as Route);
}

function jumpTo(top: number) {
  window.scrollTo({ top, behavior: "instant" });
}

function scrollToHash(hash: string, behavior: ScrollBehavior = "auto"): boolean {
  if (!hash) {
    return false;
  }

  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  target?.scrollIntoView({ behavior });
  return target !== null;
}

function afterRender(action: () => void) {
  tick().then(() => requestAnimationFrame(() => requestAnimationFrame(action)));
}

function createRouter() {
  let route = $state<Route>(routeFor(location.pathname) ?? "home");
  let leaveGuard: LeaveGuard | null = null;
  let isStarted = false;

  function rememberScroll() {
    history.replaceState({ ...readState(), scrollY: window.scrollY }, "");
  }

  function canLeave(): boolean {
    return leaveGuard === null || leaveGuard();
  }

  function navigate(href: string) {
    const url = new URL(href, location.href);
    const next = url.origin === location.origin ? routeFor(url.pathname) : null;
    if (next === null) {
      location.href = url.href;
      return;
    }

    if (next === route && url.pathname === location.pathname && url.hash) {
      history.pushState({ index: readState().index + 1, scrollY: 0, previous: route }, "", url.pathname + url.search + url.hash);
      scrollToHash(url.hash);
      return;
    }

    if (!canLeave()) {
      return;
    }

    rememberScroll();
    history.pushState({ index: readState().index + 1, scrollY: 0, previous: route }, "", url.pathname + url.search + url.hash);
    jumpTo(0);
    route = next;
    if (url.hash) {
      afterRender(() => scrollToHash(url.hash, "instant"));
    }
  }

  function back(fallbackHref: string) {
    const target = routeFor(new URL(fallbackHref, location.href).pathname);
    const { index, previous } = readState();
    if (index > 0 && previous !== null && previous === target) {
      history.back();
    } else {
      navigate(fallbackHref);
    }
  }

  function handlePopState() {
    const next = routeFor(location.pathname);
    if (next === null) {
      location.reload();
      return;
    }

    if (next !== route && !canLeave()) {
      history.go(1);
      return;
    }

    const { scrollY } = readState();
    if (next !== route) {
      jumpTo(0);
    }
    route = next;
    afterRender(() => jumpTo(scrollY));
  }

  function handleClick(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const anchor = (event.target as Element | null)?.closest?.("a");
    if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) {
      return;
    }

    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin || routeFor(url.pathname) === null) {
      return;
    }

    if (url.pathname === location.pathname && url.hash) {
      return;
    }

    event.preventDefault();
    navigate(url.href);
  }

  function start() {
    if (isStarted) {
      return;
    }

    isStarted = true;
    history.scrollRestoration = "manual";
    history.replaceState({ ...readState() }, "");
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleClick);
    window.addEventListener("pagehide", rememberScroll);
    const { scrollY } = readState();
    if (scrollY > 0 && !location.hash) {
      afterRender(() => jumpTo(scrollY));
    }
  }

  function guardLeave(guard: LeaveGuard): () => void {
    leaveGuard = guard;
    return () => {
      if (leaveGuard === guard) {
        leaveGuard = null;
      }
    };
  }

  return {
    get route() {
      return route;
    },
    start,
    navigate,
    back,
    guardLeave,
  };
}

export const router = createRouter();
