import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createServiceTemplate,
  updateServiceTemplate,
  deleteServiceTemplate,
  seedDefaultTemplates,
  createCustomService,
  updateCustomService,
  deleteCustomService,
} from "../api/serviceTemplate.api.js";

export const useCreateServiceTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createServiceTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceTemplates"] });
    },
  });
};

export const useUpdateServiceTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateServiceTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["serviceTemplate"] });
    },
  });
};

export const useDeleteServiceTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteServiceTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceTemplates"] });
    },
  });
};

export const useSeedDefaultTemplatesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => seedDefaultTemplates(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceTemplates"] });
    },
  });
};

export const useCreateCustomServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createCustomService(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customServices"] });
    },
  });
};

export const useUpdateCustomServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateCustomService(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customServices"] });
      queryClient.invalidateQueries({ queryKey: ["customService"] });
    },
  });
};

export const useDeleteCustomServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCustomService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customServices"] });
    },
  });
};
