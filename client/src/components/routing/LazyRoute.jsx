import { Suspense } from 'react';
import PageLoader from '../PageLoader';

export default function LazyRoute({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}
