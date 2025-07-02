import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase first.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Member {
  id: string
  name: string
  phone_number: string
  has_paid: boolean
  created_at: string
}

export interface Chama {
  id: string
  name: string
  due_date: string
  amount_expected: number
  created_at: string
}

export interface Payment {
  id: string
  member_id: string
  amount: number
  date: string
  chama_id?: string
}

export interface Settings {
  id: string
  due_date: string
}

// Enhanced API functions with better error handling and features
export const memberService = {
  async getAll(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching members:', error)
      throw new Error(`Failed to fetch members: ${error.message}`)
    }
    return data || []
  },

  async create(member: Omit<Member, 'id' | 'created_at'>): Promise<Member> {
    // Check if phone number already exists
    const { data: existing } = await supabase
      .from('members')
      .select('phone_number')
      .eq('phone_number', member.phone_number)
      .single()

    if (existing) {
      throw new Error('A member with this phone number already exists')
    }

    const { data, error } = await supabase
      .from('members')
      .insert([member])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating member:', error)
      throw new Error(`Failed to create member: ${error.message}`)
    }
    return data
  },

  async markAsPaid(id: string): Promise<void> {
    const { error } = await supabase
      .from('members')
      .update({ has_paid: true })
      .eq('id', id)
    
    if (error) {
      console.error('Error marking member as paid:', error)
      throw new Error(`Failed to mark member as paid: ${error.message}`)
    }
  },

  async markAsUnpaid(id: string): Promise<void> {
    const { error } = await supabase
      .from('members')
      .update({ has_paid: false })
      .eq('id', id)
    
    if (error) {
      console.error('Error marking member as unpaid:', error)
      throw new Error(`Failed to mark member as unpaid: ${error.message}`)
    }
  },

  async getUnpaid(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('has_paid', false)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching unpaid members:', error)
      throw new Error(`Failed to fetch unpaid members: ${error.message}`)
    }
    return data || []
  },

  async getPaid(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('has_paid', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching paid members:', error)
      throw new Error(`Failed to fetch paid members: ${error.message}`)
    }
    return data || []
  },

  async searchByName(searchTerm: string): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error searching members:', error)
      throw new Error(`Failed to search members: ${error.message}`)
    }
    return data || []
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting member:', error)
      throw new Error(`Failed to delete member: ${error.message}`)
    }
  },

  async getStats(): Promise<{
    total: number
    paid: number
    unpaid: number
    paymentRate: number
  }> {
    const { data, error } = await supabase
      .from('members')
      .select('has_paid')
    
    if (error) {
      console.error('Error fetching member stats:', error)
      throw new Error(`Failed to fetch member stats: ${error.message}`)
    }

    const total = data?.length || 0
    const paid = data?.filter(m => m.has_paid).length || 0
    const unpaid = total - paid
    const paymentRate = total > 0 ? (paid / total) * 100 : 0

    return { total, paid, unpaid, paymentRate }
  }
}

export const paymentService = {
  async create(payment: Omit<Payment, 'id' | 'date'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating payment:', error)
      throw new Error(`Failed to create payment: ${error.message}`)
    }
    return data
  },

  async getByMember(memberId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('member_id', memberId)
      .order('date', { ascending: false })
    
    if (error) {
      console.error('Error fetching member payments:', error)
      throw new Error(`Failed to fetch member payments: ${error.message}`)
    }
    return data || []
  },

  async getRecent(limit: number = 10): Promise<(Payment & { member_name: string })[]> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        members!inner(name)
      `)
      .order('date', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching recent payments:', error)
      throw new Error(`Failed to fetch recent payments: ${error.message}`)
    }
    return data?.map(payment => ({
      ...payment,
      member_name: payment.members.name
    })) || []
  },

  async getTotalCollected(): Promise<number> {
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
    
    if (error) {
      console.error('Error fetching total collected:', error)
      throw new Error(`Failed to fetch total collected: ${error.message}`)
    }
    return data?.reduce((sum, payment) => sum + payment.amount, 0) || 0
  },

  async getPaymentsByDateRange(startDate: string, endDate: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
    
    if (error) {
      console.error('Error fetching payments by date range:', error)
      throw new Error(`Failed to fetch payments by date range: ${error.message}`)
    }
    return data || []
  },

  async getMonthlyStats(): Promise<{
    thisMonth: number
    lastMonth: number
    growth: number
  }> {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

    const [thisMonthData, lastMonthData] = await Promise.all([
      this.getPaymentsByDateRange(thisMonthStart, now.toISOString()),
      this.getPaymentsByDateRange(lastMonthStart, lastMonthEnd)
    ])

    const thisMonth = thisMonthData.reduce((sum, p) => sum + p.amount, 0)
    const lastMonth = lastMonthData.reduce((sum, p) => sum + p.amount, 0)
    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

    return { thisMonth, lastMonth, growth }
  }
}

export const chamaService = {
  async getAll(): Promise<Chama[]> {
    const { data, error } = await supabase
      .from('chamas')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching chamas:', error)
      throw new Error(`Failed to fetch chamas: ${error.message}`)
    }
    return data || []
  },

  async create(chama: Omit<Chama, 'id' | 'created_at'>): Promise<Chama> {
    const { data, error } = await supabase
      .from('chamas')
      .insert([chama])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating chama:', error)
      throw new Error(`Failed to create chama: ${error.message}`)
    }
    return data
  },

  async getUpcoming(): Promise<Chama[]> {
    const { data, error } = await supabase
      .from('chamas')
      .select('*')
      .gte('due_date', new Date().toISOString().split('T')[0])
      .order('due_date', { ascending: true })
    
    if (error) {
      console.error('Error fetching upcoming chamas:', error)
      throw new Error(`Failed to fetch upcoming chamas: ${error.message}`)
    }
    return data || []
  }
}

export const settingsService = {
  async getDueDate(): Promise<string | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('due_date')
      .order('due_date', { ascending: true })
      .limit(1)
      .single()
    
    if (error) {
      console.error('Error fetching due date:', error)
      return null
    }
    return data?.due_date || null
  },

  async getAllDueDates(): Promise<string[]> {
    const { data, error } = await supabase
      .from('settings')
      .select('due_date')
      .order('due_date', { ascending: true })
    
    if (error) {
      console.error('Error fetching due dates:', error)
      return []
    }
    return data?.map(s => s.due_date) || []
  },

  async updateDueDate(dueDate: string): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .upsert({ due_date: dueDate })
    
    if (error) {
      console.error('Error updating due date:', error)
      throw new Error(`Failed to update due date: ${error.message}`)
    }
  }
}

// Real-time subscriptions
export const subscriptions = {
  subscribeToMembers(callback: (payload: any) => void) {
    return supabase
      .channel('members-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'members' }, 
        callback
      )
      .subscribe()
  },

  subscribeToPayments(callback: (payload: any) => void) {
    return supabase
      .channel('payments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payments' }, 
        callback
      )
      .subscribe()
  }
}

// Utility functions
export const utils = {
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  },

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },

  formatPhoneNumber(phone: string): string {
    // Format Kenyan phone numbers
    if (phone.startsWith('+254')) {
      return phone.replace('+254', '0')
    }
    return phone
  },

  validatePhoneNumber(phone: string): boolean {
    // Validate Kenyan phone number format
    const kenyanPhoneRegex = /^(\+254|0)[17]\d{8}$/
    return kenyanPhoneRegex.test(phone)
  },

  generateMemberReport(members: Member[], payments: Payment[]): {
    totalMembers: number
    paidMembers: number
    unpaidMembers: number
    totalCollected: number
    averagePayment: number
    paymentRate: number
  } {
    const totalMembers = members.length
    const paidMembers = members.filter(m => m.has_paid).length
    const unpaidMembers = totalMembers - paidMembers
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
    const averagePayment = payments.length > 0 ? totalCollected / payments.length : 0
    const paymentRate = totalMembers > 0 ? (paidMembers / totalMembers) * 100 : 0

    return {
      totalMembers,
      paidMembers,
      unpaidMembers,
      totalCollected,
      averagePayment,
      paymentRate
    }
  }
}

// Export everything for easy access
export default {
  supabase,
  memberService,
  paymentService,
  chamaService,
  settingsService,
  subscriptions,
  utils
}