import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useConvex, useConvexAuth } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { useNetInfo } from "@react-native-community/netinfo";
import {
  MAX_ATTEMPTS,
  bumpAttempts,
  getQueue,
  removeOp,
  subscribe,
} from "../utils/offlineQueue";

type NetLike = { isConnected: boolean | null; isInternetReachable: boolean | null };

export const isOnline = (s: NetLike) =>
  s.isConnected !== false && s.isInternetReachable !== false;

type OfflineState = {
  online: boolean;
  pending: number;
  syncing: boolean;
  flush: () => Promise<void>;
};

const OfflineContext = createContext<OfflineState>({
  online: true,
  pending: 0,
  syncing: false,
  flush: async () => {},
});

export const useOfflineSync = () => useContext(OfflineContext);

const RETRY_MS = 30_000;
export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const convex = useConvex();
  const { isAuthenticated } = useConvexAuth();
  const net = useNetInfo();
  const online = isOnline(net);

  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    getQueue().then((q) => setPending(q.length));
    return subscribe(setPending);
  }, []);

  const flush = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setSyncing(true);
    try {
      const queue = await getQueue();
      for (const op of queue) {
        try {
          await (convex as any).mutation(makeFunctionReference<"mutation">(op.fn), op.args);
          await removeOp(op.id);
        } catch {
          await bumpAttempts(op.id);
          if (op.attempts + 1 >= MAX_ATTEMPTS) {
            await removeOp(op.id);
            continue;
          }
          break;
        }
      }
    } finally {
      busy.current = false;
      setSyncing(false);
    }
  }, [convex]);
  useEffect(() => {
    if (online && isAuthenticated && pending > 0) flush();
  }, [online, isAuthenticated, pending, flush]);
  useEffect(() => {
    if (!online || !isAuthenticated || pending === 0) return;
    const id = setInterval(flush, RETRY_MS);
    return () => clearInterval(id);
  }, [online, isAuthenticated, pending, flush]);

  const value = useMemo(
    () => ({ online, pending, syncing, flush }),
    [online, pending, syncing, flush]
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}