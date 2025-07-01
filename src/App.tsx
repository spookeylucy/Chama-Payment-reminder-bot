import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  MessageSquare,
  Download,
  RefreshCw,
  Plus,
  UserPlus,
  X,
  Phone,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface Member {
  id: number;
  name: string;
  phone_number: string;
  has_paid: boolean;
  total_paid: number;
  created_at: string;
}

interface BalanceReport {
  summary: {
    total_members: number;
    paid_members: number;
    unpaid_members: number;
    total_collected: number;
    expected_total: number;
    collection_percentage: number;
  };
  recent_payments: Array<{
    member_name: string;
    amount: number;
    date: string;
  }>;
}

interface Reminder {
  id: number;
  name: string;
  phone_number: string;
  days_since_created: number;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState<Member[]>([]);
  const [balanceReport, setBalanceReport] = useState<BalanceReport | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  
  // Form states
  const [newMember, setNewMember] = useState({ name: '', phone_number: '' });
  const [markPaidForm, setMarkPaidForm] = useState({ member_id: '', amount: 1000 });

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMembers(),
        loadBalanceReport(),
        loadReminders()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/members`);
      setMembers(response.data.members);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const loadBalanceReport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/balance-report`);
      setBalanceReport(response.data);
    } catch (error) {
      console.error('Error loading balance report:', error);
    }
  };

  const loadReminders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reminders`);
      setReminders(response.data.reminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMemberLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/add-member`, newMember);
      setNewMember({ name: '', phone_number: '' });
      setShowAddMember(false);
      await loadDashboardData();
      alert('Member added successfully!');
    } catch (error: any) {
      console.error('Error adding member:', error);
      const errorMessage = error.response?.data?.error || 'Error adding member. Please try again.';
      alert(errorMessage);
    } finally {
      setAddMemberLoading(false);
    }
  };

  const markAsPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/mark-paid`, {
        member_id: parseInt(markPaidForm.member_id),
        amount: markPaidForm.amount
      });
      setMarkPaidForm({ member_id: '', amount: 1000 });
      await loadDashboardData();
      alert('Payment recorded successfully!');
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Error marking member as paid. Please try again.');
    }
  };

  const downloadReport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/generate-report`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chama_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report. Please try again.');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: any) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl" style={{ backgroundColor: color + '15' }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {trend && (
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">{trend}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  const MemberCard = ({ member }: { member: Member }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{member.name}</h3>
            <div className="flex items-center space-x-1 text-gray-500">
              <Phone className="w-3 h-3" />
              <span className="text-sm">{member.phone_number}</span>
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          member.has_paid
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {member.has_paid ? 'Paid' : 'Pending'}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="font-bold text-lg text-gray-900">KSh {member.total_paid.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Joined</p>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-sm text-gray-600">
              {new Date(member.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Chama Manager
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">WhatsApp Payment Tracker</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={downloadReport}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Report</span>
                <span className="sm:hidden">Report</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'reminders', label: 'Reminders', icon: AlertCircle },
              { id: 'payments', label: 'Payments', icon: CheckCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-4 text-sm font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 lg:space-y-8">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Welcome to Your Chama Dashboard
              </h2>
              <p className="text-gray-600 text-lg">
                Track payments, manage members, and stay organized
              </p>
            </div>

            {/* Stats Grid */}
            {balanceReport && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard
                  title="Total Members"
                  value={balanceReport.summary.total_members}
                  icon={Users}
                  color="#3B82F6"
                  trend="+12% this month"
                />
                <StatCard
                  title="Paid Members"
                  value={balanceReport.summary.paid_members}
                  icon={CheckCircle}
                  color="#10B981"
                  subtitle={`${balanceReport.summary.collection_percentage.toFixed(1)}% completion`}
                />
                <StatCard
                  title="Pending Payments"
                  value={balanceReport.summary.unpaid_members}
                  icon={AlertCircle}
                  color="#F59E0B"
                  subtitle="Need reminders"
                />
                <StatCard
                  title="Total Collected"
                  value={`KSh ${balanceReport.summary.total_collected.toLocaleString()}`}
                  icon={DollarSign}
                  color="#8B5CF6"
                  subtitle={`of KSh ${balanceReport.summary.expected_total.toLocaleString()} target`}
                />
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <button
                onClick={() => setShowAddMember(true)}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <UserPlus className="w-8 h-8 mb-3" />
                <h3 className="font-semibold text-lg mb-1">Add Member</h3>
                <p className="text-blue-100 text-sm">Register a new chama member</p>
              </button>
              
              <button
                onClick={() => setActiveTab('reminders')}
                className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <AlertCircle className="w-8 h-8 mb-3" />
                <h3 className="font-semibold text-lg mb-1">Send Reminders</h3>
                <p className="text-orange-100 text-sm">{reminders.length} pending reminders</p>
              </button>
              
              <button
                onClick={downloadReport}
                className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <FileText className="w-8 h-8 mb-3" />
                <h3 className="font-semibold text-lg mb-1">Generate Report</h3>
                <p className="text-green-100 text-sm">Download PDF summary</p>
              </button>
            </div>

            {/* Recent Payments */}
            {balanceReport && balanceReport.recent_payments.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Payments</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {balanceReport.recent_payments.length} payments
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Member</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceReport.recent_payments.slice(0, 5).map((payment, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 font-medium text-gray-900">{payment.member_name}</td>
                          <td className="py-4 px-4 text-green-600 font-semibold">
                            KSh {payment.amount.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-gray-500">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Members</h2>
                <p className="text-gray-600 mt-1">{members.length} total members</p>
              </div>
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <UserPlus className="w-5 h-5" />
                <span>Add Member</span>
              </button>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
              {members.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                  <p className="text-gray-500 mb-6">Start by adding your first chama member</p>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Add First Member</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reminders Tab */}
        {activeTab === 'reminders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Payment Reminders</h2>
                <p className="text-gray-600 mt-1">Members who need payment reminders</p>
              </div>
              <span className="bg-red-100 text-red-800 px-4 py-2 rounded-xl text-sm font-medium">
                {reminders.length} pending
              </span>
            </div>

            <div className="grid gap-4 lg:gap-6">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{reminder.name}</h3>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{reminder.phone_number}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {reminder.days_since_created} days since joining
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        Payment Due
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {reminders.length === 0 && (
                <div className="text-center py-16">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-500">No pending payment reminders at the moment.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Record Payment</h2>
              <p className="text-gray-600 mt-1">Mark member payments as complete</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Mark Payment as Received</h3>
              <form onSubmit={markAsPaid} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Member
                    </label>
                    <select
                      value={markPaidForm.member_id}
                      onChange={(e) => setMarkPaidForm({ ...markPaidForm, member_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    >
                      <option value="">Choose a member...</option>
                      {members.filter(m => !m.has_paid).map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} - {member.phone_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (KSh)
                    </label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={markPaidForm.amount}
                      onChange={(e) => setMarkPaidForm({ ...markPaidForm, amount: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  Mark as Paid
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Add New Member</h3>
              <button
                onClick={() => setShowAddMember(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={addMember} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter member's full name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+254712345678"
                  value={newMember.phone_number}
                  onChange={(e) => setNewMember({ ...newMember, phone_number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Include country code (e.g., +254)</p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={addMemberLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium disabled:opacity-50"
                >
                  {addMemberLoading ? 'Adding...' : 'Add Member'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;