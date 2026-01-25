// import { use } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addGuide } from "../api/guide.api";


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

}

export const useDeleteGuideMutation = () =>{

}
    