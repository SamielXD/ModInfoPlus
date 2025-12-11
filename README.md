# ModInfo+ 📊✨
Track real-time GitHub download statistics for Mindustry mods directly in-game!

## 🌟 What is ModInfo+?
ModInfo+ is a lightweight statistics viewer that connects to GitHub's API to fetch actual download counts for your favorite Mindustry mods. No more guessing — see exactly how popular each mod is with real data.

The tracker is organized into categories and displays mods in a clean, easy-to-read interface with pagination and smart caching for optimal performance.

---

## 📊 Features
✅ Real-time GitHub statistics with detailed mod view  
✅ Click mod names to see in-depth statistics  
✅ Tier system (Diamond, Gold, Silver, Bronze, Rising)  
✅ Star counts and release date tracking  
✅ Growth rate tracking (downloads per month)  
✅ Smart 5-minute caching system  
✅ Category-based organization (My Mods, Content Mods, Tool Mods)  
✅ Paginated view (2 mods per page for zero lag)  
✅ 60-second refresh cooldown to prevent API spam  
✅ Download counts formatted (1.2K, 3.5M, etc.)  
✅ Release count tracking  
✅ Cache timer display (shows time until next refresh)  
✅ Color-coded status indicators  
✅ Clean, intuitive UI with navigation  

---

## 🎮 How to Use
1. Click the **ModInfo+** button in the main menu
2. Select a category from the top tabs
3. Browse mods (2 per page)
4. **Click on any mod name** to view detailed statistics
5. Use **< Prev** and **Next >** to navigate
6. Hit **Refresh** to update stats (1-minute cooldown)
7. Cached stats show countdown until auto-refresh

Your tracked mods will load automatically with their latest GitHub data!

---

## 📦 Currently Tracked

### ⭐ My Mods (3)
- Unit Namer Mod
- Shop System Mod
- ModInfo+ Mod

### 📚 Content Mods (8)
- The Infestations
- Astralis
- Lovecraftian Library
- Thermal Engineering
- Rusted Dunes
- Echo Fleet
- Arikoth
- More Defences

### 🛠️ Tool Mods (2)
- Mod Tools
- HJSON++

**Total: 13 mods tracked across 3 categories**

---

## 🏆 Tier System
Click any mod to see its tier badge based on downloads:

- 💎 **Diamond Tier** - 10,000+ downloads
- ⭐ **Gold Tier** - 5,000+ downloads
- ⭐ **Silver Tier** - 1,000+ downloads
- ⭐ **Bronze Tier** - 500+ downloads
- 🛡️ **Rising Star** - Under 500 downloads

Each tier represents the mod's popularity and success!

---

## 📊 Detailed Statistics View
Click any mod name to see:

**Basic Stats:**
- Total downloads (formatted)
- Release count (all versions)
- Star count (GitHub stars)

**Timeline:**
- Latest release date
- First release date

**Growth Metrics:**
- Downloads per month (estimated growth rate)
- Based on time since first release

**Tier Badge:**
- Visual tier indicator with icon
- Color-coded by achievement level

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
- Repository information (stars, dates)
- Total downloads across all versions

**Smart Caching System:**
- Stats cached for **5 minutes** per mod
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
- **Some mods may show 0 downloads or not work** because:
  - They only publish source code in releases (no downloadable files)
  - No release assets attached to their releases
  - Releases contain non-mod files only
  - GitHub API doesn't track direct repository downloads

If you spot an error, **please report it** so I can fix it!

### Requirements
- Active internet connection
- GitHub API access (token included)

---

## 📊 Tracked Statistics
For each mod, you'll see:

- Total downloads (formatted: 1.2K, 500, 2.3M)
- Release count (how many versions published)
- Cache status (time until refresh or "Loading...")
- Error status (if repo fails or has no releases)

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
- **Clickable Mod Names** → Open detailed statistics dialog
- **Color Coding** → Cyan for my mods, white for others
- **Status Colors** → Yellow (loading), White (success), Red (failed)
- **Cache Display** → Gray text showing time until refresh
- **Navigation** → Disabled buttons when at page limits
- **Tier Badges** → Visual achievement indicators

---

## 📜 Changelog

### v1.2 (Current)
**New Features:**
- ✨ **Clickable mod names** - tap any mod to view detailed stats
- 🏆 **Tier system** - Diamond, Gold, Silver, Bronze, Rising based on downloads
- ⭐ **Star counts** - GitHub repository star tracking
- 📅 **Release dates** - First and latest release timestamps
- 📈 **Growth rate tracking** - Estimated downloads per month
- 🎨 **Enhanced detail dialog** - Beautiful stat presentation with icons
- Added 3 new content mods: Echo Fleet, Arikoth, More Defences

**Improvements:**
- More informative detailed view with multiple data points
- Visual tier badges with icons and colors
- Better date formatting (Month DD, YYYY)
- Enhanced statistics calculations

### v1.1
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
- Extended detailed stats (contributors, languages, etc.)

Development is ongoing — stay tuned for updates!

---

## ⭐ Support & Feedback
Enjoying ModInfo+? Here's how to help:

✅ Star the GitHub repo  
✅ Share accurate mod repos with me  
✅ Report bugs or inaccuracies  
✅ Suggest new features  

**Contact:** Discord **samielkun** | GitHub issues

---

## 🔧 Technical Details

**Cache System:**
- Cache duration: 5 minutes (300,000ms)
- Stores: downloads, releases, stars, dates, growth rate, timestamp
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
- Fetches releases AND repository data

**Tier System:**
- Diamond: 10,000+ downloads
- Gold: 5,000+ downloads
- Silver: 1,000+ downloads
- Bronze: 500+ downloads
- Rising: Under 500 downloads

**Growth Rate Calculation:**
- Formula: `(total_downloads / days_since_first_release) * 30`
- Displays estimated downloads per month
- Based on lifetime average growth

---

## 📜 Version Info
- **Current Version:** v1.2
- **Mods Tracked:** 13
- **Categories:** 3
- **New Features:** Detailed stat views, tier system, growth tracking

---

Thanks for using ModInfo+ and helping grow the Mindustry mod community! 🎉
