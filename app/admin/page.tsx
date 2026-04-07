'use client';

import { useEffect, useState } from 'react';
import DiscountManagement from '@/components/DiscountManagement';
import SaleManagement from '@/components/SaleManagement';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'discounts' | 'sales'>('orders');

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.data);
          setFilteredOrders(data.data);
        }
      })
      .catch(err => console.error("Admin data fetch error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const handleSearch = () => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter(order => {
      const referenceId = `#${order.stripeSessionId.slice(-8).toUpperCase()}`;
      return (
        referenceId.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term)
      );
    });
    setFilteredOrders(filtered);
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilteredOrders(orders);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'discounts':
        return <DiscountManagement />;
      case 'sales':
        return <SaleManagement />;
      default:
        return (
          <div>
            <div className="flex justify-between items-end mb-10">
              <div>
                <h1 className="text-3xl font-playfair font-medium text-zinc-900 tracking-tight">Admin Console</h1>
                <p className="text-zinc-500 mt-2 text-sm font-light uppercase tracking-widest">REAL-TIME ORDER MANAGEMENT</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Reference ID or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-zinc-200 px-4 py-2 text-xs rounded-sm focus:outline-none focus:border-black w-64 shadow-sm"
                />
                <button
                  onClick={handleSearch}
                  className="bg-black text-white px-6 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-zinc-800 transition-colors rounded-sm shadow-sm"
                >
                  Search
                </button>
                {searchTerm && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-[10px] uppercase font-bold tracking-widest text-zinc-400 hover:text-black transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-sm border border-zinc-200 overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reference ID</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Details</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-zinc-400 animate-pulse uppercase text-xs tracking-widest font-light">
                        Querying Database...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-zinc-400 uppercase text-xs tracking-widest font-light">
                        No orders found.
                      </td>
                    </tr>
                  ) : filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-900 font-mono font-bold">
                            #{order.stripeSessionId.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-[9px] text-zinc-400 uppercase tracking-tighter">Order Reference</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-900 uppercase tracking-tight">{order.customerName}</span>
                          <span className="text-[10px] text-zinc-500 font-light">{order.customerEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded-sm">
                                {item.quantity}x
                              </span>
                              <span className="text-[10px] text-zinc-500 font-light truncate max-w-[150px]">
                                {item.description || item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-zinc-900">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2.5 py-1 inline-flex text-[10px] leading-5 font-bold rounded-full bg-green-50 text-green-700 uppercase tracking-widest border border-green-100 shadow-sm">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex-grow w-full">
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 bg-zinc-100 p-1 rounded-sm w-fit">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2 text-xs uppercase font-bold tracking-widest transition-colors rounded-sm ${
            activeTab === 'orders'
              ? 'bg-white text-black shadow-sm'
              : 'text-zinc-500 hover:text-black'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('discounts')}
          className={`px-6 py-2 text-xs uppercase font-bold tracking-widest transition-colors rounded-sm ${
            activeTab === 'discounts'
              ? 'bg-white text-black shadow-sm'
              : 'text-zinc-500 hover:text-black'
          }`}
        >
          Discounts
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-6 py-2 text-xs uppercase font-bold tracking-widest transition-colors rounded-sm ${
            activeTab === 'sales'
              ? 'bg-white text-black shadow-sm'
              : 'text-zinc-500 hover:text-black'
          }`}
        >
          Sales
        </button>
      </div>

      {/* Tab Content */}
      {renderContent()}
    </div>
  );
}
