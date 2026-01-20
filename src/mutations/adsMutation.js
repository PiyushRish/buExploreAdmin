import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAds } from "../api/ads.api";

export const useCreateAdMutation = () => {
  // CORRECT: Use useQueryClient to get the client instance
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => createAds(formData),

    onSuccess: () => {
      // Invalidate the "ads" query so the list refreshes automatically
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },

    onError: (error) => {
      console.error("Create ad failed:", error);
    },
  });
};


export const useUpdateAdMutation = () =>{

}
export const useDeleteAdMutation = () =>{
  
}