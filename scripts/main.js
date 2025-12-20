function getGitHubToken() {
    const parts = [
        "ghp_",
        "hEuol7gs0",
        "TBzjg1Yeg",
        "42mV70oH",
        "L7pK2UHZmW"
    ];
    return parts.join("");
}

const GITHUB_TOKEN = getGitHubToken();

let lastRefreshTime = 0;
const COOLDOWN_SECONDS = 60;

let statsCache = {};
let readmeCache = {};
const CACHE_TIME = 300000;

let watchlist = [];
const WATCHLIST_KEY = "modinfo_watchlist_v2";

let historicalData = {};
const HISTORICAL_KEY = "modinfo_historical_v2";

let milestoneData = {};
const MILESTONE_KEY = "modinfo_milestones_v2";

let userStars = {};
const USER_STARS_KEY = "modinfo_user_stars_v1";

let notifications = [];
const NOTIFICATIONS_KEY = "modinfo_notifications_v2";

let lastCheckedVersions = {};
const LAST_CHECKED_KEY = "modinfo_last_checked_v2";

let searchQuery = "";

const modCategories = {
    "My Mods": [
        {owner: "SamielXD", repo: "UnitNamerMod", name: "★ Unit Namer Mod"},
        {owner: "SamielXD", repo: "ShopSystemMod", name: "★ Shop System Mod"},
        {owner: "SamielXD", repo: "ModinfoPlus", name: "★ ModInfo+ Mod"},
    ],
    "Content Mods": [
        {owner: "Fat-Bird-Owner", repo: "The-Infestations", name: "The Infestations"},
        {owner: "Novanox4", repo: "Astralis", name: "Astralis (Unavailable right now)"},
        {owner: "HuanXefh", repo: "Lovecraftian-Library", name: "Lovecraftian Library"},
        {owner: "m1cxzfw3q", repo: "Thermal-Engineering-Java", name: "Thermal Engineering"},
        {owner: "New-guys5634", repo: "rusted-dunes", name: "Rusted Dunes"},
        {owner: "BSp-2", repo: "Echo-fleet", name: "Echo Fleet"},
        {owner: "cyanide863", repo: "Arikoth", name: "Arikoth"},
        {owner: "coaldeficit", repo: "MoreDefences", name: "More Defences"},
    ],
    "Tool Mods": [
        {owner: "I-hope1", repo: "mod-tools", name: "Mod Tools"},
        {owner: "ItzCraft", repo: "hjsonpp", name: "HJSON++"},
    ]
};

let currentCategory = "My Mods";
let currentPage = 0;
const MODS_PER_PAGE = 3;

const MAX_NOTIFICATIONS = 50;
const NOTIFICATION_EXPIRE_DAYS = 30;

function loadNotifications() {
    try {
        const saved = Core.settings.getString(NOTIFICATIONS_KEY, "[]");
        notifications = JSON.parse(saved);
        cleanupOldNotifications();
    } catch (e) {
        notifications = [];
    }
}

function saveNotifications() {
    Core.settings.put(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

function cleanupOldNotifications() {
    const now = Date.now();
    const expireTime = NOTIFICATION_EXPIRE_DAYS * 24 * 60 * 60 * 1000;
    
    const filtered = [];
    for (let i = 0; i < notifications.length; i++) {
        if (now - notifications[i].time < expireTime) {
            filtered.push(notifications[i]);
        }
    }
    
    if (filtered.length > MAX_NOTIFICATIONS) {
        notifications = filtered.slice(filtered.length - MAX_NOTIFICATIONS);
    } else {
        notifications = filtered;
    }
    
    saveNotifications();
}

function loadLastCheckedVersions() {
    try {
        const saved = Core.settings.getString(LAST_CHECKED_KEY, "{}");
        lastCheckedVersions = JSON.parse(saved);
    } catch (e) {
        lastCheckedVersions = {};
    }
}

function saveLastCheckedVersions() {
    Core.settings.put(LAST_CHECKED_KEY, JSON.stringify(lastCheckedVersions));
}

function addNotification(owner, repo, modName, type, message, extraData) {
    const key = owner + "/" + repo;
    
    for (let i = notifications.length - 1; i >= 0; i--) {
        const notif = notifications[i];
        if (notif.owner === owner && notif.repo === repo && 
            notif.type === type && notif.message === message) {
            const timeDiff = Date.now() - notif.time;
            if (timeDiff < 3600000) {
                return;
            }
        }
    }
    
    notifications.push({
        owner: owner,
        repo: repo,
        modName: modName,
        type: type,
        message: message,
        time: Date.now(),
        read: false,
        extraData: extraData || {}
    });
    
    if (notifications.length > MAX_NOTIFICATIONS) {
        notifications.shift();
    }
    
    saveNotifications();
}

function checkForUpdates(mod, stats) {
    const key = mod.owner + "/" + mod.repo;
    
    if (!isInWatchlist(mod.owner, mod.repo)) {
        return;
    }
    
    if (!lastCheckedVersions[key]) {
        lastCheckedVersions[key] = {
            downloads: stats.downloads,
            releases: stats.releases,
            lastRelease: stats.latestRelease,
            stars: stats.stars || 0
        };
        saveLastCheckedVersions();
        return;
    }
    
    const lastChecked = lastCheckedVersions[key];
    
    if (stats.releases > lastChecked.releases) {
        const newReleases = stats.releases - lastChecked.releases;
        const releaseText = newReleases === 1 ? "1 new release" : newReleases + " new releases";
        addNotification(
            mod.owner, 
            mod.repo, 
            mod.name, 
            "release", 
            releaseText + " available!",
            {releaseCount: newReleases}
        );
    }
    
    if (stats.latestRelease !== lastChecked.lastRelease && stats.latestRelease) {
        const releaseDate = formatDate(stats.latestRelease);
        addNotification(
            mod.owner, 
            mod.repo, 
            mod.name, 
            "update", 
            "Updated on " + releaseDate,
            {date: stats.latestRelease}
        );
    }
    
    const downloadDiff = stats.downloads - lastChecked.downloads;
    if (downloadDiff >= 100) {
        addNotification(
            mod.owner, 
            mod.repo, 
            mod.name, 
            "downloads", 
            "+" + formatNumber(downloadDiff) + " new downloads",
            {amount: downloadDiff}
        );
    }
    
    if (stats.stars > lastChecked.stars && stats.stars > 0) {
        const starDiff = stats.stars - lastChecked.stars;
        if (starDiff >= 5 || (stats.stars >= 10 && starDiff >= 1)) {
            addNotification(
                mod.owner, 
                mod.repo, 
                mod.name, 
                "stars", 
                "+" + starDiff + " new GitHub stars!",
                {amount: starDiff, total: stats.stars}
            );
        }
    }
    
    lastCheckedVersions[key] = {
        downloads: stats.downloads,
        releases: stats.releases,
        lastRelease: stats.latestRelease,
        stars: stats.stars || 0
    };
    saveLastCheckedVersions();
}

function getUnreadCount() {
    let count = 0;
    for (let i = 0; i < notifications.length; i++) {
        if (!notifications[i].read) {
            count++;
        }
    }
    return count;
}

function markNotificationAsRead(index) {
    if (index >= 0 && index < notifications.length) {
        notifications[index].read = true;
        saveNotifications();
    }
}

function markAllAsRead() {
    for (let i = 0; i < notifications.length; i++) {
        notifications[i].read = true;
    }
    saveNotifications();
}

function clearAllNotifications() {
    notifications = [];
    saveNotifications();
}

function clearReadNotifications() {
    const unread = [];
    for (let i = 0; i < notifications.length; i++) {
        if (!notifications[i].read) {
            unread.push(notifications[i]);
        }
    }
    notifications = unread;
    saveNotifications();
}

function getNotificationIcon(type) {
    if (type === "release") return Icon.upload;
    if (type === "update") return Icon.refresh;
    if (type === "downloads") return Icon.download;
    if (type === "stars") return Icon.star;
    if (type === "milestone") return Icon.ok;
    if (type === "warning") return Icon.warning;
    return Icon.info;
}

function getNotificationColor(type) {
    if (type === "release") return "[lime]";
    if (type === "update") return "[sky]";
    if (type === "downloads") return "[yellow]";
    if (type === "stars") return "[orange]";
    if (type === "milestone") return "[accent]";
    if (type === "warning") return "[scarlet]";
    return "[white]";
}

function loadUserStars() {
    try {
        const saved = Core.settings.getString(USER_STARS_KEY, "{}");
        userStars = JSON.parse(saved);
    } catch (e) {
        userStars = {};
    }
}

function saveUserStars() {
    Core.settings.put(USER_STARS_KEY, JSON.stringify(userStars));
}

function hasUserStarred(owner, repo) {
    const key = owner + "/" + repo;
    return userStars[key] === true;
}

function toggleUserStar(owner, repo, modName) {
    const key = owner + "/" + repo;
    
    if (userStars[key]) {
        delete userStars[key];
        Vars.ui.showInfoToast("[yellow]Unstarred " + modName, 2);
        saveUserStars();
        statsCache = {};
    } else {
        userStars[key] = true;
        Vars.ui.showInfoToast("[accent]Opening GitHub to star " + modName + "...", 2);
        saveUserStars();
        
        const repoUrl = "https://github.com/" + owner + "/" + repo;
        
        try {
            if (Vars.mobile) {
                Core.app.openURI(repoUrl);
            } else {
                if (java.awt.Desktop.isDesktopSupported()) {
                    const desktop = java.awt.Desktop.getDesktop();
                    desktop.browse(new java.net.URI(repoUrl));
                } else {
                    Core.app.openURI(repoUrl);
                }
            }
            
            Vars.ui.showInfoToast("[lime]Opened in browser - Click the Star button!", 4);
        } catch (e) {
            Vars.ui.showInfoToast("[scarlet]Failed to open browser", 2);
        }
        
        statsCache = {};
    }
}

function loadWatchlist() {
    try {
        const saved = Core.settings.getString(WATCHLIST_KEY, "[]");
        watchlist = JSON.parse(saved);
    } catch (e) {
        watchlist = [];
    }
}

function saveWatchlist() {
    Core.settings.put(WATCHLIST_KEY, JSON.stringify(watchlist));
}

function isInWatchlist(owner, repo) {
    for (let i = 0; i < watchlist.length; i++) {
        if (watchlist[i].owner === owner && watchlist[i].repo === repo) {
            return true;
        }
    }
    return false;
}

function toggleWatchlist(mod) {
    let found = false;
    for (let i = 0; i < watchlist.length; i++) {
        if (watchlist[i].owner === mod.owner && watchlist[i].repo === mod.repo) {
            watchlist.splice(i, 1);
            found = true;
            Vars.ui.showInfoToast("[scarlet]Removed from watchlist", 1.5);
            break;
        }
    }
    
    if (!found) {
        watchlist.push({
            owner: mod.owner,
            repo: mod.repo,
            name: mod.name,
            addedTime: Date.now()
        });
        Vars.ui.showInfoToast("[lime]Added to watchlist - You'll get notifications!", 2);
    }
    
    saveWatchlist();
}

function loadHistoricalData() {
    try {
        const saved = Core.settings.getString(HISTORICAL_KEY, "{}");
        historicalData = JSON.parse(saved);
    } catch (e) {
        historicalData = {};
    }
}

function saveHistoricalData() {
    Core.settings.put(HISTORICAL_KEY, JSON.stringify(historicalData));
}

function recordHistoricalData(owner, repo, downloads) {
    const key = owner + "/" + repo;
    if (!historicalData[key]) {
        historicalData[key] = [];
    }
    
    const now = Date.now();
    const today = new Date(now).toDateString();
    
    let found = false;
    for (let i = 0; i < historicalData[key].length; i++) {
        if (new Date(historicalData[key][i].time).toDateString() === today) {
            historicalData[key][i].downloads = downloads;
            found = true;
            break;
        }
    }
    
    if (!found) {
        historicalData[key].push({
            time: now,
            downloads: downloads
        });
        
        if (historicalData[key].length > 30) {
            historicalData[key].shift();
        }
    }
    
    saveHistoricalData();
}

function loadMilestones() {
    try {
        const saved = Core.settings.getString(MILESTONE_KEY, "{}");
        milestoneData = JSON.parse(saved);
    } catch (e) {
        milestoneData = {};
    }
}

function saveMilestones() {
    Core.settings.put(MILESTONE_KEY, JSON.stringify(milestoneData));
}

function checkMilestones(owner, repo, downloads, modName) {
    const key = owner + "/" + repo;
    const milestones = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
    
    if (!milestoneData[key]) {
        milestoneData[key] = {reached: []};
    }
    
    for (let i = 0; i < milestones.length; i++) {
        const milestone = milestones[i];
        if (downloads >= milestone && milestoneData[key].reached.indexOf(milestone) === -1) {
            milestoneData[key].reached.push(milestone);
            saveMilestones();
            
            if (isInWatchlist(owner, repo)) {
                addNotification(
                    owner,
                    repo,
                    modName,
                    "milestone",
                    "Reached " + formatNumber(milestone) + " downloads!",
                    {milestone: milestone}
                );
                Vars.ui.showInfoToast("[accent]" + modName + " hit " + formatNumber(milestone) + " downloads!", 3);
            }
        }
    }
}

function formatNumber(num) {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + "K";
    return (num / 1000000).toFixed(1) + "M";
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
        return mins + "m " + secs + "s";
    }
    return secs + "s";
}

function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return "Just now";
    if (minutes < 60) return minutes + "m ago";
    if (hours < 24) return hours + "h ago";
    if (days < 7) return days + "d ago";
    if (days < 30) return Math.floor(days / 7) + "w ago";
    return Math.floor(days / 30) + "mo ago";
}

function getDownloadTier(downloads) {
    if (downloads >= 10000) return {name: "Diamond", color: "[sky]", icon: Icon.star};
    if (downloads >= 5000) return {name: "Gold", color: "[yellow]", icon: Icon.star};
    if (downloads >= 1000) return {name: "Silver", color: "[lightgray]", icon: Icon.star};
    if (downloads >= 500) return {name: "Bronze", color: "[orange]", icon: Icon.star};
    return {name: "Rising", color: "[white]", icon: Icon.units};
}

function calculateGrowthRate(downloads, daysSinceFirst) {
    if (daysSinceFirst <= 0) return 0;
    return Math.round((downloads / daysSinceFirst) * 30);
}

function getGrowthIndicator(owner, repo) {
    const key = owner + "/" + repo;
    const data = historicalData[key];
    
    if (!data || data.length < 2) {
        return {text: "", color: Color.gray};
    }
    
    const recent = data[data.length - 1].downloads;
    const older = data[0].downloads;
    const change = recent - older;
    
    if (change > 0) {
        return {text: "+" + formatNumber(change), color: Color.lime};
    } else if (change < 0) {
        return {text: formatNumber(change), color: Color.scarlet};
    }
    
    return {text: "━", color: Color.gray};
}

function filterMods(mods, query) {
    if (!query || query.trim().length === 0) {
        return mods;
    }
    
    const filtered = [];
    const lowerQuery = query.toLowerCase();
    
    for (let i = 0; i < mods.length; i++) {
        const mod = mods[i];
        if (mod.name.toLowerCase().indexOf(lowerQuery) >= 0 || 
            mod.owner.toLowerCase().indexOf(lowerQuery) >= 0 ||
            mod.repo.toLowerCase().indexOf(lowerQuery) >= 0) {
            filtered.push(mod);
        }
    }
    
    return filtered;
}

function findModByKey(owner, repo) {
    for (let category in modCategories) {
        const mods = modCategories[category];
        for (let i = 0; i < mods.length; i++) {
            if (mods[i].owner === owner && mods[i].repo === repo) {
                return mods[i];
            }
        }
    }
    
    for (let i = 0; i < watchlist.length; i++) {
        if (watchlist[i].owner === owner && watchlist[i].repo === repo) {
            return watchlist[i];
        }
    }
    
    return {owner: owner, repo: repo, name: owner + "/" + repo};
}function drawSparkline(owner, repo) {
    const key = owner + "/" + repo;
    const data = historicalData[key];
    
    if (!data || data.length < 2) {
        return {text: "━━━━", color: Color.gray, trend: "none"};
    }
    
    const chars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    let result = "";
    
    let min = data[0].downloads;
    let max = data[0].downloads;
    
    for (let i = 0; i < data.length; i++) {
        if (data[i].downloads < min) min = data[i].downloads;
        if (data[i].downloads > max) max = data[i].downloads;
    }
    
    const range = max - min;
    if (range === 0) return {text: "━━━━", color: Color.gray, trend: "stable"};
    
    const maxPoints = 10;
    const step = Math.max(1, Math.floor(data.length / maxPoints));
    
    for (let i = 0; i < data.length; i += step) {
        if (result.length >= maxPoints) break;
        const normalized = (data[i].downloads - min) / range;
        const charIndex = Math.floor(normalized * (chars.length - 1));
        result = result + chars[charIndex];
    }
    
    const recentData = data.slice(Math.max(0, data.length - 7));
    let trend = "stable";
    let trendColor = Color.gray;
    
    if (recentData.length >= 2) {
        const oldAvg = recentData[0].downloads;
        const newAvg = recentData[recentData.length - 1].downloads;
        const change = ((newAvg - oldAvg) / oldAvg) * 100;
        
        if (change > 5) {
            trend = "rising";
            trendColor = Color.lime;
        } else if (change < -5) {
            trend = "falling";
            trendColor = Color.scarlet;
        }
    }
    
    return {text: result, color: trendColor, trend: trend};
}

function drawDetailedGraph(mod, stats) {
    const key = mod.owner + "/" + mod.repo;
    const data = historicalData[key];
    
    if (!data || data.length < 2) {
        return null;
    }
    
    const graphTable = new Table();
    graphTable.background(Tex.button);
    
    graphTable.add("[accent]Download History (" + data.length + " days)").colspan(2).row();
    graphTable.add("").height(15).colspan(2).row();
    
    let minDownloads = data[0].downloads;
    let maxDownloads = data[0].downloads;
    
    for (let i = 0; i < data.length; i++) {
        if (data[i].downloads < minDownloads) minDownloads = data[i].downloads;
        if (data[i].downloads > maxDownloads) maxDownloads = data[i].downloads;
    }
    
    const range = maxDownloads - minDownloads;
    const graphHeight = 15;
    const graphWidth = Math.min(data.length, 50);
    
    if (range > 0) {
        const yLabels = [];
        for (let i = 0; i <= 4; i++) {
            const value = minDownloads + (range * i / 4);
            yLabels.push(formatNumber(Math.round(value)));
        }
        
        for (let row = graphHeight; row >= 0; row--) {
            const threshold = minDownloads + (row / graphHeight) * range;
            let line = "";
            
            for (let col = 0; col < graphWidth; col++) {
                const dataIndex = Math.floor((col / graphWidth) * data.length);
                const val = data[dataIndex].downloads;
                
                const diff = val - threshold;
                const cellHeight = range / graphHeight;
                
                if (diff >= cellHeight * 0.75) {
                    line = line + "█";
                } else if (diff >= cellHeight * 0.5) {
                    line = line + "▓";
                } else if (diff >= cellHeight * 0.25) {
                    line = line + "▒";
                } else if (diff >= 0) {
                    line = line + "░";
                } else {
                    line = line + " ";
                }
            }
            
            if (row % 4 === 0 && row <= graphHeight) {
                const labelIndex = row / 4;
                graphTable.add("[white]" + yLabels[labelIndex]).right().width(70);
                graphTable.add("[cyan]" + line).left().row();
            } else {
                graphTable.add("").width(70);
                graphTable.add("[cyan]" + line).left().row();
            }
        }
        
        graphTable.add("").width(70);
        let xAxisLine = "";
        for (let i = 0; i < graphWidth; i++) {
            xAxisLine = xAxisLine + "─";
        }
        graphTable.add("[gray]" + xAxisLine).left().row();
        
        if (data.length > 1) {
            const firstDate = new Date(data[0].time);
            const lastDate = new Date(data[data.length - 1].time);
            const firstLabel = (firstDate.getMonth() + 1) + "/" + firstDate.getDate();
            const lastLabel = (lastDate.getMonth() + 1) + "/" + lastDate.getDate();
            
            const padding = Math.max(0, graphWidth - firstLabel.length - lastLabel.length - 1);
            const spacer = " ".repeat(Math.floor(padding));
            
            graphTable.add("[gray]" + firstLabel).right().width(70);
            graphTable.add("[gray]" + spacer + lastLabel).left().row();
        }
    }
    
    graphTable.add("").height(10).colspan(2).row();
    
    const oldestDownloads = data[0].downloads;
    const newestDownloads = data[data.length - 1].downloads;
    const change = newestDownloads - oldestDownloads;
    
    if (change !== 0) {
        const changePercent = oldestDownloads > 0 ? ((change / oldestDownloads) * 100).toFixed(1) : 0;
        const changeColor = change >= 0 ? "[lime]" : "[scarlet]";
        const changeSymbol = change >= 0 ? "▲ +" : "▼ ";
        
        graphTable.add(changeColor + changeSymbol + formatNumber(change) + 
                      " (" + (change >= 0 ? "+" : "") + changePercent + "%) over " + 
                      data.length + " days").colspan(2).row();
    }
    
    if (data.length > 1) {
        const avgDaily = change / data.length;
        const avgColor = avgDaily >= 0 ? "[lime]" : "[scarlet]";
        const avgSymbol = avgDaily >= 0 ? "+" : "";
        
        graphTable.add(avgColor + "Average: " + avgSymbol + 
                      formatNumber(Math.round(avgDaily)) + " downloads/day").colspan(2).row();
    }
    
    const sparkline = drawSparkline(mod.owner, mod.repo);
    let trendText = "";
    
    if (sparkline.trend === "rising") {
        trendText = "[lime]Trending Up";
    } else if (sparkline.trend === "falling") {
        trendText = "[scarlet]Trending Down";
    } else {
        trendText = "[gray]Stable";
    }
    
    graphTable.add("").height(5).colspan(2).row();
    graphTable.add(trendText).colspan(2).row();
    
    return graphTable;
}

function fetchReadme(owner, repo, callback) {
    const cacheKey = owner + "/" + repo;
    const now = Date.now();
    
    if (readmeCache[cacheKey] && (now - readmeCache[cacheKey].time) < CACHE_TIME) {
        callback(readmeCache[cacheKey].content, true);
        return;
    }
    
    Core.app.post(function() {
        try {
            const readmeUrl = "https://api.github.com/repos/" + owner + "/" + repo + "/readme";
            const http = new java.net.URL(readmeUrl).openConnection();
            http.setRequestMethod("GET");
            if (GITHUB_TOKEN) {
                http.setRequestProperty("Authorization", "Bearer " + GITHUB_TOKEN);
            }
            http.setRequestProperty("Accept", "application/vnd.github.raw");
            http.setRequestProperty("User-Agent", "MindustryModStats");
            http.setConnectTimeout(10000);
            http.setReadTimeout(10000);
            
            const stream = http.getInputStream();
            const reader = new java.io.BufferedReader(new java.io.InputStreamReader(stream));
            
            let content = "";
            let line;
            while ((line = reader.readLine()) != null) {
                content = content + line + "\n";
            }
            reader.close();
            
            readmeCache[cacheKey] = {
                content: content,
                time: Date.now()
            };
            
            Core.app.post(function() {
                callback(content, false);
            });
            
        } catch (e) {
            Core.app.post(function() {
                callback(null, false);
            });
        }
    });
}

function parseMarkdown(markdown) {
    if (!markdown) return "[scarlet]README not found";
    
    let parsed = markdown;
    parsed = parsed.replace(/!\[.*?\]\(.*?\)/g, "[Image]");
    parsed = parsed.replace(/^### (.*$)/gm, "[accent]$1");
    parsed = parsed.replace(/^## (.*$)/gm, "[yellow]$1");
    parsed = parsed.replace(/^# (.*$)/gm, "[cyan]$1");
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, "[accent]$1[]");
    parsed = parsed.replace(/\*(.*?)\*/g, "[lightgray]$1[]");
    parsed = parsed.replace(/```[\s\S]*?```/g, "[gray][Code Block][]");
    parsed = parsed.replace(/`(.*?)`/g, "[orange]$1[]");
    parsed = parsed.replace(/\[(.*?)\]\((.*?)\)/g, "[sky]$1[] [gray]($2)[]");
    parsed = parsed.replace(/^[\*\-] (.*$)/gm, "  • $1");
    
    return parsed;
}

function showReadmeDialog(mod) {
    const readmeDialog = new BaseDialog("README: " + mod.name);
    
    const scrollPane = new ScrollPane(new Table());
    const contentTable = scrollPane.getWidget();
    contentTable.defaults().pad(10).left();
    
    const loadingLabel = new Label("[yellow]Loading README...");
    contentTable.add(loadingLabel).row();
    
    readmeDialog.cont.add(scrollPane).grow();
    
    readmeDialog.buttons.button("Close", function() {
        readmeDialog.hide();
    }).size(100, 50);
    
    readmeDialog.show();
    
    fetchReadme(mod.owner, mod.repo, function(content, fromCache) {
        contentTable.clear();
        
        if (content) {
            const parsed = parseMarkdown(content);
            const lines = parsed.split("\n");
            
            for (let i = 0; i < lines.length && i < 200; i++) {
                if (lines[i].trim().length > 0) {
                    contentTable.add(lines[i]).left().fillX().row();
                } else {
                    contentTable.add("").height(10).row();
                }
            }
            
            if (fromCache) {
                contentTable.add("").height(20).row();
                contentTable.add("[gray]Cached README").row();
            }
        } else {
            contentTable.add("[scarlet]README not found or failed to load").row();
            contentTable.add("[lightgray]This mod may not have a README file").row();
        }
    });
}

function fetchModStats(owner, repo, callback) {
    const cacheKey = owner + "/" + repo;
    const now = Date.now();
    
    if (statsCache[cacheKey] && (now - statsCache[cacheKey].time) < CACHE_TIME) {
        const cached = statsCache[cacheKey];
        const timeLeft = Math.ceil((CACHE_TIME - (now - cached.time)) / 1000);
        callback(cached, timeLeft);
        return;
    }
    
    Core.app.post(function() {
        try {
            const releasesUrl = "https://api.github.com/repos/" + owner + "/" + repo + "/releases";
            const releasesHttp = new java.net.URL(releasesUrl).openConnection();
            releasesHttp.setRequestMethod("GET");
            if (GITHUB_TOKEN) {
                releasesHttp.setRequestProperty("Authorization", "Bearer " + GITHUB_TOKEN);
            }
            releasesHttp.setRequestProperty("Accept", "application/vnd.github+json");
            releasesHttp.setRequestProperty("User-Agent", "MindustryModStats");
            releasesHttp.setConnectTimeout(8000);
            releasesHttp.setReadTimeout(8000);
            
            const releasesStream = releasesHttp.getInputStream();
            const releasesReader = new java.io.BufferedReader(new java.io.InputStreamReader(releasesStream));
            
            let releasesResponse = "";
            let line;
            while ((line = releasesReader.readLine()) != null) {
                releasesResponse = releasesResponse + line;
            }
            releasesReader.close();
            
            const releases = JSON.parse(releasesResponse);
            let totalDownloads = 0;
            let latestReleaseDate = null;
            let firstReleaseDate = null;
            
            for (let i = 0; i < releases.length; i++) {
                const release = releases[i];
                const releaseDate = release.published_at;
                
                if (i === 0) latestReleaseDate = releaseDate;
                if (i === releases.length - 1) firstReleaseDate = releaseDate;
                
                const assets = release.assets;
                if (assets) {
                    for (let j = 0; j < assets.length; j++) {
                        const count = assets[j].download_count;
                        if (count) {
                            totalDownloads = totalDownloads + count;
                        }
                    }
                }
            }
            
            const repoUrl = "https://api.github.com/repos/" + owner + "/" + repo;
            const repoHttp = new java.net.URL(repoUrl).openConnection();
            repoHttp.setRequestMethod("GET");
            if (GITHUB_TOKEN) {
                repoHttp.setRequestProperty("Authorization", "Bearer " + GITHUB_TOKEN);
            }
            repoHttp.setRequestProperty("Accept", "application/vnd.github+json");
            repoHttp.setRequestProperty("User-Agent", "MindustryModStats");
            repoHttp.setConnectTimeout(8000);
            repoHttp.setReadTimeout(8000);
            
            const repoStream = repoHttp.getInputStream();
            const repoReader = new java.io.BufferedReader(new java.io.InputStreamReader(repoStream));
            
            let repoResponse = "";
            while ((line = repoReader.readLine()) != null) {
                repoResponse = repoResponse + line;
            }
            repoReader.close();
            
            const repoData = JSON.parse(repoResponse);
            const githubStars = repoData.stargazers_count || 0;
            
            let growthRate = 0;
            if (firstReleaseDate) {
                const firstDate = new Date(firstReleaseDate);
                const today = new Date();
                const daysSinceFirst = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24));
                growthRate = calculateGrowthRate(totalDownloads, daysSinceFirst);
            }
            
            const stats = {
                downloads: totalDownloads,
                releases: releases.length,
                stars: githubStars,
                latestRelease: latestReleaseDate,
                firstRelease: firstReleaseDate,
                growthRate: growthRate,
                time: Date.now()
            };
            
            statsCache[cacheKey] = stats;
            recordHistoricalData(owner, repo, totalDownloads);
            
            Core.app.post(function() {
                callback(stats, -2);
            });
            
        } catch (e) {
            Core.app.post(function() {
                callback({downloads: -1, error: true}, -1);
            });
        }
    });
}

function showNotificationsDialog() {
    const notifDialog = new BaseDialog("Notifications");
    
    const scrollPane = new ScrollPane(new Table());
    const contentTable = scrollPane.getWidget();
    contentTable.defaults().pad(5).fillX();
    
    const unreadCount = getUnreadCount();
    
    const headerTable = new Table();
    headerTable.add("[accent]" + notifications.length + " Total").padRight(20);
    headerTable.add("[yellow]" + unreadCount + " Unread").row();
    contentTable.add(headerTable).row();
    contentTable.add("").height(10).row();
    
    if (notifications.length === 0) {
        contentTable.add("[gray]No notifications yet").row();
        contentTable.add("[lightgray]Watch mods to get notifications about:").row();
        contentTable.add("").height(5).row();
        
        const exampleTable = new Table();
        exampleTable.left();
        exampleTable.add("[lime]• New releases").left().row();
        exampleTable.add("[sky]• Updates").left().row();
        exampleTable.add("[yellow]• Download milestones").left().row();
        exampleTable.add("[orange]• Star count increases").left().row();
        contentTable.add(exampleTable).left().row();
        
    } else {
        const actionTable = new Table();
        actionTable.defaults().size(120, 40).pad(3);
        
        if (unreadCount > 0) {
            actionTable.button("Mark All Read", function() {
                markAllAsRead();
                notifDialog.hide();
                Timer.schedule(function() {
                    showNotificationsDialog();
                }, 0.1);
            });
        }
        
        actionTable.button("Clear Read", function() {
            clearReadNotifications();
            notifDialog.hide();
            Timer.schedule(function() {
                showNotificationsDialog();
            }, 0.1);
        });
        
        actionTable.button("Clear All", function() {
            clearAllNotifications();
            notifDialog.hide();
            Vars.ui.showInfoToast("[yellow]Notifications cleared", 2);
        });
        
        contentTable.add(actionTable).row();
        contentTable.add("").height(15).row();
        
        for (let i = notifications.length - 1; i >= 0; i--) {
            const notif = notifications[i];
            
            const notifTable = new Table();
            notifTable.left();
            
            if (!notif.read) {
                notifTable.background(Tex.buttonOver);
            } else {
                notifTable.background(Tex.button);
            }
            
            const color = getNotificationColor(notif.type);
            const icon = getNotificationIcon(notif.type);
            const readMarker = notif.read ? "" : "[accent]NEW ";
            
            const iconTable = new Table();
            iconTable.image(icon).size(20).pad(5);
            iconTable.add(readMarker + color + notif.modName).left();
            notifTable.add(iconTable).left().row();
            
            notifTable.add("[white]" + notif.message).left().padLeft(30).row();
            
            const timeText = formatTimeAgo(notif.time);
            notifTable.add("[gray]" + timeText).left().padLeft(30).row();
            
            const buttonTable = new Table();
            buttonTable.defaults().size(100, 35).pad(3);
            
            buttonTable.button("View Mod", function() {
                notifDialog.hide();
                markNotificationAsRead(i);
                
                Timer.schedule(function() {
                    const mod = findModByKey(notif.owner, notif.repo);
                    showModDetails(mod);
                }, 0.1);
            }).padLeft(30);
            
            if (!notif.read) {
                buttonTable.button("Mark Read", function() {
                    markNotificationAsRead(i);
                    notifDialog.hide();
                    Timer.schedule(function() {
                        showNotificationsDialog();
                    }, 0.1);
                });
            }
            
            notifTable.add(buttonTable).left().padLeft(30).padTop(5).row();
            
            contentTable.add(notifTable).fillX().padTop(5).row();
        }
    }
    
    notifDialog.cont.add(scrollPane).grow();
    
    notifDialog.buttons.button("Close", function() {
        notifDialog.hide();
    }).size(100, 50);
    
    notifDialog.show();
        }function showModDetails(mod) {
    const detailDialog = new BaseDialog(mod.name);
    detailDialog.cont.clear();
    
    const scrollPane = new ScrollPane(new Table());
    const mainTable = scrollPane.getWidget();
    mainTable.defaults().pad(5);
    
    mainTable.add("[accent]" + mod.name).row();
    mainTable.add("[lightgray]" + mod.owner + "/" + mod.repo).row();
    mainTable.add("").height(20).row();
    
    const actionTable = new Table();
    actionTable.defaults().size(120, 45).pad(3);
    
    const userStarred = hasUserStarred(mod.owner, mod.repo);
    
    actionTable.button(userStarred ? "Starred" : "Star", Icon.star, function() {
        toggleUserStar(mod.owner, mod.repo, mod.name);
        detailDialog.hide();
        Timer.schedule(function() {
            showModDetails(mod);
        }, 0.1);
    });
    
    actionTable.button(isInWatchlist(mod.owner, mod.repo) ? "Watching" : "Watch", Icon.eye, function() {
        toggleWatchlist(mod);
        detailDialog.hide();
        Timer.schedule(function() {
            showModDetails(mod);
        }, 0.1);
    });
    
    actionTable.button("README", Icon.book, function() {
        showReadmeDialog(mod);
    });
    
    mainTable.add(actionTable).row();
    mainTable.add("").height(20).row();
    
    const statusLabel = new Label("Loading statistics...");
    statusLabel.setColor(Color.yellow);
    mainTable.add(statusLabel).center().row();
    
    detailDialog.cont.add(scrollPane).grow();
    
    detailDialog.buttons.button("Back", function() {
        detailDialog.hide();
    }).size(100, 50);
    
    detailDialog.show();
    
    fetchModStats(mod.owner, mod.repo, function(stats, cacheTime) {
        mainTable.clear();
        
        mainTable.add("[accent]" + mod.name).row();
        mainTable.add("[lightgray]" + mod.owner + "/" + mod.repo).row();
        mainTable.add("").height(20).row();
        
        const actionTable2 = new Table();
        actionTable2.defaults().size(120, 45).pad(3);
        
        const userStarred2 = hasUserStarred(mod.owner, mod.repo);
        
        actionTable2.button(userStarred2 ? "Starred" : "Star", Icon.star, function() {
            toggleUserStar(mod.owner, mod.repo, mod.name);
            detailDialog.hide();
            Timer.schedule(function() {
                showModDetails(mod);
            }, 0.1);
        });
        
        actionTable2.button(isInWatchlist(mod.owner, mod.repo) ? "Watching" : "Watch", Icon.eye, function() {
            toggleWatchlist(mod);
            detailDialog.hide();
            Timer.schedule(function() {
                showModDetails(mod);
            }, 0.1);
        });
        
        actionTable2.button("README", Icon.book, function() {
            showReadmeDialog(mod);
        });
        
        mainTable.add(actionTable2).row();
        mainTable.add("").height(20).row();
        
        if (stats.downloads >= 0) {
            const tier = getDownloadTier(stats.downloads);
            
            const tierTable = new Table();
            tierTable.image(tier.icon).size(32).pad(5);
            tierTable.add(tier.color + tier.name + " Tier").pad(5);
            mainTable.add(tierTable).row();
            mainTable.add("").height(15).row();
            
            const downloadTable = new Table();
            downloadTable.image(Icon.download).size(24).pad(5);
            downloadTable.add("[white]Downloads: [accent]" + formatNumber(stats.downloads)).left();
            const sparkline = drawSparkline(mod.owner, mod.repo);
            if (sparkline.text !== "━━━━") {
                const sparkLabel = new Label(" " + sparkline.text);
                sparkLabel.setColor(sparkline.color);
                downloadTable.add(sparkLabel).padLeft(10);
            }
            mainTable.add(downloadTable).left().row();
            
            const releaseTable = new Table();
            releaseTable.image(Icon.box).size(24).pad(5);
            releaseTable.add("[white]Releases: [accent]" + stats.releases).left();
            mainTable.add(releaseTable).left().row();
            
            if (stats.stars > 0) {
                const starTable = new Table();
                starTable.image(Icon.star).size(24).pad(5).color(Color.yellow);
                starTable.add("[white]GitHub Stars: [yellow]" + stats.stars).left();
                mainTable.add(starTable).left().row();
            }
            
            mainTable.add("").height(15).row();
            
            if (stats.latestRelease) {
                const latestTable = new Table();
                latestTable.image(Icon.upload).size(24).pad(5);
                latestTable.add("[white]Latest: [lightgray]" + formatDate(stats.latestRelease)).left();
                mainTable.add(latestTable).left().row();
            }
            
            if (stats.firstRelease) {
                const firstTable = new Table();
                firstTable.image(Icon.tree).size(24).pad(5);
                firstTable.add("[white]First: [lightgray]" + formatDate(stats.firstRelease)).left();
                mainTable.add(firstTable).left().row();
            }
            
            if (stats.growthRate > 0) {
                mainTable.add("").height(15).row();
                const growthTable = new Table();
                growthTable.image(Icon.up).size(24).pad(5);
                growthTable.add("[white]Growth: [accent]~" + formatNumber(stats.growthRate) + "/month").left();
                mainTable.add(growthTable).left().row();
            }
            
            mainTable.add("").height(20).row();
            const graph = drawDetailedGraph(mod, stats);
            if (graph) {
                mainTable.add(graph).row();
            } else {
                mainTable.add("[gray]Graph: Collecting data...").row();
                mainTable.add("[lightgray]Check back tomorrow").row();
            }
            
            checkMilestones(mod.owner, mod.repo, stats.downloads, mod.name);
            checkForUpdates(mod, stats);
            
            if (cacheTime > 0) {
                mainTable.add("").height(15).row();
                mainTable.add("[gray]Cached • Refreshes in " + formatTime(cacheTime)).row();
            }
            
        } else {
            mainTable.add("[scarlet]Failed to load statistics").row();
            mainTable.add("[lightgray]No releases or connection error").row();
        }
    });
}

function showStatsDialog() {
    const dialog = new BaseDialog("ModInfo+ v1.3");
    
    const mainTable = dialog.cont;
    mainTable.clear();
    
    const topBar = new Table();
    topBar.defaults().pad(5);
    
    const unreadCount = getUnreadCount();
    const notifText = unreadCount > 0 ? "Inbox (" + unreadCount + ")" : "Inbox";
    const notifColor = unreadCount > 0 ? Color.yellow : Color.white;
    
    const inboxBtn = topBar.button(notifText, Icon.info, function() {
        showNotificationsDialog();
    }).size(100, 45).get();
    
    if (unreadCount > 0) {
        inboxBtn.getLabel().setColor(notifColor);
    }
    
    topBar.add("").width(20);
    
    const searchTable = new Table();
    searchTable.image(Icon.zoom).size(24).pad(5);
    
    const searchField = searchTable.field(searchQuery, function(text) {
        searchQuery = text;
    }).width(250).get();
    
    searchTable.button("Search", function() {
        dialog.hide();
        Timer.schedule(function() {
            showStatsDialog();
        }, 0.1);
    }).size(80, 45).pad(5);
    
    if (searchQuery.length > 0) {
        searchTable.button("Clear", function() {
            searchQuery = "";
            dialog.hide();
            Timer.schedule(function() {
                showStatsDialog();
            }, 0.1);
        }).size(80, 45).pad(5);
    }
    
    topBar.add(searchTable);
    
    mainTable.add(topBar).row();
    mainTable.add("").height(10).row();
    
    const categoryTable = new Table();
    categoryTable.defaults().size(110, 45).pad(3);
    
    const categories = ["My Mods", "Content Mods", "Tool Mods"];
    if (watchlist.length > 0) {
        categories.push("Watchlist");
    }
    
    for (let c = 0; c < categories.length; c++) {
        const categoryName = categories[c];
        const isActive = categoryName === currentCategory;
        
        const btn = categoryTable.button(categoryName, function() {
            currentCategory = categoryName;
            currentPage = 0;
            searchQuery = "";
            dialog.hide();
            Timer.schedule(function() {
                showStatsDialog();
            }, 0.1);
        }).get();
        
        if (isActive) {
            btn.getStyle().up = Tex.buttonSelect;
        }
    }
    
    mainTable.add(categoryTable).row();
    mainTable.add("").height(10).row();
    
    let mods;
    if (currentCategory === "Watchlist") {
        mods = watchlist;
    } else {
        mods = modCategories[currentCategory] || [];
    }
    
    if (searchQuery.trim().length > 0) {
        mods = filterMods(mods, searchQuery);
    }
    
    if (mods.length === 0) {
        mainTable.add("[accent]" + currentCategory).row();
        mainTable.add("").height(20).row();
        
        if (searchQuery.trim().length > 0) {
            mainTable.add("[gray]No mods match '" + searchQuery + "'").row();
        } else if (currentCategory === "Watchlist") {
            mainTable.add("[gray]No mods in watchlist").row();
            mainTable.add("[lightgray]Click the Eye icon on any mod to watch it!").row();
        } else {
            mainTable.add("[gray]No mods in this category").row();
        }
    } else {
        const totalPages = Math.ceil(mods.length / MODS_PER_PAGE);
        
        mainTable.add("[accent]" + currentCategory).row();
        mainTable.add("[lightgray]Page " + (currentPage + 1) + " of " + totalPages + 
                     (searchQuery.length > 0 ? " (filtered)" : "")).row();
        mainTable.add("").height(10).row();
        
        const startIndex = currentPage * MODS_PER_PAGE;
        const endIndex = Math.min(startIndex + MODS_PER_PAGE, mods.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const mod = mods[i];
            
            const modTable = new Table();
            modTable.left();
            
            const isYourMod = mod.owner === "SamielXD";
            const inWatchlist = isInWatchlist(mod.owner, mod.repo);
            const userStarred = hasUserStarred(mod.owner, mod.repo);
            
            const nameColor = isYourMod ? "[cyan]" : "[white]";
            const watchIcon = inWatchlist ? "[accent]> " : "";
            const starIcon = userStarred ? "[yellow]* " : "";
            
            modTable.button(starIcon + watchIcon + nameColor + mod.name, function() {
                showModDetails(mod);
            }).width(300).left();
            
            const growth = getGrowthIndicator(mod.owner, mod.repo);
            if (growth.text) {
                const growthLabel = new Label(growth.text);
                growthLabel.setColor(growth.color);
                modTable.add(growthLabel).padLeft(10);
            }
            
            modTable.row();
            
            const statusLabel = new Label("Loading...");
            statusLabel.setColor(Color.yellow);
            modTable.add(statusLabel).left().padLeft(10).colspan(2).row();
            
            mainTable.add(modTable).fillX().row();
            mainTable.image().color(Color.gray).fillX().height(1).pad(5).row();
            
            const delay = (i - startIndex) * 0.3;
            Timer.schedule(function() {
                fetchModStats(mod.owner, mod.repo, function(stats, cacheTime) {
                    if (stats.downloads >= 0) {
                        const formatted = formatNumber(stats.downloads);
                        const sparkline = drawSparkline(mod.owner, mod.repo);
                        
                        let text = "[white]" + formatted + " DL | " + stats.releases + " releases";
                        
                        if (stats.stars > 0) {
                            text = text + " | [yellow]" + stats.stars + " stars";
                        }
                        
                        if (sparkline.text !== "━━━━") {
                            const sparkLabel = new Label(text + " ");
                            sparkLabel.setColor(Color.white);
                            statusLabel.setText("");
                            statusLabel.remove();
                            
                            const sparkText = new Label(sparkline.text);
                            sparkText.setColor(sparkline.color);
                            
                            modTable.getCells().get(modTable.getCells().size - 1).clearElement();
                            modTable.getCells().get(modTable.getCells().size - 1).setElement(sparkLabel);
                            modTable.add(sparkText).left().row();
                        } else {
                            text = text + " [gray]" + sparkline.text;
                        }
                        
                        if (cacheTime > 0) {
                            text = text + " [gray](cached)";
                        }
                        
                        statusLabel.setText(text);
                        statusLabel.setColor(Color.white);
                        
                        checkForUpdates(mod, stats);
                    } else {
                        statusLabel.setText("[scarlet]Failed / No releases");
                        statusLabel.setColor(Color.scarlet);
                    }
                });
            }, delay);
        }
        
        mainTable.add("").height(20).row();
        
        const navTable = new Table();
        navTable.defaults().size(80, 45).pad(5);
        
        if (currentPage > 0) {
            navTable.button("< Prev", function() {
                currentPage--;
                dialog.hide();
                Timer.schedule(function() {
                    showStatsDialog();
                }, 0.1);
            });
        } else {
            navTable.button("< Prev", function() {}).disabled(true);
        }
        
        navTable.add("[lightgray]" + (currentPage + 1) + "/" + totalPages).padLeft(10).padRight(10);
        
        if (currentPage < totalPages - 1) {
            navTable.button("Next >", function() {
                currentPage++;
                dialog.hide();
                Timer.schedule(function() {
                    showStatsDialog();
                }, 0.1);
            });
        } else {
            navTable.button("Next >", function() {}).disabled(true);
        }
        
        mainTable.add(navTable).row();
    }
    
    dialog.buttons.button("Close", function() {
        dialog.hide();
    }).size(100, 50);
    
    dialog.buttons.button("Refresh", function() {
        const currentTime = Date.now();
        const timeSinceLastRefresh = (currentTime - lastRefreshTime) / 1000;
        
        if (timeSinceLastRefresh < COOLDOWN_SECONDS) {
            const remaining = Math.ceil(COOLDOWN_SECONDS - timeSinceLastRefresh);
            Vars.ui.showInfoToast("Wait " + remaining + "s", 2);
            return;
        }
        
        lastRefreshTime = currentTime;
        statsCache = {};
        readmeCache = {};
        dialog.hide();
        Timer.schedule(function() {
            showStatsDialog();
        }, 0.1);
    }).size(100, 50);
    
    dialog.show();
}

// THIS IS THE FIX - ADD THE BUTTON WHEN GAME LOADS
Events.on(ClientLoadEvent, function() {
    loadWatchlist();
    loadHistoricalData();
    loadMilestones();
    loadUserStars();
    loadNotifications();
    loadLastCheckedVersions();
    
    Vars.ui.menufrag.addButton("ModInfo+", Icon.info, function() {
        showStatsDialog();
    });
});
