(function () {
  // =========================================================
  // CONFIGURATION DES COULEURS (Jaune doré UG officiel)
  // =========================================================
  const UG_YELLOW = "#e6a323";
  const UG_YELLOW_DARK = "#c98f1f";
  const BG_DARK = "#111111";
  const BG_CARD = "#222222";
  const TXT_WHITE = "#FFFFFF";
  const TXT_GRAY = "#AAAAAA";

  const PATH_DATA =
    "m3.923 13.166-.005.115.02-.114a7.677 7.677 0 0 1 .118-.548l.008-.035c.023-.087.046-.173.072-.259l.014-.046c.026-.087.054-.174.083-.26l.004-.012c.029-.084.06-.167.09-.25l.014-.036c.032-.083.065-.166.1-.248l.018-.042c.073-.168.15-.334.234-.496l.018-.034c.041-.079.084-.158.127-.236l.02-.033c.09-.16.187-.317.288-.47l.02-.03c.05-.075.102-.15.155-.224l.017-.024c.11-.15.224-.298.343-.442l.02-.024c.06-.071.12-.141.183-.21l.012-.013c.128-.141.26-.28.397-.411l.018-.018c.068-.067.139-.132.21-.196l.001-.002c.147-.13.297-.257.453-.378l.013-.01c.234-.182.478-.352.731-.51l.007-.004a8.646 8.646 0 0 1 2.537-1.057 8.798 8.798 0 0 1 2.057-.242c3.784 0 6.99 2.383 8.098 5.678.152.372.255.768.298 1.182.025.146.047.294.064.442h7.62v-.039l.076.055L32.184 0l-8.097 4.673a12.455 12.455 0 0 0-7.932-2.82c-3.468 0-6.604 1.398-8.833 3.641L0 2.718l3.923 10.448ZM15.211 22.79l9.463 3.289c-1.394 5.017-6.146 8.71-11.795 8.71-6.148 0-11.232-4.374-12.084-10.066a11.377 11.377 0 0 1-.127-1.691c0-1.65.272-3.22.91-4.645h-.109a14.754 14.754 0 0 0-1.42 6.336c0 4.08 1.65 7.917 4.647 10.803C7.693 38.41 11.677 40 15.916 40c4.237 0 8.221-1.589 11.218-4.474 2.078-2.001 3.507-4.459 4.19-7.137L36 30.016v-16.44l-20.788 9.216h-.002Z";

  const UG_LOGO_SVG = `<svg width="80" height="80" viewBox="0 0 40 40" style="margin-bottom:25px;"><path fill="${UG_YELLOW}" d="${PATH_DATA}"/></svg>`;
  const UG_LOGO_SVG_SMALL = `<svg width="24" height="24" viewBox="0 0 40 40" style="margin-right:10px; flex-shrink:0;"><path fill="${UG_YELLOW}" d="${PATH_DATA}"/></svg>`;

  // Clés de stockage
  const GLOBAL_TV_KEY = "ug_tv_global_state";
  const LOADING_TAB_NAME_KEY = "ug_tv_loading_tab_name";
  let isGlobalTVModeOn = localStorage.getItem(GLOBAL_TV_KEY) === "true";

  // =========================================================
  // GESTION DU LOADER FULLSCREEN PERSONNALISÉ
  // =========================================================
  let globalLoader = null;
  if (isGlobalTVModeOn) {
    showLoader();
  }

  function showLoader() {
    let loadingTabName = localStorage.getItem(LOADING_TAB_NAME_KEY) || "";

    if (window.location.href.includes("/tab/")) {
      try {
        const path = window.location.href.split("/tab/")[1];
        const parts = path.split("/");
        const artistRaw = parts[0];
        const titleRaw = parts[1].split("-chords-")[0].split("-tabs-")[0];
        const artist = artistRaw
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        const title = titleRaw
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        loadingTabName = `${artist} - ${title}`;
      } catch (e) {}
    }

    if (globalLoader) {
      const h2 = globalLoader.querySelector("h2");
      if (loadingTabName) {
        if (h2) h2.innerText = loadingTabName;
        else
          globalLoader
            .querySelector("svg")
            .insertAdjacentHTML(
              "afterend",
              `<h2 style="margin: 0 0 30px 0; font-size: 1.8em; font-weight: normal; text-align: center; max-width: 80%;">${loadingTabName}</h2>`,
            );
      } else if (h2) {
        h2.remove();
      }
      return;
    }

    globalLoader = document.createElement("div");
    globalLoader.id = "ug-tv-global-loader";
    globalLoader.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: ${BG_DARK}; z-index: 999999999; display: flex; 
            flex-direction: column; justify-content: center; align-items: center;
            font-family: sans-serif; color: ${TXT_WHITE};
        `;

    globalLoader.innerHTML = `
            ${UG_LOGO_SVG}
            ${loadingTabName ? `<h2 style="margin: 0 0 30px 0; font-size: 1.8em; font-weight: normal; text-align: center; max-width: 80%;">${loadingTabName}</h2>` : ""}
            <div class="ug-tv-spinner"></div>
            <style>
                .ug-tv-spinner {
                    border: 4px solid rgba(255, 255, 255, 0.1);
                    border-top: 4px solid ${UG_YELLOW};
                    border-radius: 50%; width: 50px; height: 50px;
                    animation: ug-tv-spin 1s linear infinite;
                }
                @keyframes ug-tv-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;
    document.documentElement.appendChild(globalLoader);
  }

  function removeGlobalLoader() {
    if (globalLoader && globalLoader.parentNode) {
      globalLoader.parentNode.removeChild(globalLoader);
      globalLoader = null;
      localStorage.removeItem(LOADING_TAB_NAME_KEY);
    }
  }

  // =========================================================
  // 1. ROUTEUR SPA (Surveille les changements d'URL)
  // =========================================================
  let currentUrl = location.href;

  function lockViewport() {
    let metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
      metaViewport = document.createElement("meta");
      metaViewport.name = "viewport";
      document.head.appendChild(metaViewport);
    }
    metaViewport.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no";
  }

  function route() {
    cleanUpEverything();
    if (location.href.match(/explore|mytabs|my_tabs|search\.php/i)) {
      initListTVMode();
    } else if (location.href.includes("/tab/")) {
      waitForTabAndInit();
    } else {
      removeGlobalLoader();
    }
  }

  setInterval(() => {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      if (isGlobalTVModeOn) showLoader();
      route();
    }
  }, 1000);

  function cleanUpEverything() {
    document.body.classList.remove(
      "ug-tv-active",
      "ug-tv-dark-mode",
      "ug-tv-hide-aside",
      "ug-tv-show-cursor",
      "ug-tv-list-active",
      "ug-tv-chords-horizontal",
    );
    const elementsToRemove = [
      "ug-tv-launcher",
      "ug-tv-toolbar",
      "ug-tv-list-overlay",
      "ug-tv-indicator",
      "ug-tv-custom-chord-panel",
    ];
    elementsToRemove.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
    document.querySelectorAll(".ug-tv-style").forEach((s) => s.remove());
  }

  route();

  // =========================================================
  // 2. MODE "LISTE" & RECHERCHE AVEC PAGINATION INTELLIGENTE
  // =========================================================
  function initListTVMode() {
    if (document.getElementById("ug-tv-launcher")) return;

    const style = document.createElement("style");
    style.className = "ug-tv-style";
    style.innerHTML = `
            #ug-tv-launcher { position: fixed; bottom: 20px; left: 20px; background: ${UG_YELLOW}; color: ${TXT_WHITE}; padding: 12px 20px; border-radius: 30px; border: none; font-weight: bold; cursor: pointer; z-index: 9999999; box-shadow: 0 5px 15px rgba(0,0,0,0.4); font-family: sans-serif; transition: transform 0.2s; display: flex; align-items: center;}
            #ug-tv-launcher:hover { transform: scale(1.05); background: ${UG_YELLOW_DARK}; }
            #ug-tv-launcher svg path { fill: ${TXT_WHITE} !important; }

            body.ug-tv-list-active { overflow: hidden !important; }
            body.ug-tv-list-active > *:not(#ug-tv-list-overlay):not(#ug-tv-global-loader) { display: none !important; }

            #ug-tv-list-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: ${BG_DARK}; color: ${TXT_WHITE}; z-index: 9999998;
                overflow-y: auto; padding: 50px 80px; box-sizing: border-box;
                font-family: sans-serif; display: flex; flex-direction: column; scroll-behavior: smooth;
            }
            #ug-tv-list-overlay::-webkit-scrollbar { width: 10px; }
            #ug-tv-list-overlay::-webkit-scrollbar-thumb { background: #333; border-radius: 5px; }

            .ug-tv-list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; flex-wrap: wrap; gap: 20px; }
            .ug-tv-list-header h1 { font-size: 2.5em; margin: 0; color: ${UG_YELLOW}; display: flex; align-items: center;}
            
            .ug-tv-header-controls { display: flex; gap: 15px; align-items: center; }
            #ug-tv-search { background: #333; color: ${TXT_WHITE}; border: 2px solid transparent; border-radius: 20px; padding: 12px 20px; font-size: 1.1em; outline: none; transition: border-color 0.2s, background 0.2s; width: 300px; font-family: sans-serif; }
            #ug-tv-search::placeholder { color: #888; }
            #ug-tv-search.ug-tv-focused, #ug-tv-search:focus { border-color: ${UG_YELLOW}; background: #444; box-shadow: 0 0 10px rgba(230, 163, 35, 0.3); }

            .ug-tv-close-list { background: #333; color: ${TXT_WHITE}; border: none; padding: 12px 25px; border-radius: 20px; cursor: pointer; font-weight: bold; outline: none; transition: background 0.2s; font-size: 1.1em;}
            .ug-tv-close-list.ug-tv-focused, .ug-tv-close-list:hover { background: #444; box-shadow: 0 0 0 3px ${UG_YELLOW};}
            .ug-tv-favorites-btn { background: ${UG_YELLOW}; color: ${BG_DARK}; border: none; padding: 12px 25px; border-radius: 20px; cursor: pointer; font-weight: bold; outline: none; transition: background 0.2s; font-size: 1.1em;}
            .ug-tv-favorites-btn.ug-tv-focused, .ug-tv-favorites-btn:hover { background: ${UG_YELLOW_DARK}; box-shadow: 0 0 0 3px ${UG_YELLOW};}

            .ug-tv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; padding-bottom: 20px;}
            .ug-tv-card {
                background: ${BG_CARD}; border-radius: 10px; padding: 25px; cursor: pointer;
                transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
                text-decoration: none; color: ${TXT_WHITE}; display: flex; flex-direction: column; gap: 8px;
                border: 2px solid transparent; outline: none; position: relative;
            }
            .ug-tv-card-title { font-size: 1.2em; font-weight: bold; padding-right: 80px; }
            .ug-tv-card-artist { font-size: 0.9em; color: ${TXT_GRAY}; text-transform: uppercase; letter-spacing: 1px;}
            
            /* Evaluations */
            .ug-tv-card-rating-wrap { position: absolute; top: 15px; right: 15px; display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.5); padding: 5px 10px; border-radius: 12px; font-size: 0.85em; font-weight: bold; color: ${TXT_WHITE}; }
            .ug-tv-card-rating-wrap > div { display: flex; align-items: center; gap: 4px; }
            .ug-tv-card-rating-wrap svg { width: 14px !important; height: 14px !important; }
            
            .ug-tv-card.ug-tv-focused, .ug-tv-card:hover { transform: scale(1.05); background: #333; border-color: ${UG_YELLOW}; box-shadow: 0 10px 20px rgba(0,0,0,0.5); z-index: 10; }

            /* Pagination */
            .ug-tv-pagination { display: flex; justify-content: center; gap: 10px; padding: 40px 0; flex-wrap: wrap; width: 100%; }
            .ug-tv-page-btn, .ug-tv-page-active, .ug-tv-page-dots { background: #333; color: ${TXT_WHITE}; padding: 12px 20px; border-radius: 12px; font-weight: bold; font-size: 1.1em; }
            .ug-tv-page-btn { cursor: pointer; border: 2px solid transparent; transition: all 0.2s; }
            .ug-tv-page-active { background: ${UG_YELLOW}; color: ${BG_DARK}; border: 2px solid ${UG_YELLOW}; cursor: default; }
            .ug-tv-page-dots { background: transparent; color: #888; }
            .ug-tv-page-btn.ug-tv-focused, .ug-tv-page-btn:hover { background: #444; border-color: ${UG_YELLOW}; transform: scale(1.1); box-shadow: 0 0 15px rgba(230, 163, 35, 0.4); z-index: 10; }
        `;
    document.head.appendChild(style);

    const launcher = document.createElement("button");
    launcher.id = "ug-tv-launcher";
    launcher.innerHTML = `${UG_LOGO_SVG_SMALL} Démarrer Mode TV`;
    document.body.appendChild(launcher);

    const overlay = document.createElement("div");
    overlay.id = "ug-tv-list-overlay";
    overlay.style.display = "none";
    document.body.appendChild(overlay);

    let isListTVMode = false;
    let cards = [];
    let pageBtns = [];
    let totalItems = 0;
    let currentIndex = -3;
    let listKeydownHandler = null;

    function updateListFocus() {
      cards.forEach((c) => c.classList.remove("ug-tv-focused"));
      pageBtns.forEach((b) => b.classList.remove("ug-tv-focused"));
      overlay.querySelector(".ug-tv-close-list").classList.remove("ug-tv-focused");
      const favBtn = document.getElementById("ug-tv-favorites-btn");
      if (favBtn) favBtn.classList.remove("ug-tv-focused");

      const searchInput = document.getElementById("ug-tv-search");
      if (searchInput) searchInput.classList.remove("ug-tv-focused");

      if (currentIndex === -3 && searchInput) {
        searchInput.classList.add("ug-tv-focused");
        searchInput.focus();
      } else if (currentIndex === -2 && favBtn) {
        if (searchInput) searchInput.blur();
        favBtn.classList.add("ug-tv-focused");
      } else if (currentIndex === -1) {
        overlay.querySelector(".ug-tv-close-list").classList.add("ug-tv-focused");
        if (searchInput) searchInput.blur();
      } else if (currentIndex >= 0 && currentIndex < cards.length) {
        if (searchInput) searchInput.blur();
        cards[currentIndex].classList.add("ug-tv-focused");
        cards[currentIndex].scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (currentIndex >= cards.length && currentIndex < totalItems) {
        if (searchInput) searchInput.blur();
        const btnIndex = currentIndex - cards.length;
        pageBtns[btnIndex].classList.add("ug-tv-focused");
        pageBtns[btnIndex].scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    function activateListTV() {
      lockViewport();

      isListTVMode = true;
      localStorage.setItem(GLOBAL_TV_KEY, "true");
      isGlobalTVModeOn = true;
      document.body.classList.add("ug-tv-list-active");
      launcher.style.display = "none";
      overlay.style.display = "flex";

      const links = Array.from(document.querySelectorAll('a[href*="/tab/"]'));
      const songsMap = new Map();
      const seenHrefs = new Set();

      links.forEach((a) => {
        const href = a.href;
        const match = href.match(/\/tab\/([^\/]+)\/([^\/]+)-chords-(\d+)/);
        if (!match) return;
        if (seenHrefs.has(href)) return;
        seenHrefs.add(href);

        const artistRaw = match[1];
        const titleRaw = match[2];
        const tabId = parseInt(match[3], 10);

        const artist = artistRaw
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        const title = titleRaw
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        let ratingHTML = "";
        try {
          let rowContainer = a.closest('[role="row"]');
          if (!rowContainer) {
            let curr = a;
            while (curr.parentElement) {
              let parent = curr.parentElement;
              let otherLinks = Array.from(parent.querySelectorAll('a[href*="-chords-"]')).filter(
                (lnk) => lnk.href.split("?")[0] !== a.href.split("?")[0],
              );
              if (otherLinks.length > 0) {
                rowContainer = curr;
                break;
              }
              curr = parent;
            }
            if (!rowContainer) rowContainer = curr;
          }

          const allElements = Array.from(rowContainer.querySelectorAll("*"));
          for (let el of allElements) {
            if (el.children.length === 2) {
              const starsBlock = el.children[0];
              if (starsBlock.children.length === 5) {
                const isAllStars = Array.from(starsBlock.children).every(
                  (c) => c.tagName.toUpperCase() === "SPAN" || c.tagName.toUpperCase() === "SVG",
                );
                if (isAllStars) {
                  const clone = el.cloneNode(true);
                  clone.style.display = "flex";
                  clone.style.alignItems = "center";
                  clone.style.gap = "6px";
                  ratingHTML = clone.outerHTML;
                  break;
                }
              }
            }
          }
        } catch (e) {}

        const songKey = `${artistRaw}-${titleRaw}`;
        if (!songsMap.has(songKey)) {
          songsMap.set(songKey, []);
        }
        songsMap.get(songKey).push({ href, title, artist, tabId, ratingHTML });
      });

      const uniqueTabs = [];
      songsMap.forEach((versions, key) => {
        versions.sort((a, b) => a.tabId - b.tabId);
        versions.forEach((tab, idx) => {
          let displayTitle = tab.title;
          if (versions.length > 1)
            displayTitle += ` <span style="color:${UG_YELLOW}; font-size:0.8em;">(v${idx + 1})</span>`;
          uniqueTabs.push({ ...tab, displayTitle });
        });
      });

      let currentPage = 1;
      const urlPageMatch = window.location.href.match(/[?&page=(\d+)]/);
      if (urlPageMatch) currentPage = parseInt(urlPageMatch[1], 10);

      const allPageLinks = Array.from(document.querySelectorAll("a")).filter(
        (a) => a.href && a.href.match(/[?&]page=(\d+)/),
      );
      let maxPage = currentPage;
      allPageLinks.forEach((a) => {
        const pageNum = parseInt(a.href.match(/[?&]page=(\d+)/)[1], 10);
        if (pageNum > maxPage) maxPage = pageNum;
      });

      let paginationHTML = "";
      if (maxPage > 1) {
        let baseUrlPattern = window.location.href;
        if (!baseUrlPattern.match(/[?&]page=\d+/)) {
          baseUrlPattern += baseUrlPattern.includes("?") ? "&page=1" : "?page=1";
        }
        const generatePageUrl = (page) => baseUrlPattern.replace(/([?&])page=\d+/, `$1page=${page}`);

        paginationHTML = '<div class="ug-tv-pagination">';

        if (currentPage > 1) {
          paginationHTML += `<div class="ug-tv-page-btn" data-href="${generatePageUrl(currentPage - 1)}">&larr; Précédent</div>`;
        }

        for (let i = 1; i <= maxPage; i++) {
          if (i === 1 || i === maxPage || (i >= currentPage - 2 && i <= currentPage + 2)) {
            if (i === currentPage) paginationHTML += `<div class="ug-tv-page-active">${i}</div>`;
            else paginationHTML += `<div class="ug-tv-page-btn" data-href="${generatePageUrl(i)}">${i}</div>`;
          } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `<div class="ug-tv-page-dots">...</div>`;
          }
        }

        if (currentPage < maxPage) {
          paginationHTML += `<div class="ug-tv-page-btn" data-href="${generatePageUrl(currentPage + 1)}">Suivant &rarr;</div>`;
        }

        paginationHTML += "</div>";
      }

      let titleText = "Explorer";
      if (currentUrl.includes("mytabs") || currentUrl.includes("my_tabs")) titleText = "Mes Tablatures";
      else if (currentUrl.includes("search.php")) {
        const q = new URLSearchParams(window.location.search).get("title");
        titleText = q ? `Recherche: "${q}"` : "Recherche";
      }

      let html = `
                <div class="ug-tv-list-header">
                    <h1>${UG_LOGO_SVG_SMALL} ${titleText}</h1>
                    <div class="ug-tv-header-controls">
                        <input type="text" id="ug-tv-search" placeholder="Rechercher (ex: Goldman)..." autocomplete="off" />
                        <button class="ug-tv-favorites-btn" id="ug-tv-favorites-btn">Mes Favoris</button>
                        <button class="ug-tv-close-list">Quitter TV</button>
                    </div>
                </div> 
                <div class="ug-tv-grid">
            `;

      if (uniqueTabs.length === 0) {
        html += `<h2>Aucune tablature d'accords trouvée. (Veuillez faire une recherche ou attendre le chargement)</h2>`;
      } else {
        uniqueTabs.forEach((tab, index) => {
          const cleanNameForLoader = tab.displayTitle.replace(/<[^>]*>?/gm, "");
          html += `
                        <div class="ug-tv-card" data-index="${index}" data-href="${tab.href}" data-name="${tab.artist} - ${cleanNameForLoader}">
                            ${tab.ratingHTML ? `<div class="ug-tv-card-rating-wrap">${tab.ratingHTML}</div>` : ""}
                            <div class="ug-tv-card-artist">${tab.artist}</div>
                            <div class="ug-tv-card-title">${tab.displayTitle}</div>
                        </div>
                    `;
        });
      }
      html += `</div>`;
      html += paginationHTML;

      overlay.innerHTML = html;

      cards = Array.from(overlay.querySelectorAll(".ug-tv-card"));
      pageBtns = Array.from(overlay.querySelectorAll(".ug-tv-page-btn"));
      totalItems = cards.length + pageBtns.length;

      currentIndex = cards.length > 0 ? 0 : -1;
      updateListFocus();

      const searchInput = document.getElementById("ug-tv-search");
      searchInput.addEventListener("click", () => {
        currentIndex = -3;
        updateListFocus();
      });
      const favBtn = document.getElementById("ug-tv-favorites-btn");
      favBtn.addEventListener("mouseenter", () => {
        currentIndex = -2;
        updateListFocus();
      });
      favBtn.addEventListener("click", () => {
        showLoader();
        window.location.href = "https://www.ultimate-guitar.com/user/mytabs";
      });
      overlay.querySelector(".ug-tv-close-list").addEventListener("mouseenter", () => {
        currentIndex = -1;
        updateListFocus();
      });

      if (cards.length > 0) {
        cards.forEach((card, index) => {
          card.addEventListener("mouseenter", () => {
            currentIndex = index;
            updateListFocus();
          });
          card.addEventListener("click", () => {
            const url = card.getAttribute("data-href");
            const name = card.getAttribute("data-name");
            if (url) {
              if (name) localStorage.setItem(LOADING_TAB_NAME_KEY, name);
              showLoader();
              window.location.href = url;
            }
          });
        });
      }

      if (pageBtns.length > 0) {
        pageBtns.forEach((btn, index) => {
          btn.addEventListener("mouseenter", () => {
            currentIndex = cards.length + index;
            updateListFocus();
          });
          btn.addEventListener("click", () => {
            const url = btn.getAttribute("data-href");
            if (url) {
              showLoader();
              window.location.href = url;
            }
          });
        });
      }

      overlay.querySelector(".ug-tv-close-list").addEventListener("click", closeListMode);

      listKeydownHandler = (e) => {
        if (!isListTVMode) return;
        const isSearchFocused = document.activeElement === searchInput;

        if (isSearchFocused) {
          if (e.key === "Enter") {
            e.preventDefault();
            const q = searchInput.value.trim();
            if (q) {
              showLoader();
              window.location.href = `https://www.ultimate-guitar.com/search.php?title=${encodeURIComponent(q)}&page=1&type=300`;
            }
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            currentIndex = cards.length > 0 ? 0 : -1;
            updateListFocus();
            return;
          }
          if (e.key === "ArrowRight" && searchInput.selectionStart === searchInput.value.length) {
            e.preventDefault();
            currentIndex = -2;
            updateListFocus();
            return;
          }
          if (e.key !== "Escape") return;
        }

        const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Escape", "Backspace"];
        if (!keys.includes(e.key)) return;
        e.preventDefault();

        const grid = overlay.querySelector(".ug-tv-grid");
        let cols = 1;
        if (grid) {
          const gridStyles = window.getComputedStyle(grid);
          cols = gridStyles.getPropertyValue("grid-template-columns").split(" ").length;
        }

        if (e.key === "ArrowRight") {
          if (currentIndex === -3) currentIndex = -2;
          else if (currentIndex === -2) currentIndex = -1;
          else if (currentIndex === -1) currentIndex = cards.length > 0 ? 0 : pageBtns.length > 0 ? cards.length : -3;
          else if (currentIndex >= 0 && currentIndex < cards.length) {
            if (currentIndex < cards.length - 1) currentIndex++;
            else if (pageBtns.length > 0) currentIndex++;
          } else if (currentIndex >= cards.length && currentIndex < totalItems - 1) {
            currentIndex++;
          }
        }

        if (e.key === "ArrowLeft") {
          if (currentIndex === -2) currentIndex = -3;
          else if (currentIndex === -1) currentIndex = -2;
          else if (currentIndex === -3 || currentIndex === 0) currentIndex = -3;
          else if (currentIndex > 0 && currentIndex < cards.length) {
            if (currentIndex % cols === 0) currentIndex = -3;
            else currentIndex--;
          } else if (currentIndex === cards.length) {
            currentIndex--;
          } else if (currentIndex > cards.length) {
            currentIndex--;
          }
        }

        if (e.key === "ArrowDown") {
          if (currentIndex === -1 || currentIndex === -2 || currentIndex === -3) {
            currentIndex = cards.length > 0 ? 0 : pageBtns.length > 0 ? cards.length : currentIndex;
          } else if (currentIndex >= 0 && currentIndex < cards.length) {
            if (currentIndex + cols < cards.length) {
              currentIndex += cols;
            } else if (pageBtns.length > 0) {
              currentIndex = cards.length;
            }
          }
        }

        if (e.key === "ArrowUp") {
          if (currentIndex >= 0 && currentIndex < cards.length) {
            if (currentIndex < cols) currentIndex = -3;
            else currentIndex -= cols;
          } else if (currentIndex >= cards.length) {
            currentIndex = cards.length > 0 ? cards.length - 1 : -3;
          }
        }

        if (e.key === "Enter") {
          if (currentIndex === -1) closeListMode();
          else if (currentIndex === -2) favBtn.click();
          else if (currentIndex === -3) searchInput.focus();
          else if (currentIndex >= 0 && currentIndex < cards.length) {
            const url = cards[currentIndex].getAttribute("data-href");
            const name = cards[currentIndex].getAttribute("data-name");
            if (url) {
              if (name) localStorage.setItem(LOADING_TAB_NAME_KEY, name);
              showLoader();
              window.location.href = url;
            }
          } else if (currentIndex >= cards.length && currentIndex < totalItems) {
            const btnIndex = currentIndex - cards.length;
            const url = pageBtns[btnIndex].getAttribute("data-href");
            if (url) {
              showLoader();
              window.location.href = url;
            }
          }
        }

        if (e.key === "Escape" || e.key === "Backspace") window.history.back();

        updateListFocus();
      };
      document.addEventListener("keydown", listKeydownHandler);

      removeGlobalLoader();
    }

    launcher.addEventListener("click", activateListTV);

    function closeListMode() {
      isListTVMode = false;
      localStorage.setItem(GLOBAL_TV_KEY, "false");
      isGlobalTVModeOn = false;
      document.body.classList.remove("ug-tv-list-active");
      launcher.style.display = "block";
      overlay.style.display = "none";
      if (listKeydownHandler) document.removeEventListener("keydown", listKeydownHandler);
    }

    if (isGlobalTVModeOn) {
      setTimeout(activateListTV, 1500);
    } else {
      removeGlobalLoader();
    }
  }

  // =========================================================
  // 3. ATTENTE DE CHARGEMENT DE LA TABLATURE
  // =========================================================
  function waitForTabAndInit() {
    let checkAttempts = 0;
    const checkInterval = setInterval(() => {
      checkAttempts++;
      if (document.querySelector("pre") || document.querySelector("code")) {
        clearInterval(checkInterval);
        initTabTVMode();
      } else if (checkAttempts > 40) {
        clearInterval(checkInterval);
        removeGlobalLoader();
      }
    }, 500);
  }

  // =========================================================
  // 4. MODE "LECTURE" (TABLATURE)
  // =========================================================
  function initTabTVMode() {
    if (document.getElementById("ug-tv-launcher")) return;

    const preEl = document.querySelector("pre") || document.querySelector("code");

    // Création du nouveau panneau géré par ChordGenerator
    let asideEl = document.createElement("div");
    asideEl.id = "ug-tv-custom-chord-panel";
    asideEl.className = "ug-tv-aside ug-tv-keep";
    document.body.appendChild(asideEl);

    const tabKey = "ug_tv_prefs_" + window.location.pathname;
    let prefs = JSON.parse(localStorage.getItem(tabKey)) || {
      font: 18,
      cols: 3,
      aside: true,
      dark: false,
      inst: "guitar",
      tunings: { guitar: "guitar_standard", ukulele: "ukulele_standard" },
      chordsLayout: "vertical",
    };
    if (!["guitar", "ukulele", "piano", "staff"].includes(prefs.inst)) prefs.inst = "guitar";
    if (!prefs.tunings) prefs.tunings = { guitar: "guitar_standard", ukulele: "ukulele_standard" };

    let isTVMode = false;
    let currentFont = prefs.font;
    let currentCols = prefs.cols;
    let isAsideVisible = prefs.aside;
    let chordsLayout = prefs.chordsLayout || "vertical";
    let isDark = prefs.dark;

    const instruments = ["guitar", "ukulele", "piano", "staff"]; // Ajout de staff
    const instLabels = { guitar: "Guitare", ukulele: "Ukulélé", piano: "Piano", staff: "Partition" };

    function savePrefs() {
      prefs = {
        font: currentFont,
        cols: currentCols,
        aside: isAsideVisible,
        dark: isDark,
        inst: prefs.inst,
        tunings: prefs.tunings,
        chordsLayout: chordsLayout,
      };
      localStorage.setItem(tabKey, JSON.stringify(prefs));
    }

    if (isDark) {
      document.body.classList.add("ug-tv-dark-mode");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    function forceInstrument(instName) {
      if (instName === "staff" || instName === "piano") return; // Pas d'équivalent clicable pour staff

      // On cherche le bouton qui contient le nom de l'instrument dans le texte
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], a'));
      const target = buttons.find((el) => {
        const txt = el.textContent.toLowerCase();
        return txt.includes(instName) && !el.closest("#ug-tv-toolbar");
      });

      if (target) target.click();
    }

    function updateCustomChords(inst) {
      if (!asideEl || typeof ChordGenerator === "undefined") return;

      const pre = document.querySelector("pre") || document.querySelector("code");
      if (!pre) return;

      const chords = new Set();
      const chordElements = pre.querySelectorAll("span[data-name]");
      if (chordElements.length > 0) {
        chordElements.forEach((el) => {
          const chord = el.getAttribute("data-name");
          if (chord && chord.length <= 10 && /^[A-G]/.test(chord)) chords.add(chord);
        });
      } else {
        const regex = /\b([CDEFGAB][#b]?(m|min|maj|sus|dim|add|aug|7|9|11|13)?)\b/g;
        const matches = pre.textContent.match(regex);
        if (matches) matches.forEach((m) => chords.add(m));
      }

      const chordString = Array.from(chords).join(",");

      let tuningToUse = "guitar_standard";
      let rType = "instrument";

      if (inst === "staff") {
        rType = "staff";
        tuningToUse = "piano"; // Sans importance pour la partition
      } else if (inst === "piano") {
        tuningToUse = "piano";
      } else {
        tuningToUse = prefs.tunings[inst] || `${inst}_standard`;
      }

      asideEl.innerHTML = "";

      const container = document.createElement("div");
      asideEl.appendChild(container);

      const chordSize = chordsLayout === "horizontal" ? 45 : 80;
      let canvasMaxHeight = 0;
      if (chordsLayout === "horizontal") {
        canvasMaxHeight = Math.floor(window.innerHeight * 0.16) - 24;
        if (rType === "piano") canvasMaxHeight = Math.floor(canvasMaxHeight * 0.6);
      }

      new ChordGenerator(container, chordString, {
        tuning: tuningToUse,
        renderType: rType,
        size: chordSize,
        displayMode: "notes",
        canvasMaxHeight: canvasMaxHeight,
      });

      if (chordsLayout === "horizontal") {
        container.style.cssText = "display:flex; flex-direction:row; align-items:stretch; overflow:hidden;";
        const titleDiv = container.querySelector("div");
        if (titleDiv) {
          titleDiv.style.cssText =
            "writing-mode:vertical-rl; flex-shrink:0; width:24px; font-size:9px; padding:4px 2px; background:rgba(255,255,255,0.1); border-radius:10px; margin:2px; white-space:nowrap; display:flex; align-items:center; justify-content:center;";
        }
        const gridDiv = container.querySelector("div:nth-child(2)");
        if (gridDiv) {
          const isStaffOrPiano = rType === "piano" || rType === "staff";
          gridDiv.style.flex = "1";
          gridDiv.style.display = "flex";
          gridDiv.style.flexDirection = "row";
          gridDiv.style.flexWrap = isStaffOrPiano ? "wrap" : "nowrap";
          gridDiv.style.overflowX = "auto";
          gridDiv.style.overflowY = isStaffOrPiano ? "auto" : "hidden";
          gridDiv.style.gap = "6px";
          gridDiv.style.alignItems = "center";
          gridDiv.style.alignContent = isStaffOrPiano ? "center" : "";
          gridDiv.style.padding = "2px 4px";
          gridDiv.style.maxHeight = "100%";
          gridDiv.querySelectorAll("canvas").forEach((canvas) => {
            canvas.style.maxHeight = "100%";
            canvas.style.width = "auto";
          });
          gridDiv.querySelectorAll("*").forEach((el) => {
            if (el.tagName === "DIV" && el.className && el.className.includes("bg-white")) {
              el.style.flexShrink = "0";
              el.style.maxHeight = "100%";
            }
          });
        }
      }

      updateTuningDropdown(inst);
    }

    // Nouvelle fonction pour gérer l'affichage de la dropdown d'accordage
    function updateTuningDropdown(inst) {
      const select = document.getElementById("ug-tuning-select");
      if (!select) return;
      select.innerHTML = "";

      if (inst !== "guitar" && inst !== "ukulele") {
        select.style.display = "none";
        return;
      }

      select.style.display = "block";
      const prefix = `${inst}_`;

      for (const [key, label] of Object.entries(TUNING_LABELS)) {
        if (key.startsWith(prefix)) {
          const opt = document.createElement("option");
          opt.value = key;
          opt.innerText = label;
          if (prefs.tunings[inst] === key) opt.selected = true;
          select.appendChild(opt);
        }
      }
    }

    const style = document.createElement("style");
    style.className = "ug-tv-style";
    style.innerHTML = `
            :root { 
                --tv-bg: ${TXT_WHITE}; 
                --tv-bg-alt: #f4f5f6; 
                --tv-txt: ${BG_DARK}; 
                --tv-accent: ${UG_YELLOW}; 
                --tv-aside-w: max(180px, 20vw);
            }
            body.ug-tv-active, body.ug-tv-active *,
            body.ug-tv-list-active, body.ug-tv-list-active * {
                -webkit-text-size-adjust: 100% !important;
                text-size-adjust: 100% !important;
                touch-action: pan-y !important;
            }

            body.ug-tv-dark-mode { --tv-bg: ${BG_DARK}; --tv-bg-alt: #1a1a1a; --tv-txt: ${TXT_WHITE}; --tv-accent: ${UG_YELLOW}; }
            body.ug-tv-hide-aside { --tv-aside-w: 0px !important; }
            body.ug-tv-hide-aside .ug-tv-aside { display: none !important; }
            
            body.ug-tv-active { background: var(--tv-bg) !important; overflow: hidden !important; cursor: none; }
            body.ug-tv-active * { visibility: hidden !important; }
            body.ug-tv-active .ug-tv-keep, body.ug-tv-active .ug-tv-keep *,
            body.ug-tv-active #ug-tv-toolbar, body.ug-tv-active #ug-tv-toolbar *,
            body.ug-tv-active .ug-tv-indicator { visibility: visible !important; }
            body.ug-tv-active .ug-tv-path { transform: none !important; z-index: auto !important; position: static !important; contain: none !important; clip-path: none !important; }
            
            body.ug-tv-active { scrollbar-width: thin !important; scrollbar-color: #555 transparent !important; }
            body.ug-tv-active .ug-tv-tab, body.ug-tv-active .ug-tv-aside { scrollbar-width: thin !important; scrollbar-color: #555 transparent !important; }
            body.ug-tv-active ::-webkit-scrollbar { width: 8px !important; height: 8px !important; }
            body.ug-tv-active ::-webkit-scrollbar-track { background: transparent !important; }
            body.ug-tv-active ::-webkit-scrollbar-thumb { background-color: #555 !important; border-radius: 10px !important; }
            
            body.ug-tv-active .ug-tv-title { position: fixed !important; top: 0 !important; left: 0 !important; width: calc(100vw - var(--tv-aside-w)) !important; height: auto !important; min-height: 42px !important; z-index: 999998 !important; padding: 6px 16px !important; box-sizing: border-box !important; background: var(--tv-bg) !important; color: var(--tv-txt) !important; display: flex; align-items: center;}
            body.ug-tv-active .ug-tv-tab { position: fixed !important; top: 48px !important; left: 0 !important; width: calc(100vw - var(--tv-aside-w)) !important; height: calc(100vh - 48px) !important; padding: 0 40px 40px 40px !important; box-sizing: border-box !important; z-index: 999998 !important; column-count: var(--tv-cols, 3) !important; column-gap: 60px !important; column-rule: 2px solid #555 !important; font-size: var(--tv-font, 18px) !important; line-height: 1.5 !important; overflow-x: auto !important; overflow-y: hidden !important; column-fill: auto !important; background: var(--tv-bg) !important; color: var(--tv-txt) !important; scroll-behavior: smooth; }
            body.ug-tv-active .ug-tv-tab span[style*="color"] { color: var(--tv-accent) !important; font-weight: bold !important; }
            
            body.ug-tv-active #ug-tv-custom-chord-panel {
                position: fixed !important; 
                top: 0 !important; 
                right: 0 !important; 
                width: var(--tv-aside-w) !important; 
                height: 100vh !important;
                background: var(--tv-bg-alt) !important; 
                z-index: 999998 !important; 
                padding: 0px !important; 
                box-sizing: border-box !important; 
                border-left: 1.5px solid #444 !important; 
                overflow-y: auto !important; 
                overflow-x: hidden !important;
                scroll-behavior: smooth; 
                transform: none !important;
            }
            body.ug-tv-active #ug-tv-custom-chord-panel * {
                visibility: visible !important;
            }

            /* ---> POLYFILL TAILWIND POUR CHORD GENERATOR <--- */
            #ug-tv-custom-chord-panel * { box-sizing: border-box !important; }
            #ug-tv-custom-chord-panel .relative { position: relative !important; }
            #ug-tv-custom-chord-panel .absolute { position: absolute !important; }
            #ug-tv-custom-chord-panel .flex { display: flex !important; }
            #ug-tv-custom-chord-panel .flex-col { flex-direction: column !important; }
            #ug-tv-custom-chord-panel .items-center { align-items: center !important; }
            #ug-tv-custom-chord-panel .justify-center { justify-content: center !important; }
            #ug-tv-custom-chord-panel .w-full { width: 100% !important; }
            #ug-tv-custom-chord-panel .h-auto { height: auto !important; }
            #ug-tv-custom-chord-panel .w-6 { width: 24px !important; }
            #ug-tv-custom-chord-panel .h-8 { height: 32px !important; }
            #ug-tv-custom-chord-panel .top-1\\/2 { top: 50% !important; }
            #ug-tv-custom-chord-panel .-translate-y-1\\/2 { transform: translateY(-50%) !important; }
            #ug-tv-custom-chord-panel .-left-2 { left: -8px !important; }
            #ug-tv-custom-chord-panel .-right-2 { right: -8px !important; }
            #ug-tv-custom-chord-panel .top-2 { top: 8px !important; }
            #ug-tv-custom-chord-panel .left-2 { left: 8px !important; }
            #ug-tv-custom-chord-panel .mt-1 { margin-top: 4px !important; }
            #ug-tv-custom-chord-panel .mb-0 { margin-bottom: 0 !important; }
            #ug-tv-custom-chord-panel .mb-4 { margin-bottom: 16px !important; }
            #ug-tv-custom-chord-panel .z-0 { z-index: 0 !important; }
            #ug-tv-custom-chord-panel .z-10 { z-index: 10 !important; }
            #ug-tv-custom-chord-panel .opacity-0 { opacity: 0 !important; transition: opacity 0.2s !important; }
            #ug-tv-custom-chord-panel .group:hover .group-hover\\:opacity-100 { opacity: 1 !important; }
            #ug-tv-custom-chord-panel .pointer-events-none { pointer-events: none !important; }
            
            #ug-tv-custom-chord-panel .rounded-lg { border-radius: 8px !important; }
            #ug-tv-custom-chord-panel .rounded { border-radius: 4px !important; }
            #ug-tv-custom-chord-panel .p-2 { padding: 8px !important; }
            #ug-tv-custom-chord-panel .pb-1 { padding-bottom: 4px !important; }
            #ug-tv-custom-chord-panel .px-1 { padding-left: 4px !important; padding-right: 4px !important; }
            #ug-tv-custom-chord-panel .text-lg { font-size: 18px !important; }
            #ug-tv-custom-chord-panel .font-bold { font-weight: bold !important; }
            #ug-tv-custom-chord-panel .font-medium { font-weight: 500 !important; }
            #ug-tv-custom-chord-panel .text-\\[10px\\] { font-size: 10px !important; }
            #ug-tv-custom-chord-panel .text-\\[11px\\] { font-size: 11px !important; }
            #ug-tv-custom-chord-panel .uppercase { text-transform: uppercase !important; }
            #ug-tv-custom-chord-panel .tracking-wider { letter-spacing: 0.05em !important; }
            #ug-tv-custom-chord-panel .flex-wrap { flex-wrap: wrap !important; }
            #ug-tv-custom-chord-panel .gap-3 { gap: 12px !important; }
            #ug-tv-custom-chord-panel .leading-none { line-height: 1 !important; }
            
            /* Surcharges spécifiques pour forcer le comportement propre */
            #ug-tv-custom-chord-panel h3 { margin: 0 !important; padding: 0 !important; text-align: center !important;}
            #ug-tv-custom-chord-panel button { margin: 0 !important; padding: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; }
            
            #ug-tv-custom-chord-panel .bg-white { background-color: transparent !important; }
            #ug-tv-custom-chord-panel .bg-white\\/80 { background-color: var(--tv-bg) !important; }
            #ug-tv-custom-chord-panel .bg-white\\/90 { background-color: var(--tv-bg-alt) !important; }            #ug-tv-custom-chord-panel .text-gray-800 { color: #1f2937 !important; }
            #ug-tv-custom-chord-panel .text-gray-700 { color: #374151 !important; }
            #ug-tv-custom-chord-panel .text-gray-600 { color: #4b5563 !important; }
            #ug-tv-custom-chord-panel .text-gray-400 { color: #9ca3af !important; }
            #ug-tv-custom-chord-panel .border-gray-200 { border-color: #e5e7eb !important; }
            #ug-tv-custom-chord-panel .border { border-width: 1px !important; border-style: solid !important; }
            #ug-tv-custom-chord-panel .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05) !important; }
            
            html.dark #ug-tv-custom-chord-panel .dark\\:bg-gray-800 { background-color: var(--tv-bg) !important; border-color: rgba(255, 255, 255, 0.1) !important; }
            html.dark #ug-tv-custom-chord-panel .dark\\:bg-gray-800\\/80 { background-color: rgba(17, 17, 17, 0.8) !important; }
            html.dark #ug-tv-custom-chord-panel .dark\\:bg-gray-700\\/90 { background-color: rgba(34, 34, 34, 0.9) !important; }
            html.dark #ug-tv-custom-chord-panel .dark\\:text-gray-100 { color: #ffffff !important; }
            html.dark #ug-tv-custom-chord-panel .dark\\:text-gray-200 { color: #dddddd !important; }
            html.dark #ug-tv-custom-chord-panel .dark\\:text-gray-300 { color: #cccccc !important; }
            html.dark #ug-tv-custom-chord-panel .dark\\:text-gray-400 { color: #aaaaaa !important; }
            html.dark #ug-tv-custom-chord-panel .dark\\:text-gray-500 { color: #888888 !important; }
            html.dark #ug-tv-custom-chord-panel .dark\\:border-gray-600 { border-color: rgba(255, 255, 255, 0.15) !important; }
            html.dark #ug-tv-custom-chord-panel .dark\\:border-gray-700 { border-color: rgba(255, 255, 255, 0.1) !important; }            /* ------------------------------------------------ */

            .ug-btn { display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.4); color: ${TXT_WHITE}; padding: 10px 18px; border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; font-family: sans-serif; outline: none; }
            .ug-btn.ug-tv-active-opt { background: ${UG_YELLOW}; border-color: ${UG_YELLOW}; color: ${BG_DARK}; font-weight: bold; }
            .ug-btn-group { display: flex; align-items: center; background: rgba(0,0,0,0.6); border-radius: 20px; padding: 4px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); }
            .ug-btn-group span { font-size: 14px; color: ${TXT_WHITE}; margin: 0 10px; min-width: 25px; text-align: center; font-weight: bold; font-family: sans-serif; }
            .ug-btn-circle { width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(255,255,255,0.15); color: ${TXT_WHITE}; cursor: pointer; display: flex; justify-content: center; align-items: center; font-weight: bold; transition: background 0.2s; font-size: 18px; outline: none; }
            
            .ug-tv-focused { box-shadow: 0 0 0 4px ${UG_YELLOW}, 0 0 15px ${UG_YELLOW} !important; transform: scale(1.08) !important; background: rgba(255, 255, 255, 0.25) !important; z-index: 100 !important; }

            #ug-tv-launcher { position: fixed; bottom: 20px; left: 20px; background: ${UG_YELLOW}; color: ${TXT_WHITE}; padding: 12px 20px; border-radius: 30px; border: none; font-weight: bold; cursor: pointer; z-index: 9999999; box-shadow: 0 5px 15px rgba(0,0,0,0.4); font-family: sans-serif; transition: transform 0.2s; display: flex; align-items: center;}
            #ug-tv-launcher:hover { transform: scale(1.05); background: ${UG_YELLOW_DARK};}
            #ug-tv-launcher svg path { fill: ${TXT_WHITE} !important; }

            .ug-tv-indicator { position: fixed; bottom: 5px; left: 50%; transform: translateX(-50%); width: 80px; height: 5px; background: rgba(150,150,150,0.6); border-radius: 3px; z-index: 9999997; pointer-events: none; transition: opacity 0.4s; }
            .ug-tv-show-cursor { cursor: default !important; }

            body.ug-tv-chords-horizontal .ug-tv-title { width: 100vw !important; top: 20vh !important; }
            body.ug-tv-chords-horizontal .ug-tv-tab { width: 100vw !important; top: calc(48px + 20vh) !important; height: calc(100vh - 48px - 20vh) !important; }
            body.ug-tv-chords-horizontal #ug-tv-custom-chord-panel {
                top: 0 !important;
                bottom: auto !important;
                left: 0 !important;
                right: auto !important;
                width: 100vw !important;
                height: 20vh !important;
                border-left: none !important;
                border-bottom: 1.5px solid #444 !important;
                border-top: none !important;
                overflow: hidden !important;
            }
            body.ug-tv-chords-horizontal .ug-tv-indicator { bottom: 5px !important; }

            #ug-autofit-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 99999999; display: flex; flex-direction: column; justify-content: center; align-items: center; }
            .ug-autofit-spinner { border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid ${UG_YELLOW}; border-radius: 50%; width: 50px; height: 50px; animation: ug-tv-spin 1s linear infinite; }
            .ug-autofit-text { color: ${TXT_WHITE}; font-size: 1.2em; margin-top: 20px; font-family: sans-serif; font-weight: bold; }
        `;
    document.head.appendChild(style);

    const h1ElToKeep = document.querySelector("h1")
      ? document.querySelector("h1").closest("header") ||
        document.querySelector("h1").parentElement.closest("section") ||
        document.querySelector("h1").parentElement
      : null;
    if (h1ElToKeep) {
      h1ElToKeep.classList.add("ug-tv-title", "ug-tv-keep");
      if (!h1ElToKeep.querySelector(".ug-logo-title-tv")) {
        h1ElToKeep.insertAdjacentHTML("afterbegin", `<div class="ug-logo-title-tv">${UG_LOGO_SVG_SMALL}</div>`);
      }
    }

    if (preEl) preEl.classList.add("ug-tv-tab", "ug-tv-keep");
    [h1ElToKeep, preEl, asideEl].filter(Boolean).forEach((el) => {
      let current = el.parentElement;
      while (current && current !== document.body) {
        current.classList.add("ug-tv-path");
        current = current.parentElement;
      }
    });

    const launcher = document.createElement("button");
    launcher.id = "ug-tv-launcher";
    launcher.innerHTML = `${UG_LOGO_SVG_SMALL} Activer Mode TV`;
    document.body.appendChild(launcher);

    const toolbar = document.createElement("div");
    toolbar.id = "ug-tv-toolbar";
    toolbar.style.cssText = `
            position: fixed; bottom: 0; left: 50%; transform: translateX(-50%) translateY(100%);
            background: rgba(20, 20, 20, 0.95); color: ${TXT_WHITE}; padding: 15px 30px 20px 30px;
            border-radius: 25px 25px 0 0; z-index: 9999999; display: none; flex-direction: row;
            gap: 15px; align-items: center; box-shadow: 0 -10px 40px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1);
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s;
            opacity: 0; pointer-events: auto; border-top: 1px solid rgba(255,255,255,0.1);
        `;

    const indicator = document.createElement("div");
    indicator.className = "ug-tv-indicator";
    indicator.style.display = "none";

    toolbar.innerHTML = `
            <button id="ug-btn-inst" class="ug-btn ug-tv-active-opt" style="width:125px; justify-content:center;">${instLabels[prefs.inst]}</button>
            <select id="ug-tuning-select" class="ug-btn" style="display:none; max-width: 170px; cursor:pointer; appearance: none; -webkit-appearance: none; padding-right: 25px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;"></select>
            <button id="ug-btn-theme" class="ug-btn">Sombre</button>
            <button id="ug-btn-aside" class="ug-btn ug-tv-active-opt">Accords ON</button>
            <div class="ug-btn-group">
                <button id="ug-font-minus" class="ug-btn-circle">-</button>
                <span id="ug-font-val">18</span>
                <button id="ug-font-plus" class="ug-btn-circle">+</button>
            </div>
            <div class="ug-btn-group">
                <button id="ug-col-minus" class="ug-btn-circle">-</button>
                <span id="ug-col-val">3</span>
                <button id="ug-col-plus" class="ug-btn-circle">+</button>
            </div>
            <button id="ug-btn-auto" class="ug-btn ug-tv-active-opt">Auto-Fit</button>
            <button id="ug-close-tv" class="ug-btn" style="background:#ff3b30; border-color:#ff3b30; color:#fff;">Quitter TV</button>
        `;
    document.body.appendChild(toolbar);
    document.body.appendChild(indicator);

    const autoFitOverlay = document.createElement("div");
    autoFitOverlay.id = "ug-autofit-overlay";
    autoFitOverlay.style.display = "none";
    autoFitOverlay.innerHTML = `<div class="ug-autofit-spinner"></div><div class="ug-autofit-text">Auto-Fit...</div>`;
    document.body.appendChild(autoFitOverlay);

    document.getElementById("ug-btn-theme").innerText = isDark ? "☀️ Clair" : "🌙 Sombre";
    document.getElementById("ug-btn-aside").innerText = !isAsideVisible
      ? "Accords OFF"
      : chordsLayout === "horizontal"
        ? "Accords \u2014"
        : "Accords |";

    let hideTimeout;
    let isMenuFocused = false;
    let currentFocusIndex = 0;
    let visibleButtons = [];
    let tabKeydownHandler = null;

    const updateFocusUI = () => {
      visibleButtons.forEach((b) => b.classList.remove("ug-tv-focused"));
      if (isMenuFocused && visibleButtons[currentFocusIndex]) {
        visibleButtons[currentFocusIndex].classList.add("ug-tv-focused");
      }
    };

    const showDock = () => {
      toolbar.style.transform = "translateX(-50%) translateY(0)";
      toolbar.style.opacity = "1";
      indicator.style.opacity = "0";
      document.body.classList.add("ug-tv-show-cursor");
      visibleButtons = Array.from(toolbar.querySelectorAll("button"));
    };

    const hideDock = () => {
      if (!isTVMode || isMenuFocused) return;
      toolbar.style.transform = "translateX(-50%) translateY(100%)";
      toolbar.style.opacity = "0";
      indicator.style.opacity = "1";
      document.body.classList.remove("ug-tv-show-cursor");
    };

    const resetHideTimer = () => {
      if (!isTVMode || isMenuFocused) return;
      showDock();
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(hideDock, 3000);
    };

    tabKeydownHandler = (e) => {
      if (!isTVMode) return;
      const isBackKey = e.key === "Escape" || e.key === "Backspace";
      const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"];

      if (!keys.includes(e.key) && !isBackKey) return;

      e.preventDefault();
      resetHideTimer();

      if (isBackKey) {
        if (isMenuFocused) {
          isMenuFocused = false;
          updateFocusUI();
          hideDock();
        } else {
          window.history.back();
        }
        return;
      }

      if (!isMenuFocused) {
        if (e.key === "Enter") {
          isMenuFocused = true;
          currentFocusIndex = 0;
          showDock();
          updateFocusUI();
        } else {
          const scrollTab = window.innerWidth * 0.7;
          const scrollAside = 150;
          if (e.key === "ArrowRight" && preEl) preEl.scrollBy({ left: scrollTab });
          if (e.key === "ArrowLeft" && preEl) preEl.scrollBy({ left: -scrollTab });
          if (chordsLayout === "horizontal" && asideEl) {
            const scrollEl = asideEl.querySelector("div:nth-child(2)") || asideEl;
            if (e.key === "ArrowDown") scrollEl.scrollBy({ left: scrollAside });
            if (e.key === "ArrowUp") scrollEl.scrollBy({ left: -scrollAside });
          } else if (asideEl) {
            if (e.key === "ArrowDown") asideEl.scrollBy({ top: scrollAside });
            if (e.key === "ArrowUp") asideEl.scrollBy({ top: -scrollAside });
          }
        }
      } else {
        if (e.key === "ArrowRight") {
          currentFocusIndex = (currentFocusIndex + 1) % visibleButtons.length;
          updateFocusUI();
        } else if (e.key === "ArrowLeft") {
          currentFocusIndex = (currentFocusIndex - 1 + visibleButtons.length) % visibleButtons.length;
          updateFocusUI();
        } else if (e.key === "Enter") {
          visibleButtons[currentFocusIndex].click();
        } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          isMenuFocused = false;
          updateFocusUI();
          hideDock();
        }
      }
    };

    document.addEventListener("keydown", tabKeydownHandler);
    document.addEventListener("mousemove", resetHideTimer);
    document.addEventListener("click", resetHideTimer);
    toolbar.addEventListener("mouseenter", () => {
      isMenuFocused = true;
      clearTimeout(hideTimeout);
    });
    toolbar.addEventListener("mouseleave", () => {
      isMenuFocused = false;
      updateFocusUI();
      resetHideTimer();
    });

    function applyStyles() {
      document.documentElement.style.setProperty("--tv-cols", currentCols);
      document.documentElement.style.setProperty("--tv-font", currentFont + "px");
      document.getElementById("ug-col-val").innerText = currentCols;
      document.getElementById("ug-font-val").innerText = currentFont;
      savePrefs();
    }

    function autoFit() {
      if (!isTVMode) return;
      currentFont = 35;
      applyStyles();
      autoFitOverlay.style.display = "flex";

      const fitInterval = setInterval(() => {
        const isOverflowing = preEl.scrollWidth > preEl.clientWidth || preEl.scrollHeight > preEl.clientHeight;

        if (isOverflowing) {
          if (currentFont > 3) {
            currentFont -= 0.5;
            applyStyles();
          } else if (currentFont > 0.5) {
            currentFont -= 0.1;
            applyStyles();
          } else {
            clearInterval(fitInterval);
            autoFitOverlay.style.display = "none";
            savePrefs();
          }
        } else {
          clearInterval(fitInterval);
          autoFitOverlay.style.display = "none";
          savePrefs();
        }
      }, 30);
    }

    function activateTabTV() {
      lockViewport();

      isTVMode = true;
      localStorage.setItem(GLOBAL_TV_KEY, "true");
      isGlobalTVModeOn = true;
      document.body.classList.add("ug-tv-active");
      document.body.classList.toggle("ug-tv-hide-aside", !isAsideVisible);
      document.body.classList.toggle("ug-tv-chords-horizontal", isAsideVisible && chordsLayout === "horizontal");
      const asideBtn = document.getElementById("ug-btn-aside");
      if (asideBtn) asideBtn.classList.toggle("ug-tv-active-opt", isAsideVisible);
      launcher.style.display = "none";
      toolbar.style.display = "flex";
      indicator.style.display = "block";

      if (prefs.inst && prefs.inst !== "guitar") forceInstrument(prefs.inst);

      removeGlobalLoader();

      isMenuFocused = false;
      hideDock();

      setTimeout(() => updateCustomChords(prefs.inst), 500);

      setTimeout(autoFit, 400);
    }

    launcher.addEventListener("click", (e) => {
      e.stopPropagation();
      activateTabTV();
    });

    document.getElementById("ug-close-tv").addEventListener("click", () => {
      isTVMode = false;
      isMenuFocused = false;
      localStorage.setItem(GLOBAL_TV_KEY, "false");
      isGlobalTVModeOn = false;
      document.body.classList.remove("ug-tv-active");
      document.body.classList.remove("ug-tv-chords-horizontal");
      launcher.style.display = "block";
      toolbar.style.display = "none";
      indicator.style.display = "none";
      document.body.classList.remove("ug-tv-show-cursor");
    });

    document.getElementById("ug-btn-inst").addEventListener("click", (e) => {
      // 1. Rotation de l'instrument dans tes préférences
      let idx = instruments.indexOf(prefs.inst);
      idx = (idx + 1) % instruments.length;
      prefs.inst = instruments[idx];

      // 2. Mise à jour de l'UI du bouton
      e.currentTarget.innerText = instLabels[prefs.inst];

      // 3. Action : On force le clic sur le site original (optionnel)
      // ET on rafraîchit ton panneau immédiatement
      forceInstrument(prefs.inst);
      savePrefs();
      updateCustomChords(prefs.inst);
    });

    document.getElementById("ug-btn-aside").addEventListener("click", (e) => {
      if (!isAsideVisible) {
        isAsideVisible = true;
        chordsLayout = "vertical";
      } else if (chordsLayout === "vertical") {
        chordsLayout = "horizontal";
      } else {
        isAsideVisible = false;
      }

      document.body.classList.toggle("ug-tv-hide-aside", !isAsideVisible);
      document.body.classList.toggle("ug-tv-chords-horizontal", isAsideVisible && chordsLayout === "horizontal");

      if (!isAsideVisible) {
        e.currentTarget.innerText = "Accords OFF";
        e.currentTarget.classList.remove("ug-tv-active-opt");
      } else if (chordsLayout === "horizontal") {
        e.currentTarget.innerText = "Accords \u2014";
        e.currentTarget.classList.add("ug-tv-active-opt");
      } else {
        e.currentTarget.innerText = "Accords |";
        e.currentTarget.classList.add("ug-tv-active-opt");
      }

      savePrefs();
      updateCustomChords(prefs.inst);
      setTimeout(autoFit, 50);
    });

    document.getElementById("ug-btn-theme").addEventListener("click", (e) => {
      isDark = !isDark;
      document.body.classList.toggle("ug-tv-dark-mode", isDark);
      document.documentElement.classList.toggle("dark", isDark);
      e.currentTarget.innerText = isDark ? "☀️ Clair" : "🌙 Sombre";
      savePrefs();
      updateCustomChords(prefs.inst);
    });

    document.getElementById("ug-font-plus").addEventListener("click", () => {
      currentFont += 0.5;
      applyStyles();
    });
    document.getElementById("ug-font-minus").addEventListener("click", () => {
      currentFont = Math.max(3, currentFont - 0.5);
      applyStyles();
    });
    document.getElementById("ug-col-plus").addEventListener("click", () => {
      currentCols++;
      applyStyles();
      autoFit();
    });
    document.getElementById("ug-col-minus").addEventListener("click", () => {
      currentCols = Math.max(1, currentCols - 1);
      applyStyles();
      autoFit();
    });
    document.getElementById("ug-btn-auto").addEventListener("click", autoFit);

    const tuningSelect = document.getElementById("ug-tuning-select");
    if (tuningSelect) {
      tuningSelect.addEventListener("change", (e) => {
        prefs.tunings[prefs.inst] = e.target.value;
        savePrefs();
        updateCustomChords(prefs.inst);
      });
    }

    applyStyles();

    if (isGlobalTVModeOn) {
      activateTabTV();
    } else {
      removeGlobalLoader();
    }
  }

  // =========================================================
  // 5. ECOUTEUR CHROME (SÉCURISÉ POUR ANDROID WEBVIEW)
  // =========================================================
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "toggle_tv_mode") {
        const closeTabBtn = document.getElementById("ug-close-tv");
        const closeListBtn = document.querySelector(".ug-tv-close-list");
        const launcherBtn = document.getElementById("ug-tv-launcher");

        if (document.body.classList.contains("ug-tv-active") && closeTabBtn) closeTabBtn.click();
        else if (document.body.classList.contains("ug-tv-list-active") && closeListBtn) closeListBtn.click();
        else if (launcherBtn) launcherBtn.click();
      }
    });
  }
})();
