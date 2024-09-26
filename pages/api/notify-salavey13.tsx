import { NextApiRequest, NextApiResponse } from 'next';
import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.NEXT_PUBLIC_BOT_TOKEN || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { v0DevLink, githubTaskLink } = req.body;

    try {
      await bot.telegram.sendMessage("413553377", 
        `Новая таска:\n\nv0.dev link: ${v0DevLink}\nGitHub task: ${githubTaskLink}`
      );
      res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ message: 'Failed to send notification' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
