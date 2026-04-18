import {
  type DailyGuidanceRequest,
  type DailyGuidanceResponse,
  dailyGuidanceRequestSchema,
  dailyGuidanceResponseSchema,
  type TransactionSimulationInput,
  transactionSimulationSchema
} from "@gama/schemas";
import type { Database } from "@gama/supabase-types";

export type GamaFunctionName = "daily-guidance" | "simulate-transaction";

export type EdgePayload = Record<string, unknown>;

export type EdgeInvoker = <TResponse>(name: GamaFunctionName, payload: EdgePayload) => Promise<TResponse>;

export type GamaApiClient = {
  getDailyGuidance(input: DailyGuidanceRequest): Promise<DailyGuidanceResponse>;
  simulateTransaction(input: TransactionSimulationInput): Promise<{ accepted: true }>;
};

export type SupabaseSchemaName = keyof Database;

export function createGamaApiClient(invoke: EdgeInvoker): GamaApiClient {
  return {
    async getDailyGuidance(input) {
      const payload = dailyGuidanceRequestSchema.parse(input);
      const response = await invoke<DailyGuidanceResponse>("daily-guidance", payload);
      return dailyGuidanceResponseSchema.parse(response);
    },
    async simulateTransaction(input) {
      const payload = transactionSimulationSchema.parse(input);
      await invoke("simulate-transaction", payload);
      return { accepted: true as const };
    }
  };
}
