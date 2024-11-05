import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        apiKey: process.env.NEWS_API_KEY
      }
    })

    const newsContext = response.data.articles.slice(0, 5).map((article: any) => ({
      title: article.title,
      category: article.category || 'General'
    }))

    res.status(200).json(newsContext)
  } catch (error) {
    console.error('Error fetching news:', error)
    res.status(500).json({ message: 'Failed to fetch news' })
  }
}