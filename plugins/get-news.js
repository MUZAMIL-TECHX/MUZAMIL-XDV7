const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "news",
    desc: "Get the latest news headlines.",
    category: "news",
    react: "📰",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey) {
            return reply('News is not configured. Add NEWS_API_KEY to your deployment secrets.');
        }

        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: { country: 'us', apiKey }
        });
        const articles = response.data.articles;
        if (!articles.length) return reply("No news articles found.");

        for (const article of articles.slice(0, 5)) {
            const message = `
📰 *${article.title}*
⚠️ _${article.description || ''}_
🔗 _${article.url}_

©ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫
            `;

            if (article.urlToImage) {
                await conn.sendMessage(from, { image: { url: article.urlToImage }, caption: message });
            } else {
                await conn.sendMessage(from, { text: message });
            }
        }
    } catch (error) {
        console.error("Error fetching news:", error.message);
        reply("Could not fetch news. Please try again later.");
    }
});
