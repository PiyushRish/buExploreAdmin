

    import axiosClient from "./axiosClient";

    export const addTestimonial = async (formData) => {
    const res = await axiosClient.post(
        "/testimonials/createTestimonial",
        formData,
        { headers: {
        "Content-Type": "multipart/form-data", // Most libraries set this automatically if you pass formData
        },timeout: 60000 }   // optional but useful for videos
    );
    return res.data;
    };


    export const getTestimonials = async () => {
      const res = await axiosClient.get("/testimonials/getTestimonials");
      return res.data;
    };