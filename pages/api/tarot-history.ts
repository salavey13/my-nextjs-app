import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    const { data: readings, error } = await supabase
      .from('tarot_readings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.status(200).json(readings)
  } catch (error) {
    console.error('Error fetching tarot reading history:', error)
    res.status(500).json({ message: 'Failed to fetch tarot reading history' })
  }
}