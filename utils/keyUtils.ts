import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabaseClient'

const KEY_LENGTH = 16
const KEY_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generateKey(): string {
  return uuidv4().replace(/-/g, '').substring(0, KEY_LENGTH)
}

export async function validateOneTimeKey(key: string, userRole: number): Promise<boolean> {
  if (userRole === 1) {
    // Admin can generate new keys
    return true
  }

  // Check if the key exists and is not used
  const { data, error } = await supabase
    .from('one_time_keys')
    .select('used')
    .eq('key', key)
    .single()

  if (error || !data) {
    return false
  }

  return !data.used
}

export async function invalidateOneTimeKey(key: string): Promise<void> {
  const { error } = await supabase
    .from('one_time_keys')
    .update({ used: true })
    .eq('key', key)

  if (error) {
    console.error('Error invalidating key:', error)
    throw new Error('Failed to invalidate key')
  }
}

export async function createOneTimeKey(userRole: number): Promise<string | null> {
  if (userRole !== 1) {
    return null
  }

  const key = generateKey()
  const { error } = await supabase
    .from('one_time_keys')
    .insert({ key, used: false })

  if (error) {
    console.error('Error creating key:', error)
    return null
  }

  return key
}