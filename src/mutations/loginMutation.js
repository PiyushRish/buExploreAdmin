import { useMutation } from "@tanstack/react-query";
import { login } from "../api/login.api";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (credentials) => login(credentials),
    onError: (error) => {
      console.error("[AUTH] Login mutation failed:", error);
    },
  });
};