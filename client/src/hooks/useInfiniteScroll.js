import { useCallback, useRef } from 'react';

export function useInfiniteScroll(onLoadMore, { hasMore, isLoading }) {
  const observer = useRef(null);

  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore]
  );

  return { lastElementRef };
}
