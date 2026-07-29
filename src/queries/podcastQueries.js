import { useQuery } from "@tanstack/react-query";
import { getPodcasts } from "../api/podcast.api.js";

export const usePodcastsQuery = () => {
  return useQuery({
    queryKey: ["podcasts"],
    queryFn: getPodcasts,
  });
};
