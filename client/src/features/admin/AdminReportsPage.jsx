import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetReportsQuery, useUpdateReportMutation } from '@/api/adminApi';

const STATUS_OPTIONS = ['', 'open', 'in_progress', 'resolved', 'dismissed'];
const STATUS_LABELS = { '': 'All', open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', dismissed: 'Dismissed' };
const STATUS_COLORS = {
  open: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-green-700',
  dismissed: 'bg-gray-100 text-gray-600',
};

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError } = useGetReportsQuery({ page, limit, status: statusFilter });
  const reports = data?.data?.reports || data?.data || [];
  const totalPages = data?.data?.totalPages || 1;

  const [updateReport] = useUpdateReportMutation();

  const handleStatusChange = async (reportId, newStatus) => {
    try { await updateReport({ reportId, status: newStatus }).unwrap(); } catch {}
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Reports</h1>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              statusFilter === status
                ? 'bg-violet-100 border-violet-300 text-violet-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Reports list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-8 text-gray-500">Failed to load reports.</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No reports found.</div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report._id} className="p-4 border-0 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {report.subject || report.reason || 'Report'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {report.description || report.details || '—'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-600'}`}>
                      {report.status || 'open'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  <select
                    value={report.status || 'open'}
                    onChange={(e) => handleStatusChange(report._id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
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
