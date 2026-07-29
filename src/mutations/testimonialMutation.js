import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTestimonial, deleteTestimonial } from "../api/testimonial.api";

export const useCreateTestimonialMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => addTestimonial(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
};

export const useDeleteTestimonialMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testimonialId) => deleteTestimonial(testimonialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
};