// ==UserScript==
// @name         Precision Probability - Torn Bookie Tool
// @namespace    https://www.torn.com/
// @version      6.4.4
// @description  Precision Probability for Torn Bookie. Injects clean implied probabilities next to team names. Draggable UI. PDA Safe. 100% local.
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

    const VERSION = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) ? GM_info.script.version : '6.4.4';

    // Core Settings
    let isEnabled = localStorage.getItem('pb_inline_enabled') !== 'false';
    let currentTheme = localStorage.getItem('pb_user_theme') || 'default';
    let currentLang = localStorage.getItem('pb_user_lang') || 'en';

    // Feature Toggles
    let favoritesOnly = localStorage.getItem('pb_favorites_only') === 'true';
    let highlightValue = localStorage.getItem('pb_highlight_value') !== 'false';

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
            aboutDesc: `<div class="pb-info-section"><h4>Why use this tool?</h4><p>Converts the raw odds you see into clear implied probabilities so you can quickly understand the real chance behind each bet. <strong>Remember: you can still lose.</strong></p></div><div class="pb-info-section"><h4>What it doesn't do</h4><ul><li>Does not place bets or auto-refresh the page</li><li>Does not track, spy on, or collect any of your stats or activity</li><li>Does not predict outcomes or guarantee wins</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><h4>Privacy &amp; Compliance</h4><p>100% local • Zero server communication • Fully Torn compliant • Safe on mobile/PDA</p></div><div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08); text-align:center; font-size:11px; opacity:0.75;"><strong>Risk reminder:</strong> These are only probabilities. You can still lose money when betting.</div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;">
    <span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Free tool for Torn Bookie</span>
</div>

<div class="pb-info-section">
    <ul style="list-style-type: disc;">
        <li>Built as a hobby project - no subscriptions, payments, or donations.</li>
        <li>Converts bookie odds into clean probabilities and risk levels.</li>
        <li>Strictly analytical - does not predict outcomes or guarantee profits.</li>
    </ul>
</div>

<div class="pb-info-section" style="margin-bottom:0;">
    <p>It shows the implied probability behind the odds and gives a basic risk level for the favorite.</p>
    <p style="margin-top:16px; text-align:center; font-style:italic; opacity: 0.8;">Hope it helps you out</p>
</div>`,
            authorBtn: "Author: Zemouregal [4038551]",
            riskLow: "Low Risk", riskMod: "Moderate Risk", riskHigh: "High Risk", riskExt: "Extreme Risk"
        },
        es: {
            title: "Precision Probability", tabSettings: "Ajustes", tabAbout: "Acerca de", tabDev: "Desarrollador",
            toggleLbl: "Mostrar Probabilidades:", toggleOn: "Activado", toggleOff: "Desactivado",
            langLbl: "Idioma:", themeLbl: "Tema:",
            aboutDesc: `<div class="pb-info-section"><h4>¿Por qué usar esta herramienta?</h4><p>Convierte las cuotas que ves en probabilidades claras para que entiendas rápido la probabilidad real de cada apuesta. <strong>Recuerda: aún puedes perder.</strong></p></div><div class="pb-info-section"><h4>Lo que NO hace</h4><ul><li>No apuesta ni actualiza la página</li><li>No rastrea, espía ni recopila tus estadísticas o actividad</li><li>No predice resultados ni garantiza ganancias</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><h4>Privacidad y cumplimiento</h4><p>100% local • Sin servidores • Compatible con Torn • Seguro en móvil/PDA</p></div><div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08); text-align:center; font-size:11px; opacity:0.75;"><strong>Recordatorio de riesgo:</strong> Estas son solo probabilidades. Aún puedes perder dinero al apostar.</div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Esta es una herramienta gratuita para Torn.</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Proyecto aficionado - sin suscripciones ni pagos.</li><li>Convierte cuotas en porcentajes legibles y niveles de riesgo.</li><li>Estrictamente analítico - no predice resultados ni garantiza beneficios.</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><p>Muestra la probabilidad implícita y da un nivel de riesgo básico para el favorito.</p><p style="margin-top:16px; text-align:center; font-style:italic; opacity: 0.8;">¡Espero que te ayude!</p></div>`,
            authorBtn: "Autor: Zemouregal [4038551]",
            riskLow: "Riesgo Bajo", riskMod: "Riesgo Moderado", riskHigh: "Riesgo Alto", riskExt: "Riesgo Extremo"
        },
        de: {
            title: "Precision Probability", tabSettings: "Einstellungen", tabAbout: "Über", tabDev: "Entwickler",
            toggleLbl: "Wahrscheinlichkeiten anzeigen:", toggleOn: "Aktiviert", toggleOff: "Deaktiviert",
            langLbl: "Sprache:", themeLbl: "Thema:",
            aboutDesc: `<div class="pb-info-section"><h4>Warum dieses Tool?</h4><p>Wandelt die angezeigten Quoten in klare Wahrscheinlichkeiten um, damit du die echte Chance hinter jeder Wette schnell verstehst. <strong>Denk daran: Du kannst trotzdem verlieren.</strong></p></div><div class="pb-info-section"><h4>Was es NICHT tut</h4><ul><li>Platziert keine Wetten und aktualisiert die Seite nicht</li><li>Verfolgt, spioniert oder sammelt keine deiner Statistiken oder Aktivitäten</li><li>Sagt keine Ergebnisse voraus und garantiert keine Gewinne</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><h4>Datenschutz &amp; Richtlinien</h4><p>100% lokal • Keine Serverkommunikation • Voll konform mit Torn • PDA-sicher</p></div><div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08); text-align:center; font-size:11px; opacity:0.75;"><strong>Risikohinweis:</strong> Dies sind nur Wahrscheinlichkeiten. Du kannst beim Wetten immer noch Geld verlieren.</div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Dies ist ein kostenloses Tool für Torns Bookie.</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Hobbyprojekt - keine Abonnements, Zahlungen oder Spenden.</li><li>Wandelt Quoten in lesbare Prozentsätze und Risikostufen um.</li><li>Streng analytisch - sagt keine Ergebnisse voraus und garantiert keine Gewinne.</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><p>Es zeigt die implizite Wahrscheinlichkeit und gibt ein grundlegendes Risikoniveau für den Favoriten an.</p><p style="margin-top:16px; text-align:center; font-style:italic; opacity: 0.8;">Hoffe, es hilft dir!</p></div>`,
            authorBtn: "Autor: Zemouregal [4038551]",
            riskLow: "Geringes Risiko", riskMod: "Mittleres Risiko", riskHigh: "Hohes Risiko", riskExt: "Extremes Risiko"
        },
        fr: {
            title: "Precision Probability", tabSettings: "Paramètres", tabAbout: "À propos", tabDev: "Développeur",
            toggleLbl: "Afficher les probabilités:", toggleOn: "Activé", toggleOff: "Désactivé",
            langLbl: "Langue:", themeLbl: "Thème:",
            aboutDesc: `<div class="pb-info-section"><h4>Pourquoi utiliser cet outil ?</h4><p>Convertit les cotes brutes en probabilités claires pour que vous puissiez comprendre rapidement la vraie chance derrière chaque pari. <strong>N'oubliez pas : vous pouvez siempre perder.</strong></p></div><div class="pb-info-section"><h4>Ce qu'il ne fait pas</h4><ul><li>Ne place pas de paris et n'actualise pas la page</li><li>Ne suit pas, n'espionne pas et ne collecte pas vos statistiques ou activités</li><li>Ne prédit pas les résultats et ne garantit pas de gains</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><h4>Confidentialité et Conformité</h4><p>100% local • Zéro communication serveur • Totalement conforme à Torn • Sûr sur mobile/PDA</p></div><div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08); text-align:center; font-size:11px; opacity:0.75;"><strong>Rappel des risques :</strong> Ce ne sont que des probabilités. Vous pouvez siempre perder de l'argent.</div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Ceci est un outil gratuit pour Torn Bookie.</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Créé comme projet amateur - pas d'abonnements, de paiements ou de dons.</li><li>Convertit les cotes en pourcentages et niveaux de risque.</li><li>Strictement analytique - ne prédit pas les résultats et ne garantit pas de profits.</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><p>Il montre la probabilité implicite et donne un niveau de risque de base pour le favori.</p><p style="margin-top:16px; text-align:center; font-style:italic; opacity: 0.8;">J'espère que cela vous aidera</p></div>`,
            authorBtn: "Auteur: Zemouregal [4038551]",
            riskLow: "Faible", riskMod: "Modéré", riskHigh: "Élevé", riskExt: "Extrême"
        },
        it: {
            title: "Precision Probability", tabSettings: "Impostazioni", tabAbout: "Info", tabDev: "Sviluppatore",
            toggleLbl: "Mostra Probabilità:", toggleOn: "Attivato", toggleOff: "Disattivato",
            langLbl: "Lingua:", themeLbl: "Tema:",
            aboutDesc: `<div class="pb-info-section"><h4>Perché usare questo strumento?</h4><p>Converte le quote grezze in probabilità implicite chiare per comprendere rapidamente le reali possibilità di ogni scommessa. <strong>Ricorda: puoi comunque perdere.</strong></p></div><div class="pb-info-section"><h4>Cosa NON fa</h4><ul><li>Non piazza scommesse né aggiorna la pagina</li><li>Non traccia, spia o raccoglie le tue statistiche o attività</li><li>Non prevede i risultati né garantisce vittorie</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><h4>Privacy e Conformità</h4><p>100% locale • Nessuna comunicazione server • Completamente conforme a Torn • Sicuro su PDA</p></div><div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08); text-align:center; font-size:11px; opacity:0.75;"><strong>Promemoria rischio:</strong> Queste sono solo probabilità. Puoi ancora perdere soldi.</div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Strumento gratuito per il Bookie di Torn.</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Progetto amatoriale - niente abbonamenti, pagamenti o donazioni.</li><li>Converte le quote in probabilità e livelli di rischio.</li><li>Strettamente analitico - non prevede i risultati né garantisce profitti.</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><p>Mostra la probabilità implicita dietro le quote e un livello di rischio per il favorito.</p><p style="margin-top:16px; text-align:center; font-style:italic; opacity: 0.8;">Spero ti sia d'aiuto</p></div>`,
            authorBtn: "Autore: Zemouregal [4038551]",
            riskLow: "Basso", riskMod: "Moderato", riskHigh: "Alto", riskExt: "Estremo"
        },
        pl: {
            title: "Precision Probability", tabSettings: "Ustawienia", tabAbout: "O nas", tabDev: "Deweloper",
            toggleLbl: "Pokaż prawdopodobieństwa:", toggleOn: "Włączone", toggleOff: "Wyłączone",
            langLbl: "Język:", themeLbl: "Motyw:",
            aboutDesc: `<div class="pb-info-section"><h4>Dlaczego to narzędzie?</h4><p>Przekształca kursy w jasne prawdopodobieństwa, abyś mógł szybko zrozumieć realne szanse każdego zakładu. <strong>Pamiętaj: wciąż możesz przegrać.</strong></p></div><div class="pb-info-section"><h4>Czego NIE robi</h4><ul><li>Nie obstawia zakładów ani nie odświeża strony</li><li>Nie śledzi, nie szpieguje ani nie zbiera twoich statystyk</li><li>Nie przewiduje wyników ani nie gwarantuje wygranych</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><h4>Prywatność i Zgodność</h4><p>100% lokalne • Brak komunikacji z serwerem • W pełni zgodne z Torn</p></div><div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08); text-align:center; font-size:11px; opacity:0.75;"><strong>Przypomnienie o ryzyku:</strong> To są tylko prawdopodobieństwa. Nadal możesz stracić pieniądze.</div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Darmowe narzędzie dla bukmachera w Torn.</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Projekt hobbystyczny - brak subskrypcji, płatności lub darowizn.</li><li>Przelicza kursy na czyste prawdopodobieństwa i ryzyko.</li><li>Ściśle analityczne - nie przewiduje wyników ani nie gwarantuje zysków.</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><p>Pokazuje prawdopodobieństwo ukryte w kursach i podaje poziom ryzyka dla faworyta.</p><p style="margin-top:16px; text-align:center; font-style:italic; opacity: 0.8;">Mam nadzieję, że to pomoże</p></div>`,
            authorBtn: "Autor: Zemouregal [4038551]",
            riskLow: "Niskie", riskMod: "Umiarkowane", riskHigh: "Wysokie", riskExt: "Ekstremalne"
        },
        nl: {
            title: "Precision Probability", tabSettings: "Instellingen", tabAbout: "Over", tabDev: "Ontwikkelaar",
            toggleLbl: "Kansen tonen:", toggleOn: "Aan", toggleOff: "Uit",
            langLbl: "Taal:", themeLbl: "Thema:",
            aboutDesc: `<div class="pb-info-section"><h4>Waarom deze tool?</h4><p>Zet de odds om in duidelijke kansen, zodat je snel de echte kans achter elke weddenschap begrijpt. <strong>Onthoud: je kunt nog steeds verliezen.</strong></p></div><div class="pb-info-section"><h4>Wat het NIET doet</h4><ul><li>Plaatst geen weddenschappen en vernieuwt de pagina niet</li><li>Volgt, bespioneert of verzamelt je statistieken niet</li><li>Voorspelt geen uitkomsten en garandeert geen winst</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><h4>Privacy & Naleving</h4><p>100% lokaal • Geen servercommunicatie • Volledig conform Torn</p></div><div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08); text-align:center; font-size:11px; opacity:0.75;"><strong>Risicoherinnering:</strong> Dit zijn slechts kansen. Je kunt nog steeds geld verliezen.</div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Gratis tool voor de Torn Bookie.</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Hobbyproject - geen abonnementen, betalingen or donaties.</li><li>Zet bookie odds om in kansen en risiconiveaus.</li><li>Strikt analytisch - voorspelt geen uitkomsten en garandeert geen winst.</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><p>Het toont de impliciete kans achter de odds en geeft een basis risiconiveau voor de favoriet.</p><p style="margin-top:16px; text-align:center; font-style:italic; opacity: 0.8;">Ik hoop dat het je helpt</p></div>`,
            authorBtn: "Auteur: Zemouregal [4038551]",
            riskLow: "Laag", riskMod: "Matig", riskHigh: "Hoog", riskExt: "Extreem"
        },
        sv: {
            title: "Precision Probability", tabSettings: "Inställningar", tabAbout: "Om", tabDev: "Utvecklare",
            toggleLbl: "Visa sannolikhet:", toggleOn: "På", toggleOff: "Av",
            langLbl: "Språk:", themeLbl: "Tema:",
            aboutDesc: `<div class="pb-info-section"><h4>Varför detta verktyg?</h4><p>Konverterar oddsen till tydliga sannolikheter så att du snabbt kan förstå den verkliga chansen bakom varje spel. <strong>Kom ihåg: du kan fortfarande förlora.</strong></p></div><div class="pb-info-section"><h4>Vad det INTE gör</h4><ul><li>Placerar inga spel eller uppdaterar sidan automatiskt</li><li>Spårar eller samlar inte in din statistik</li><li>Förutsäger inga resultat och garanterar inga vinster</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><h4>Integritet & Efterlevnad</h4><p>100% lokalt • Ingen serverkommunikation • Helt kompatibelt med Torn</p></div><div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08); text-align:center; font-size:11px; opacity:0.75;"><strong>Riskpåminnelse:</strong> Detta är endast sannolikheter. Du kan fortfarande förlora pengar.</div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Gratis verktyg för Torns Bookie.</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Hobbyprojekt - inga prenumerationer eller betalningar.</li><li>Konverterar odds till rena sannolikheter och risknivåer.</li><li>Strikt analytiskt - förutsäger inte resultat eller garanterar vinster.</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><p>Det visar den implicita sannolikheten bakom oddsen och ger en risknivå för favoriten.</p><p style="margin-top:16px; text-align:center; font-style:italic; opacity: 0.8;">Hoppas det hjälper dig</p></div>`,
            authorBtn: "Författare: Zemouregal [4038551]",
            riskLow: "Låg", riskMod: "Måttlig", riskHigh: "Hög", riskExt: "Extrem"
        },
        da: {
            title: "Precision Probability", tabSettings: "Indstillinger", tabAbout: "Om", tabDev: "Udvikler",
            toggleLbl: "Vis sandsynlighed:", toggleOn: "Til", toggleOff: "Fra",
            langLbl: "Sprog:", themeLbl: "Tema:",
            aboutDesc: `<div class="pb-info-section"><h4>Hvorfor dette værktøj?</h4><p>Konverterer de rå odds til klare sandsynligheder, så du hurtigt kan forstå den reelle chance bag hvert væddemål. <strong>Husk: du kan stadig tabe.</strong></p></div><div class="pb-info-section"><h4>Hvad det IKKE gør</h4><ul><li>Placerer ikke væddemål og opdaterer ikke siden</li><li>Sporer eller indsamler ikke din statistik</li><li>Forudsiger ikke resultater eller garanterar gevinster</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><h4>Privatliv & Overholdelse</h4><p>100% lokalt • Ingen serverkommunikation • Kompatibelt med Torn</p></div><div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08); text-align:center; font-size:11px; opacity:0.75;"><strong>Risikopåmindelse:</strong> Dette er kun sandsynligheder. Du kan stadig tabe penge.</div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Gratis værktøj til Torns Bookie.</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Hobbyprojekt - ingen abonnementer eller betalinger.</li><li>Konverterar bookie odds til rene sandsynligheder og risikoniveauer.</li><li>Strengt analytisk - forudsiger ikke resultater eller garanterer overskud.</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><p>Det viser den implicitte sandsynlighed bag oddset og giver et risikoniveau for favoritten.</p><p style="margin-top:16px; text-align:center; font-style:italic; opacity: 0.8;">Håber det hjælper dig</p></div>`,
            authorBtn: "Forfatter: Zemouregal [4038551]",
            riskLow: "Lav", riskMod: "Moderat", riskHigh: "Høj", riskExt: "Ekstrem"
        },
        no: {
            title: "Precision Probability", tabSettings: "Innstillinger", tabAbout: "Om", tabDev: "Utvikler",
            toggleLbl: "Vis sannsynlighet:", toggleOn: "På", toggleOff: "Av",
            langLbl: "Språk:", themeLbl: "Tema:",
            aboutDesc: `<div class="pb-info-section"><h4>Hvorfor dette verktøyet?</h4><p>Konverterer oddsene til klare sannsynligheter, slik at du raskt kan forstå den virkelige sjansen bak hvert spill. <strong>Husk: du kan fortsatt tape.</strong></p></div><div class="pb-info-section"><h4>Hva det IKKE gjør</h4><ul><li>Plasserer ikke spill eller oppdaterer siden automatisk</li><li>Sporer eller samler ikke inn statistikken din</li><li>Spår ikke utfall eller garanterar gevinster</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><h4>Personvern og Samsvar</h4><p>100% lokalt • Ingen serverkommunikasjon • Kompatibelt med Torn</p></div><div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08); text-align:center; font-size:11px; opacity:0.75;"><strong>Risikopåminnelse:</strong> Dette er bare sannsynligheter. Du kan fortsatt tape penger.</div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Gratis verktøy for Torns Bookie.</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Hobbyprosjekt - ingen abonnementer eller betalinger.</li><li>Konverterer odds til rene sannsynligheter og risikonivåer.</li><li>Strengt analytisk - spår ikke utfall eller garanterar fortjeneste.</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><p>Det viser den implisitte sannsynligheten bak oddsen og gir et risikonivå for favoritten.</p><p style="margin-top:16px; text-align:center; font-style:italic; opacity: 0.8;">Håper det hjelper deg</p></div>`,
            authorBtn: "Forfatter: Zemouregal [4038551]",
            riskLow: "Lav", riskMod: "Moderat", riskHigh: "Høy", riskExt: "Ekstrem"
        },
        fi: {
            title: "Precision Probability", tabSettings: "Asetukset", tabAbout: "Tietoa", tabDev: "Kehittäjä",
            toggleLbl: "Näytä todennäköisyydet:", toggleOn: "Päällä", toggleOff: "Pois",
            langLbl: "Kieli:", themeLbl: "Teema:",
            aboutDesc: `<div class="pb-info-section"><h4>Miksi käyttää tätä työkalua?</h4><p>Muuntaa kertoimet selkeiksi todennäköisyyksiksi, jotta ymmärrät nopeasti todellisen mahdollisuuden jokaisen vedon takana. <strong>Muista: voit silti hävittää.</strong></p></div><div class="pb-info-section"><h4>Mitä se EI tee</h4><ul><li>Ei aseta vetoja tai päivitä sivua automaattisesti</li><li>Ei seuraa tai kerää tilastojasi</li><li>Ei ennusta tuloksia tai takaa voittoja</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><h4>Yksityisyys ja Säännöt</h4><p>100% paikallinen • Ei palvelinviestintää • Tornin sääntöjen mukainen</p></div><div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08); text-align:center; font-size:11px; opacity:0.75;"><strong>Riskimuistutus:</strong> Nämä ovat vain todennäköisyyksiä. Voit silti menettää rahaa.</div>`,
            devDesc: `<div class="pb-info-section" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px;"><span style="font-weight: 800; font-size: 15px; color: var(--pb-accent);">Ilmainen työkalu Tornin Bookielle.</span></div><div class="pb-info-section"><ul style="list-style-type: disc;"><li>Harrasteprojekti - ei tilauksia tai maksuja.</li><li>Muuntaa kertoimet todennäköisyyksiksi ja riskitasoiksi.</li><li>Tiukasti analyyttinen - ei ennusta tuloksia tai takaa tuottoja.</li></ul></div><div class="pb-info-section" style="margin-bottom:0;"><p>Se näyttää kertoimen takana olevan todennäköisyyden ja antaa riskin suosikille.</p><p style="margin-top:16px; text-align:center; font-style:italic; opacity: 0.8;">Toivottavasti tästä on apua</p></div>`,
            authorBtn: "Tekijä: Zemouregal [4038551]",
            riskLow: "Pieni", riskMod: "Kohtalainen", riskHigh: "Suuri", riskExt: "Äärimmäinen"
        }
    };

    let t = translations[currentLang] || translations.en;

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

            /* Developer Tab */
            #pb-tab-dev .pb-info-section { margin-bottom: 15px; }
            #pb-tab-dev .pb-info-section:last-child { margin-bottom: 0; }
            #pb-tab-dev .pb-info-section p { line-height: 1.45; margin-bottom: 8px; }
            #pb-tab-dev .pb-info-section ul { line-height: 1.4; margin-bottom: 4px; }

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

            /* Author Button */
            .pb-author-btn {
                display: block; width: fit-content; margin: 24px auto 0;
                background: var(--pb-btn-bg); color: var(--pb-btn-text);
                border: 1px solid var(--pb-modal-border); padding: 8px 20px;
                border-radius: 20px; text-decoration: none; font-weight: bold;
                font-family: system-ui, sans-serif; font-size: 11.5px;
                transition: all 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            }
            .pb-author-btn:hover { background: var(--pb-accent); color: #000; transform: translateY(-1px); }

            /* Inline Injection Styles */
            .pb-inline-prob {
                margin-left: 5px; margin-right: 5px; font-size: 11px; font-weight: 700; color: var(--pb-inline-text);
                background: var(--pb-inline-bg); padding: 1.5px 5px; border-radius: 3px;
                display: inline-flex; align-items: center; justify-content: center;
                box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
                font-family: system-ui, sans-serif; letter-spacing: 0.15px; white-space: nowrap;
                height: fit-content; line-height: 1.1; vertical-align: middle;
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
        document.querySelectorAll('[data-pb-scanned="true"]').forEach(el => el.removeAttribute('data-pb-scanned'));
        document.querySelectorAll('.pb-inline-prob').forEach(el => el.remove());
        if (isEnabled) processBookieRows();
    }

    function createUI() {
        if (document.getElementById('pb-fab')) return;

        // Boundary Checking
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
                    </div>
                </div>

                <div class="pb-tab-content" id="pb-tab-about">
                    <div id="lbl-about-desc">${t.aboutDesc}</div>
                </div>

                <div class="pb-tab-content" id="pb-tab-dev">
                    <div id="lbl-dev-desc">${t.devDesc}</div>
                    <a href="https://www.torn.com/profiles.php?XID=4038551" target="_blank" class="pb-author-btn" id="lbl-author-btn">${t.authorBtn}</a>
                    <div style="text-align:center; margin-top: 16px; font-size: 10px; opacity: 0.5;">v${VERSION}</div>
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

        const structuralElements = document.querySelectorAll('tr, li, [class*="market-row"], [class*="bet-option"]');

        structuralElements.forEach(row => {
            if (row.getAttribute('data-pb-scanned') === 'true') return;

            const text = row.innerText ? row.innerText.trim() : '';
            if (!text) return;

            // ISLET PARSING: Ensure this container has EXACTLY one odds match so we don't accidentally parse giant outer wrappers.
            const oddsMatches = text.match(/x\s*(\d+\.?\d*)/gi);
            if (!oddsMatches || oddsMatches.length !== 1) return;

            const oddsMatchStr = oddsMatches[0];
            const finalOdds = parseFloat(oddsMatchStr.replace(/x\s*/i, ''));
            if (!finalOdds || finalOdds < 1.01 || finalOdds >= 50) return;

            // Remove any old badges in this exact DOM branch before recalculating
            const oldBadges = row.querySelectorAll('.pb-inline-prob');
            if (oldBadges.length > 0) {
                oldBadges.forEach(b => b.remove());
            }

            // Favorites Only Logic - Dynamically finds the true favorite of the match
            let isFavorite = true;
            if (favoritesOnly && row.parentElement) {
                const parentText = row.parentElement.innerText || '';
                const allOddsMatches = parentText.match(/x\s*(\d+\.?\d*)/gi) || [];
                let minOdds = 50;

                allOddsMatches.forEach(m => {
                    const val = parseFloat(m.replace(/x\s*/i, ''));
                    if (val >= 1.01 && val < 50 && val < minOdds) minOdds = val;
                });

                // If this row's odds are greater than the lowest odds found (allowing a small tie margin), hide it
                if (finalOdds > minOdds + 0.02) isFavorite = false;
            }

            if (favoritesOnly && !isFavorite) {
                row.setAttribute('data-pb-scanned', 'true');
                return;
            }

            let teamName = "";
            const after = text.split(oddsMatchStr)[1];
            if (after) {
                const candidate = after.trim().split(/[\n\t]/)[0].trim();
                if (candidate.length > 2 && !['probability', 'odds'].includes(candidate.toLowerCase())) {
                    teamName = candidate;
                }
            }

            if (teamName) {
                const elements = row.querySelectorAll('td, div, span');
                let targetNode = null;

                for (let el of elements) {
                    const cleanText = Array.from(el.childNodes)
                        .filter(n => !(n.nodeType === 1 && n.classList.contains('pb-inline-prob')))
                        .map(n => n.textContent || '')
                        .join('')
                        .trim();

                    if (cleanText === teamName) {
                        targetNode = el; break;
                    }
                }

                if (targetNode) {
                    const prob = (1 / finalOdds) * 100;

                    const span = document.createElement('span');
                    span.className = 'pb-inline-prob';
                    span.textContent = prob.toFixed(1) + '%';

                    if (finalOdds >= riskThresholds.extreme) { span.classList.add('ext'); span.title = t.riskExt; }
                    else if (finalOdds >= riskThresholds.high) { span.classList.add('high'); span.title = t.riskHigh; }
                    else if (finalOdds >= riskThresholds.moderate) { span.classList.add('mod'); span.title = t.riskMod; }
                    else { span.title = t.riskLow; }

                    if (highlightValue && finalOdds < 1.8) {
                        span.style.fontWeight = '800';
                        span.style.boxShadow = '0 0 0 2px rgba(163, 172, 185, 0.6)';
                        if (finalOdds < 1.5) span.style.background = 'rgba(163, 172, 185, 0.15)';
                    }

                    targetNode.style.display = 'inline-flex';
                    targetNode.style.alignItems = 'center';
                    targetNode.appendChild(span);
                }
            }
            row.setAttribute('data-pb-scanned', 'true');
        });
    }

    function initObserver() {
        let debounceTimer;
        let lastUrl = location.href;

        const observer = new MutationObserver(() => {
            // SPA Navigation Monitor
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
