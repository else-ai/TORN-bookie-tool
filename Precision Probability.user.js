// ==UserScript==
// @name         Precision Probability - Torn Bookie Tool
// @namespace    https://www.torn.com/
// @version      6.7.5
// @description  Precision Probability for Torn Bookie. Injects clean implied probabilities next to team names. Draggable UI. Safe on PC & PDA. 100% local.
// @author       Zemouregal [4038551]
// @match        https://www.torn.com/*
// @icon         https://www.torn.com/favicon.ico
// @license      GPL-3.0-or-later
// @grant        GM_info
// @grant        GM_addStyle
// @run-at       document-start
// @noframes
// @updateURL    https://raw.githubusercontent.com/else-ai/TORN-bookie-tool/main/Precision%20Probability.user.js
// @downloadURL  https://raw.githubusercontent.com/else-ai/TORN-bookie-tool/main/Precision%20Probability.user.js
// ==/UserScript==

/*
 * Precision Probability - Torn Bookie Tool
 * Copyright (c) 2026 Zemouregal [4038551]
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

(function() {
    'use strict';

    const VERSION = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) ? GM_info.script.version : '6.7.5';

    // Core Settings
    let isEnabled = localStorage.getItem('pb_inline_enabled') !== 'false';
    let currentTheme = localStorage.getItem('pb_user_theme') || 'default';
    let currentLang = localStorage.getItem('pb_user_lang') || 'en';

    // Feature Toggles
    let favoritesOnly = localStorage.getItem('pb_favorites_only') === 'true';
    let highlightValue = localStorage.getItem('pb_highlight_value') !== 'false';
    let powerMethodEnabled = localStorage.getItem('pb_power_method') === 'true';

    // Fixed Risk Thresholds
    const riskThresholds = {
        extreme: 2.39,
        high: 1.82,
        moderate: 1.34
    };

    const languages = [
        { code: 'en', name: 'English' }, { code: 'es', name: 'Español' }, { code: 'de', name: 'Deutsch' },
        { code: 'fr', name: 'Français' }, { code: 'it', name: 'Italiano' }, { code: 'pl', name: 'Polski' },
        { code: 'nl', name: 'Nederlands' }, { code: 'sv', name: 'Svenska' }, { code: 'da', name: 'Dansk' },
        { code: 'no', name: 'Norsk' }, { code: 'fi', name: 'Suomi' }
    ];

    const translations = {
        en: {
            title: "Precision Probability", tabSettings: "Settings", tabAbout: "About", tabDev: "Developer",
            toggleLbl: "Show Probabilities:", toggleOn: "Enabled", toggleOff: "Disabled",
            langLbl: "Language:", themeLbl: "Theme Palette:",
            aboutDesc: `<div class="pb-info-section"><h4>Why use this tool?</h4><p>Converts raw odds into clear implied probabilities so you can quickly understand the real chance behind each bet.</p></div>
            <div class="pb-info-section"><h4>What is the True-Edge Margin?</h4><p>Bookmakers hide a profit margin inside their odds, making favorites look better than they actually are. The <strong>Dynamic True-Edge Margin</strong> algorithm strips this away, revealing the true mathematical probability of an outcome. When active, an asterisk (*) appears next to the percentage.</p></div>
            <div class="pb-info-section"><h4>What it doesn't do</h4><ul><li>Does not place bets or auto-refresh</li><li>Does not track your activity</li><li>Does not guarantee wins</li></ul></div>
            <div class="pb-info-section" style="margin-bottom:0;"><h4>Privacy &amp; Compliance</h4><p>100% local • Zero server communication • Fully Torn compliant</p></div>
            <div style="margin-top:15px; padding:10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; text-align:center; font-size:11.5px; opacity: 1;">
                <strong style="color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px;">Risk reminder:</strong><br>
                <span style="color: #ffb3b3; font-weight: 600;">These are only probabilities. You can still lose money.</span>
            </div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Free tool for Torn Bookie</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Built as a hobby project - no subscriptions or donations.</li><li>Converts bookie odds into clean probabilities and risk levels.</li><li>Strictly analytical - does not predict outcomes.</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><p>Hope it helps you out.</p></div>`,
            authorBtn: "Author: Zemouregal [4038551]",
            riskLow: "Low Risk", riskMod: "Moderate Risk", riskHigh: "High Risk", riskExt: "Extreme Risk",
            deviggedSuffix: " • True-Edge %", rawSuffix: " • Raw %"
        },
        es: {
            title: "Precision Probability", tabSettings: "Ajustes", tabAbout: "Acerca de", tabDev: "Desarrollador",
            toggleLbl: "Mostrar Probabilidades:", toggleOn: "Activado", toggleOff: "Desactivado",
            langLbl: "Idioma:", themeLbl: "Tema:",
            aboutDesc: `<div class="pb-info-section"><h4>¿Por qué usar esta herramienta?</h4><p>Convierte las cuotas en probabilidades claras para que entiendas la probabilidad real de cada apuesta.</p></div>
            <div class="pb-info-section"><h4>¿Qué es el Margen True-Edge?</h4><p>Las casas de apuestas ocultan un margen de beneficio en sus cuotas. El algoritmo <strong>Dynamic True-Edge Margin</strong> elimina este margen para mostrar la probabilidad matemática real. Cuando está activo, aparece un asterisco (*) junto al porcentaje.</p></div>
            <div class="pb-info-section"><h4>Lo que NO hace</h4><ul><li>No apuesta ni actualiza la página</li><li>No rastrea tu actividad</li><li>No garantiza ganancias</li></ul></div>
            <div class="pb-info-section" style="margin-bottom:0;"><h4>Privacidad</h4><p>100% local • Compatible con Torn</p></div>
            <div style="margin-top:15px; padding:10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; text-align:center; font-size:11.5px; opacity: 1;">
                <strong style="color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px;">Recordatorio de riesgo:</strong><br>
                <span style="color: #ffb3b3; font-weight: 600;">Estas son solo probabilidades. Aún puedes perder dinero.</span>
            </div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Herramienta gratuita</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Proyecto aficionado.</li><li>Estrictamente analítico.</li></ul></div>`,
            authorBtn: "Autor: Zemouregal [4038551]",
            riskLow: "Riesgo Bajo", riskMod: "Riesgo Moderado", riskHigh: "Riesgo Alto", riskExt: "Riesgo Extremo",
            deviggedSuffix: " • % True-Edge", rawSuffix: " • % Bruto"
        },
        de: {
            title: "Precision Probability", tabSettings: "Einstellungen", tabAbout: "Über", tabDev: "Entwickler",
            toggleLbl: "Wahrscheinlichkeiten:", toggleOn: "Aktiviert", toggleOff: "Deaktiviert",
            langLbl: "Sprache:", themeLbl: "Thema:",
            aboutDesc: `<div class="pb-info-section"><h4>Warum dieses Tool?</h4><p>Wandelt Quoten in klare Wahrscheinlichkeiten um, damit du die echte Chance verstehst.</p></div>
            <div class="pb-info-section"><h4>Was ist die True-Edge Margin?</h4><p>Buchmacher verstecken eine Gewinnmarge in ihren Quoten. Der <strong>Dynamic True-Edge Margin</strong>-Algorithmus entfernt diese, um die echte mathematische Wahrscheinlichkeit zu zeigen. Wenn aktiv, erscheint ein Sternchen (*).</p></div>
            <div class="pb-info-section"><h4>Was es NICHT tut</h4><ul><li>Platziert keine Wetten</li><li>Sammelt keine Daten</li><li>Garantiert keine Gewinne</li></ul></div>
            <div class="pb-info-section" style="margin-bottom:0;"><h4>Datenschutz</h4><p>100% lokal • Torn-konform</p></div>
            <div style="margin-top:15px; padding:10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; text-align:center; font-size:11.5px; opacity: 1;">
                <strong style="color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px;">Risikohinweis:</strong><br>
                <span style="color: #ffb3b3; font-weight: 600;">Dies sind nur Wahrscheinlichkeiten. Du kannst immer noch verlieren.</span>
            </div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Kostenloses Tool</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Hobbyprojekt.</li><li>Streng analytisch.</li></ul></div>`,
            authorBtn: "Autor: Zemouregal [4038551]",
            riskLow: "Geringes Risiko", riskMod: "Mittleres Risiko", riskHigh: "Hohes Risiko", riskExt: "Extremes Risiko",
            deviggedSuffix: " • True-Edge %", rawSuffix: " • Rohe %"
        },
        fr: {
            title: "Precision Probability", tabSettings: "Paramètres", tabAbout: "À propos", tabDev: "Développeur",
            toggleLbl: "Probabilités:", toggleOn: "Activé", toggleOff: "Désactivé",
            langLbl: "Langue:", themeLbl: "Thème:",
            aboutDesc: `<div class="pb-info-section"><h4>Pourquoi utiliser cet outil ?</h4><p>Convertit les cotes en probabilités claires pour comprendre la vraie chance de chaque pari.</p></div>
            <div class="pb-info-section"><h4>Qu'est-ce que la marge True-Edge ?</h4><p>Les bookmakers cachent une marge bénéficiaire dans leurs cotes. L'algorithme <strong>Dynamic True-Edge Margin</strong> la supprime pour révéler la véritable probabilité mathématique. Lorsqu'il est actif, un astérisque (*) apparaît.</p></div>
            <div class="pb-info-section"><h4>Ce qu'il ne fait pas</h4><ul><li>Ne place pas de paris</li><li>Ne vous espionne pas</li><li>Ne garantit pas de gains</li></ul></div>
            <div class="pb-info-section" style="margin-bottom:0;"><h4>Confidentialité</h4><p>100% local • Conforme à Torn</p></div>
            <div style="margin-top:15px; padding:10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; text-align:center; font-size:11.5px; opacity: 1;">
                <strong style="color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px;">Rappel des risques :</strong><br>
                <span style="color: #ffb3b3; font-weight: 600;">Ce ne sont que des probabilités. Vous pouvez toujours perdre.</span>
            </div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Outil gratuit</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Projet amateur.</li><li>Strictement analytique.</li></ul></div>`,
            authorBtn: "Auteur: Zemouregal [4038551]",
            riskLow: "Faible", riskMod: "Modéré", riskHigh: "Élevé", riskExt: "Extrême",
            deviggedSuffix: " • % True-Edge", rawSuffix: " • % Brut"
        },
        it: {
            title: "Precision Probability", tabSettings: "Impostazioni", tabAbout: "Info", tabDev: "Sviluppatore",
            toggleLbl: "Probabilità:", toggleOn: "Attivato", toggleOff: "Disattivato",
            langLbl: "Lingua:", themeLbl: "Tema:",
            aboutDesc: `<div class="pb-info-section"><h4>Perché usare questo strumento?</h4><p>Converte le quote in probabilità chiare per comprendere le reali possibilità.</p></div>
            <div class="pb-info-section"><h4>Cos'è il margine True-Edge?</h4><p>I bookmaker nascondono un margine di profitto nelle quote. L'algoritmo <strong>Dynamic True-Edge Margin</strong> lo rimuove, rivelando la vera probabilità matematica. Se attivo, appare un asterisco (*).</p></div>
            <div class="pb-info-section"><h4>Cosa NON fa</h4><ul><li>Non piazza scommesse</li><li>Non traccia i tuoi dati</li><li>Non garantisce vincite</li></ul></div>
            <div class="pb-info-section" style="margin-bottom:0;"><h4>Privacy</h4><p>100% locale • Conforme a Torn</p></div>
            <div style="margin-top:15px; padding:10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; text-align:center; font-size:11.5px; opacity: 1;">
                <strong style="color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px;">Promemoria rischio:</strong><br>
                <span style="color: #ffb3b3; font-weight: 600;">Queste sono solo probabilità. Puoi comunque perdere.</span>
            </div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Strumento gratuito</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Progetto amatoriale.</li><li>Strettamente analitico.</li></ul></div>`,
            authorBtn: "Autore: Zemouregal [4038551]",
            riskLow: "Basso", riskMod: "Moderato", riskHigh: "Alto", riskExt: "Estremo",
            deviggedSuffix: " • % True-Edge", rawSuffix: " • % Grezzo"
        },
        pl: {
            title: "Precision Probability", tabSettings: "Ustawienia", tabAbout: "O nas", tabDev: "Deweloper",
            toggleLbl: "Prawdopodobieństwa:", toggleOn: "Włączone", toggleOff: "Wyłączone",
            langLbl: "Język:", themeLbl: "Motyw:",
            aboutDesc: `<div class="pb-info-section"><h4>Dlaczego to narzędzie?</h4><p>Przekształca kursy w jasne prawdopodobieństwa, abyś mógł zrozumieć realne szanse.</p></div>
            <div class="pb-info-section"><h4>Czym jest margines True-Edge?</h4><p>Bukmacherzy ukrywają marżę zysku w kursach. Algorytm <strong>Dynamic True-Edge Margin</strong> usuwa ją, ujawniając prawdziwe matematyczne prawdopodobieństwo. Gdy aktywny, pojawia się gwiazdka (*).</p></div>
            <div class="pb-info-section"><h4>Czego NIE robi</h4><ul><li>Nie obstawia zakładów</li><li>Nie śledzi Twojej aktywności</li><li>Nie gwarantuje wygranych</li></ul></div>
            <div class="pb-info-section" style="margin-bottom:0;"><h4>Prywatność</h4><p>100% lokalne • Zgodne z Torn</p></div>
            <div style="margin-top:15px; padding:10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; text-align:center; font-size:11.5px; opacity: 1;">
                <strong style="color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px;">Przypomnienie o ryzyku:</strong><br>
                <span style="color: #ffb3b3; font-weight: 600;">To tylko prawdopodobieństwa. Nadal możesz stracić pieniądze.</span>
            </div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Darmowe narzędzie</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Projekt hobbystyczny.</li><li>Ściśle analityczne.</li></ul></div>`,
            authorBtn: "Autor: Zemouregal [4038551]",
            riskLow: "Niskie", riskMod: "Umiarkowane", riskHigh: "Wysokie", riskExt: "Ekstremalne",
            deviggedSuffix: " • % True-Edge", rawSuffix: " • % Surowe"
        },
        nl: {
            title: "Precision Probability", tabSettings: "Instellingen", tabAbout: "Over", tabDev: "Ontwikkelaar",
            toggleLbl: "Kansen tonen:", toggleOn: "Aan", toggleOff: "Uit",
            langLbl: "Taal:", themeLbl: "Thema:",
            aboutDesc: `<div class="pb-info-section"><h4>Waarom deze tool?</h4><p>Zet de odds om in duidelijke kansen, zodat je de echte kans begrijpt.</p></div>
            <div class="pb-info-section"><h4>Wat is de True-Edge Marge?</h4><p>Bookmakers verbergen een winstmarge in hun odds. Het <strong>Dynamic True-Edge Margin</strong> algoritme verwijdert dit en onthult de echte wiskundige kans. Indien actief, verschijnt er een sterretje (*).</p></div>
            <div class="pb-info-section"><h4>Wat het NIET doet</h4><ul><li>Plaatst geen weddenschappen</li><li>Volgt je niet</li><li>Garandeert geen winst</li></ul></div>
            <div class="pb-info-section" style="margin-bottom:0;"><h4>Privacy</h4><p>100% lokaal • Conform Torn</p></div>
            <div style="margin-top:15px; padding:10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; text-align:center; font-size:11.5px; opacity: 1;">
                <strong style="color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px;">Risicoherinnering:</strong><br>
                <span style="color: #ffb3b3; font-weight: 600;">Dit zijn slechts kansen. Je kunt nog steeds verliezen.</span>
            </div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Gratis tool</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Hobbyproject.</li><li>Strikt analytisch.</li></ul></div>`,
            authorBtn: "Auteur: Zemouregal [4038551]",
            riskLow: "Laag", riskMod: "Matig", riskHigh: "Hoog", riskExt: "Extreem",
            deviggedSuffix: " • True-Edge %", rawSuffix: " • Ruwe %"
        },
        sv: {
            title: "Precision Probability", tabSettings: "Inställningar", tabAbout: "Om", tabDev: "Utvecklare",
            toggleLbl: "Visa sannolikhet:", toggleOn: "På", toggleOff: "Av",
            langLbl: "Språk:", themeLbl: "Tema:",
            aboutDesc: `<div class="pb-info-section"><h4>Varför detta verktyg?</h4><p>Konverterar oddsen till tydliga sannolikheter så att du förstår den verkliga chansen.</p></div>
            <div class="pb-info-section"><h4>Vad är True-Edge Marginalen?</h4><p>Spelbolag döljer en vinstmarginal i sina odds. <strong>Dynamic True-Edge Margin</strong> algoritmen tar bort denna och visar den sanna matematiska sannolikheten. När den är aktiv visas en asterisk (*).</p></div>
            <div class="pb-info-section"><h4>Vad det INTE gör</h4><ul><li>Placerar inga spel</li><li>Spårar inte din aktivitet</li><li>Garanterar inga vinster</li></ul></div>
            <div class="pb-info-section" style="margin-bottom:0;"><h4>Integritet</h4><p>100% lokalt • Kompatibelt med Torn</p></div>
            <div style="margin-top:15px; padding:10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; text-align:center; font-size:11.5px; opacity: 1;">
                <strong style="color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px;">Riskpåminnelse:</strong><br>
                <span style="color: #ffb3b3; font-weight: 600;">Detta är endast sannolikheter. Du kan fortfarande förlora.</span>
            </div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Gratis verktyg</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Hobbyprojekt.</li><li>Strikt analytiskt.</li></ul></div>`,
            authorBtn: "Författare: Zemouregal [4038551]",
            riskLow: "Låg", riskMod: "Måttlig", riskHigh: "Hög", riskExt: "Extrem",
            deviggedSuffix: " • True-Edge %", rawSuffix: " • Råa %"
        },
        da: {
            title: "Precision Probability", tabSettings: "Indstillinger", tabAbout: "Om", tabDev: "Udvikler",
            toggleLbl: "Sandsynlighed:", toggleOn: "Til", toggleOff: "Fra",
            langLbl: "Sprog:", themeLbl: "Tema:",
            aboutDesc: `<div class="pb-info-section"><h4>Hvorfor dette værktøj?</h4><p>Konverterer de rå odds til klare sandsynligheder.</p></div>
            <div class="pb-info-section"><h4>Hvad er True-Edge Margin?</h4><p>Bookmakere skjuler en fortjenstmargen i deres odds. <strong>Dynamic True-Edge Margin</strong> fjerner denne og afslører den sande matematiske sandsynlighed. Når den er aktiv, vises en stjerne (*).</p></div>
            <div class="pb-info-section"><h4>Hvad det IKKE gør</h4><ul><li>Placerer ikke væddemål</li><li>Sporer ikke din aktivitet</li><li>Garanterer ikke gevinster</li></ul></div>
            <div class="pb-info-section" style="margin-bottom:0;"><h4>Privatliv</h4><p>100% lokalt • Kompatibelt med Torn</p></div>
            <div style="margin-top:15px; padding:10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; text-align:center; font-size:11.5px; opacity: 1;">
                <strong style="color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px;">Risikopåmindelse:</strong><br>
                <span style="color: #ffb3b3; font-weight: 600;">Dette er kun sandsynligheder. Du kan stadig tabe.</span>
            </div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Gratis værktøj</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Hobbyprojekt.</li><li>Strengt analytisk.</li></ul></div>`,
            authorBtn: "Forfatter: Zemouregal [4038551]",
            riskLow: "Lav", riskMod: "Moderat", riskHigh: "Høj", riskExt: "Ekstrem",
            deviggedSuffix: " • True-Edge %", rawSuffix: " • Rå %"
        },
        no: {
            title: "Precision Probability", tabSettings: "Innstillinger", tabAbout: "Om", tabDev: "Utvikler",
            toggleLbl: "Sannsynlighet:", toggleOn: "På", toggleOff: "Av",
            langLbl: "Språk:", themeLbl: "Tema:",
            aboutDesc: `<div class="pb-info-section"><h4>Hvorfor dette verktøyet?</h4><p>Konverterer oddsene til klare sannsynligheter.</p></div>
            <div class="pb-info-section"><h4>Hva er True-Edge Margin?</h4><p>Bookmakere skjuler en profittmargin i oddsene sine. <strong>Dynamic True-Edge Margin</strong> fjerner denne og avslører den sanne matematiske sannsynligheten. Når aktiv, vises en stjerne (*).</p></div>
            <div class="pb-info-section"><h4>Hva det IKKE gjør</h4><ul><li>Plasserer ikke spill</li><li>Sporer ikke din aktivitet</li><li>Garanterer ikke gevinster</li></ul></div>
            <div class="pb-info-section" style="margin-bottom:0;"><h4>Personvern</h4><p>100% lokalt • Kompatibelt med Torn</p></div>
            <div style="margin-top:15px; padding:10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; text-align:center; font-size:11.5px; opacity: 1;">
                <strong style="color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px;">Risikopåminnelse:</strong><br>
                <span style="color: #ffb3b3; font-weight: 600;">Dette er bare sannsynligheter. Du kan fortsatt tape penger.</span>
            </div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Gratis verktøy</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Hobbyprosjekt.</li><li>Strengt analytisk.</li></ul></div>`,
            authorBtn: "Forfatter: Zemouregal [4038551]",
            riskLow: "Lav", riskMod: "Moderat", riskHigh: "Høy", riskExt: "Ekstrem",
            deviggedSuffix: " • True-Edge %", rawSuffix: " • Rå %"
        },
        fi: {
            title: "Precision Probability", tabSettings: "Asetukset", tabAbout: "Tietoa", tabDev: "Kehittäjä",
            toggleLbl: "Todennäköisyydet:", toggleOn: "Päällä", toggleOff: "Pois",
            langLbl: "Kieli:", themeLbl: "Teema:",
            aboutDesc: `<div class="pb-info-section"><h4>Miksi käyttää tätä?</h4><p>Muuntaa kertoimet selkeiksi todennäköisyyksiksi.</p></div>
            <div class="pb-info-section"><h4>Mikä on True-Edge -marginaali?</h4><p>Vedonvälittäjät piilottavat voittomarginaalin kertoimiin. <strong>Dynamic True-Edge Margin</strong> poistaa tämän ja paljastaa todellisen matemaattisen todennäköisyyden. Kun aktiivinen, näkyy tähti (*).</p></div>
            <div class="pb-info-section"><h4>Mitä se EI tee</h4><ul><li>Ei aseta vetoja</li><li>Ei seuraa toimintaasi</li><li>Ei takaa voittoja</li></ul></div>
            <div class="pb-info-section" style="margin-bottom:0;"><h4>Yksityisyys</h4><p>100% paikallinen • Tornin sääntöjen mukainen</p></div>
            <div style="margin-top:15px; padding:10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; text-align:center; font-size:11.5px; opacity: 1;">
                <strong style="color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px;">Riskimuistutus:</strong><br>
                <span style="color: #ffb3b3; font-weight: 600;">Nämä ovat vain todennäköisyyksiä. Voit silti hävitä.</span>
            </div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Ilmainen työkalu</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Harrasteprojekti.</li><li>Tiukasti analyyttinen.</li></ul></div>`,
            authorBtn: "Tekijä: Zemouregal [4038551]",
            riskLow: "Pieni", riskMod: "Kohtalainen", riskHigh: "Suuri", riskExt: "Äärimmäinen",
            deviggedSuffix: " • True-Edge %", rawSuffix: " • Raaka %"
        }
    };

    let t = translations[currentLang] || translations.en;
    const suffixDevig = t.deviggedSuffix || translations.en.deviggedSuffix;
    const suffixRaw = t.rawSuffix || translations.en.rawSuffix;

    function isOnBookie() { return window.location.href.includes('sid=bookie'); }

    function injectStyles() {
        const css = `
            :root {
                --pb-fab-bg: #1e2235; --pb-fab-border: #4f422e; --pb-fab-icon: #d4af77;
                --pb-modal-bg: #151a28; --pb-modal-border: #4f422e; --pb-modal-text: #a88b56;
                --pb-modal-val: #fdf2d5; --pb-btn-bg: #1e2235; --pb-btn-text: #d4af77;
                --pb-accent: #d4af77;
                --pb-inline-bg: rgba(143,196,0,0.15); --pb-inline-text: #a6f500;
                --pb-inline-bg-mod: rgba(250,204,21,0.15); --pb-inline-text-mod: #facc15;
                --pb-inline-bg-high: rgba(234,179,8,0.15); --pb-inline-text-high: #eab308;
                --pb-inline-bg-ext: rgba(239,68,68,0.15); --pb-inline-text-ext: #ef4444;
            }
            body.pb-theme-v1 {
                --pb-fab-bg: #111; --pb-fab-border: #333; --pb-fab-icon: #8fc400;
                --pb-modal-bg: #161616; --pb-modal-border: #333; --pb-modal-text: #888;
                --pb-modal-val: #f3f4f6; --pb-btn-bg: #222; --pb-btn-text: #8fc400;
                --pb-accent: #8fc400;
            }
            body.pb-theme-modern {
                --pb-fab-bg: #0f172a; --pb-fab-border: #1e293b; --pb-fab-icon: #38bdf8;
                --pb-modal-bg: #030712; --pb-modal-border: #1e293b; --pb-modal-text: #64748b;
                --pb-modal-val: #f8fafc; --pb-btn-bg: #0f172a; --pb-btn-text: #38bdf8;
                --pb-accent: #38bdf8;
            }
            body.pb-theme-futuristic {
                --pb-fab-bg: rgba(6, 11, 25, 0.95); --pb-fab-border: rgba(0, 255, 204, 0.5); --pb-fab-icon: #00ffcc;
                --pb-modal-bg: rgba(6, 11, 25, 0.95); --pb-modal-border: rgba(0, 255, 204, 0.5); --pb-modal-text: #009999;
                --pb-modal-val: #00f0ff; --pb-btn-bg: rgba(0, 255, 204, 0.1); --pb-btn-text: #00ffcc;
                --pb-accent: #00ffcc;
            }
            body.pb-theme-retro {
                --pb-fab-bg: #110022; --pb-fab-border: #ff0055; --pb-fab-icon: #00ffcc;
                --pb-modal-bg: #000; --pb-modal-border: #440088; --pb-modal-text: #aa55ff;
                --pb-modal-val: #ffffff; --pb-btn-bg: #110022; --pb-btn-text: #00ffcc;
                --pb-accent: #ff0055;
            }

            /* Draggable FAB */
            #pb-fab {
                position: fixed; width: 48px; height: 48px;
                background: var(--pb-fab-bg); border: 1px solid var(--pb-fab-border); border-radius: 50%;
                display: flex; align-items: center; justify-content: center; z-index: 999999;
                cursor: grab; box-shadow: 0 4px 12px rgba(0,0,0,0.6); touch-action: none;
            }
            #pb-fab:active { cursor: grabbing; transform: scale(0.95); }
            #pb-fab svg { fill: var(--pb-fab-icon); width: 22px; height: 22px; pointer-events: none; }

            /* Modal Overlays */
            #pb-modal-overlay {
                position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 1000000;
                display: none; align-items: center; justify-content: center; backdrop-filter: blur(3px);
            }
            #pb-modal {
                width: 90%; max-width: 400px; background: var(--pb-modal-bg); border: 1px solid var(--pb-modal-border);
                border-radius: 12px; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.9);
                animation: pbModalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; overflow: hidden;
            }
            @keyframes pbModalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

            .pb-modal-header {
                padding: 16px 20px; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--pb-modal-border);
                display: flex; justify-content: space-between; align-items: center;
            }
            .pb-modal-title { color: var(--pb-modal-val); font-weight: 700; font-size: 15px; font-family: system-ui, sans-serif; display: flex; align-items: center; gap: 8px;}
            .pb-modal-close { cursor: pointer; font-size: 22px; color: var(--pb-modal-text); line-height: 1; transition: color 0.1s; }
            .pb-modal-close:hover { color: #fff; }

            /* Tabs */
            .pb-tabs { display: flex; border-bottom: 1px solid var(--pb-modal-border); background: rgba(0,0,0,0.1); }
            .pb-tab {
                flex: 1; padding: 12px 0; text-align: center; color: var(--pb-modal-text); font-size: 12px;
                font-weight: 700; text-transform: uppercase; cursor: pointer; border-bottom: 2px solid transparent;
                font-family: system-ui, sans-serif; transition: all 0.15s;
            }
            .pb-tab:hover { background: rgba(255,255,255,0.03); color: var(--pb-modal-val); }
            .pb-tab.active { color: var(--pb-accent); border-bottom-color: var(--pb-accent); }
            .pb-tab-content { padding: 18px 20px; display: none; color: var(--pb-modal-text); font-size: 13.5px; font-family: system-ui, sans-serif; line-height: 1.5; max-height: 60vh; overflow-y: auto;}
            .pb-tab-content.active { display: block; }
            .pb-tab-content::-webkit-scrollbar { width: 6px; }
            .pb-tab-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

            /* Info Section Styles */
            .pb-info-section { margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.06); }
            .pb-info-section:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
            .pb-info-section h4 { color: var(--pb-modal-val); font-size: 12px; margin: 0 0 3px 0 !important; padding: 0; font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.3px; font-weight: 700; }
            .pb-info-section p { color: var(--pb-modal-text); font-size: 12px; margin: 0 0 2px 0 !important; padding-top: 0; line-height: 1.35; font-family: system-ui, sans-serif; }
            .pb-info-section ul { margin: 0 0 0 !important; padding-left: 15px; color: var(--pb-modal-text); font-size: 12px; font-family: system-ui, sans-serif; line-height: 1.3; }
            .pb-info-section li { margin-bottom: 2px; }

            /* Settings Forms */
            .pb-form-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
            .pb-form-col { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
            .pb-form-lbl { font-weight: 600; color: var(--pb-modal-val); font-size: 13px; font-family: system-ui, sans-serif; }
            .pb-select { background: var(--pb-btn-bg); color: var(--pb-btn-text); border: 1px solid var(--pb-modal-border); padding: 8px 12px; border-radius: 6px; outline: none; font-size: 13px; cursor: pointer; font-weight: 600; }

            /* Pill Toggles */
            .pb-btn-group {
                display: flex; gap: 4px; background: rgba(0,0,0,0.25);
                padding: 4px; border-radius: 8px; border: 1px solid var(--pb-modal-border);
            }
            .pb-btn-group button {
                flex: 1; padding: 6px 14px; border: none; background: transparent;
                color: var(--pb-modal-text); border-radius: 5px; cursor: pointer;
                font-weight: bold; font-size: 12px; transition: all 0.2s; font-family: system-ui, sans-serif;
            }
            .pb-btn-group button.active { background: var(--pb-accent); color: #000; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }

            /* Author & Link Buttons */
            .pb-author-btn {
                display: block; width: fit-content; margin: 18px auto 0;
                background: var(--pb-btn-bg); color: var(--pb-btn-text);
                border: 1px solid var(--pb-modal-border); padding: 8px 20px;
                border-radius: 20px; text-decoration: none; font-weight: bold;
                font-family: system-ui, sans-serif; font-size: 11.5px;
                transition: all 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            }
            .pb-author-btn:hover { background: var(--pb-accent); color: #000; transform: translateY(-1px); }

            .pb-github-box {
                margin-top: 16px; padding: 10px; background: rgba(0,0,0,0.2);
                border: 1px solid var(--pb-modal-border); border-radius: 8px;
                display: flex; align-items: center; justify-content: center;
            }
            .pb-github-link {
                color: var(--pb-accent); text-decoration: none; font-weight: 600;
                font-family: system-ui, sans-serif; font-size: 11.5px;
                display: flex; align-items: center; gap: 6px; opacity: 0.85; transition: opacity 0.2s;
            }
            .pb-github-link:hover { opacity: 1; text-decoration: underline; }

            /* Inline Injection Styles */
            .pb-inline-prob {
                margin-left: 5px; margin-right: 5px; font-size: 11px; font-weight: 700; color: var(--pb-inline-text);
                background: var(--pb-inline-bg); padding: 1.5px 5px; border-radius: 3px;
                display: inline-flex; align-items: center; justify-content: center;
                box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
                font-family: system-ui, sans-serif; letter-spacing: 0.15px; white-space: nowrap;
                height: fit-content; line-height: 1.1; vertical-align: middle; cursor: help;
            }
            .pb-inline-prob.mod { color: var(--pb-inline-text-mod); background: var(--pb-inline-bg-mod); }
            .pb-inline-prob.high { color: var(--pb-inline-text-high); background: var(--pb-inline-bg-high); }
            .pb-inline-prob.ext { color: var(--pb-inline-text-ext); background: var(--pb-inline-bg-ext); }

            body.pb-hide-inline .pb-inline-prob { display: none !important; }

            /* Mobile Improvements */
            @media (max-width: 480px) {
                .pb-tab-content { font-size: 14px !important; padding: 16px 14px !important; }
                .pb-info-section p, .pb-info-section ul, .pb-info-section h4 { font-size: 12.5px !important; }
                #pb-fab { width: 54px; height: 54px; }
                .pb-form-row { margin-bottom: 10px; }
            }
        `;

        if (typeof GM_addStyle !== 'undefined') {
            GM_addStyle(css);
        } else {
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        }

        document.body.classList.add(`pb-theme-${currentTheme}`);
        if (!isEnabled) document.body.classList.add('pb-hide-inline');
    }

    // Scrub all DOM elements clean before recalculating to strictly prevent duplicates
    function fullReset() {
        document.querySelectorAll('.pb-inline-prob').forEach(el => el.remove());
        if (isEnabled) processBookieRows();
    }

    function createUI() {
        if (document.getElementById('pb-fab')) return;

        let fabLeft = localStorage.getItem('pb_fab_left');
        let fabTop = localStorage.getItem('pb_fab_top');
        if (!fabLeft || !fabTop || parseInt(fabLeft) < 0 || parseInt(fabTop) < 0 || parseInt(fabLeft) > window.innerWidth || parseInt(fabTop) > window.innerHeight) {
            fabLeft = 'calc(100vw - 68px)'; fabTop = 'calc(100vh - 68px)';
        }

        const fab = document.createElement('div');
        fab.id = 'pb-fab';
        fab.style.display = isOnBookie() ? 'flex' : 'none';
        fab.style.left = fabLeft; fab.style.top = fabTop;
        fab.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;
        document.body.appendChild(fab);

        const overlay = document.createElement('div');
        overlay.id = 'pb-modal-overlay';
        overlay.innerHTML = `
            <div id="pb-modal">
                <div class="pb-modal-header">
                    <div class="pb-modal-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg> <span id="lbl-title">${t.title} <span style="font-size:11px; opacity:0.6; font-weight:400;">v${VERSION}</span></span></div>
                    <div class="pb-modal-close" id="pb-modal-close">×</div>
                </div>
                <div class="pb-tabs">
                    <div class="pb-tab active" data-target="pb-tab-settings" id="lbl-tab-settings">${t.tabSettings}</div>
                    <div class="pb-tab" data-target="pb-tab-about" id="lbl-tab-about">${t.tabAbout}</div>
                    <div class="pb-tab" data-target="pb-tab-dev" id="lbl-tab-dev">${t.tabDev}</div>
                </div>

                <div class="pb-tab-content active" id="pb-tab-settings">
                    <div class="pb-form-row">
                        <span class="pb-form-lbl" id="lbl-toggle">${t.toggleLbl}</span>
                        <div class="pb-btn-group">
                            <button id="pb-master-on" class="${isEnabled ? 'active' : ''}">On</button>
                            <button id="pb-master-off" class="${!isEnabled ? 'active' : ''}">Off</button>
                        </div>
                    </div>
                    <div class="pb-form-col">
                        <span class="pb-form-lbl" id="lbl-lang">${t.langLbl}</span>
                        <select class="pb-select" id="pb-lang-select"></select>
                    </div>
                    <div class="pb-form-col">
                        <span class="pb-form-lbl" id="lbl-theme">${t.themeLbl}</span>
                        <select class="pb-select" id="pb-theme-select">
                            <option value="default" ${currentTheme === 'default' ? 'selected' : ''}>Casino (Gold)</option>
                            <option value="v1" ${currentTheme === 'v1' ? 'selected' : ''}>V1 (Dark Green)</option>
                            <option value="modern" ${currentTheme === 'modern' ? 'selected' : ''}>Modern (Blue)</option>
                            <option value="futuristic" ${currentTheme === 'futuristic' ? 'selected' : ''}>Cyber (Cyan)</option>
                            <option value="retro" ${currentTheme === 'retro' ? 'selected' : ''}>Retro (Pink)</option>
                        </select>
                    </div>

                    <div class="pb-form-col" style="margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08);">
                        <span class="pb-form-lbl" style="margin-bottom: 6px;">Features</span>

                        <div class="pb-form-row" style="margin-bottom: 8px;">
                            <span style="font-size: 12.5px; color: var(--pb-modal-text);">Favorites Only Mode</span>
                            <div class="pb-btn-group">
                                <button id="pb-fav-on" class="${favoritesOnly ? 'active' : ''}">On</button>
                                <button id="pb-fav-off" class="${!favoritesOnly ? 'active' : ''}">Off</button>
                            </div>
                        </div>

                        <div class="pb-form-row" style="margin-bottom: 8px;">
                            <span style="font-size: 12.5px; color: var(--pb-modal-text);">Highlight Strong Favorites</span>
                            <div class="pb-btn-group">
                                <button id="pb-high-on" class="${highlightValue ? 'active' : ''}">On</button>
                                <button id="pb-high-off" class="${!highlightValue ? 'active' : ''}">Off</button>
                            </div>
                        </div>

                        <div class="pb-form-col" style="margin-bottom: 8px; padding-bottom: 8px;">
                            <div class="pb-form-row" style="margin-bottom: 2px;">
                                <span style="font-size: 12.5px; color: var(--pb-modal-text);">Dynamic True-Edge Margin</span>
                                <div class="pb-btn-group">
                                    <button id="pb-power-on" class="${powerMethodEnabled ? 'active' : ''}">On</button>
                                    <button id="pb-power-off" class="${!powerMethodEnabled ? 'active' : ''}">Off</button>
                                </div>
                            </div>
                            <div style="font-size: 10.5px; color: var(--pb-modal-text); opacity: 0.6; line-height: 1.3;">
                                Removes the bookie's hidden profit margin to calculate the true mathematical probability. Appends an asterisk (*) to modified values.
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pb-tab-content" id="pb-tab-about">
                    <div id="lbl-about-desc">${t.aboutDesc}</div>
                </div>

                <div class="pb-tab-content" id="pb-tab-dev">
                    <div id="lbl-dev-desc">${t.devDesc}</div>
                    <a href="https://www.torn.com/profiles.php?XID=4038551" target="_blank" class="pb-author-btn" id="lbl-author-btn">${t.authorBtn}</a>

                    <div class="pb-github-box">
                        <a href="https://github.com/else-ai/TORN-bookie-tool/blob/main/Precision%20Probability.user.js" target="_blank" class="pb-github-link">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                            Source Code on GitHub
                        </a>
                    </div>

                    <div style="text-align:center; margin-top: 12px; font-size: 10px; opacity: 0.5;">v${VERSION}</div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const langSelect = document.getElementById('pb-lang-select');
        langSelect.innerHTML = languages.map(l => `<option value="${l.code}" ${l.code === currentLang ? 'selected' : ''}>${l.name}</option>`).join('');

        function updateUITexts() {
            document.getElementById('lbl-title').textContent = t.title;
            document.getElementById('lbl-tab-settings').textContent = t.tabSettings;
            document.getElementById('lbl-tab-about').textContent = t.tabAbout;
            document.getElementById('lbl-tab-dev').textContent = t.tabDev;
            document.getElementById('lbl-toggle').textContent = t.toggleLbl;
            document.getElementById('lbl-lang').textContent = t.langLbl;
            document.getElementById('lbl-theme').textContent = t.themeLbl;
            document.getElementById('lbl-about-desc').innerHTML = t.aboutDesc;
            document.getElementById('lbl-dev-desc').innerHTML = t.devDesc;
            document.getElementById('lbl-author-btn').textContent = t.authorBtn;
        }

        langSelect.onchange = (e) => {
            currentLang = e.target.value;
            localStorage.setItem('pb_user_lang', currentLang);
            t = translations[currentLang] || translations.en;
            updateUITexts();
            fullReset(); // Re-render tooltips in new language
        };

        document.getElementById('pb-theme-select').onchange = (e) => {
            document.body.classList.remove(`pb-theme-${currentTheme}`);
            currentTheme = e.target.value;
            localStorage.setItem('pb_user_theme', currentTheme);
            document.body.classList.add(`pb-theme-${currentTheme}`);
        };

        const updateFabColor = () => {
            const fabEl = document.getElementById('pb-fab');
            if (!fabEl) return;
            if (isEnabled) {
                fabEl.style.opacity = '1'; fabEl.style.filter = 'none';
            } else {
                fabEl.style.opacity = '0.55'; fabEl.style.filter = 'grayscale(0.6)';
            }
        };

        const bindToggleGroup = (onId, offId, conditionCheck, callback) => {
            const onBtn = document.getElementById(onId);
            const offBtn = document.getElementById(offId);

            const setActive = (isOn) => {
                if (isOn) { onBtn.classList.add('active'); offBtn.classList.remove('active'); }
                else { onBtn.classList.remove('active'); offBtn.classList.add('active'); }
            };

            onBtn.onclick = () => {
                if (!conditionCheck()) {
                    setActive(true); callback(true); fullReset();
                }
            };
            offBtn.onclick = () => {
                if (conditionCheck()) {
                    setActive(false); callback(false); fullReset();
                }
            };
        };

        bindToggleGroup('pb-master-on', 'pb-master-off', () => isEnabled, (val) => {
            isEnabled = val;
            localStorage.setItem('pb_inline_enabled', isEnabled);
            document.body.classList.toggle('pb-hide-inline', !isEnabled);
            updateFabColor();
        });

        bindToggleGroup('pb-fav-on', 'pb-fav-off', () => favoritesOnly, (val) => {
            favoritesOnly = val;
            localStorage.setItem('pb_favorites_only', favoritesOnly ? 'true' : 'false');
        });

        bindToggleGroup('pb-high-on', 'pb-high-off', () => highlightValue, (val) => {
            highlightValue = val;
            localStorage.setItem('pb_highlight_value', highlightValue);
        });

        bindToggleGroup('pb-power-on', 'pb-power-off', () => powerMethodEnabled, (val) => {
            powerMethodEnabled = val;
            localStorage.setItem('pb_power_method', powerMethodEnabled ? 'true' : 'false');
        });

        setTimeout(updateFabColor, 50);

        document.querySelectorAll('.pb-tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.pb-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.pb-tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.target).classList.add('active');
            };
        });

        document.getElementById('pb-modal-close').onclick = () => { overlay.style.display = 'none'; };
        overlay.onmousedown = (e) => { if (e.target === overlay) { overlay.style.display = 'none'; } };

        // --- DRAG LOGIC ---
        let isDragging = false, hasMoved = false;
        let startX, startY, initialX, initialY;

        const dragStart = (clientX, clientY) => {
            isDragging = true; hasMoved = false;
            startX = clientX; startY = clientY;
            initialX = fab.offsetLeft; initialY = fab.offsetTop;
            document.body.style.userSelect = 'none';
        };
        const dragMove = (clientX, clientY, e) => {
            if (!isDragging) return;
            const dx = clientX - startX, dy = clientY - startY;
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
                hasMoved = true;
                if(e.cancelable) e.preventDefault();
            }
            fab.style.left = `${initialX + dx}px`;
            fab.style.top = `${initialY + dy}px`;
            fab.style.bottom = 'auto'; fab.style.right = 'auto';
        };
        const dragEnd = () => {
            isDragging = false;
            document.body.style.userSelect = '';
            if (hasMoved) {
                localStorage.setItem('pb_fab_left', fab.style.left);
                localStorage.setItem('pb_fab_top', fab.style.top);
            }
        };

        fab.addEventListener('mousedown', e => dragStart(e.clientX, e.clientY));
        document.addEventListener('mousemove', e => dragMove(e.clientX, e.clientY, e), { passive: false });
        document.addEventListener('mouseup', () => { if(isDragging) dragEnd(); });
        fab.addEventListener('touchstart', e => dragStart(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
        document.addEventListener('touchmove', e => { if (isDragging) dragMove(e.touches[0].clientX, e.touches[0].clientY, e); }, { passive: false });
        document.addEventListener('touchend', () => { if(isDragging) dragEnd(); });

        fab.addEventListener('click', () => { if (!hasMoved) overlay.style.display = 'flex'; });
    }

    // --- DOM CLIMBER & INJECTION LOGIC ---
    function processBookieRows() {
        if (!isOnBookie() || !isEnabled) return;

        const rows = document.querySelectorAll('li.bets');
        if (!rows.length) return;

        let lowestOdds = Infinity;
        let gatheredOdds = [];

        rows.forEach(row => {
            const oddsNode = row.querySelector('[class*="multiplier"]');
            if (!oddsNode) return;

            const match = oddsNode.textContent.match(/x\s*(\d+(?:\.\d+)?)/i);
            if (!match) return;

            const odds = parseFloat(match[1]);
            if (!isNaN(odds) && odds >= 1.01 && odds < 1000) {
                if (odds < lowestOdds) {
                    lowestOdds = odds;
                }
                gatheredOdds.push(odds);
            }
        });

        // --- Calibration ---
        let powerProbsMap=new Map();if(powerMethodEnabled&&gatheredOdds.length>1){(function(_0x1a,_0x2b){let _0x3c=_0x1a.map(x=>1/x);if(_0x3c.reduce((a,b)=>a+b,0)>1){let _0x4d=1,_0x5e=25;for(let _0x6f=0;_0x6f<50;_0x6f++){let _0x7a=(_0x4d+_0x5e)/2;_0x3c.reduce((a,b)=>a+Math.pow(b,_0x7a),0)>1?_0x4d=_0x7a:_0x5e=_0x7a;}_0x1a.forEach(x=>_0x2b.set(x,Math.pow(1/x,(_0x4d+_0x5e)/2)*100));}})(gatheredOdds,powerProbsMap);}

        rows.forEach(row => {
            row.querySelectorAll('.pb-inline-prob').forEach(x => x.remove());

            const oddsNode = row.querySelector('[class*="multiplier"]');
            const nameNode = row.querySelector('[class*="description"] span');
            if (!oddsNode || !nameNode) return;

            const match = oddsNode.textContent.match(/x\s*(\d+(?:\.\d+)?)/i);
            if (!match) return;

            const finalOdds = parseFloat(match[1]);
            if (isNaN(finalOdds) || finalOdds < 1.01 || finalOdds > 1000) {
                return;
            }

            if (favoritesOnly && finalOdds > lowestOdds + 0.02) {
                return;
            }

            const span = document.createElement('span');
            span.className = 'pb-inline-prob';
            let riskBaseText = "";

            if (finalOdds >= riskThresholds.extreme) {
                span.classList.add('ext');
                riskBaseText = t.riskExt;
            }
            else if (finalOdds >= riskThresholds.high) {
                span.classList.add('high');
                riskBaseText = t.riskHigh;
            }
            else if (finalOdds >= riskThresholds.moderate) {
                span.classList.add('mod');
                riskBaseText = t.riskMod;
            }
            else {
                riskBaseText = t.riskLow;
            }

            if (powerMethodEnabled && powerProbsMap.has(finalOdds)) {
                let prob = powerProbsMap.get(finalOdds);
                span.textContent = prob.toFixed(1) + '%*';
                span.title = riskBaseText + suffixDevig;
            } else {
                let prob = (1 / finalOdds) * 100;
                span.textContent = prob.toFixed(1) + '%';
                span.title = riskBaseText + suffixRaw;
            }

            if (highlightValue && finalOdds < 1.8) {
                span.style.fontWeight = '800';
                span.style.boxShadow = '0 0 0 2px rgba(163,172,185,.6)';

                if (finalOdds < 1.5) {
                    span.style.background = 'rgba(163,172,185,.15)';
                }
            }

            const parent = nameNode.parentElement;
            parent.style.display = 'inline-flex';
            parent.style.alignItems = 'center';
            parent.appendChild(span);
        });
    }

    function initObserver() {
        let debounceTimer;
        let lastUrl = location.href;

        const observer = new MutationObserver(() => {
            if (lastUrl !== location.href) {
                lastUrl = location.href;
                const fabEl = document.getElementById('pb-fab');
                const modalEl = document.getElementById('pb-modal-overlay');

                if (isOnBookie()) {
                    if (fabEl) fabEl.style.display = 'flex';
                    if (isEnabled) fullReset();
                } else {
                    if (fabEl) fabEl.style.display = 'none';
                    if (modalEl) modalEl.style.display = 'none';
                }
            }

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (isOnBookie() && isEnabled) processBookieRows();
            }, 400);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function init() {
        injectStyles();
        createUI();
        if (isOnBookie() && isEnabled) processBookieRows();
        initObserver();
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
