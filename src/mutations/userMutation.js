import { useMutation, useQueryClient } from "@tanstack/react-query";
import { softDeleteUser, restoreUser } from "../api/user.api";

export const useSoftDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: softDeleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useRestoreUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
