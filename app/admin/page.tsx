export default async function AdminDashboard() {
  const orders = [
    { id: 'ord_1001', customer: 'John Doe', status: 'Paid', amount: 35, date: '2026-04-05', item: 'Essential Cotton T-Shirt' },
    { id: 'ord_1002', customer: 'Jane Smith', status: 'Pending', amount: 65, date: '2026-04-04', item: 'Minimalist Hoodie' }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto flex-grow w-full">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-playfair font-medium text-zinc-900 tracking-tight">Admin Console</h1>
          <p className="text-zinc-500 mt-2">Manage orders, customers, and payments securely.</p>
        </div>
        <div className="text-xs uppercase tracking-widest font-bold bg-zinc-100 text-zinc-500 px-3 py-1 rounded-sm">
          Protected Route
        </div>
      </div>
      
      <div className="bg-white rounded-sm border border-zinc-200 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Order ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Item</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 font-mono">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700">{order.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{order.item}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">${order.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-sm uppercase tracking-wider ${
                    order.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
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
