import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
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

// API functions
export const memberService = {
  async getAll(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(member: Omit<Member, 'id' | 'created_at'>): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .insert([member])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async markAsPaid(id: string): Promise<void> {
    const { error } = await supabase
      .from('members')
      .update({ has_paid: true })
      .eq('id', id)
    
    if (error) throw error
  },

  async getUnpaid(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('has_paid', false)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

export const paymentService = {
  async create(payment: Omit<Payment, 'id' | 'date'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByMember(memberId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('member_id', memberId)
      .order('date', { ascending: false })
    
    if (error) throw error
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
    
    if (error) throw error
    return data?.map(payment => ({
      ...payment,
      member_name: payment.members.name
    })) || []
  },

  async getTotalCollected(): Promise<number> {
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
    
    if (error) throw error
    return data?.reduce((sum, payment) => sum + payment.amount, 0) || 0
  }
}

export const chamaService = {
  async getAll(): Promise<Chama[]> {
    const { data, error } = await supabase
      .from('chamas')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(chama: Omit<Chama, 'id' | 'created_at'>): Promise<Chama> {
    const { data, error } = await supabase
      .from('chamas')
      .insert([chama])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const settingsService = {
  async getDueDate(): Promise<string | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('due_date')
      .limit(1)
      .single()
    
    if (error) return null
    return data?.due_date || null
  },

  async updateDueDate(dueDate: string): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .upsert({ due_date: dueDate })
    
    if (error) throw error
  }
}