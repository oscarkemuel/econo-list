import { Telegraf } from "telegraf";

class TelegrafService {
  private botToken;
  private telegramChatId;
  private bot;

  constructor() {
    this.botToken = process.env.TELEGRAM_TOKEN_BOT || '';
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID || '';
    this.bot = new Telegraf(this.botToken);
  }

  public async sendMessage(message: string) {
    try {
      await this.bot.telegram.sendMessage(this.telegramChatId, message, {
        parse_mode: 'MarkdownV2'
      });
    } catch (error) {
      console.log('Error on send message', error);
    }
  }
}

export default TelegrafService;