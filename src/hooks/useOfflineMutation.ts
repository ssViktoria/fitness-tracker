import { useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useConvex } from "convex/react";
import {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
  getFunctionName,
} from "convex/server";
import { enqueue } from "../utils/offlineQueue";
import { isOnline } from "./useOfflineSync";

type Result<M extends FunctionReference<"mutation">> =
  | { queued: false; result: FunctionReturnType<M> }
  | { queued: true; result: undefined };

export function useOfflineMutation<M extends FunctionReference<"mutation">>(ref: M) {
  const convex = useConvex();

  return useCallback(
    async (args: FunctionArgs<M>): Promise<Result<M>> => {
      const state = await NetInfo.fetch();
      if (isOnline(state)) {
        const result = await (convex as any).mutation(ref, args);
        return { queued: false, result };
      }
      await enqueue(getFunctionName(ref), args as Record<string, unknown>);
      return { queued: true, result: undefined };
    },
    [convex, ref]
  );
}