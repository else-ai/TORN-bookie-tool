// ==UserScript==
// @name         ZEM's OC 2.0 Helper
// @namespace    https://www.torn.com/profiles.php?XID=4038551
// @version      2.4.3
// @description  Clean role highlights, Page OCs dashboard, full offline OC 2.0 database. (Fixed native Torn menus).
// @author       ZEM [4038551]
// @match        https://www.torn.com/factions.php?step=your*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // =========================================================================
    // 1. LOCKED THRESHOLDS & SETTINGS
    // =========================================================================
    const ANCHOR_MIN = 20.0;    // 20%+ is Anchor
    const SECONDARY_MIN = 14.0; // 14% - 19.9% is Secondary
    const STORAGE_KEY = 'zem_oc2_helper_settings_v24';

    const DEFAULT_SETTINGS = {
        anchorColor: '#ff4d4d',     // Crimson Red
        secondaryColor: '#ffaa00',  // Amber Gold
        lowColor: '#38d9a9',        // Crisp Teal/Cyan
        showWeightBadges: true,
        showFailChances: true,
        btnPos: { top: '140px', left: '20px' }
    };

    // =========================================================================
    // 2. COMPLETE OFFLINE OC 2.0 DATABASE
    // =========================================================================
    const OC_DATABASE = {
        // --- LEVEL 1 ---
        "Mob Mentality": {
            level: 1,
            roles: {
                "LOOTER #1": { weight: 34.0, item: "Jemmy" },
                "LOOTER #2": { weight: 26.5, item: null },
                "LOOTER #4": { weight: 21.2, item: null },
                "LOOTER #3": { weight: 18.4, item: "Jemmy" }
            }
        },
        "Pet Project": {
            level: 1,
            roles: {
                "PICKLOCK": { weight: 36.4, item: "Lockpicks" },
                "MUSCLE": { weight: 32.6, item: "Net" },
                "KIDNAPPER": { weight: 30.9, item: "Dog Treats" }
            }
        },
        "First Aid and Abet": {
            level: 1,
            roles: {
                "PICKPOCKET": { weight: 43.3, item: null },
                "DECOY": { weight: 30.7, item: "Shaving Foam" },
                "PICKLOCK": { weight: 26.0, item: "Lockpicks" }
            }
        },

        // --- LEVEL 2 ---
        "Thou Shalt Not Steal": {
            level: 2,
            roles: {
                "PICKLOCK": { weight: 49.7, item: "Lockpicks" },
                "PICKPOCKET": { weight: 37.9, item: "Cell Phone" },
                "THIEF": { weight: 12.4, item: "Cassock" }
            }
        },
        "Cash Me If You Can": {
            level: 2,
            roles: {
                "THIEF #1": { weight: 54.2, item: "ID Badge" },
                "THIEF #2": { weight: 28.0, item: "ATM Key" },
                "LOOKOUT": { weight: 17.8, item: null }
            }
        },
        "Best of the Lot": {
            level: 2,
            roles: {
                "MUSCLE": { weight: 43.7, item: null },
                "PICKLOCK": { weight: 20.7, item: "Lockpicks" },
                "CAR THIEF": { weight: 19.5, item: null },
                "IMITATOR": { weight: 16.1, item: "Police Badge" }
            }
        },

        // --- LEVEL 3 ---
        "Smoke and Wing Mirrors": {
            level: 3,
            roles: {
                "CAR THIEF": { weight: 50.9, item: "RF Detector" },
                "IMITATOR": { weight: 27.1, item: "DSLR Camera" },
                "HUSTLER #2": { weight: 13.0, item: null },
                "HUSTLER #1": { weight: 9.0, item: null }
            }
        },
        "Market Forces": {
            level: 3,
            roles: {
                "ENFORCER": { weight: 29.4, item: null },
                "NEGOTIATOR": { weight: 27.2, item: null },
                "MUSCLE": { weight: 22.5, item: null },
                "LOOKOUT": { weight: 16.4, item: null },
                "ARSONIST": { weight: 4.5, item: "Gasoline" }
            }
        },
        "Gaslight the Way": {
            level: 3,
            roles: {
                "IMITATOR #3": { weight: 41.3, item: "ID Badge" },
                "IMITATOR #2": { weight: 27.5, item: "ID Badge" },
                "LOOTER #3": { weight: 12.4, item: null },
                "IMITATOR #1": { weight: 9.4, item: "Construction Helmet" },
                "LOOTER #1": { weight: 9.4, item: null },
                "LOOTER #2": { weight: 0.0, item: null }
            }
        },

        // --- LEVEL 4 ---
        "Stage Fright": {
            level: 4,
            roles: {
                "SNIPER": { weight: 46.3, item: null },
                "MUSCLE #1": { weight: 20.0, item: null },
                "ENFORCER": { weight: 15.7, item: null },
                "MUSCLE #3": { weight: 9.2, item: null },
                "LOOKOUT": { weight: 6.2, item: "Binoculars" },
                "MUSCLE #2": { weight: 2.6, item: null }
            }
        },
        "Snow Blind": {
            level: 4,
            roles: {
                "HUSTLER": { weight: 48.4, item: null },
                "IMITATOR": { weight: 34.6, item: "PCP" },
                "MUSCLE #1": { weight: 8.5, item: null },
                "MUSCLE #2": { weight: 8.5, item: null }
            }
        },
        "Plucking the Lotus Petal": {
            level: 4,
            roles: {
                "MUSCLE": { weight: 47.9, item: null },
                "ROBBER #2": { weight: 23.7, item: null },
                "HUSTLER": { weight: 14.4, item: "Blank Casino Chips" },
                "ROBBER #1": { weight: 14.0, item: null }
            }
        },

        // --- LEVEL 5 ---
        "No Reserve": {
            level: 5,
            roles: {
                "TECHIE": { weight: 38.4, item: "Spray Paint : Black" },
                "ENGINEER": { weight: 31.1, item: "Chloroform" },
                "CAR THIEF": { weight: 30.5, item: "Bolt Cutters" }
            }
        },
        "Guardian Angels": {
            level: 5,
            roles: {
                "HUSTLER": { weight: 42.1, item: null },
                "ENGINEER": { weight: 30.5, item: "Hand Drill" },
                "ENFORCER": { weight: 27.4, item: null }
            }
        },
        "Counter Offer": {
            level: 5,
            roles: {
                "ROBBER": { weight: 35.9, item: "Zip Ties" },
                "ENGINEER": { weight: 28.4, item: "Wire Cutters" },
                "PICKLOCK": { weight: 16.5, item: "Lockpicks" },
                "HACKER": { weight: 12.1, item: "Polymorphic Virus" },
                "LOOTER": { weight: 7.0, item: "Zip Ties" }
            }
        },
        "Honey Trap": {
            level: 5,
            roles: {
                "MUSCLE #2": { weight: 42.2, item: "Billfold" },
                "ENFORCER": { weight: 31.8, item: "Billfold" },
                "MUSCLE #1": { weight: 26.0, item: null }
            }
        },

        // --- LEVEL 6 ---
        "Leave No Trace": {
            level: 6,
            roles: {
                "IMITATOR": { weight: 36.9, item: "Police Badge" },
                "NEGOTIATOR": { weight: 34.1, item: "Police Badge" },
                "TECHIE": { weight: 29.0, item: null }
            }
        },
        "Sneaky Git Grab": {
            level: 6,
            roles: {
                "PICKPOCKET": { weight: 50.8, item: null },
                "IMITATOR": { weight: 17.5, item: null },
                "TECHIE": { weight: 17.1, item: "Wireless Dongle" },
                "HACKER": { weight: 14.5, item: "Tunneling Virus" }
            }
        },
        "Dish It Out": {
            level: 6,
            roles: {
                "ASSASSIN": { weight: 37.3, item: "Ipecac Syrup" },
                "MUSCLE": { weight: 25.2, item: "Bolt Cutters" },
                "SABOTEUR #1": { weight: 14.6, item: "Thermite" },
                "ENGINEER": { weight: 13.9, item: "Wire Cutters" },
                "SABOTEUR #2": { weight: 8.9, item: "Thermite" }
            }
        },
        "Bidding War": {
            level: 6,
            roles: {
                "ROBBER #3": { weight: 31.7, item: "Dental Mirror" },
                "ROBBER #2": { weight: 22.9, item: "Flash Grenade" },
                "BOMBER #2": { weight: 18.0, item: "C4 Explosive" },
                "DRIVER": { weight: 12.5, item: null },
                "BOMBER #1": { weight: 7.8, item: "C4 Explosive" },
                "ROBBER #1": { weight: 7.1, item: "Jemmy" }
            }
        },

        // --- LEVEL 7 ---
        "Blast From The Past": {
            level: 7,
            roles: {
                "MUSCLE": { weight: 34.6, item: "Zip Ties" },
                "ENGINEER": { weight: 24.0, item: "Core Drill" },
                "BOMBER": { weight: 15.6, item: "Shaped Charge" },
                "HACKER": { weight: 12.1, item: "Firewalk Virus" },
                "PICKLOCK #1": { weight: 10.8, item: null },
                "PICKLOCK #2": { weight: 2.9, item: null }
            }
        },
        "Window of Opportunity": {
            level: 7,
            roles: {
                "LOOTER #2": { weight: 29.8, item: "Angle Grinder" },
                "ENGINEER": { weight: 23.4, item: "Wire Cutters" },
                "LOOTER #1": { weight: 20.2, item: "Ladder" },
                "MUSCLE #1": { weight: 15.6, item: "Razor Wire" },
                "MUSCLE #2": { weight: 11.0, item: "Floor Cleaner" }
            }
        },
        "Cleared for Takeoff": {
            level: 7,
            roles: {
                "ASSASSIN": { weight: 26.5, item: null },
                "INTERROGATOR": { weight: 22.4, item: "Bone Saw" },
                "IMITATOR": { weight: 18.2, item: "Large Suitcase" },
                "TECHIE": { weight: 14.8, item: "Hand Drill" },
                "PICKPOCKET": { weight: 11.1, item: "Tracking Device" },
                "LOOKOUT": { weight: 7.0, item: null }
            }
        },

        // --- LEVEL 8 ---
        "Break the Bank": {
            level: 8,
            roles: {
                "MUSCLE #3": { weight: 31.7, item: "Hand Drill" },
                "THIEF #2": { weight: 29.1, item: "Hand Drill" },
                "MUSCLE #1": { weight: 13.5, item: "Hand Drill" },
                "ROBBER": { weight: 12.7, item: "Hand Drill" },
                "MUSCLE #2": { weight: 10.1, item: "Zip Ties" },
                "THIEF #1": { weight: 2.9, item: "Hand Drill" }
            }
        },
        "Clinical Precision": {
            level: 8,
            roles: {
                "IMITATOR": { weight: 43.3, item: null },
                "CLEANER": { weight: 21.7, item: null },
                "CAT BURGLAR": { weight: 18.9, item: null },
                "ASSASSIN": { weight: 16.1, item: null }
            }
        },
        "Stacking the Deck": {
            level: 8,
            roles: {
                "IMITATOR": { weight: 48.2, item: "ID Badge" },
                "HACKER": { weight: 25.4, item: "Stealth Virus" },
                "CAT BURGLAR": { weight: 23.4, item: "Jemmy" },
                "DRIVER": { weight: 3.0, item: "Smoke Grenade" }
            }
        },
        "Manifest Cruelty": {
            level: 8,
            roles: {
                "REVIVER": { weight: 46.3, item: "Car Battery" },
                "INTERROGATOR": { weight: 23.5, item: "Cigar Cutter" },
                "HACKER": { weight: 16.3, item: "Stealth Virus" },
                "CAT BURGLAR": { weight: 13.9, item: "Zip Ties" }
            }
        },
        "Lock Stock": {
            level: 8,
            roles: {
                "HACKER": { weight: 29.5, item: "Armored Virus" },
                "SMUGGLER": { weight: 24.8, item: "Lubricant" },
                "ASSASSIN": { weight: 21.2, item: "Ecstasy" },
                "MUSCLE #1": { weight: 14.5, item: null },
                "MUSCLE #2": { weight: 10.0, item: null }
            }
        },
        "Ship Happens": {
            level: 8,
            roles: {
                "SPY": { weight: 28.6, item: null },
                "ENGINEER": { weight: 24.2, item: "Core Drill" },
                "INTERROGATOR": { weight: 19.4, item: null },
                "ASSASSIN": { weight: 15.8, item: null },
                "HUSTLER": { weight: 12.0, item: "Single Red Rose" }
            }
        },

        // --- LEVEL 9 ---
        "Ace in the Hole": {
            level: 9,
            roles: {
                "HACKER": { weight: 28.3, item: null },
                "MUSCLE #2": { weight: 24.7, item: null },
                "IMITATOR": { weight: 21.1, item: null },
                "MUSCLE #1": { weight: 18.3, item: null },
                "DRIVER": { weight: 7.6, item: null }
            }
        },
        "Gone Fission": {
            level: 9,
            roles: {
                "IMITATOR": { weight: 24.9, item: "DSLR Camera" },
                "HIJACKER": { weight: 22.1, item: "Zip Ties" },
                "ENGINEER": { weight: 18.5, item: "Thermite" },
                "BOMBER": { weight: 18.0, item: "C4 Explosive" },
                "PICKPOCKET": { weight: 16.5, item: "Cut-Throat Razor" }
            }
        },
        "Hostile Takeover": {
            level: 9,
            roles: {
                "SNIPER": { weight: 40.7, item: null },
                "LOOKOUT": { weight: 16.6, item: "Binoculars" },
                "BOMBER": { weight: 15.9, item: "Remote Detonator" },
                "MUSCLE #1": { weight: 10.7, item: null },
                "ENGINEER": { weight: 8.3, item: "Shaped Charge" },
                "MUSCLE #2": { weight: 7.8, item: "Tear Gas" }
            }
        },

        // --- LEVEL 10 ---
        "Crane Reaction": {
            level: 10,
            roles: {
                "NEGOTIATOR": { weight: 26.4, item: "Nail Bomb" },
                "HACKER": { weight: 22.8, item: "Tunneling Virus" },
                "ENGINEER": { weight: 18.5, item: "PSU" },
                "CAT BURGLAR": { weight: 14.9, item: "Hard Drive" },
                "KIDNAPPER": { weight: 10.2, item: "Igniter Cord" },
                "MUSCLE": { weight: 7.2, item: "China Lake" }
            }
        }
    };

    let settings = loadSettings();
    let normalizedDB = {};
    let scannedPageOCs = [];
    let uiBuilt = false;
    let observer = null;
    let isProcessingDOM = false;
    let debounceTimer = null;

    // =========================================================================
    // 3. HELPER FUNCTIONS
    // =========================================================================
    function loadSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return {
                ...DEFAULT_SETTINGS,
                ...saved,
                btnPos: { ...DEFAULT_SETTINGS.btnPos, ...(saved?.btnPos || {}) }
            };
        } catch {
            return { ...DEFAULT_SETTINGS };
        }
    }

    function saveSettings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        injectDynamicStyles();
        processAllCrimes(true);
    }

    function normalizeStr(str) {
        return (str || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
    }

    function hexToRgba(hex, alpha) {
        let c = (hex || '#ff4d4d').replace('#', '');
        if (c.length === 3) c = c.split('').map(x => x + x).join('');
        const num = parseInt(c, 16);
        return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
    }

    function buildNormalizedDB() {
        normalizedDB = {};
        for (const [ocName, ocObj] of Object.entries(OC_DATABASE)) {
            const ocKey = normalizeStr(ocName);
            normalizedDB[ocKey] = {
                displayName: ocName,
                level: ocObj.level,
                roles: {}
            };
            for (const [roleName, roleInfo] of Object.entries(ocObj.roles)) {
                normalizedDB[ocKey].roles[normalizeStr(roleName)] = {
                    displayName: roleName.toUpperCase(),
                    weight: roleInfo.weight,
                    item: roleInfo.item
                };
            }
        }
    }

    function isOCTabActive() {
        if (!location.href.includes('factions.php')) return false;
        if (location.hash.includes('tab=crimes')) return true;
        const crimeRoot = document.querySelector('#faction-crimes, [class*="crimesWrapper___"], [data-oc-id]');
        return !!(crimeRoot && crimeRoot.offsetParent !== null);
    }

    function extractSlotCPR(slot, roleTitleEl) {
        const walker = document.createTreeWalker(slot, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
            const parent = node.parentElement;
            if (!parent) continue;
            if (parent.closest('.zem-oc-slot-footer')) continue;
            if (roleTitleEl && roleTitleEl.contains(parent)) continue;

            const txt = node.textContent.trim();
            const pctMatch = txt.match(/^(\d{1,3}(?:\.\d+)?)\s*%?$/);
            if (pctMatch) {
                const val = parseFloat(pctMatch[1]);
                const cls = (parent.className || '').toLowerCase();
                if (cls.includes('chance') || cls.includes('rate') || cls.includes('success') || cls.includes('cpr') || cls.includes('percent') || txt.includes('%')) {
                    if (val >= 0 && val <= 100) return val;
                }
            }
        }

        const rateEl = slot.querySelector('[class*="chance"], [class*="rate"], [class*="success"], [class*="percent"]');
        if (rateEl && !rateEl.closest('.zem-oc-slot-footer')) {
            const m = rateEl.textContent.trim().match(/(\d{1,3}(?:\.\d+)?)/);
            if (m) {
                const v = parseFloat(m[1]);
                if (v >= 0 && v <= 100) return v;
            }
        }
        return null;
    }

    function extractPlayerInfo(slot, roleTitleEl) {
        let xid = null;
        let candidateName = '';

        const isIgnoredLabel = (str) => {
            if (!str) return true;
            const s = str.trim();
            if (!s || /^\d+(\.\d+)?%?$/.test(s)) return true;
            return /^(view profile|profile|join|assign|empty|open|slot|recruit|waiting|planning|ready)$/i.test(s);
        };

        const profileLink = slot.querySelector('a[href*="profiles.php?XID="]');
        if (profileLink) {
            const xidMatch = profileLink.href.match(/XID=(\d+)/i);
            if (xidMatch) xid = xidMatch[1];

            const honorSpans = profileLink.querySelectorAll('[class*="honor-text-svg"] span, [class*="honor-text"], [class*="userName"], [class*="name"]');
            if (honorSpans.length > 0) {
                const combined = Array.from(honorSpans).map(el => el.textContent).join('').trim();
                if (!isIgnoredLabel(combined)) candidateName = combined;
            }

            if (!candidateName) {
                const rawLinkTxt = (profileLink.textContent || '').replace(/view profile/ig, '').trim();
                if (!isIgnoredLabel(rawLinkTxt)) candidateName = rawLinkTxt;
            }

            if (!candidateName) {
                const img = profileLink.querySelector('img[alt]');
                if (img) {
                    const altTxt = img.getAttribute('alt').replace(/('s banner|banner|avatar|profile)/ig, '').trim();
                    if (!isIgnoredLabel(altTxt)) candidateName = altTxt;
                }
            }
        }

        if (!candidateName) {
            const honorEl = slot.querySelector('[class*="honor-text"]:not([class*="svg"]), [class*="userName"], [class*="playerName"], [class*="memberName"]');
            if (honorEl && (!roleTitleEl || !roleTitleEl.contains(honorEl))) {
                const txt = (honorEl.textContent || '').replace(/view profile/ig, '').trim();
                if (!isIgnoredLabel(txt)) candidateName = txt;
            }
        }

        if (!candidateName) {
            const imgs = slot.querySelectorAll('img[alt]');
            for (const img of imgs) {
                const altTxt = (img.getAttribute('alt') || '').replace(/('s banner|banner|avatar|view profile)/ig, '').trim();
                if (!isIgnoredLabel(altTxt) && altTxt.length >= 2 && altTxt.length <= 20) {
                    candidateName = altTxt;
                    break;
                }
            }
        }

        if (!candidateName) {
            const walker = document.createTreeWalker(slot, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while ((node = walker.nextNode())) {
                const parent = node.parentElement;
                if (!parent) continue;
                if (parent.closest('.zem-oc-slot-footer')) continue;
                if (roleTitleEl && roleTitleEl.contains(parent)) continue;
                const t = node.textContent.replace(/view profile/ig, '').trim();
                if (!isIgnoredLabel(t) && t.length >= 2 && t.length <= 20) {
                    candidateName = t;
                    break;
                }
            }
        }

        if (candidateName || xid) {
            return {
                name: candidateName || (xid ? `Player [${xid}]` : 'Member'),
                xid,
                filled: true
            };
        }

        return { name: null, xid: null, filled: false };
    }

    function extractOCTimer(ocNode) {
        const text = ocNode.textContent || '';
        const m = text.match(/\b(\d{2}:\d{2}:\d{2}(?::\d{2})?)\b/);
        return m ? m[1] : null;
    }

    // =========================================================================
    // 4. PROFESSIONAL NON-CLIPPING CSS
    // =========================================================================
    function injectDynamicStyles() {
        let styleEl = document.getElementById('zem-oc-helper-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'zem-oc-helper-styles';
            document.head.appendChild(styleEl);
        }

        const anchorBg = hexToRgba(settings.anchorColor, 0.14);
        const secondaryBg = hexToRgba(settings.secondaryColor, 0.11);
        const lowBg = hexToRgba(settings.lowColor, 0.09);

        const showFooter = settings.showWeightBadges || settings.showFailChances;

        styleEl.textContent = `
            .zem-oc-role-anchor,
            .zem-oc-role-secondary,
            .zem-oc-role-low {
                border-radius: 6px !important;
                position: relative !important;
                /* Removed overflow:hidden and display:flex to fix Torn's native remove/edit menus */
                box-sizing: border-box !important;
                transition: box-shadow 0.2s ease, border-color 0.2s ease;
            }

            .zem-oc-role-anchor {
                border: 1.5px solid ${settings.anchorColor} !important;
                background: linear-gradient(180deg, ${anchorBg} 0%, rgba(15,15,15,0.45) 100%) !important;
                box-shadow: 0 2px 8px ${hexToRgba(settings.anchorColor, 0.28)}, inset 0 1px 0 ${hexToRgba(settings.anchorColor, 0.35)} !important;
            }

            .zem-oc-role-secondary {
                border: 1.5px solid ${settings.secondaryColor} !important;
                background: linear-gradient(180deg, ${secondaryBg} 0%, rgba(15,15,15,0.4) 100%) !important;
                box-shadow: 0 2px 6px ${hexToRgba(settings.secondaryColor, 0.2)} !important;
            }

            .zem-oc-role-low {
                border: 1px solid ${hexToRgba(settings.lowColor, 0.75)} !important;
                background: linear-gradient(180deg, ${lowBg} 0%, rgba(15,15,15,0.35) 100%) !important;
                box-shadow: 0 1px 4px rgba(0,0,0,0.3) !important;
            }

            /* Compact Non-Clipping Bottom Footer Inside Role Card */
            .zem-oc-slot-footer {
                display: ${showFooter ? 'flex' : 'none'};
                align-items: center;
                justify-content: space-between;
                gap: 2px;
                width: 100%;
                box-sizing: border-box;
                padding: 3px 5px;
                margin-top: 4px;
                background: rgba(10, 10, 12, 0.90);
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                border-bottom-left-radius: 5px;
                border-bottom-right-radius: 5px;
                font-family: Arial, sans-serif;
                font-size: 9.5px;
                line-height: 1.15;
                white-space: nowrap;
                z-index: 3;
                clear: both;
            }

            .zem-oc-impact-pill {
                display: ${settings.showWeightBadges ? 'inline-flex' : 'none'};
                align-items: center;
                font-weight: 700;
                letter-spacing: -0.1px;
            }
            .zem-oc-impact-pill.tier-anchor { color: ${settings.anchorColor}; }
            .zem-oc-impact-pill.tier-secondary { color: ${settings.secondaryColor}; }
            .zem-oc-impact-pill.tier-low { color: ${settings.lowColor}; }

            .zem-oc-fail-pill {
                display: ${settings.showFailChances ? 'inline-flex' : 'none'};
                align-items: center;
                font-weight: 700;
                padding: 1px 3px;
                border-radius: 3px;
                font-size: 9.5px;
                letter-spacing: -0.1px;
                margin-left: auto;
            }
            .zem-oc-fail-pill.risk-low {
                color: #69db7c;
                background: rgba(43, 138, 62, 0.24);
            }
            .zem-oc-fail-pill.risk-med {
                color: #ffd43b;
                background: rgba(230, 119, 0, 0.24);
            }
            .zem-oc-fail-pill.risk-high {
                color: #ff8787;
                background: rgba(201, 42, 42, 0.30);
            }

            /* Header Total Pass / Fail Pill */
            .zem-oc-header-summary {
                display: ${settings.showFailChances ? 'inline-flex' : 'none'};
                align-items: center;
                gap: 8px;
                margin-left: 12px;
                padding: 3px 10px;
                border-radius: 20px;
                font-size: 11.5px;
                font-weight: 700;
                background: rgba(18, 18, 20, 0.92);
                border: 1px solid rgba(255, 255, 255, 0.14);
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
                vertical-align: middle;
                line-height: 1.2;
            }
            .zem-oc-header-summary .zem-pass-txt {
                color: #69db7c;
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }
            .zem-oc-header-summary .zem-pass-txt::before {
                content: '';
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #51cf66;
                box-shadow: 0 0 4px #51cf66;
            }
            .zem-oc-header-summary .zem-fail-txt { color: #ff7676; }
            .zem-oc-header-summary .zem-est-txt {
                color: #aaa;
                font-weight: 500;
                font-size: 10.5px;
            }

            /* Floating Button */
            #zem-oc-float-btn {
                position: fixed;
                z-index: 99998;
                width: 42px;
                height: 42px;
                border-radius: 50%;
                background: linear-gradient(145deg, #2b2b2e, #18181a);
                border: 2px solid ${settings.anchorColor};
                box-shadow: 0 4px 12px rgba(0,0,0,0.8);
                color: #fff;
                font-size: 12.5px;
                font-weight: 800;
                letter-spacing: 0.6px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: grab;
                user-select: none;
                transition: transform 0.15s ease;
            }
            #zem-oc-float-btn:hover { transform: scale(1.06); }
            #zem-oc-float-btn:active { cursor: grabbing; }

            /* Modal UI - Fixed Uniform Height Across All Tabs */
            #zem-oc-modal {
                position: fixed;
                z-index: 99999;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 560px;
                max-width: 96vw;
                height: 580px;
                max-height: 85vh;
                background: #18181b;
                border: 1px solid #3a3a40;
                border-top: 3px solid ${settings.anchorColor};
                border-radius: 8px;
                box-shadow: 0 16px 40px rgba(0,0,0,0.92);
                color: #e4e4e7;
                font-family: Arial, sans-serif;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }
            #zem-oc-modal.open { display: flex; }

            .zem-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 11px 16px;
                background: #222226;
                border-bottom: 1px solid #323238;
                font-weight: bold;
                font-size: 13.5px;
                flex-shrink: 0;
            }
            .zem-modal-close {
                cursor: pointer;
                background: none;
                border: none;
                color: #999;
                font-size: 20px;
                line-height: 1;
            }
            .zem-modal-close:hover { color: #fff; }

            .zem-modal-tabs {
                display: flex;
                background: #1c1c20;
                border-bottom: 1px solid #323238;
                flex-shrink: 0;
            }
            .zem-tab-btn {
                flex: 1;
                padding: 10px 4px;
                text-align: center;
                cursor: pointer;
                background: transparent;
                border: none;
                color: #8e8e96;
                font-weight: bold;
                font-size: 11.5px;
                border-bottom: 2px solid transparent;
            }
            .zem-tab-btn.active {
                color: #fff;
                border-bottom-color: ${settings.anchorColor};
                background: #25252b;
            }

            .zem-modal-body {
                padding: 14px;
                overflow-y: auto;
                font-size: 12px;
                flex: 1;
                line-height: 1.45;
                box-sizing: border-box;
            }

            /* Page OCs Overview KPI Bar */
            .zem-kpi-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
                margin-bottom: 12px;
            }
            .zem-kpi-box {
                background: #222227;
                border: 1px solid #323238;
                border-radius: 6px;
                padding: 8px 6px;
                text-align: center;
            }
            .zem-kpi-val {
                font-size: 15px;
                font-weight: 800;
                color: #fff;
            }
            .zem-kpi-lbl {
                font-size: 10px;
                color: #999;
                margin-top: 2px;
                text-transform: uppercase;
            }

            /* Live Page OC Card */
            .zem-live-card {
                background: #222227;
                border: 1px solid #323238;
                border-radius: 6px;
                padding: 10px 12px;
                margin-bottom: 10px;
            }
            .zem-live-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 6px;
                padding-bottom: 8px;
                margin-bottom: 8px;
                border-bottom: 1px solid #303036;
            }
            .zem-status-badge {
                font-size: 10px;
                font-weight: 800;
                padding: 2px 6px;
                border-radius: 3px;
                text-transform: uppercase;
            }
            .zem-status-planning { background: rgba(56, 217, 169, 0.18); color: #38d9a9; border: 1px solid rgba(56, 217, 169, 0.4); }
            .zem-status-recruiting { background: rgba(255, 170, 0, 0.18); color: #ffaa00; border: 1px solid rgba(255, 170, 0, 0.4); }

            .zem-live-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
            }
            .zem-live-table th {
                text-align: left;
                color: #888 !important;
                font-weight: 600;
                padding: 3px 5px;
                border-bottom: 1px solid #2d2d34;
                font-size: 10px;
            }
            .zem-live-table td {
                padding: 4px 5px;
                border-bottom: 1px solid #26262c;
                color: #999 !important;
            }
            .zem-live-table td strong {
                color: #999 !important;
                font-weight: 700;
            }
            .zem-live-table tr:last-child td { border-bottom: none; }

            .zem-setting-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 11px;
                padding-bottom: 9px;
                border-bottom: 1px solid #27272c;
            }
            .zem-setting-row label { color: #d4d4d8; }
            .zem-setting-row input[type="color"] {
                border: 1px solid #444;
                border-radius: 4px;
                width: 38px;
                height: 24px;
                cursor: pointer;
                background: none;
                padding: 0;
            }
            .zem-search-input {
                width: 100%;
                box-sizing: border-box;
                padding: 8px 10px;
                margin-bottom: 10px;
                background: #101013;
                border: 1px solid #3f3f46;
                border-radius: 5px;
                color: #fff;
                font-size: 12px;
            }
            .zem-info-card {
                background: #222227;
                border: 1px solid #323238;
                border-radius: 6px;
                padding: 10px 12px;
                margin-bottom: 9px;
            }
            .zem-info-title {
                font-weight: bold;
                color: #fff;
                margin-bottom: 8px;
                font-size: 13px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .zem-level-badge {
                background: #323238;
                color: #d4d4d8;
                padding: 2px 7px;
                border-radius: 4px;
                font-size: 11px;
            }
            .zem-info-roles-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 6px;
            }
            .zem-info-role-item {
                display: flex;
                flex-direction: column;
                padding: 5px 8px;
                border-radius: 4px;
                background: #16161a;
                font-size: 11.5px;
            }
            .zem-info-role-top {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .zem-info-role-sub {
                font-size: 10.5px;
                color: #999;
                margin-top: 2px;
                display: flex;
                justify-content: space-between;
            }
            .zem-guide-box {
                background: #222227;
                border: 1px solid #323238;
                border-radius: 5px;
                padding: 10px 12px;
                margin-bottom: 10px;
            }
            .zem-guide-box h4 {
                margin: 0 0 5px 0;
                color: #fff;
                font-size: 13px;
            }
            .zem-guide-box p {
                margin: 0 0 6px 0;
                color: #bdbdc4;
            }
            .zem-guide-box p:last-child { margin-bottom: 0; }

            .zem-btn {
                background: #2d2d34;
                color: #e4e4e7;
                border: 1px solid #4a4a54;
                padding: 5px 11px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11.5px;
                text-decoration: none;
                display: inline-block;
            }
            .zem-btn:hover { background: #3b3b44; color: #fff; }
            .zem-dev-btn {
                background: #1f3325;
                border-color: #365c42;
                color: #8ce99a;
                font-weight: bold;
            }
            .zem-dev-btn:hover { background: #294531; color: #b2f2bb; }
        `;
    }

    // =========================================================================
    // 5. DOM SCANNER & HIGHLIGHTER
    // =========================================================================
    function getTitleElement(ocNode) {
        return ocNode.querySelector('[class*="panelTitle___"]');
    }

    function getCleanOCName(titleEl) {
        if (!titleEl) return null;
        const clone = titleEl.cloneNode(true);
        const injected = clone.querySelector('.zem-oc-header-summary');
        if (injected) injected.remove();
        return clone.textContent.trim();
    }

    function processSingleOC(ocNode, forceReprocess = false) {
        const titleEl = getTitleElement(ocNode);
        const ocNameRaw = getCleanOCName(titleEl);
        if (!ocNameRaw) return null;

        const ocEntry = normalizedDB[normalizeStr(ocNameRaw)];
        if (!ocEntry) return null;

        let roleSlots = Array.from(ocNode.querySelectorAll('[class*="contentLayer___"] > [class*="wrapper___"] > [class*="wrapper___"]'));
        if (roleSlots.length === 0) {
            roleSlots = Array.from(ocNode.querySelectorAll('[class*="wrapper___"]')).filter(el => el.querySelector('[class*="title___"]'));
        }
        if (roleSlots.length === 0) return null;

        const roleCounts = {};
        let totalWeightedPass = 0;
        let filledSlotsCount = 0;
        let totalSlotsCount = 0;
        let cprSignatureList = [];
        let slotDetails = [];

        roleSlots.forEach(slot => {
            const roleTitleEl = slot.querySelector('[class*="title___"]');
            if (!roleTitleEl) return;

            const rawRoleText = roleTitleEl.textContent.trim();
            const normRole = normalizeStr(rawRoleText);
            roleCounts[normRole] = (roleCounts[normRole] || 0) + 1;

            let roleData = ocEntry.roles[normRole];
            if (!roleData) {
                const numberedKey = normalizeStr(`${rawRoleText} #${roleCounts[normRole]}`);
                roleData = ocEntry.roles[numberedKey];
            }
            if (!roleData) return;

            totalSlotsCount++;
            const weight = roleData.weight;
            const cpr = extractSlotCPR(slot, roleTitleEl);
            const player = extractPlayerInfo(slot, roleTitleEl);
            const isSlotFilled = player.filled || (cpr !== null && slot.querySelector('img, [class*="honor"], [class*="avatar"], a[href*="profiles.php"]'));

            cprSignatureList.push(`${weight}:${cpr}:${player.name || ''}`);

            const effectiveCPR = cpr !== null ? cpr : 75;
            const slotFail = Math.max(0, 100 - effectiveCPR);
            const weightedFail = +(slotFail * (weight / 100)).toFixed(1);

            if (isSlotFilled) {
                filledSlotsCount++;
            }
            totalWeightedPass += (effectiveCPR * (weight / 100));

            slotDetails.push({
                roleName: roleData.displayName,
                weight,
                item: roleData.item,
                cpr,
                slotFail,
                weightedFail,
                playerName: player.name || (isSlotFilled ? 'Member' : null),
                playerXid: player.xid,
                isFilled: !!isSlotFilled
            });

            const sig = `${weight}_${cpr}`;
            if (!forceReprocess && slot.dataset.zemOcSig === sig) return;

            const isAnchor = weight >= ANCHOR_MIN;
            const isSecondary = !isAnchor && weight >= SECONDARY_MIN;

            slot.classList.remove('zem-oc-role-anchor', 'zem-oc-role-secondary', 'zem-oc-role-low');
            const oldWrap = slot.querySelector('.zem-oc-badge-wrap');
            if (oldWrap) oldWrap.remove();
            const oldFooter = slot.querySelector('.zem-oc-slot-footer');
            if (oldFooter) oldFooter.remove();

            const tierClass = isAnchor ? 'tier-anchor' : isSecondary ? 'tier-secondary' : 'tier-low';
            if (isAnchor) {
                slot.classList.add('zem-oc-role-anchor');
            } else if (isSecondary) {
                slot.classList.add('zem-oc-role-secondary');
            } else {
                slot.classList.add('zem-oc-role-low');
            }

            // Build non-clipping bottom footer bar inside the role card
            const footer = document.createElement('div');
            footer.className = 'zem-oc-slot-footer';

            // 1. Concise Impact Pill
            const impPill = document.createElement('span');
            impPill.className = `zem-oc-impact-pill ${tierClass}`;
            impPill.title = `Role Impact: ${weight.toFixed(1)}% of total crime outcome${roleData.item ? ' | Item: ' + roleData.item : ''}`;
            impPill.textContent = `Imp: ${weight.toFixed(1)}%`;
            footer.appendChild(impPill);

            // 2. Concise Fail Chance Pill
            const failPill = document.createElement('span');
            if (cpr !== null) {
                const riskClass = weightedFail < 2.5 ? 'risk-low' : weightedFail < 6.5 ? 'risk-med' : 'risk-high';
                failPill.className = `zem-oc-fail-pill ${riskClass}`;
                failPill.title = `Slot Fail: ${slotFail.toFixed(0)}% (100 - ${cpr}% CPR) | Pulls total OC down by -${weightedFail.toFixed(1)}%`;
                failPill.textContent = `Fail: ${slotFail.toFixed(0)}%`;
            } else {
                const riskClass = weightedFail < 2.5 ? 'risk-low' : weightedFail < 6.0 ? 'risk-med' : 'risk-high';
                failPill.className = `zem-oc-fail-pill ${riskClass}`;
                failPill.title = `Empty slot: A 75% CPR player here pulls total OC down by -${weightedFail.toFixed(1)}%`;
                failPill.textContent = `-${weightedFail.toFixed(1)}% OC`;
            }
            footer.appendChild(failPill);

            slot.appendChild(footer);
            slot.dataset.zemOcSig = sig;
        });

        const clampedPass = Math.min(100, Math.max(0, totalWeightedPass));
        const clampedFail = Math.max(0, 100 - clampedPass);
        const isAllFilled = (filledSlotsCount === totalSlotsCount && totalSlotsCount > 0);
        const timerStr = extractOCTimer(ocNode);

        let status = 'RECRUITING';
        if (isAllFilled) {
            status = (timerStr && timerStr !== '00:00:00' && timerStr !== '00:00:00:00') ? 'PLANNING' : 'READY / PLANNING';
        } else if (filledSlotsCount > 0 && timerStr && !timerStr.startsWith('00:00:00')) {
            status = 'PLANNING (NEEDS FILL)';
        }

        const headerSig = cprSignatureList.join('|');
        if (titleEl && (forceReprocess || ocNode.dataset.zemHeaderSig !== headerSig)) {
            const oldSummary = titleEl.parentElement.querySelector('.zem-oc-header-summary');
            if (oldSummary) oldSummary.remove();

            const summaryEl = document.createElement('span');
            summaryEl.className = 'zem-oc-header-summary';

            const prefix = isAllFilled ? '' : 'Est. ';
            const suffix = isAllFilled ? '' : `<span class="zem-est-txt">(${filledSlotsCount}/${totalSlotsCount})</span>`;

            summaryEl.title = isAllFilled
                ? `Total weighted OC Pass/Fail across all ${totalSlotsCount} members`
                : `Estimated OC Pass/Fail (${filledSlotsCount}/${totalSlotsCount} filled, empty slots estimated at 75% CPR)`;

            summaryEl.innerHTML = `
                <span class="zem-pass-txt">${prefix}Pass: ${clampedPass.toFixed(1)}%</span>
                <span style="color:#444;">|</span>
                <span class="zem-fail-txt">Fail: ${clampedFail.toFixed(1)}%</span>
                ${suffix}
            `;

            titleEl.insertAdjacentElement('afterend', summaryEl);
            ocNode.dataset.zemHeaderSig = headerSig;
        }

        return {
            ocName: ocEntry.displayName,
            level: ocEntry.level,
            status,
            isAllFilled,
            filledSlotsCount,
            totalSlotsCount,
            timer: timerStr || 'N/A',
            passRate: clampedPass,
            failRate: clampedFail,
            slots: slotDetails
        };
    }

    function processAllCrimes(forceReprocess = false) {
        if (!isOCTabActive() || isProcessingDOM) return;
        isProcessingDOM = true;
        try {
            const ocContainers = document.querySelectorAll('[data-oc-id], [class*="crimeWrapper___"]');
            const list = [];
            ocContainers.forEach(node => {
                const data = processSingleOC(node, forceReprocess);
                if (data) list.push(data);
            });
            scannedPageOCs = list;
        } finally {
            isProcessingDOM = false;
        }
    }

    // =========================================================================
    // 6. UI BUILDER
    // =========================================================================
    function buildUI() {
        if (uiBuilt) return;
        uiBuilt = true;

        injectDynamicStyles();

        // Floating Button
        const btn = document.createElement('div');
        btn.id = 'zem-oc-float-btn';
        btn.title = "ZEM's OC 2.0 Helper (Click to open, drag to move)";
        btn.textContent = 'OC';
        btn.style.top = settings.btnPos.top;
        btn.style.left = settings.btnPos.left;
        document.body.appendChild(btn);

        // Modal
        const modal = document.createElement('div');
        modal.id = 'zem-oc-modal';
        modal.innerHTML = `
            <div class="zem-modal-header">
                <span>ZEM's OC 2.0 Helper</span>
                <button class="zem-modal-close" title="Close">&times;</button>
            </div>
            <div class="zem-modal-tabs">
                <button class="zem-tab-btn active" data-tab="live">Page OCs</button>
                <button class="zem-tab-btn" data-tab="database">All OCs</button>
                <button class="zem-tab-btn" data-tab="settings">Settings</button>
                <button class="zem-tab-btn" data-tab="guide">How It Works</button>
            </div>

            <!-- TAB 1: LIVE PAGE OCs -->
            <div class="zem-modal-body" id="zem-tab-live">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span style="color:#999; font-size:11px;">Showing crimes currently loaded on the page</span>
                    <button class="zem-btn" id="zem-btn-refresh-live">Refresh</button>
                </div>
                <div id="zem-live-oc-container"></div>
            </div>

            <!-- TAB 2: ALL OCs DATABASE -->
            <div class="zem-modal-body" id="zem-tab-database" style="display:none;">
                <input type="text" class="zem-search-input" id="zem-info-search" placeholder="Search crime, role, level, or item...">
                <div id="zem-info-list-container"></div>
            </div>

            <!-- TAB 3: SETTINGS -->
            <div class="zem-modal-body" id="zem-tab-settings" style="display:none;">
                <div class="zem-setting-row">
                    <label>Anchor Role Color</label>
                    <input type="color" id="zem-set-anchor-color" value="${settings.anchorColor}">
                </div>
                <div class="zem-setting-row">
                    <label>Secondary Role Color</label>
                    <input type="color" id="zem-set-sec-color" value="${settings.secondaryColor}">
                </div>
                <div class="zem-setting-row">
                    <label>Low Impact Role Color</label>
                    <input type="color" id="zem-set-low-color" value="${settings.lowColor}">
                </div>
                <div class="zem-setting-row">
                    <label>Show Role Impact %</label>
                    <input type="checkbox" id="zem-set-show-badges" ${settings.showWeightBadges ? 'checked' : ''}>
                </div>
                <div class="zem-setting-row">
                    <label>Show Pass / Fail Chances</label>
                    <input type="checkbox" id="zem-set-show-fail" ${settings.showFailChances ? 'checked' : ''}>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px;">
                    <button class="zem-btn" id="zem-btn-reset">Reset Colors</button>
                    <a href="https://www.torn.com/profiles.php?XID=4038551" target="_blank" class="zem-btn zem-dev-btn">Dev: ZEM [4038551]</a>
                </div>
            </div>

            <!-- TAB 4: HOW IT WORKS -->
            <div class="zem-modal-body" id="zem-tab-guide" style="display:none;">
                <div class="zem-guide-box">
                    <h4>Role Impact</h4>
                    <p>Every slot in an OC has a hidden impact percentage that decides how much that role matters. If a slot has 45% impact and someone with an awful pass rate joins it, the whole team fails. Put your best players in the Anchor roles and save the low-impact slots for newer members.</p>
                </div>

                <div class="zem-guide-box">
                    <h4>Pass Rate (CPR) & Fail Chance</h4>
                    <p>The number Torn shows on a slot is your Checkpoint Pass Rate (CPR), based on your Crime XP and Crime 2.0 skills. Your personal fail chance on that slot is simply <strong>100% minus your CPR</strong>.</p>
                    <p>The top crime bar shows the combined <strong>Pass / Fail %</strong> for the whole team. Hovering over any slot's Fail badge (or opening the <strong>Page OCs</strong> tab) shows how much fail risk that specific player is adding to the overall crime.</p>
                </div>

                <div class="zem-guide-box">
                    <h4>Items & Running the Crime</h4>
                    <p>Actual tools (Lockpicks, Drills, Cutters, Jemmy, Badges, Cameras) stay in your inventory after the OC. Consumables (Zip Ties, C4, Thermite, Viruses, Grenades, Drugs) get used up.</p>
                    <p>When the final 24h finishes, everyone needs to be in Torn and out of the hospital to run it. Being in jail is fine for planning and most executions, just don't be flying or hosped when the timer hits zero.</p>
                </div>

                <div style="text-align:right; margin-top:10px;">
                    <a href="https://www.torn.com/profiles.php?XID=4038551" target="_blank" class="zem-btn zem-dev-btn">Script by ZEM [4038551]</a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Dragging logic
        let isDragging = false;
        let hasMoved = false;
        let startX, startY, initialLeft, initialTop;

        btn.addEventListener('pointerdown', (e) => {
            isDragging = true;
            hasMoved = false;
            startX = e.clientX;
            startY = e.clientY;
            const rect = btn.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            btn.setPointerCapture(e.pointerId);
        });

        btn.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved = true;

            const maxLeft = window.innerWidth - btn.offsetWidth - 5;
            const maxTop = window.innerHeight - btn.offsetHeight - 5;
            btn.style.left = `${Math.max(5, Math.min(maxLeft, initialLeft + dx))}px`;
            btn.style.top = `${Math.max(5, Math.min(maxTop, initialTop + dy))}px`;
        });

        btn.addEventListener('pointerup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            btn.releasePointerCapture(e.pointerId);

            if (hasMoved) {
                settings.btnPos = { top: btn.style.top, left: btn.style.left };
                saveSettings();
            } else {
                modal.classList.toggle('open');
                if (modal.classList.contains('open')) {
                    processAllCrimes();
                    renderLivePageOCs();
                    renderOCInfoList();
                }
            }
        });

        modal.querySelector('.zem-modal-close').addEventListener('click', () => modal.classList.remove('open'));

        document.getElementById('zem-btn-refresh-live').addEventListener('click', () => {
            processAllCrimes();
            renderLivePageOCs();
        });

        // Tabs
        const tabBtns = modal.querySelectorAll('.zem-tab-btn');
        const tabPanels = {
            live: document.getElementById('zem-tab-live'),
            database: document.getElementById('zem-tab-database'),
            settings: document.getElementById('zem-tab-settings'),
            guide: document.getElementById('zem-tab-guide')
        };

        tabBtns.forEach(tb => {
            tb.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tb.classList.add('active');
                Object.keys(tabPanels).forEach(k => {
                    tabPanels[k].style.display = (k === tb.dataset.tab) ? 'block' : 'none';
                });
                if (tb.dataset.tab === 'live') {
                    processAllCrimes();
                    renderLivePageOCs();
                } else if (tb.dataset.tab === 'database') {
                    renderOCInfoList();
                }
            });
        });

        // Settings Listeners
        document.getElementById('zem-set-anchor-color').addEventListener('input', (e) => {
            settings.anchorColor = e.target.value;
            saveSettings();
        });
        document.getElementById('zem-set-sec-color').addEventListener('input', (e) => {
            settings.secondaryColor = e.target.value;
            saveSettings();
        });
        document.getElementById('zem-set-low-color').addEventListener('input', (e) => {
            settings.lowColor = e.target.value;
            saveSettings();
        });
        document.getElementById('zem-set-show-badges').addEventListener('change', (e) => {
            settings.showWeightBadges = e.target.checked;
            saveSettings();
        });
        document.getElementById('zem-set-show-fail').addEventListener('change', (e) => {
            settings.showFailChances = e.target.checked;
            saveSettings();
            renderOCInfoList();
            renderLivePageOCs();
        });

        document.getElementById('zem-btn-reset').addEventListener('click', () => {
            const currentPos = settings.btnPos;
            settings = { ...DEFAULT_SETTINGS, btnPos: currentPos };
            document.getElementById('zem-set-anchor-color').value = settings.anchorColor;
            document.getElementById('zem-set-sec-color').value = settings.secondaryColor;
            document.getElementById('zem-set-low-color').value = settings.lowColor;
            document.getElementById('zem-set-show-badges').checked = settings.showWeightBadges;
            document.getElementById('zem-set-show-fail').checked = settings.showFailChances;
            saveSettings();
        });

        document.getElementById('zem-info-search').addEventListener('input', () => renderOCInfoList());
    }

    function renderLivePageOCs() {
        const container = document.getElementById('zem-live-oc-container');
        if (!container) return;

        if (!scannedPageOCs || scannedPageOCs.length === 0) {
            container.innerHTML = `
                <div class="zem-guide-box" style="text-align:center; padding:20px;">
                    <h4>No Active OCs Detected on Screen</h4>
                    <p>Make sure crimes are visible on the page behind this window, then click Refresh.</p>
                </div>
            `;
            return;
        }

        const totalOCs = scannedPageOCs.length;
        const planningCount = scannedPageOCs.filter(o => o.isAllFilled).length;
        const recruitingCount = totalOCs - planningCount;
        const totalSlots = scannedPageOCs.reduce((acc, o) => acc + o.totalSlotsCount, 0);
        const filledSlots = scannedPageOCs.reduce((acc, o) => acc + o.filledSlotsCount, 0);
        const avgPass = (scannedPageOCs.reduce((acc, o) => acc + o.passRate, 0) / totalOCs).toFixed(1);

        let html = `
            <div class="zem-kpi-grid">
                <div class="zem-kpi-box">
                    <div class="zem-kpi-val">${totalOCs}</div>
                    <div class="zem-kpi-lbl">Visible OCs</div>
                </div>
                <div class="zem-kpi-box">
                    <div class="zem-kpi-val" style="color:#38d9a9;">${planningCount} / ${recruitingCount}</div>
                    <div class="zem-kpi-lbl">Plan / Recruit</div>
                </div>
                <div class="zem-kpi-box">
                    <div class="zem-kpi-val">${filledSlots}/${totalSlots}</div>
                    <div class="zem-kpi-lbl">Slots Filled</div>
                </div>
                <div class="zem-kpi-box">
                    <div class="zem-kpi-val" style="color:#69db7c;">${avgPass}%</div>
                    <div class="zem-kpi-lbl">Avg Pass Rate</div>
                </div>
            </div>
        `;

        scannedPageOCs.forEach(oc => {
            const statusClass = oc.isAllFilled ? 'zem-status-planning' : 'zem-status-recruiting';
            const rowsHtml = oc.slots.map(s => {
                const isAnchor = s.weight >= ANCHOR_MIN;
                const isSec = !isAnchor && s.weight >= SECONDARY_MIN;
                const roleColor = isAnchor ? settings.anchorColor : isSec ? settings.secondaryColor : settings.lowColor;

                const memberDisplay = s.isFilled
                    ? (s.playerXid
                        ? `<a href="https://www.torn.com/profiles.php?XID=${s.playerXid}" target="_blank" style="color:#999; text-decoration:underline;">${s.playerName}</a>`
                        : `<span style="color:#999;">${s.playerName}</span>`)
                    : `<span style="color:#ffaa00; font-weight:bold;">OPEN SLOT</span>`;

                const cprDisplay = s.cpr !== null ? `<span style="color:#999;">${s.cpr}%</span>` : `<span style="color:#777;">75% (est)</span>`;
                const failDisplay = `<span style="color:#ff8787;">${s.slotFail.toFixed(0)}% (-${s.weightedFail.toFixed(1)}%)</span>`;

                return `
                    <tr>
                        <td style="border-left: 3px solid ${roleColor}; font-weight:bold; color:${roleColor} !important;">${s.roleName}</td>
                        <td>${memberDisplay}</td>
                        <td style="color:#999 !important; font-weight:bold;">${s.weight.toFixed(1)}%</td>
                        <td>${cprDisplay}</td>
                        <td>${failDisplay}</td>
                        <td style="color:#999 !important;">${s.item || '-'}</td>
                    </tr>
                `;
            }).join('');

            html += `
                <div class="zem-live-card">
                    <div class="zem-live-header">
                        <div>
                            <strong style="font-size:13px; color:#fff;">${oc.ocName}</strong>
                            <span class="zem-level-badge" style="margin-left:6px;">Lv ${oc.level}</span>
                            <span class="zem-status-badge ${statusClass}" style="margin-left:6px;">${oc.status} (${oc.filledSlotsCount}/${oc.totalSlotsCount})</span>
                        </div>
                        <div style="font-size:11.5px; font-weight:bold;">
                            <span style="color:#aaa; margin-right:8px;">⏱ ${oc.timer}</span>
                            <span style="color:#69db7c;">Pass: ${oc.passRate.toFixed(1)}%</span>
                            <span style="color:#555;"> | </span>
                            <span style="color:#ff7676;">Fail: ${oc.failRate.toFixed(1)}%</span>
                        </div>
                    </div>
                    <table class="zem-live-table">
                        <thead>
                            <tr>
                                <th>Role</th>
                                <th>Member</th>
                                <th>Impact</th>
                                <th>CPR</th>
                                <th>Fail (-OC%)</th>
                                <th>Req. Item</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    function renderOCInfoList() {
        const container = document.getElementById('zem-info-list-container');
        if (!container) return;

        const query = (document.getElementById('zem-info-search')?.value || '').toLowerCase().trim();
        container.innerHTML = '';

        const entries = Object.values(normalizedDB).sort((a, b) => a.level - b.level);
        entries.forEach(oc => {
            const ocName = oc.displayName;
            const levelStr = `lv ${oc.level} level ${oc.level}`;
            const sortedRoles = Object.values(oc.roles).sort((a, b) => b.weight - a.weight);

            const matchesOC = ocName.toLowerCase().includes(query) || levelStr.includes(query);
            const matchesRoleOrItem = sortedRoles.some(r =>
                r.displayName.toLowerCase().includes(query) ||
                (r.item && r.item.toLowerCase().includes(query))
            );
            if (query && !matchesOC && !matchesRoleOrItem) return;

            const card = document.createElement('div');
            card.className = 'zem-info-card';

            const rolesHtml = sortedRoles.map(r => {
                const isAnchor = r.weight >= ANCHOR_MIN;
                const isSec = !isAnchor && r.weight >= SECONDARY_MIN;
                const color = isAnchor ? settings.anchorColor : isSec ? settings.secondaryColor : settings.lowColor;
                const itemLabel = r.item ? `Item: ${r.item}` : 'No item';
                const failAt75 = (25 * (r.weight / 100)).toFixed(1);
                const failHtml = settings.showFailChances
                    ? `<span style="color:#ff8787;" title="Fail risk added if a 75% CPR player takes this slot">75% CPR = -${failAt75}% OC</span>`
                    : '';

                return `
                    <div class="zem-info-role-item" style="border-left: 3px solid ${color};">
                        <div class="zem-info-role-top">
                            <span style="color:#999;">${r.displayName}</span>
                            <strong style="color:${color}">Impact: ${r.weight.toFixed(1)}%</strong>
                        </div>
                        <div class="zem-info-role-sub">
                            <span style="color:#999;">${itemLabel}</span>
                            ${failHtml}
                        </div>
                    </div>
                `;
            }).join('');

            card.innerHTML = `
                <div class="zem-info-title">
                    <span>${ocName}</span>
                    <span class="zem-level-badge">Lv ${oc.level} (${sortedRoles.length}p)</span>
                </div>
                <div class="zem-info-roles-grid">${rolesHtml}</div>
            `;
            container.appendChild(card);
        });
    }

    // =========================================================================
    // 7. LIFECYCLE & SAFE OBSERVER
    // =========================================================================
    function syncVisibilityAndObserver() {
        const active = isOCTabActive();
        const btn = document.getElementById('zem-oc-float-btn');
        const modal = document.getElementById('zem-oc-modal');

        if (active) {
            if (!uiBuilt) buildUI();
            if (btn) btn.style.display = 'flex';
            processAllCrimes();

            if (!observer) {
                observer = new MutationObserver((mutations) => {
                    if (!isOCTabActive() || isProcessingDOM) return;

                    const isExternalChange = mutations.some(m => {
                        const target = m.target;
                        if (!target || !(target instanceof Element)) return false;
                        return !target.closest('#zem-oc-modal, #zem-oc-float-btn, .zem-oc-slot-footer, .zem-oc-header-summary');
                    });

                    if (!isExternalChange) return;

                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        processAllCrimes();
                    }, 150);
                });
                observer.observe(document.body, { childList: true, subtree: true });
            }
        } else {
            if (btn) btn.style.display = 'none';
            if (modal) modal.classList.remove('open');
        }
    }

    buildNormalizedDB();
    syncVisibilityAndObserver();
    window.addEventListener('hashchange', syncVisibilityAndObserver);
    setInterval(syncVisibilityAndObserver, 2000);
})();
