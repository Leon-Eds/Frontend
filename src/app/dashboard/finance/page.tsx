import { Banknote, TrendingUp, ArrowDownCircle, ArrowUpCircle, PieChart } from "lucide-react";

export default function FinancialsPage() {

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      {/* Header */}
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-[#053d26] mb-3">Financials</h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          Track fee collections, monitor outstanding balances, and generate financial reports for your institution.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Total Revenue</p>
          <div className="text-4xl font-bold text-[#053d26] mb-2">₦24.8M</div>
          <p className="text-xs text-[#20c997] font-semibold flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +12% from last term
          </p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Fees Collected</p>
          <div className="text-4xl font-bold text-[#053d26] mb-2">₦18.2M</div>
          <div className="flex items-center gap-1 mt-2">
            <ArrowDownCircle className="h-4 w-4 text-[#053d26]" />
            <span className="text-xs text-gray-500">73% collection rate</span>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Outstanding</p>
          <div className="text-4xl font-bold text-[#b05e1c] mb-2">₦6.6M</div>
          <p className="text-xs text-[#c92a2a] font-semibold">284 students pending</p>
        </div>
        <div className="bg-[#053d26] rounded-3xl p-8 shadow-sm text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-green-200 mb-4">Expenses</p>
          <div className="text-4xl font-bold mb-2">₦9.1M</div>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpCircle className="h-4 w-4 text-green-200" />
            <span className="text-xs text-green-200">Salaries, supplies, utilities</span>
          </div>
        </div>
      </div>

      {/* Coming Soon Feature */}
      <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-gray-100 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 text-[#b05e1c] flex items-center justify-center mb-6">
          <PieChart className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Financial Analytics Coming Soon</h2>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          Detailed breakdowns by class, payment method analysis, and predictive revenue models are being built for the next release.
        </p>
        <div className="flex justify-center gap-3 mt-8">
          <span className="px-4 py-2 rounded-full bg-green-100 text-[#053d26] text-xs font-bold">Fee Schedules</span>
          <span className="px-4 py-2 rounded-full bg-green-100 text-[#053d26] text-xs font-bold">Payment Tracking</span>
          <span className="px-4 py-2 rounded-full bg-orange-100 text-[#b05e1c] text-xs font-bold">In Progress</span>
        </div>
      </div>
    </div>
  );
}
