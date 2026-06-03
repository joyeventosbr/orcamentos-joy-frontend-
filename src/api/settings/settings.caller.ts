import { UpdateSettingRequest } from "@/src/types/api.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "./settings.keys";
import { settingsReq } from "./settings.req";

export function useTaxNfSettingQuery() {
  return useQuery({
    queryKey: settingsKeys.queries.taxNf,
    queryFn: settingsReq.getTaxNf,
  });
}

export function useUpdateTaxNfSettingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: settingsKeys.mutations.updateTaxNf,
    mutationFn: ({ id, body }: { id: string; body: UpdateSettingRequest }) =>
      settingsReq.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.queries.taxNf });
    },
  });
}
