import axiosClient from "./axiosClient";

export const getTestimonials = async () => {
  const res = await axiosClient.get("/testimonials/getTestimonials");
  return res.data;
};

export const addTestimonial = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await axiosClient.post("/testimonials/createTestimonial", data, {
    ...(isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    timeout: 60000,
  });
  return res.data;
};

export const deleteTestimonial = async (testimonialId) => {
  const res = await axiosClient.delete(`/testimonials/deleteTestimonial/${testimonialId}`);
  return res.data;
};