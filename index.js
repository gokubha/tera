const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();
const fs = require('fs');
const axios = require('axios');

require('dotenv').config({
    path: './config.env'
});

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/start"
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Hello! 😊 Please give me a Terra link 🌍 and I will provide you with a video 🎥 and direct download link ⬇️.');
});

// Listen for any kind of message
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore '/start' command
    if (text === '/start') {
        return;
    }

    // Regular expression for the Terra box links
    const patterns = [
        /ww\.mirrobox\.com|www\.nephobox\.com|freeterabox\.com|www\.freeterabox\.com|1024tera\.com|4funbox\.co|www\.4funbox\.com|mirrobox\.com|nephobox\.com|terabox\.app|terabox\.com|www\.terabox\.ap|terabox\.fun|www\.terabox\.com|www\.1024tera\.co|www\.momerybox\.com|teraboxapp\.com|momerybox\.com|tibibox\.com|www\.tibibox\.com|www\.teraboxapp\.com/,
    ];


    if (!patterns.some(pattern => pattern.test(text))) {
        console.log('Please enter a valid Terra box link.');
    } else {
        console.log(text)
        //check is link response if response is 200 then send the video link and download link if not send error message
        try {
            await axios.post(`https://teraboxdown.com/api/get-data`, { "url": "https://www.terabox.app/sharing/link?surl=janrQ1WSk63w0LKf-NsSBw" }, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0"
                },
            }).then((response) => {
                const ddl_link = response.data[0].resolutions['HD Video'];
                if (response.status === 200) {
                    axios({
                        method: 'get',
                        url: ddl_link,
                        responseType: 'stream'
                    })
                        .then(async response => {
                            const contentDisposition = response.headers['content-disposition'];
                            const filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
                            const v2 = response.request.res.responseUrl;

                            bot.sendMessage(chatId, `🎥 Video Link: \`${v2}\`\n\n⬇️ Direct Download Link: \`${ddl_link}\``);

                        }).catch((error) => {
                            console.log(error.message)
                        });

                }
            }).catch((error) => {
                console.log(error.message)
            });
        } catch (error) {
            console.log(error)
            bot.sendMessage(chatId, error.message);
        }
    }

});