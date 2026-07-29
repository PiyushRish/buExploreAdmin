import axiosClient from "./axiosClient";

export const getTestimonials = async () => {
  const res = await axiosClient.get("/testimonials/getTestimonials");
  return res.data;
};

export const addTestimonial = async (formData) => {
  const res = await axiosClient.post("/testimonials/createTestimonial", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
  });
  return res.data;
};

export const deleteTestimonial = async (testimonialId) => {
  const res = await axiosClient.delete(`/testimonials/deleteTestimonial/${testimonialId}`);
  return res.data;
};