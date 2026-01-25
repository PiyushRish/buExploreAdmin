import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addHotel } from "../api/hotel.api";
// import { createAds } from "../api/ads.api";

export const useAddHotelMutation = () => {
  // CORRECT: Use useQueryClient to get the client instance
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => addHotel(formData),

    onSuccess: () => {
      // Invalidate the "ads" query so the list refreshes automatically
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
    },
    
    onError: (error) => {
      console.error("Create ad failed:", error);
    },
  });
};


export const useUpdateHotelMutation = () =>{

}
export const useDeleteHotelMutation = () =>{
  
}