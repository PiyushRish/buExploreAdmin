import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTestimonial } from "../api/testimonial.api";
// import { deletePlace, addPlace,updatePlace } from "../api/places.api.js";
export const useCreateTestimonialMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => addTestimonial(formData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
//    \
    },

    onError: (error) => {
      console.error("Testimonial creation failed:", error);
    },
  });
};
