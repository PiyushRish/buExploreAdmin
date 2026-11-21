import { useMutation, useQueryClient } from "@tanstack/react-query";
import { takeReportAction } from "../api/report.api.js";

export const useTakeReportActionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => takeReportAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["reportStats"] });
    },
  });
};
