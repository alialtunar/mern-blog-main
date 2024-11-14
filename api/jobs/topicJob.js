import cron from 'node-cron';
import { fetchNews } from '../services/newsFetcher.js';

const startCronJob = () => {
    console.log('Starting news fetcher cron job...');
    
    // İlk çalıştırmayı hemen yapalım
    fetchNews();
    
    // Sonra her dakika çalıştıralım
    cron.schedule('* * * * *', async () => {
        await fetchNews();
    });
};

export { startCronJob };