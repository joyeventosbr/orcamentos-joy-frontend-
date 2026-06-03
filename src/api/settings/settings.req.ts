import { apiClient } from "@/src/api/client";
import { API_ENDPOINTS } from "@/src/api/endpoints";
import { SETTING_KEY_TAX_NF, Setting, UpdateSettingRequest } from "@/src/types/api.types";

export const settingsReq = {
  getTaxNf: () =>
    apiClient
      .get<Setting>(API_ENDPOINTS.settings.byKey(SETTING_KEY_TAX_NF))
      .then((r) => r.data),

  update: (id: string, body: UpdateSettingRequest) =>
    apiClient
      .patch<Setting>(API_ENDPOINTS.settings.update(id), body)
      .then((r) => r.data),
};
