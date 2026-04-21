'use client';

import { useEffect, useState } from 'react';

export default function SupportManagement() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/support');
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching support requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        fetchRequests();
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedRequest) return;
    
    try {
      const response = await fetch(`/api/support/${selectedRequest.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchRequests();
        setSelectedRequest(null);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(req => req.status === filter);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (newFilter: 'all' | 'pending' | 'in-progress' | 'resolved') => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'resolved':
        return 'bg-green-50 text-green-700 border-green-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-playfair font-medium text-zinc-900 tracking-tight">Support Requests</h1>
          <p className="text-zinc-500 mt-2 text-sm font-light uppercase tracking-widest">CUSTOMER SUPPORT MANAGEMENT</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value as any)}
            className="border border-zinc-200 px-4 py-2 text-xs rounded-sm focus:outline-none focus:border-black"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-400 animate-pulse uppercase text-xs tracking-widest font-light">
          Loading support requests...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-20 text-zinc-400 uppercase text-xs tracking-widest font-light">
          No support requests found.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-sm border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-zinc-900">{request.name}</h3>
                      <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-bold rounded-full uppercase tracking-widest border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mb-1">{request.email}</p>
                    {request.phone && <p className="text-sm text-zinc-500">{request.phone}</p>}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {new Date(request.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-zinc-900 mb-1">{request.subject}</p>
                  <p className="text-sm text-zinc-600 line-clamp-2">{request.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Contact: </span>
                  <span className="text-xs font-medium text-zinc-900 capitalize">{request.contact_method}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-200">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-zinc-200 rounded-sm hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs text-zinc-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-zinc-200 rounded-sm hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
        </>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 mb-2">{selectedRequest.subject}</h2>
                  <p className="text-sm text-zinc-500">Request from {selectedRequest.name}</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Name</p>
                  <p className="text-sm font-medium text-zinc-900">{selectedRequest.name}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-sm font-medium text-zinc-900">{selectedRequest.email}</p>
                </div>
                {selectedRequest.phone && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-sm font-medium text-zinc-900">{selectedRequest.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Contact Method</p>
                  <p className="text-sm font-medium text-zinc-900 capitalize">{selectedRequest.contact_method}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Message</p>
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{selectedRequest.message}</p>
              </div>

              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Status</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'pending')}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm border ${
                      selectedRequest.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'border-zinc-200 text-zinc-600 hover:border-black'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'in-progress')}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm border ${
                      selectedRequest.status === 'in-progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'border-zinc-200 text-zinc-600 hover:border-black'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'resolved')}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm border ${
                      selectedRequest.status === 'resolved'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'border-zinc-200 text-zinc-600 hover:border-black'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200">
                <button
                  onClick={() => handleDelete(selectedRequest.id)}
                  className="text-xs font-bold text-red-600 hover:text-red-800 uppercase tracking-widest"
                >
                  Delete Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-zinc-200">
              <h2 className="text-xl font-bold text-zinc-900">Delete Request</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-zinc-700 mb-6">
                Are you sure you want to delete this support request? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-zinc-200 rounded-sm hover:border-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
