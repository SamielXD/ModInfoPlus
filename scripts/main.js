// ModInfo+ v1.1 - Mod Info Plus for Mindustry
// Displays real download statistics from GitHub

const GITHUB_TOKEN = "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";

// Cooldown system
let lastRefreshTime = 0;
const COOLDOWN_SECONDS = 60;

// Cache system
let statsCache = {};
const CACHE_TIME = 300000; // 5 minutes in milliseconds

const modCategories = {
    "My Mods": [
        {owner: "SamielXD", repo: "UnitNamerMod", name: "★ Unit Namer Mod"},
        {owner: "SamielXD", repo: "ShopSystemMod", name: "★ Shop System Mod"},
        {owner: "SamielXD", repo: "ModinfoPlus", name: "★ ModInfo+ Mod"},
    ],
    "Content Mods": [
        {owner: "Fat-Bird-Owner", repo: "The-Infestations", name: "The Infestations"},
        {owner: "Novanox4", repo: "Astralis-ARCHIVED", name: "Astralis"},
        {owner: "HuanXefh", repo: "Lovecraftian-Library", name: "Lovecraftian Library"},
        {owner: "m1cxzfw3q", repo: "Thermal-Engineering-Java", name: "Thermal Engineering"},
        {owner: "New-guys5634", repo: "rusted-dunes", name: "Rusted Dunes"},
    ],
    "Tool Mods": [
        {owner: "I-hope1", repo: "mod-tools", name: "Mod Tools"},
        {owner: "ItzCraft", repo: "hjsonpp", name: "HJSON++"},
    ]
};

let currentCategory = "My Mods";
let currentPage = 0;
const MODS_PER_PAGE = 2;

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

function fetchModStats(owner, repo, callback) {
    const cacheKey = owner + "/" + repo;
    const now = Date.now();
    
    // Check cache first
    if (statsCache[cacheKey] && (now - statsCache[cacheKey].time) < CACHE_TIME) {
        const timeLeft = Math.ceil((CACHE_TIME - (now - statsCache[cacheKey].time)) / 1000);
        callback(statsCache[cacheKey].downloads, statsCache[cacheKey].releases, timeLeft);
        return;
    }
    
    const url = "https://api.github.com/repos/" + owner + "/" + repo + "/releases";
    
    Core.app.post(function() {
        try {
            const http = new java.net.URL(url).openConnection();
            http.setRequestMethod("GET");
            if (GITHUB_TOKEN) {
                http.setRequestProperty("Authorization", "Bearer " + GITHUB_TOKEN);
            }
            http.setRequestProperty("Accept", "application/vnd.github+json");
            http.setRequestProperty("User-Agent", "MindustryModStats");
            http.setConnectTimeout(8000);
            http.setReadTimeout(8000);
            
            const stream = http.getInputStream();
            const reader = new java.io.BufferedReader(new java.io.InputStreamReader(stream));
            
            let response = "";
            let line;
            while ((line = reader.readLine()) != null) {
                response = response + line;
            }
            reader.close();
            
            const releases = JSON.parse(response);
            let totalDownloads = 0;
            
            for (let i = 0; i < releases.length; i++) {
                const assets = releases[i].assets;
                if (assets) {
                    for (let j = 0; j < assets.length; j++) {
                        const count = assets[j].download_count;
                        if (count) {
                            totalDownloads = totalDownloads + count;
                        }
                    }
                }
            }
            
            // Cache the result
            statsCache[cacheKey] = {
                downloads: totalDownloads,
                releases: releases.length,
                time: Date.now()
            };
            
            Core.app.post(function() {
                callback(totalDownloads, releases.length, -2);
            });
            
        } catch (e) {
            Core.app.post(function() {
                callback(-1, 0, -1);
            });
        }
    });
}

Events.on(ClientLoadEvent, function() {
    Vars.ui.menufrag.addButton("ModInfo+", Icon.info, function() {
        showStatsDialog();
    });
});

function showStatsDialog() {
    const dialog = new BaseDialog("ModInfo+ v1.1");
    
    const mainTable = dialog.cont;
    mainTable.clear();
    
    // Category buttons
    const categoryTable = new Table();
    categoryTable.defaults().size(120, 45).pad(3);
    
    Object.keys(modCategories).forEach(function(categoryName) {
        const isActive = categoryName === currentCategory;
        const btn = categoryTable.button(categoryName, function() {
            currentCategory = categoryName;
            currentPage = 0;
            dialog.hide();
            Timer.schedule(function() {
                showStatsDialog();
            }, 0.1);
        }).get();
        
        if (isActive) {
            btn.getStyle().up = Tex.buttonSelect;
        }
    });
    
    mainTable.add(categoryTable).row();
    mainTable.add("").height(10).row();
    
    // Current category info
    const mods = modCategories[currentCategory];
    
    if (mods.length === 0) {
        mainTable.add("[accent]" + currentCategory).row();
        mainTable.add("").height(20).row();
        mainTable.add("[gray]No mods in this category yet").row();
    } else {
        const totalPages = Math.ceil(mods.length / MODS_PER_PAGE);
        
        mainTable.add("[accent]" + currentCategory).row();
        mainTable.add("[lightgray]Page " + (currentPage + 1) + " of " + totalPages).row();
        mainTable.add("").height(10).row();
        
        // Display mods for current page
        const startIndex = currentPage * MODS_PER_PAGE;
        const endIndex = Math.min(startIndex + MODS_PER_PAGE, mods.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const mod = mods[i];
            
            const modTable = new Table();
            modTable.left();
            
            const isYourMod = mod.owner === "SamielXD";
            const nameColor = isYourMod ? "[cyan]" : "[white]";
            
            modTable.add(nameColor + mod.name).width(250).left().row();
            
            const statusLabel = new Label("Loading...");
            statusLabel.setColor(Color.yellow);
            modTable.add(statusLabel).left().row();
            
            mainTable.add(modTable).fillX().row();
            mainTable.image().color(Color.gray).fillX().height(1).pad(5).row();
            
            const delay = (i - startIndex) * 0.3;
            Timer.schedule(function() {
                fetchModStats(mod.owner, mod.repo, function(downloads, releases, timeLeft) {
                    if (downloads >= 0) {
                        const formatted = formatNumber(downloads);
                        let text = "[lime]" + formatted + " downloads (" + releases + " releases)";
                        
                        if (timeLeft > 0) {
                            text = text + "\n[gray]Cached - " + formatTime(timeLeft) + " until refresh";
                        }
                        
                        statusLabel.setText(text);
                        statusLabel.setColor(Color.lime);
                    } else {
                        statusLabel.setText("[scarlet]Failed / No releases");
                        statusLabel.setColor(Color.scarlet);
                    }
                });
            }, delay);
        }
        
        mainTable.add("").height(20).row();
        
        // Navigation buttons
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
    
    // Bottom buttons
    dialog.buttons.button("Close", function() {
        dialog.hide();
    }).size(100, 50);
    
    dialog.buttons.button("Refresh", function() {
        const currentTime = Date.now();
        const timeSinceLastRefresh = (currentTime - lastRefreshTime) / 1000;
        
        if (timeSinceLastRefresh < COOLDOWN_SECONDS) {
            const remaining = Math.ceil(COOLDOWN_SECONDS - timeSinceLastRefresh);
            Vars.ui.showInfoToast("Please wait " + remaining + " seconds", 2);
            return;
        }
        
        lastRefreshTime = currentTime;
        statsCache = {};
        dialog.hide();
        Timer.schedule(function() {
            showStatsDialog();
        }, 0.1);
    }).size(100, 50);
    
    dialog.show();
}

print("ModInfo+ v1.1 loaded!");
print("Tracking mods across " + Object.keys(modCategories).length + " categories");
print("Cache system enabled - stats refresh every 5 minutes");
