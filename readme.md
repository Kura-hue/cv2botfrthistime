# 🤖 Advanced Discord Bot

A powerful, modular, and scalable Discord bot built with **Node.js** and **discord.js**, featuring moderation, utility, music, tickets, giveaways, and social systems — all in one.

---

## 🚀 Features

### 🛡️ Moderation

* Ban, Kick, Timeout, Softban
* Warn system with history tracking
* Clear messages, purge, nuke channels
* Lock / Unlock channels
* Slowmode control
* Role management
* Mod logs system

---

### ⚙️ Utility

* User, server, and bot info
* Ping & uptime tracking
* Reminders and timers
* Poll creation
* Translation system
* Avatar & banner fetch
* Invite tracking
* QR code generator
* URL shortener
* Math & weather commands

---

### 🎫 Ticket System

* Create and manage support tickets
* Add / remove users from tickets
* Close tickets with logs

---

### 🎉 Giveaway System

* Start giveaways
* End giveaways
* Reroll winners

---

### 🎵 Music System

* Play music from URLs or search
* Queue system
* Skip, pause, resume, stop
* Loop & shuffle
* Volume control
* Lyrics support
* Seek & move tracks

---

### ❤️ Social System

* Marriage & relationship system
* Adopt & family commands
* Reputation system
* Fun interaction commands (hug, slap, kiss, etc.)

---

### 🤖 AI & API Features

* AI chat history storage
* Roblox & Minecraft integrations
* Chat API commands

---

### ⚡ Events & Handlers

* Slash command handler
* Prefix command handler
* Centralized error handling
* Event-based architecture

---

## 📂 Project Structure

* `commands/` → Slash commands
* `prefix/` → Prefix-based commands
* `handlers/` → Command/event loaders
* `events/` → Discord event listeners
* `models/` → Database schemas
* `utils/` → Helper functions

---

## 🛠️ Installation

```bash
git clone <your-repo-url>
cd your-bot
npm install
```

---

## ⚙️ Configuration

1. Rename `.env.example` → `.env` (if applicable)
2. Add your bot token:

```
TOKEN=your_bot_token_here
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
```

3. Configure `config.js` as needed

---

## ▶️ Running the Bot

```bash
node deploy-commands.js
node index.js
```

---

## 📌 Requirements

* Node.js v18+
* Discord Bot Token
* MongoDB (for database models)

---

## 📈 Future Improvements

* Dashboard (web panel)
* Advanced logging UI
* AI-powered moderation
* Custom command builder

---

## 🤝 Contributing

Pull requests are welcome! Feel free to fork the project and improve it.

---

## 📜 License

This project is licensed under the MIT License.

---

## 💬 Support

If you need help, open an issue or contact the developer.

---

⭐ Don't forget to star the repo if you like this project!
