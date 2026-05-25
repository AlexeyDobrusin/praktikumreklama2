export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: 'Telegram credentials not configured' });
  }

  try {
    const data = req.body;

    const phone = data.customer_phone || 'не указан';
    const email = data.customer_email || 'не указан';
    const sum = data.sum || data.payment_amount || '—';
    const orderNum = data.order_num || data.order_id || '—';
    const product = data.product_name || data.products?.[0]?.name || 'Практикум Реклама';
    const status = data.payment_status || 'success';
    const date = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

    const message = [
      '💰 *Новая оплата!*',
      '',
      `📦 *Продукт:* ${product}`,
      `💵 *Сумма:* ${sum} ₽`,
      `📱 *Телефон:* ${phone}`,
      `📧 *Email:* ${email}`,
      `🔢 *Заказ:* ${orderNum}`,
      `✅ *Статус:* ${status}`,
      '',
      `⏰ ${date}`,
      '🌐 _reklama.metodzms.ru_'
    ].join('\n');

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      console.error('Telegram API error:', response.status);
      return res.status(500).json({ error: 'Telegram send failed' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Notify error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
