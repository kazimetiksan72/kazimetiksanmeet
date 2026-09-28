import 'dotenv/config';
import { createApp } from './app.js';
import { connectToDatabase } from './database.js';

const port = Number(process.env.PORT) || 5050;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mint-form';
const app = createApp({ clientOrigin: process.env.CLIENT_ORIGIN });

async function start() {
  try {
    await connectToDatabase(mongoUri);
    app.listen(port, '0.0.0.0', () => console.log(`API 0.0.0.0:${port} adresinde çalışıyor.`));
  } catch (error) {
    console.error('MongoDB bağlantısı kurulamadı:', error.message);
    process.exit(1);
  }
}

start();
