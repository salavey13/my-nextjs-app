import { Client, GatewayIntentBits } from 'discord.js';
import { supabase } from '@supabase/supabase-js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Check VIP status and request count
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('discord_id', message.author.id)
    .single();

  if (user) {
    if (user.requests < 10) {
      // Process the message
      // Your logic to trigger Automations
    } else if (user.is_vip) {
      // Process VIP user message
      // Your logic to trigger Automations
    } else {
      message.reply('You have reached the maximum number of requests. Upgrade to VIP for more requests.');
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
