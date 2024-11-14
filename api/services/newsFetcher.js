import axios from 'axios';
import config from '../config/topic-config.js';
import Topic from '../models/topic.model.js';

let currentStart = 6;

const buildUrl = (start) => {
    // URL'i manuel olarak oluşturalım
    const baseUrl = config.baseUrl;
    const url = new URL(baseUrl);
    
    // Temel parametreleri ekleyelim
    url.searchParams.append('allow_license_partners[]', 'associatedPress');
    url.searchParams.append('category', config.params.category);
    url.searchParams.append('direction', config.params.direction);
    url.searchParams.append('max_level', config.params.max_level);
    url.searchParams.append('min_level', config.params.min_level);
    url.searchParams.append('order', config.params.order);
    url.searchParams.append('page_size', config.params.page_size);
    url.searchParams.append('published_latest', config.params.published_latest);
    url.searchParams.append('query', config.params.query);
    url.searchParams.append('type', config.params.type);
    url.searchParams.append('start', start);

    return url.toString();
};

const fetchNews = async () => {
    try {
        const url = buildUrl(currentStart);
        console.log(`Fetching from URL: ${url}`); // URL'i kontrol etmek için

        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (response.data && response.data.data && response.data.data.length > 0) {
            const titleText = response.data.data[0].title_text.text;
            console.log(`[${new Date().toISOString()}] Article ${currentStart}: ${titleText}`);
            const topic = await Topic.findOne({ title: titleText });
            if(topic == null) {
                const newTopic = new Topic({
                    title:titleText
                   });
                   await newTopic.save();
            }
            currentStart++; 
        } else {
            console.log('No more articles found, resetting to start');
            currentStart = 0; // Reset to start if no more articles
        }
    } catch (error) {
        console.error('Error fetching news:', error.message);
        if (error.response) {
            console.error('Error details:', {
                status: error.response.status,
                data: error.response.data
            });
        }
        // Hata durumunda start değerini sıfırlayalım
        currentStart = 0;
    }
};

export { fetchNews };