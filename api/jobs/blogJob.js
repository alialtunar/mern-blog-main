// jobs/claude-job.js
import cron from 'node-cron';
import fs from 'fs';
import jobConfig from '../config/job-config.js';
import claudeService from '../services/claude-service.js';
import Post from '../models/post.model.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { google } from 'googleapis';
import * as cheerio from 'cheerio';
import Topic from '../models/topic.model.js';
import RewriteService from '../services/ai-undetect-service.js'



// Google Custom Search API yapılandırması
const customSearch = google.customsearch('v1');
const API_KEY = 'AIzaSyAfvon0OexdH5KUs_FiZdxk6treZMjIzxs';
const SEARCH_ENGINE_ID = '53c90cfe9f7634ec0';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// prompt.json dosyasının yolunu oluştur

const Prompt = join(__dirname, 'prompt.txt');

async function isImageAccessible(url) {
  try {
    // Sosyal medya URL'lerini kontrol et ve reddet
    if (url.includes('fbsbx.com') || 
        url.includes('fbcdn.net') || 
        url.includes('instagram.com') ||
        url.includes('cdninstagram.com') ||
        url.includes('twitter.com') ||
        url.includes('twimg.com') ||
        url.includes('pinterest.com') ||
        url.includes('pinimg.com')) {
      return false;
    }

    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function searchImage(query) {
  try {
    const response = await customSearch.cse.list({
      auth: API_KEY,
      cx: SEARCH_ENGINE_ID,
      q: query,
      searchType: 'image',
      num: 5, // Daha fazla sonuç al
      imgType: 'photo', // Sadece fotoğrafları getir
      // Sosyal medya sitelerini hariç tut
      excludeTerms: 'site:facebook.com site:instagram.com site:twitter.com site:pinterest.com'
    });

    if (response.data.items && response.data.items.length > 0) {
      // Sonuçları döngüyle kontrol et ve uygun olan ilk resmi döndür
      for (const item of response.data.items) {
        if (await isImageAccessible(item.link)) {
          return item.link;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Image search error:', error);
    return null;
  }
}

async function updateImagesInContent(content) {
  try {
    const $ = cheerio.load(content);
    const images = $('img').toArray();
    console.log('Toplam resim sayısı:', images.length);     
    
    for (const elem of images) {
      const $elem = $(elem);
      const currentSrc = $elem.attr('src');
      const alt = $elem.attr('alt');
      
      if (currentSrc) {
        // Mevcut resim erişilebilir değilse veya sosyal medya kaynağıysa
        if (!(await isImageAccessible(currentSrc))) {
          const searchTerm = alt || $elem.attr('title') || 'generic image';
          const newImageUrl = await searchImage(searchTerm);
          
          if (newImageUrl) {
            $elem.attr('src', newImageUrl);
          } else {
            $elem.remove();
          }
        }
      } else if (alt) {
        // src attribute yoksa ve alt text varsa
        const imageUrl = await searchImage(alt);
        if (imageUrl) {
          $elem.attr('src', imageUrl);
        } else {
          $elem.remove();
        }
      } else {
        // Ne src ne de alt varsa elementi sil
        $elem.remove();
      }
    }

    return $.html();
  } catch (error) {
    console.error('Content update error:', error);
    return content;
  }
}

  const slugify = (str) => {
    return str
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '') // sadece harf, rakam, boşluk ve tire karakterlerini tutar
        .replace(/\s+/g, '-') // boşlukları tire ile değiştirir
        .replace(/-+/g, '-') // birden fazla tireyi tek tire yapar
        .replace(/^-+|-+$/g, ''); // baştaki ve sondaki tireleri kaldırır
}

function extractTitle(content) {
  const titleMatch = content.match(/<h[1-6][^>]*>(?:<strong[^>]*>)?([^<]+)(?:<\/strong>)?<\/h[1-6]>/);
  return titleMatch ? titleMatch[1].trim() : '';
 }

class ClaudeJob {
    constructor() {
        this.config = jobConfig.claudeJob;
    }

    start() {
        if (!this.config.enabled) return;

        cron.schedule(this.config.schedule, async () => {
            console.log('Claude Job çalışıyor:', new Date().toISOString());
            await this.execute();
        });
    }

    async execute() {
      try {
        const txt = fs.readFileSync(Prompt, 'utf-8');
        const latestTopic = await Topic.findOne({ status: 1 });
    
        const data1 = `"Write me a blog about the "${latestTopic.title}"` + txt;
        const response = await claudeService.sendMessage(data1);
         console.log(response.content[0].text);
    
    
        // const result = await RewriteService.rewriteText(text);
        
        // if (result.success) {
        //     const txt2 = fs.readFileSync(secondPrompt, 'utf-8');
        //     const data2 = `"${result.data}"\n${txt2}`;
        //     console.log("data2----------------------", data2); // Console.log buraya taşındı
        //     console.log("rewrite------------------", result.data);
        //     const response2 = await claudeService.sendMessage(data2);
        //     console.log("claudee------------------", response2.content[0].text);
         
           
            
        // } else {
        //     console.error('Rewrite failed:', result.error);
        //     throw new Error(result.error);
        // }
         console.log(latestTopic.metaTitle);
         console.log(latestTopic.metaDescription);
        const content = await updateImagesInContent(response.content[0].text);
        const title = extractTitle(response.content[0].text);
        const image = await searchImage(title);
        const slug = slugify(title);
        
        const newPost = new Post({
            title,
            content,
            image,
            category: latestTopic.category,
            slug,
            metaTitle:latestTopic.metaTitle,
            metaDescription:latestTopic.metaDescription,
            userId: "666ae50bef8a61688de9daac",
        });
        
        await newPost.save();
        await Topic.deleteOne({ _id: latestTopic.id });
    
    } catch (error) {
        this.logError(error);
        console.error('Hata detayı:', error);
    }
    }

    logResponse(response) {
        const timestamp = new Date().toISOString();
        const logMessage = `\n[${timestamp}] API Yanıtı: ${JSON.stringify(response, null, 2)}`;
        fs.appendFileSync('claude_responses.log', logMessage);
    }

    logError(error) {
        const timestamp = new Date().toISOString();
        const errorMessage = `\n[${timestamp}] Hata: ${error.message}\nStack: ${error.stack}`;
        fs.appendFileSync('claude_errors.log', errorMessage);
    }
}



export default new ClaudeJob();