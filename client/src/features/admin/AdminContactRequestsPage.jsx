import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetContactRequestsQuery, useApproveContactRequestMutation } from '@/api/adminApi';

export default function AdminContactRequestsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError } = useGetContactRequestsQuery({ page, limit });
  const requests = data?.data?.contactRequests || data?.data || [];
  const totalPages = data?.data?.totalPages || 1;

  const [approveRequest, { isLoading: isApproving }] = useApproveContactRequestMutation();

  const handleApprove = async (requestId) => {
    try { await approveRequest(requestId).unwrap(); } catch {}
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Contact Requests</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-8 text-gray-500">Failed to load contact requests.</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No pending contact requests.</div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req._id} className="p-4 border-0 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {req.fromUser?.username || req.from?.username || 'User'} → {req.toUser?.username || req.to?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {req.message || 'No message'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-50 text-yellow-700">
                      {req.status || 'pending'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleApprove(req._id)}
                  disabled={isApproving || req.status === 'approved'}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
