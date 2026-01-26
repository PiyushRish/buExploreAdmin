import axiosClient from "./axiosClient";

export const getGuides = async () => {
  const res = await axiosClient.get("/services/guides"); // ← change endpoint
  return res.data;
};


export const addGuide = async (guideData) => {
  const res = await axiosClient.post("/services/createGuide", guideData, {
    headers: {  
      "Content-Type": "multipart/form-data",  
    },
  });
  return res.data;
}


export const updateGuide = async (guideId, guideData) => {
  const res = await axiosClient.patch(`/services/updateGuide/${guideId}`, guideData, {
    headers: {  
      "Content-Type": "multipart/form-data",  
    },
  });
  return res.data;
}

export const deleteGuide = async (guideId) => {
  const res = await axiosClient.delete(`/services/deleteGuide/${guideId}`);
  return res.data;
} 