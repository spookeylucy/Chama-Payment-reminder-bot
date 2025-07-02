import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { paymentService, utils, type Payment } from '../lib/supabase';

interface PaymentHistoryProps {
  memberId?: string;
  limit?: number;
  showStats?: boolean;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  memberId,
  limit = 20,
  showStats = true
}) => {
  const [payments, setPayments] = useState<(Payment & { member_name?: string })[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<{
    thisMonth: number;
    lastMonth: number;
    growth: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentData();
  }, [memberId, limit]);

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      let paymentsData;
      if (memberId) {
        paymentsData = await paymentService.getByMember(memberId);
      } else {
        paymentsData = await paymentService.getRecent(limit);
      }
      
      setPayments(paymentsData);

      if (showStats && !memberId) {
        const stats = await paymentService.getMonthlyStats();
        setMonthlyStats(stats);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {memberId ? 'Payment History' : 'Recent Payments'}
        </h3>
        {showStats && monthlyStats && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">This Month</p>
              <p className="font-bold text-lg text-gray-900">
                {utils.formatCurrency(monthlyStats.thisMonth)}
              </p>
            </div>
            <div className={`flex items-center space-x-1 ${
              monthlyStats.growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {monthlyStats.growth >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(monthlyStats.growth).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
          <p className="text-gray-500">Payment history will appear here once recorded</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                {!memberId && (
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Member</th>
                )}
                <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{utils.formatDate(payment.date)}</span>
                    </div>
                  </td>
                  {!memberId && payment.member_name && (
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {payment.member_name}
                    </td>
                  )}
                  <td className="py-4 px-4">
                    <span className="font-semibold text-green-600">
                      {utils.formatCurrency(payment.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};