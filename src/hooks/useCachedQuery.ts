import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "convex/react";
import { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";

export function useCachedQuery<Q extends FunctionReference<"query">>(
  query: Q,
  args: FunctionArgs<Q>,
  cacheKey: string
): FunctionReturnType<Q> | undefined {
  const live = (useQuery as any)(query, args) as FunctionReturnType<Q> | undefined;
  const [cached, setCached] = useState<FunctionReturnType<Q> | undefined>(undefined);
  const storageKey = `fitpulse:cache:${cacheKey}`;

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (alive) setCached(raw ? JSON.parse(raw) : undefined);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (live !== undefined) {
      AsyncStorage.setItem(storageKey, JSON.stringify(live)).catch(() => {});
    }
  }, [live, storageKey]);

  return live !== undefined ? live : cached;
}