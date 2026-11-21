import { useQuery } from "@tanstack/react-query";
import {
  getServiceTemplates,
  getServiceTemplateById,
  getCustomServices,
  getCustomServiceById,
} from "../api/serviceTemplate.api.js";

export const useServiceTemplatesQuery = (params = {}) => {
  return useQuery({
    queryKey: ["serviceTemplates", params],
    queryFn: () => getServiceTemplates(params),
    staleTime: 1000 * 60,
  });
};

export const useServiceTemplateDetailsQuery = (id) => {
  return useQuery({
    queryKey: ["serviceTemplate", id],
    queryFn: () => getServiceTemplateById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};

export const useCustomServicesQuery = (params = {}) => {
  return useQuery({
    queryKey: ["customServices", params],
    queryFn: () => getCustomServices(params),
    staleTime: 1000 * 60,
  });
};

export const useCustomServiceDetailsQuery = (id) => {
  return useQuery({
    queryKey: ["customService", id],
    queryFn: () => getCustomServiceById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};
