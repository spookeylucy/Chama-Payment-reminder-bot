import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, ChevronDown } from 'lucide-react';
import { chamaService, utils, type Chama } from '../lib/supabase';

interface ChamaSelectorProps {
  selectedChama?: Chama | null;
  onChamaSelect: (chama: Chama | null) => void;
  className?: string;
}

export const ChamaSelector: React.FC<ChamaSelectorProps> = ({
  selectedChama,
  onChamaSelect,
  className = ""
}) => {
  const [chamas, setChamas] = useState<Chama[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChamas();
  }, []);

  const loadChamas = async () => {
    try {
      const chamasData = await chamaService.getAll();
      setChamas(chamasData);
    } catch (error) {
      console.error('Error loading chamas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChamaSelect = (chama: Chama) => {
    onChamaSelect(chama);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
      >
        <div className="flex items-center space-x-3">
          <Users className="w-5 h-5 text-gray-400" />
          <div className="text-left">
            {selectedChama ? (
              <>
                <p className="font-medium text-gray-900">{selectedChama.name}</p>
                <p className="text-sm text-gray-500">
                  Due: {utils.formatDate(selectedChama.due_date)} • 
                  Target: {utils.formatCurrency(selectedChama.amount_expected)}
                </p>
              </>
            ) : (
              <p className="text-gray-500">Select a Chama group</p>
            )}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          <div className="py-2">
            <button
              onClick={() => handleChamaSelect(null as any)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <p className="font-medium text-gray-900">All Chamas</p>
              <p className="text-sm text-gray-500">View all members across groups</p>
            </button>
            {chamas.map((chama) => (
              <button
                key={chama.id}
                onClick={() => handleChamaSelect(chama)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{chama.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{utils.formatDate(chama.due_date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{utils.formatCurrency(chama.amount_expected)}</span>
                      </div>
                    </div>
                  </div>
                  {new Date(chama.due_date) < new Date() && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Overdue
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};