import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ComposeCard, Feed } from "@/components/feed";
import { Layout } from "@/components/layout";
import { type PublishData, PublishModal } from "@/components/publish";
import { useAuth, useCreatePost, usePosts } from "@/hooks";
import type { PostType } from "@/types";

interface SearchParams {
	tag?: string;
	type?: PostType;
}

export const Route = createFileRoute("/")({
	component: HomePage,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			tag: typeof search.tag === "string" ? search.tag : undefined,
			type:
				typeof search.type === "string" &&
				["SNIPPET", "ARTICLE", "MOMENT"].includes(search.type)
					? (search.type as PostType)
					: undefined,
		};
	},
	staticData: {
		breadcrumb: {
			label: "首页",
		},
	},
});

function HomePage() {
	const { user } = useAuth();
	const search = useSearch({ from: "/" });
	const [publishOpen, setPublishOpen] = useState(false);
	const [publishType, setPublishType] = useState<PostType>("MOMENT");

	const {
		data,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		error,
	} = usePosts({
		tag: search.tag,
		type: search.type,
	});

	const createPost = useCreatePost();

	const posts = useMemo(() => {
		return data?.pages.flatMap((page) => page.content) ?? [];
	}, [data]);

	const handleCompose = (type: PostType) => {
		setPublishType(type);
		setPublishOpen(true);
	};

	const handlePublish = async (data: PublishData) => {
		try {
			await createPost.mutateAsync({
				type: data.type,
				title: data.title || undefined,
				content: data.content,
				language: data.language || undefined,
				coverImage: data.coverImage || undefined,
				images: data.images && data.images.length > 0 ? data.images : undefined,
				tags: data.tags.length > 0 ? data.tags : undefined,
			});
			setPublishOpen(false);
		} catch {}
	};

	const getEmptyMessage = () => {
		if (search.tag && search.type) {
			return `没有找到标签为 "${search.tag}" 且类型为 "${search.type}" 的内容`;
		}
		if (search.tag) {
			return `没有找到标签为 "${search.tag}" 的内容`;
		}
		if (search.type) {
			const typeLabels: Record<PostType, string> = {
				SNIPPET: "代码片段",
				ARTICLE: "文章",
				MOMENT: "动态",
			};
			return `没有找到类型为 "${typeLabels[search.type]}" 的内容`;
		}
		return "还没有任何内容，成为第一个发布者吧！";
	};

	return (
		<Layout>
			<div className="space-y-4">
				{(search.tag || search.type) && (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span>筛选:</span>
						{search.tag && (
							<span className="px-2 py-0.5 bg-secondary rounded-full">
								#{search.tag}
							</span>
						)}
						{search.type && (
							<span className="px-2 py-0.5 bg-secondary rounded-full">
								{search.type === "SNIPPET" && "代码片段"}
								{search.type === "ARTICLE" && "文章"}
								{search.type === "MOMENT" && "动态"}
							</span>
						)}
					</div>
				)}

				{user && <ComposeCard onCompose={handleCompose} />}

				{error && (
					<div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
						加载失败：{error.message}
					</div>
				)}

				<Feed
					posts={posts}
					isLoading={isLoading}
					isFetchingNextPage={isFetchingNextPage}
					hasNextPage={hasNextPage}
					fetchNextPage={fetchNextPage}
					emptyMessage={getEmptyMessage()}
				/>
			</div>

			<PublishModal
				open={publishOpen}
				onOpenChange={setPublishOpen}
				initialType={publishType}
				onPublish={handlePublish}
				isPublishing={createPost.isPending}
				error={createPost.error?.message}
			/>
		</Layout>
	);
}
