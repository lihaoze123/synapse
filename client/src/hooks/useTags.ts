import { useQuery } from "@tanstack/react-query";
import { tagsService } from "../services/tags";

export function usePopularTags(limit = 10) {
	return useQuery({
		queryKey: ["tags", "popular", limit],
		queryFn: () => tagsService.getPopularTags(limit),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useAllTags(enabled = true) {
	return useQuery({
		queryKey: ["tags", "all"],
		queryFn: () => tagsService.getAllTags(),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled,
	});
}
