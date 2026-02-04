export default function Dashboard() {
  const stats = [
    { label: 'Total Tenants', value: '5', icon: '🏢', color: 'bg-blue-500' },
    { label: 'Active Orders', value: '23', icon: '📦', color: 'bg-green-500' },
    { label: 'Revenue', value: 'Rp 2.5M', icon: '💰', color: 'bg-purple-500' },
    { label: 'Users', value: '12', icon: '👥', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back! 👋</h2>
          <p className="text-slate-600">Here's an overview of your POS system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`${stat.color} h-2`}></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="text-4xl">✅</div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Login System Active</h3>
              <p className="text-slate-600 mb-2">Your admin dashboard is fully connected to Supabase authentication.</p>
              <div className="flex gap-4">
                <div className="text-sm">
                  <span className="text-green-600 font-semibold">✓</span> Real Supabase Auth
                </div>
                <div className="text-sm">
                  <span className="text-green-600 font-semibold">✓</span> Protected Routes
                </div>
                <div className="text-sm">
                  <span className="text-green-600 font-semibold">✓</span> Session Management
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
