import { addRestaurant } from "../api/restaurant.api";
import { useQueryClient,useMutation } from "@tanstack/react-query";

export const useAddRestaurantMutation = () => {
     const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => addRestaurant(formData),

    onSuccess: () => {
      // Refresh all relevant place queries
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
     
    },

    onError: (error) => {
      console.error("Hotel addition failed:", error);
    },
  });
   
}

export const useUpdateRestaurantMutation = () => {

}

export const useDeleteRestaurantMutation = () => {

}


