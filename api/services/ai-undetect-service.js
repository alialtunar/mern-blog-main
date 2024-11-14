import fetch from 'node-fetch'
import dotenv from 'dotenv';

class RewriteService {
    constructor() {
        this.API_KEY = process.env.AIUNDETECT_API_KEY;
        this.BASE_URL = 'https://aiundetect.com/api/v1';
    }

    async rewriteText(text, model = "0", email = "ali.altunar@coens.io") {
        try {
            if (!text || text.length < 100 || text.length > 10000) {
                throw new Error('Text must be between 100 and 10000 characters');
            }

            const response = await fetch(`${this.BASE_URL}/rewrite`, {
                method: 'POST',
                headers: {
                    'Authorization': "vbbnBJzVR2aqPjwgZYnDfg==",
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    mail: email,
                    data: text
                })
            });

            const result = await response.json();

            if (result.code === 200) {
                return {
                    success: true,
                    data: result.data
                };
            }

            return {
                success: false,
                error: result.msg
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}


export default new RewriteService();