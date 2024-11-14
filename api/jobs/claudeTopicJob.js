// jobs/claude-job.js
import cron from "node-cron";
import fs from "fs";
import TopicConfig from "../config/claude-Topicconfig.js";
import claudeService from "../services/claude-service.js";
import Topic from "../models/topic.model.js";

class ClaudeJob {
  constructor() {
    this.config = TopicConfig.claudeJob;
  }

  start() {
    if (!this.config?.enabled) return;

    cron.schedule(this.config.schedule, async () => {
      console.log("Claude Job çalışıyor:", new Date().toISOString());
      await this.execute();
    });
  }

  async execute() {
    try {
      // Claude API'den yanıt al
      const response = await claudeService.sendMessage(
        "write me 50 blog post topics that are interesting and have very good statistics in google trends that people will want to read, but do not have numerical expressions in these post topics and write which of these categories each topic falls into Travel, Technology, Fashion, Health, Food, Education, Finance, Sports, Books, Life Subject - Category format but only give the output I want Do not give any additional explanations or additional information, just give the blog topics and write meta name and description for each blog topic"
       );
       
       this.logResponse(response);
       
       // Her blog girdisini boş satırla ayır
       const topics = response.content[0].text.split("\n\n");
       
       for (const topicBlock of topics) {
        // Her blog girdisinin satırlarını ayır
        const lines = topicBlock.split("\n");
        
        // İlk satırdan başlık ve kategoriyi ayır
        const [titleAndCategory] = lines[0].split(" - ");
        const category = lines[0].split(" - ")[1];
       
        // Meta bilgilerini al
        const metaTitleLine = lines.find(line => line.startsWith("Meta Title:"));
        const metaDescLine = lines.find(line => line.startsWith("Meta Description:"));
       
        if (titleAndCategory && category && metaTitleLine && metaDescLine) {
          const title = titleAndCategory;
          const metaTitle = metaTitleLine.replace("Meta Title:", "").trim();
          const metaDescription = metaDescLine.replace("Meta Description:", "").trim();
          
          const existingTopic = await Topic.findOne({ title });
       
          if (!existingTopic) {
            const newTopic = new Topic({
              title,
              category: category.toLowerCase(),
              metaTitle,
              metaDescription,
              status: 1
            });
            
            try {
              await newTopic.save();
              console.log(`Saved topic: ${title}`);
            } catch (error) {
              console.error(`Error saving topic ${title}:`, error);
            }
          }
        }
      }
    } catch (error) {
      this.logError(error);
      console.error("Hata detayı:", error);
    }
  }

  logResponse(response) {
    const timestamp = new Date().toISOString();
    const logMessage = `\n[${timestamp}] API Yanıtı: ${JSON.stringify(
      response,
      null,
      2
    )}`;
    fs.appendFileSync("claude_responses.log", logMessage);
  }

  logError(error) {
    const timestamp = new Date().toISOString();
    const errorMessage = `\n[${timestamp}] Hata: ${error.message}\nStack: ${error.stack}`;
    fs.appendFileSync("claude_errors.log", errorMessage);
  }
}

export default new ClaudeJob();
