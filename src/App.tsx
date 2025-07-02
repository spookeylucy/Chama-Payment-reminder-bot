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
  Activity,
  Loader2,
  Search,
  Filter,
  BarChart3,
  Settings
} from 'lucide-react';
import { 
  memberService, 
  paymentService, 
  settingsService,
  chamaService,
  utils,
  subscriptions,
  type Member,
  type Chama
} from './lib/supabase';
import { MemberSearch } from './components/MemberSearch';
import { PaymentHistory } from './components/PaymentHistory';
import { ChamaSelector } from './components/ChamaSelector';

interface BalanceReport {
  summary: {
    total_members: number;
    paid_members: number;
    unpaid_members: number;
    total_collected: number;
    expected_total: number;
    collection_percentage: number;
    payment_rate: number;
  };
  recent_payments: Array<{
    member_name: string;
    amount: number;
    date: string;
  }>;
  monthly_stats: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [balanceReport, setBalanceReport] = useState<BalanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [selectedChama, setSelectedChama] = useState<Chama | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [newMember, setNewMember] = useState({ name: '', phone_number: '' });

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time subscriptions
    const membersSubscription = subscriptions.subscribeToMembers(() => {
      loadDashboardData();
    });
    
    const paymentsSubscription = subscriptions.subscribeToPayments(() => {
      loadDashboardData();
    });

    return () => {
      membersSubscription.unsubscribe();
      paymentsSubscription.unsubscribe();
    };
  }, []);

  // Filter members based on search and payment status
  useEffect(() => {
    let filtered = members;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone_number.includes(searchTerm)
      );
    }

    // Filter by payment status
    if (paymentFilter === 'paid') {
      filtered = filtered.filter(member => member.has_paid);
    } else if (paymentFilter === 'unpaid') {
      filtered = filtered.filter(member => !member.has_paid);
    }

    setFilteredMembers(filtered);
  }, [members, searchTerm, paymentFilter]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMembers(),
        loadBalanceReport(),
        loadDueDate()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      alert('Error loading data. Please check your Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const membersData = await memberService.getAll();
      
      // Calculate total paid for each member
      const membersWithPayments = await Promise.all(
        membersData.map(async (member) => {
          const payments = await paymentService.getByMember(member.id);
          const total_paid = payments.reduce((sum, payment) => sum + payment.amount, 0);
          return { ...member, total_paid };
        })
      );
      
      setMembers(membersWithPayments);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const loadBalanceReport = async () => {
    try {
      const [membersData, totalCollected, recentPayments, monthlyStats] = await Promise.all([
        memberService.getAll(),
        paymentService.getTotalCollected(),
        paymentService.getRecent(10),
        paymentService.getMonthlyStats()
      ]);
      
      const totalMembers = membersData.length;
      const paidMembers = membersData.filter(m => m.has_paid).length;
      const unpaidMembers = totalMembers - paidMembers;
      const expectedTotal = totalMembers * 1000; // Assuming 1000 per member
      const paymentRate = totalMembers > 0 ? (paidMembers / totalMembers) * 100 : 0;
      
      setBalanceReport({
        summary: {
          total_members: totalMembers,
          paid_members: paidMembers,
          unpaid_members: unpaidMembers,
          total_collected: totalCollected,
          expected_total: expectedTotal,
          collection_percentage: expectedTotal > 0 ? (totalCollected / expectedTotal) * 100 : 0,
          payment_rate: paymentRate
        },
        recent_payments: recentPayments.map(payment => ({
          member_name: payment.member_name,
          amount: payment.amount,
          date: payment.date
        })),
        monthly_stats: monthlyStats
      });
    } catch (error) {
      console.error('Error loading balance report:', error);
    }
  };

  const loadDueDate = async () => {
    try {
      const date = await settingsService.getDueDate();
      setDueDate(date);
    } catch (error) {
      console.error('Error loading due date:', error);
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMemberLoading(true);
    try {
      // Validate phone number
      if (!utils.validatePhoneNumber(newMember.phone_number)) {
        throw new Error('Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)');
      }

      // Format phone number to international format
      let formattedPhone = newMember.phone_number.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+254' + formattedPhone.substring(1);
      }

      await memberService.create({
        name: newMember.name.trim(),
        phone_number: formattedPhone,
        has_paid: false
      });
      
      setNewMember({ name: '', phone_number: '' });
      setShowAddMember(false);
      await loadDashboardData();
      alert('Member added successfully!');
    } catch (error: any) {
      console.error('Error adding member:', error);
      alert(error.message || 'Error adding member. Please try again.');
    } finally {
      setAddMemberLoading(false);
    }
  };

  const markAsPaid = async (memberId: string, amount: number = 1000) => {
    try {
      // Mark member as paid
      await memberService.markAsPaid(memberId);
      
      // Record payment
      await paymentService.create({
        member_id: memberId,
        amount: amount
      });
      
      await loadDashboardData();
      alert('Payment recorded successfully!');
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Error marking member as paid. Please try again.');
    }
  };

  const markAsUnpaid = async (memberId: string) => {
    try {
      await memberService.markAsUnpaid(memberId);
      await loadDashboardData();
      alert('Member marked as unpaid successfully!');
    } catch (error) {
      console.error('Error marking as unpaid:', error);
      alert('Error marking member as unpaid. Please try again.');
    }
  };

  const sendReminders = async () => {
    try {
      const unpaidMembers = await memberService.getUnpaid();
      alert(`Would send WhatsApp reminders to ${unpaidMembers.length} unpaid members. (WhatsApp integration needed)`);
    } catch (error) {
      console.error('Error getting unpaid members:', error);
      alert('Error getting unpaid members.');
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

  const MemberCard = ({ member }: { member: Member & { total_paid: number } }) => (
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
              <span className="text-sm">{utils.formatPhoneNumber(member.phone_number)}</span>
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
          <p className="font-bold text-lg text-gray-900">
            {utils.formatCurrency(member.total_paid || 0)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Joined</p>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-sm text-gray-600">
              {utils.formatDate(member.created_at)}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
        {!member.has_paid ? (
          <button
            onClick={() => markAsPaid(member.id)}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Mark as Paid
          </button>
        ) : (
          <button
            onClick={() => markAsUnpaid(member.id)}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            Mark as Unpaid
          </button>
        )}
      </div>
    </div>
  );

  if (loading && members.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Connecting to Supabase...</p>
        </div>
      </div>
    );
  }

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
                  Chama Manager Pro
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Powered by Supabase • {members.length} Members
                </p>
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
                onClick={sendReminders}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Send Reminders</span>
                <span className="sm:hidden">Remind</span>
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
              { id: 'payments', label: 'Payments', icon: CheckCircle },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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
                Track payments, manage members, and stay organized with real-time data
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
                  subtitle={`${balanceReport.summary.payment_rate.toFixed(1)}% completion`}
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
                  value={utils.formatCurrency(balanceReport.summary.total_collected)}
                  icon={DollarSign}
                  color="#8B5CF6"
                  subtitle={`of ${utils.formatCurrency(balanceReport.summary.expected_total)} target`}
                />
              </div>
            )}

            {/* Monthly Growth Card */}
            {balanceReport?.monthly_stats && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Monthly Performance</h3>
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-purple-100 text-sm">This Month</p>
                        <p className="text-2xl font-bold">
                          {utils.formatCurrency(balanceReport.monthly_stats.thisMonth)}
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-100 text-sm">Growth</p>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-bold">
                            {balanceReport.monthly_stats.growth.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {dueDate && (
                    <div className="text-right">
                      <p className="text-purple-100 text-sm">Next Due Date</p>
                      <p className="font-semibold">
                        {utils.formatDate(dueDate)}
                      </p>
                    </div>
                  )}
                </div>
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
                onClick={sendReminders}
                className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <AlertCircle className="w-8 h-8 mb-3" />
                <h3 className="font-semibold text-lg mb-1">Send Reminders</h3>
                <p className="text-orange-100 text-sm">
                  {balanceReport?.summary.unpaid_members || 0} pending reminders
                </p>
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <BarChart3 className="w-8 h-8 mb-3" />
                <h3 className="font-semibold text-lg mb-1">View Analytics</h3>
                <p className="text-green-100 text-sm">Detailed reports and insights</p>
              </button>
            </div>

            {/* Recent Payments */}
            <PaymentHistory limit={5} showStats={false} />
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Members</h2>
                <p className="text-gray-600 mt-1">{filteredMembers.length} of {members.length} members</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'paid' | 'unpaid')}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Members</option>
                  <option value="paid">Paid Only</option>
                  <option value="unpaid">Unpaid Only</option>
                </select>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
              {filteredMembers.length === 0 && members.length > 0 && (
                <div className="col-span-full text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setPaymentFilter('all');
                    }}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear Filters</span>
                  </button>
                </div>
              )}
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

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Payment Management</h2>
              <p className="text-gray-600 mt-1">Track and manage member payments</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Unpaid Members */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Payments</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {members.filter(m => !m.has_paid).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{utils.formatPhoneNumber(member.phone_number)}</p>
                      </div>
                      <button
                        onClick={() => markAsPaid(member.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Mark Paid
                      </button>
                    </div>
                  ))}
                  {members.filter(m => !m.has_paid).length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-gray-500">All members have paid!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Paid Members */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Payments</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {members.filter(m => m.has_paid).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{utils.formatPhoneNumber(member.phone_number)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-green-600">
                          {utils.formatCurrency(member.total_paid || 0)}
                        </span>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  ))}
                  {members.filter(m => m.has_paid).length === 0 && (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                      <p className="text-gray-500">No payments recorded yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment History */}
            <PaymentHistory />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Analytics & Reports</h2>
              <p className="text-gray-600 mt-1">Detailed insights into your chama performance</p>
            </div>

            {balanceReport && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Rate Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Rate</h3>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                          Progress
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-green-600">
                          {balanceReport.summary.payment_rate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                      <div 
                        style={{ width: `${balanceReport.summary.payment_rate}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {balanceReport.summary.paid_members}/{balanceReport.summary.total_members}
                    </p>
                    <p className="text-sm text-gray-500">Members Paid</p>
                  </div>
                </div>

                {/* Collection Rate */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Rate</h3>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                          Target
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-blue-600">
                          {balanceReport.summary.collection_percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div 
                        style={{ width: `${Math.min(balanceReport.summary.collection_percentage, 100)}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {utils.formatCurrency(balanceReport.summary.total_collected)}
                    </p>
                    <p className="text-sm text-gray-500">
                      of {utils.formatCurrency(balanceReport.summary.expected_total)}
                    </p>
                  </div>
                </div>

                {/* Monthly Growth */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Growth</h3>
                  <div className="text-center">
                    <div className={`flex items-center justify-center space-x-2 mb-2 ${
                      balanceReport.monthly_stats.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {balanceReport.monthly_stats.growth >= 0 ? (
                        <TrendingUp className="w-6 h-6" />
                      ) : (
                        <TrendingUp className="w-6 h-6 rotate-180" />
                      )}
                      <span className="text-2xl font-bold">
                        {Math.abs(balanceReport.monthly_stats.growth).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      {balanceReport.monthly_stats.growth >= 0 ? 'Growth' : 'Decline'} from last month
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">This Month:</span>
                        <span className="font-medium">
                          {utils.formatCurrency(balanceReport.monthly_stats.thisMonth)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last Month:</span>
                        <span className="font-medium">
                          {utils.formatCurrency(balanceReport.monthly_stats.lastMonth)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Payment History */}
            <PaymentHistory limit={50} showStats={true} />
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
                  placeholder="+254712345678 or 0712345678"
                  value={newMember.phone_number}
                  onChange={(e) => setNewMember({ ...newMember, phone_number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Kenyan phone number (e.g., +254712345678 or 0712345678)
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={addMemberLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  {addMemberLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Member'
                  )}
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