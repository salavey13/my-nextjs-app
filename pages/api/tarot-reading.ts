import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { userId, question, spreadType, newsContext, cost } = req.body

  if (!userId || !question || !spreadType || !newsContext || !cost) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    // Fetch current user balance
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()

    if (fetchError) throw new Error('Failed to fetch user balance')

    const currentBalance = userData.balance

    // Check if user has enough balance
    if (currentBalance < cost) {
      return res.status(400).json({ message: 'Insufficient balance' })
    }

    // Deduct coins from user balance
    const newBalance = currentBalance - cost
    const { data: updatedUserData, error: updateError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId)
      .select('balance')
      .single()

    if (updateError) throw new Error('Failed to update user balance')

    // Generate tarot reading
    const prompt = `Generate a tarot reading for the question: "${question}". 
    Consider the following recent news events for context: ${JSON.stringify(newsContext)}.
    Provide a JSON response with the following structure:
    {
      "cards": [
        { "name": "Card Name", "position": "Position (e.g., Past, Present, Future)", "interpretation": "Card interpretation" }
      ],
      "overall_interpretation": "Overall interpretation of the reading",
      "advice": "Advice based on the reading"
    }`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [{ role: "user", content: prompt }],
    })

    const reading = JSON.parse(completion.choices[0].message.content || '{}')

    // Save reading to database
    const { data: savedReading, error: readingError } = await supabase
      .from('tarot_readings')
      .insert({
        user_id: userId,
        question,
        spread_type: spreadType,
        reading: reading,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (readingError) throw new Error('Failed to save reading')

    res.status(200).json({
      reading: savedReading,
      newBalance: updatedUserData.balance
    })
  } catch (error) {
    console.error('Error generating tarot reading:', error)
    res.status(500).json({ message: 'Failed to generate tarot reading' })
  }
}