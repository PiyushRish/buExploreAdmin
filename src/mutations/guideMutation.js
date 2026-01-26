// import { use } from "react"

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addGuide,updateGuide,deleteGuide } from "../api/guide.api";


export const useAddGuideMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData) => addGuide(formData),

        onSuccess: () => {
          // Refresh all relevant place queries
          queryClient.invalidateQueries({ queryKey: ["guides"] });  
        },

        onError: (error) => {
            console.error("Guide addition failed:", error);
        },
    }); 

}
export const useUpdateGuideMutation = () =>{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({guideId, formData}) => updateGuide(guideId, formData),    
        onSuccess: () => {
          // Refresh all relevant place queries
          queryClient.invalidateQueries({ queryKey: ["guides"] });  
        },
        onError: (error) => {
            console.error("Guide update failed:", error);
        },
    });

}

export const useDeleteGuideMutation = () =>{
    const queryClient = useQueryClient();   
    return useMutation({
        mutationFn: (guideId) => deleteGuide(guideId),  
        onSuccess: () => {
          // Refresh all relevant place queries
          queryClient.invalidateQueries({ queryKey: ["guides"] });  
        },
        onError: (error) => {
            console.error("Guide deletion failed:", error);
        },
    });

}
    