const fs = require('fs');
const path = require('path');
const { getConfig } = require("./lib/configdb");

if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    // ===== BOT CORE SETTINGS =====
    PREFIX: getConfig("PREFIX") || ".",  // Command prefix (e.g., "., / ! * - +")
    CHATBOT: getConfig("CHATBOT") || "on", // on/off chat bot 
    BOT_NAME: getConfig("BOT_NAME") || process.env.BOT_NAME || "𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫",  // Bot's display name
    MODE: getConfig("MODE") || process.env.MODE || "public",        // Bot mode: public/private/group/inbox
    REPO: process.env.REPO || "hhttps://github.com/MUZAMIL-TECHX",  // Bot's GitHub repo
    BAILEYS: process.env.BAILEYS || "@whiskeysockets/baileys",  // Bot's BAILEYS

    // ===== OWNER & DEVELOPER SETTINGS =====
    OWNER_NUMBER: getConfig("OWNER_NUMBER") || process.env.BOT_PAIR_NUMBER || process.env.OWNER_NUMBER || "923130122643",  // Owner's WhatsApp number
    OWNER_NAME: getConfig("OWNER_NAME") || process.env.OWNER_NAME || "C9-Mᴜᴢᴀᴍɪʟ",           // Owner's name
    DEV: process.env.DEV || "923130122643",                     // Developer's contact number
    DEVELOPER_NUMBER: '923130122643@s.whatsapp.net',            // Developer's WhatsApp ID

    // ===== AUTO-RESPONSE SETTINGS =====
    AUTO_REPLY: getConfig("AUTO_REPLY") || process.env.AUTO_REPLY || "false",              // Enable/disable auto-reply
    AUTO_STATUS_REPLY: getConfig("AUTO_STATUS_REPLY") || process.env.AUTO_STATUS_REPLY || "false",// Reply to status updates?
    AUTO_STATUS_MSG: getConfig("AUTO_STATUS_MSG") || process.env.AUTO_STATUS_MSG || "*𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫 VIEWED YOUR STATUS 🤖*",  // Status reply message
    READ_MESSAGE: getConfig("READ_MESSAGE") || process.env.READ_MESSAGE || "false",          // Mark messages as read automatically?
    REJECT_MSG: process.env.REJECT_MSG || "*📞 ᴄαℓℓ ɴσт αℓℓσωє∂ ιɴ тнιѕ ɴᴜмвєʀ уσυ ∂σɴт нανє ᴘєʀмιѕѕισɴ 📵*",
    // ===== REACTION & STICKER SETTINGS =====
    AUTO_REACT: getConfig("AUTO_REACT") || process.env.AUTO_REACT || "false",              // Auto-react to messages?
    OWNER_REACT: getConfig("OWNER_REACT") || process.env.OWNER_REACT || "false",              // Auto-react to messages?
    CUSTOM_REACT: getConfig("CUSTOM_REACT") || process.env.CUSTOM_REACT || "false",          // Use custom emoji reactions?
    CUSTOM_REACT_EMOJIS: getConfig("CUSTOM_REACT_EMOJIS") || process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",  // set custom reacts
    STICKER_NAME: getConfig("STICKER_NAME") || process.env.STICKER_NAME || "𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫",     // Sticker pack name
    AUTO_STICKER: getConfig("AUTO_STICKER") || process.env.AUTO_STICKER || "false",          // Auto-send stickers?
    // ===== MEDIA & AUTOMATION =====
    AUTO_RECORDING: getConfig("AUTO_RECORDING") || process.env.AUTO_RECORDING || "false",      // Auto-record voice notes?
    AUTO_TYPING: getConfig("AUTO_TYPING") || process.env.AUTO_TYPING || "false",            // Show typing indicator?
    MENTION_REPLY: getConfig("MENTION_REPLY") || process.env.MENTION_REPLY || "false",   // reply on mentioned message
    MENU_IMAGE_URL: getConfig("MENU_IMAGE_URL") || process.env.MENU_IMAGE_URL || "https://i.ibb.co/zhBH3mzR/file-000000002ae08211834774ce8bc71642.png",  // Bot's menu image URL

    // ===== SECURITY & ANTI-FEATURES =====
    ANTI_DELETE: getConfig("ANTI_DELETE") || process.env.ANTI_DELETE || "true", // true antidelete to recover deleted messages
    ANTI_CALL: getConfig("ANTI_CALL") || process.env.ANTI_CALL || "false", // enble to reject calls automatically
    ANTI_BAD_WORD: getConfig("ANTI_BAD_WORD") || process.env.ANTI_BAD_WORD || "false",    // Block bad words?
    ANTI_LINK: getConfig("ANTI_LINK") || process.env.ANTI_LINK || "true",    // Block links in groups
    ANTI_VV: getConfig("ANTI_VV") || process.env.ANTI_VV || "true",   // Block view-once messages
    DELETE_LINKS: getConfig("DELETE_LINKS") || process.env.DELETE_LINKS || "false",          // Auto-delete links?
    ANTI_DEL_PATH: getConfig("ANTI_DEL_PATH") || process.env.ANTI_DEL_PATH || "same", // inbox deleted messages (or 'same' to resend)
    ANTI_BOT: getConfig("ANTI_BOT") || process.env.ANTI_BOT || "true",
    PM_BLOCKER: getConfig("PM_BLOCKER") || process.env.PM_BLOCKER || "true",

    // ===== BOT BEHAVIOR & APPEARANCE =====
    DESCRIPTION: getConfig("DESCRIPTION") || process.env.DESCRIPTION || "*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫*",  // Bot description
    PUBLIC_MODE: getConfig("PUBLIC_MODE") || process.env.PUBLIC_MODE || "true",              // Allow public commands?
    ALWAYS_ONLINE: getConfig("ALWAYS_ONLINE") || process.env.ALWAYS_ONLINE || "false",        // Show bot as always online?
    AUTO_STATUS_REACT: getConfig("AUTO_STATUS_REACT") || process.env.AUTO_STATUS_REACT || "true", // React to status updates?
    AUTO_STATUS_SEEN: getConfig("AUTO_STATUS_SEEN") || process.env.AUTO_STATUS_SEEN || "true", // VIEW to status updates?
    AUTO_BIO: getConfig("AUTO_BIO") || process.env.AUTO_BIO || "false", // ture to get auto bio
    WELCOME: getConfig("WELCOME") || process.env.WELCOME || "false", // true to get welcome in groups
    GOODBYE: getConfig("GOODBYE") || process.env.GOODBYE || "false", // true to get goodbye in groups
    ADMIN_ACTION: getConfig("ADMIN_ACTION") || process.env.ADMIN_ACTION || "false", // true if want see admin activity
};
        
