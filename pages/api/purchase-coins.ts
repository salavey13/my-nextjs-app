//pages\api\purchase-coins.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { validateOneTimeKey, invalidateOneTimeKey, createOneTimeKey } from '@/utils/keyUtils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' })
    }
  
    const { userId, oneTimeKey } = req.body
  
    if (!userId || !oneTimeKey) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
  
    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
  
    if (userError || !userData) {
      return res.status(400).json({ message: 'Invalid user' })
    }
  
    // Validate the one-time key
    const isValidKey = await handleKeyValidation(oneTimeKey, userData.role)
    if (!isValidKey) {
      return res.status(400).json({ message: 'Invalid one-time key' })
    }
  
    // Add coins to the user's balance
    const coinsToAdd = 100 // You can adjust this value as needed
    const { data, error } = await supabase
      .rpc('add_coins_to_balance', { user_id: userId, coins_to_add: coinsToAdd })
  
    if (error) {
      console.error('Error updating user balance:', error)
      return res.status(500).json({ message: 'Failed to update balance' })
    }
  
    // Invalidate the one-time key if it's not an admin
    if (userData.role !== 1) {
      await invalidateOneTimeKey(oneTimeKey)
    }
  
    return res.status(200).json({ message: 'Coins added successfully', newBalance: data })
  }
  
  async function handleKeyValidation(key: string, userRole: number): Promise<boolean> {
    if (userRole === 1) {
      // Admin is creating a new key
      const newKey = await createOneTimeKey(userRole)
      return newKey !== null
    }
    return validateOneTimeKey(key, userRole)
  }