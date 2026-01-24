

import { useQuery } from "@tanstack/react-query";

// import { getAds } from "../api/ads.api";
import { getTestimonials } from "../api/testimonial.api";

export const useTestimonialsQuery = () => {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: getTestimonials,
    staleTime: 1000 * 60, // optional
  });
};
