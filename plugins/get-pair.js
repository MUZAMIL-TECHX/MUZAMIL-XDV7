const { cmd, commands } = require('../command');
const axios = require('axios');

async function requestPairingCode(phoneNumber) {
    const baseUrl = (process.env.PAIRING_API_URL || process.env.PUBLIC_URL || '').replace(/\/+$/, '');
    if (!baseUrl) {
        throw new Error('Set PAIRING_API_URL to this bot deployment URL before using .pair.');
    }
    const response = await axios.get(`${baseUrl}/code`, {
        params: { number: phoneNumber },
        timeout: 65000
    });
    if (!response.data?.code) {
        throw new Error(response.data?.message || 'Pairing code was not returned.');
    }
    return response.data.code;
}

cmd({
    pattern: "pair",
    alias: ["getpair", "clonebot"],
    react: "✅",
    desc: "Get pairing code for 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫",
    category: "download",
    use: ".pair 923427582XXX",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply }) => {
    try {
        // Extract phone number from command
        const phoneNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');

        // Validate phone number format
        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            return await reply("❌ Please provide a valid phone number without `+`\nExample: `.pair 923427582XXX`");
        }

        const pairingCode = await requestPairingCode(phoneNumber);
        const doneMessage = "> *𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫 PAIRING COMPLETED*";

        // Send initial message with formatting
        await reply(`${doneMessage}\n\n*Your pairing code is:* ${pairingCode}`);

        // Optional 2-second delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Send clean code again
        await reply(`${pairingCode}`);

    } catch (error) {
        console.error("Pair command error:", error);
        await reply("❌ An error occurred while getting pairing code. Please try again later.");
    }
});

cmd({
    pattern: "pair2",
    alias: ["getpair2", "reqpair", "clonebot2"],
    react: "📉",
    desc: "Get pairing code for 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫 bot",
    category: "download",
    use: ".pair 923427582XXX",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply }) => {
    try {
        // Check if in group
        if (isGroup) {
            return await reply("❌ This command only works in private chat. Please message me directly.");
        }

        // Show processing reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Extract phone number
        const phoneNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');

        // Validate phone number
        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            return await reply("❌ Invalid phone number format!\n\nPlease use: `.pair 923000000000`\n(Without + sign)");
        }

        // Get pairing code from API
        const pairingCode = await requestPairingCode(phoneNumber);
        
        // Send image with caption
        const sentMessage = await conn.sendMessage(from, {
            image: { url: require('../config').MENU_IMAGE_URL },
            caption: `- *Pairing Code For 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫 ⚡*\n\n Notification has been sent to your WhatsApp. Please check your phone and copy this code to pair it..\n\n*🔢 Pairing Code*: *${pairingCode}*\n\n> *Copy it from below message 👇🏻*`
        }, { quoted: m });

        // Send clean code separately
        await reply(pairingCode);
        
        // Add ✅ reaction to the clean code message
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error("Pair command error:", error);
        await reply("❌ An error occurred. Please try again later.");
    }
});
