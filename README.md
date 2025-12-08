# ModInfo+ 📊✨

Track real-time GitHub download statistics for Mindustry mods directly in-game!

---

## 🌟 What is ModInfo+?

ModInfo+ is a lightweight statistics viewer that connects to GitHub's API to fetch **actual download counts** for your favorite Mindustry mods. No more guessing — see exactly how popular each mod is with real data.

The tracker is organized into categories and displays mods in a clean, easy-to-read interface with pagination and smart caching for optimal performance.

---

## 📊 Features

- ✅ Real-time GitHub statistics with 5-minute smart caching
- ✅ Category-based organization (My Mods, Content Mods, Tool Mods)
- ✅ Paginated view (2 mods per page for zero lag)
- ✅ 60-second refresh cooldown to prevent API spam
- ✅ Download counts formatted (1.2K, 3.5M, etc.)
- ✅ Release count tracking
- ✅ Cache timer display (shows time until next refresh)
- ✅ Color-coded status indicators
- ✅ Clean, intuitive UI with navigation

---

## 🎮 How to Use

1. Click the **ModInfo+** button in the main menu
2. Select a category from the top tabs
3. Browse mods (2 per page)
4. Use **< Prev** and **Next >** to navigate
5. Hit **Refresh** to update stats (1-minute cooldown)
6. Cached stats show countdown until auto-refresh

Your tracked mods will load automatically with their latest GitHub data!

---

## 📦 Currently Tracked

### ⭐ My Mods (3)
- Unit Namer Mod
- Shop System Mod
- ModInfo+ Mod

### 📚 Content Mods (5)
- The Infestations
- Astralis
- Lovecraftian Library
- Thermal Engineering
- Rusted Dunes

### 🛠️ Tool Mods (2)
- Mod Tools
- HJSON++

**Total: 10 mods tracked across 3 categories**

---

## 📢 Help Expand the List!

This mod is **community-driven**. Want to add a mod?

- Contact me on Discord: **samielkun**
- Open a GitHub issue with the repo link
- Format: `owner/repo` (e.g., SamielXD/UnitNamerMod)

If you're a mod creator or know someone's repo, please share!

---

## 🔍 How It Works

ModInfo+ connects to the **GitHub API** and fetches:
- All releases for each tracked mod
- Download counts for each release asset
- Total downloads across all versions

Features a **smart caching system**:
- Stats cached for 5 minutes
- Displays time remaining until refresh
- Reduces API calls and improves performance
- Manual refresh available with 60-second cooldown

---

## ⚠️ Important Notes

### Accuracy Disclaimer
Some mod info may be inaccurate due to:
- Incorrect or outdated repo links
- Typos in owner/repo names
- Forks instead of main repos
- Private or deleted repositories

If you spot an error, **please report it** so I can fix it!

### Requirements
- Active internet connection
- GitHub API access (token included)

---

## 📊 Tracked Statistics

For each mod, you'll see:
- **Total downloads** (formatted: 1.2K, 500, 2.3M)
- **Release count** (how many versions published)
- **Cache status** (time until refresh or "Loading...")
- **Error status** (if repo fails or has no releases)

---

## 🔄 Caching & Refresh System

**Smart Caching:**
- Stats cached for 5 minutes per mod
- Cache timer displays remaining time
- Automatic refresh when cache expires
- Separate cache for each repository

**Manual Refresh:**
- 60-second cooldown between refreshes
- Clears all cached data
- Reloads dialog with fresh stats
- Shows toast notification if cooldown active

---

## 🎨 UI Design

- **Category Tabs** → Switch between My Mods, Content Mods, Tool Mods
- **Pagination** → 2 mods per page for smooth scrolling
- **Color Coding** → Cyan for my mods, white for others
- **Status Colors** → Yellow (loading), Lime (success), Red (failed)
- **Cache Display** → Gray text showing time until refresh
- **Navigation** → Disabled buttons when at page limits

---

## 📜 Changelog

### v1.1 (Current)
**New Features:**
- ✨ Smart 5-minute caching system per repository
- ⏱️ Cache timer display showing time until auto-refresh
- 📊 Added 8 new tracked mods (total: 10)
- 🗂️ Reorganized into 3 categories: My Mods, Content Mods, Tool Mods
- 🚫 Improved navigation with disabled buttons at page limits

**Tracked Mods Added:**
- The Infestations, Astralis, Lovecraftian Library
- Thermal Engineering, Rusted Dunes
- Mod Tools, HJSON++

**Performance:**
- Reduced API calls with intelligent caching
- Faster load times with cached data
- Better error handling for failed requests

---

### v1.0 (Initial Release)
**Features:**
- 📊 Real-time GitHub statistics fetching
- 🗂️ Category-based organization
- 📄 Paginated view (2 mods per page)
- 🔄 60-second manual refresh cooldown
- 📈 Download count formatting (K, M)
- 🎨 Color-coded UI with status indicators

**Initial Tracked Mods:**
- Unit Namer Mod, Shop System Mod

---

## 🚀 Future Plans

- Add more popular mods with verified repos
- Search/filter functionality
- Sort by downloads, releases, or alphabetically
- Export stats to clipboard
- Mod comparison tool
- Historical download tracking
- Additional categories (Utility, Graphics, PvP, etc.)

Development is ongoing — stay tuned for updates!

---

## ⭐ Support & Feedback

Enjoying ModInfo+? Here's how to help:

- ✅ Star the GitHub repo
- ✅ Share accurate mod repos with me
- ✅ Report bugs or inaccuracies
- ✅ Suggest new features

**Contact:** Discord **samielkun** | GitHub issues

---

## 🔧 Technical Details

**Cache System:**
- Cache duration: 5 minutes (300,000ms)
- Stores: downloads, releases, timestamp
- Key format: `owner/repo`

**Cooldown System:**
- Manual refresh: 60 seconds
- Tracked globally across all categories
- Displays remaining time in toast

**API Integration:**
- GitHub API v3
- Token authentication included
- 8-second connection/read timeout
- Error handling for failed requests

---

## 📜 Version Info

- **Current Version:** v1.1
- **Mods Tracked:** 10
- **Categories:** 3
- **New Features:** 5-minute caching system, cache timer display, improved navigation

---

Thanks for using ModInfo+ and helping grow the Mindustry mod community! 🎉
