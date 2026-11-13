"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** false pendant le rendu serveur et la première hydratation, true ensuite */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
