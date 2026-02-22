export default function LoadMoreIndicator({ hasMore, isLoadingMore }) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center py-3 text-gray-400 text-xs italic">
      {isLoadingMore ? "Loading older messages..." : "Scroll up to load more"}
    </div>
  );
}
