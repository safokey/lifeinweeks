        // Configuration des couleurs
        const COLORS = {
            default: "#f9f9f9",
            black: "#000000",
            sleep: "#3498db",
            screen: "#e84393",
            work: "#fd7e14",
            study: "#27ae60"
        };

        // Variables globales
        let initialBlackCount = 0;
        let gridState = [];
        let userLivedWeeks = 0;

        // Éléments du DOM
        const grid = document.getElementById('grid');
        const dateFillInput = document.getElementById('date-fill');
        const dateFillBtn = document.getElementById('date-fill-btn');
        const screenDateInput = document.getElementById('screen-date');

        // Création de la grille principale (52x80)
        function createGrid() {
            grid.innerHTML = '';
            for (let i = 0; i < 52 * 80; i++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                grid.appendChild(cell);
            }
            gridState = new Array(52 * 80).fill('default');
        }

        // Définir la taille des cellules selon la taille de l'écran
        function setCellSize() {
            const screenWidth = window.innerWidth;
            let cellSize = 16;
            
            if (screenWidth < 800) {
                const availableHeight = window.innerHeight * 0.8;
                const availableWidth = screenWidth * 0.9;
                
                const cellSizeFromHeight = Math.floor(availableHeight / 80);
                const cellSizeFromWidth = Math.floor(availableWidth / 52);
                
                cellSize = Math.max(4, Math.min(cellSizeFromHeight, cellSizeFromWidth));
            }
            
            document.documentElement.style.setProperty('--cell-size', cellSize + 'px');
        }

        // Remplissage du tableau à partir de la date de naissance
        function fillFromBirthdate() {
            const dateValue = dateFillInput.value;
            if (!dateValue) {
                alert("Veuillez entrer une date.");
                return;
            }
            
            const birthdate = new Date(dateValue);
            const today = new Date();
            
            let fullYears = today.getFullYear() - birthdate.getFullYear();
            const thisYearBirthday = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate());
            if (today < thisYearBirthday) {
                fullYears--;
            }
            
            const lastBirthday = new Date(birthdate);
            lastBirthday.setFullYear(birthdate.getFullYear() + fullYears);
            const diffWeeks = Math.floor((today - lastBirthday) / (1000 * 60 * 60 * 24 * 7));
            
            const fillCount = Math.min(fullYears * 52 + diffWeeks, 52 * 80);
            userLivedWeeks = fillCount;
            
            initialBlackCount = fillCount;
            resetGridState();
            updateDisplay();
            updateLifeSummaryMessage();
            
            if (!screenDateInput.value) {
                screenDateInput.value = dateValue;
            }
        }

        // Réinitialiser l'état de la grille
        function resetGridState() {
            gridState = new Array(52 * 80).fill('default');
            for (let i = 0; i < initialBlackCount; i++) {
                gridState[i] = 'black';
            }
        }

        // Mettre à jour l'affichage de la grille
        function updateDisplay() {
            const cells = grid.querySelectorAll('.grid-cell');
            cells.forEach((cell, index) => {
                const state = gridState[index];
                cell.style.backgroundColor = COLORS[state] || COLORS.default;
            });
        }

        // Réinitialiser uniquement les cases d'une catégorie
        function resetCategoryOnGrid(stateKey) {
            for (let i = 0; i < gridState.length; i++) {
                if (gridState[i] === stateKey) {
                    gridState[i] = 'black';
                }
            }
        }

        // Colorier les cellules de manière équilibrée
        function colorizeGridEqually(color, count, stateKey) {
            if (count <= 0) return;
            resetCategoryOnGrid(stateKey);

            const blackIndices = gridState
                .map((state, idx) => state === 'black' ? idx : null)
                .filter(idx => idx !== null);
            count = Math.min(count, blackIndices.length);
            
            for (let i = 0; i < count; i++) {
                const pos = Math.round(i * (blackIndices.length - 1) / (count - 1 || 1));
                const idx = blackIndices[pos];
                gridState[idx] = stateKey;
            }
            updateDisplay();
        }

        // Fonction de délai pour l'effet domino
        function dominoDelay(i, total, duration = 6000) {
            if (total <= 1) return 0;
            const t = i / (total - 1);
            return duration * Math.pow(t, 2.2);
        }

        // Calculer le temps de sommeil
        function calculateSleep() {
            const hoursPerNight = parseFloat(document.getElementById('sleep-input').value) || 0;
            const sleepCells = Math.ceil((userLivedWeeks * (hoursPerNight * 7)) / 168);
            colorizeGridEqually(COLORS.sleep, sleepCells, 'sleep');
            const sleepGrid = document.getElementById('sleep-grid');
            sleepGrid.innerHTML = '';
            for (let i = 0; i < sleepCells; i++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.backgroundColor = COLORS.sleep;
                cell.style.opacity = '0';
                sleepGrid.appendChild(cell);
                const delay = dominoDelay(i, sleepCells, 1400);
                setTimeout(() => {
                    cell.classList.add('fadein');
                }, delay);
            }
            updateLifeSummaryMessage();
        }

        // Calculer le temps d'écran
        function calculateScreen() {
            const screenDateValue = screenDateInput.value;
            if (!screenDateValue) {
                alert("Veuillez entrer une date pour le 1er téléphone.");
                return;
            }
            const screenDate = new Date(screenDateValue);
            const today = new Date();
            if (screenDate > today) {
                alert("La date ne peut pas être dans le futur.");
                return;
            }
            const diffWeeks = Math.floor((today - screenDate) / (1000 * 60 * 60 * 24 * 7)) + 1;
            const hoursPerDay = parseFloat(document.getElementById('screen-input').value) || 0;
            const screenCells = Math.ceil((diffWeeks * (hoursPerDay * 7)) / 168);
            colorizeGridEqually(COLORS.screen, screenCells, 'screen');
            const screenGrid = document.getElementById('screen-grid');
            screenGrid.innerHTML = '';
            for (let i = 0; i < screenCells; i++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.backgroundColor = COLORS.screen;
                cell.style.opacity = '0';
                screenGrid.appendChild(cell);
                const delay = dominoDelay(i, screenCells, 1400);
                setTimeout(() => {
                    cell.classList.add('fadein');
                }, delay);
            }
            const years = Math.floor(screenCells / 52);
            const weeks = screenCells % 52;
            document.getElementById('screen-message').innerHTML =
                `<span style="color:#e84393;">
                    Félicitations, tu as passé ${years} année${years > 1 ? 's' : ''} et ${weeks} semaine${weeks > 1 ? 's' : ''} sur ton téléphone! 🎊
                </span>`;
            updateLifeSummaryMessage();
        }

        // Calculer le temps de travail
        function calculateWork() {
            const hoursPerWeek = parseFloat(document.getElementById('work-input').value) || 0;
            const years = parseFloat(document.getElementById('work-years').value) || 1;
            const workCells = Math.ceil((hoursPerWeek * 52 * years) / 168);
            colorizeGridEqually(COLORS.work, workCells, 'work');
            const workGrid = document.getElementById('work-grid');
            workGrid.innerHTML = '';
            for (let i = 0; i < workCells; i++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.backgroundColor = COLORS.work;
                cell.style.opacity = '0';
                workGrid.appendChild(cell);
                const delay = dominoDelay(i, workCells, 1400);
                setTimeout(() => {
                    cell.classList.add('fadein');
                }, delay);
            }
            updateLifeSummaryMessage();
        }

        // Calculer le temps d'étude
        function calculateStudy() {
            const hoursPerWeek = parseFloat(document.getElementById('study-input').value) || 0;
            const years = parseFloat(document.getElementById('study-years').value) || 1;
            const studyCells = Math.ceil((hoursPerWeek * 52 * years) / 168);
            colorizeGridEqually(COLORS.study, studyCells, 'study');
            const studyGrid = document.getElementById('study-grid');
            studyGrid.innerHTML = '';
            for (let i = 0; i < studyCells; i++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.backgroundColor = COLORS.study;
                cell.style.opacity = '0';
                studyGrid.appendChild(cell);
                const delay = dominoDelay(i, studyCells, 1400);
                setTimeout(() => {
                    cell.classList.add('fadein');
                }, delay);
            }
            updateLifeSummaryMessage();
        }

        // Mettre à jour le message récapitulatif
        function updateLifeSummaryMessage() {
            const cells = grid.querySelectorAll('.grid-cell');
            let blackCount = 0;
            cells.forEach((cell) => {
                if (cell.style.backgroundColor === "rgb(0, 0, 0)" || cell.style.backgroundColor === "#000000") {
                    blackCount++;
                }
            });
            if (initialBlackCount > 0) {
                const years = Math.floor(blackCount / 52);
                const weeks = blackCount % 52;
                document.getElementById('life-summary-message').textContent =
                    `Tu as réellement vécu ${years} année${years > 1 ? 's' : ''} et ${weeks} semaine${weeks > 1 ? 's' : ''} durant ton existence.`;
            } else {
                document.getElementById('life-summary-message').textContent = '';
            }
        }

        // Gestion des cookies - Version simplifiée et fonctionnelle
        function checkCookieConsent() {
            // Note: Utilisation d'une variable globale au lieu de localStorage 
            // car localStorage n'est pas disponible dans cet environnement
            if (!window.cookieConsent) {
                setTimeout(function() {
                    document.getElementById('cookie-banner').style.display = 'block';
                }, 5000);
            }
        }

        function acceptCookies() {
            window.cookieConsent = 'accepted';
            document.getElementById('cookie-banner').style.display = 'none';
        }

        function declineCookies() {
            window.cookieConsent = 'declined';
            document.getElementById('cookie-banner').style.display = 'none';
        }

        // Initialisation des événements
        function initEvents() {
            dateFillBtn.addEventListener('click', fillFromBirthdate);
            document.getElementById('sleep-btn').addEventListener('click', calculateSleep);
            document.getElementById('screen-btn').addEventListener('click', calculateScreen);
            document.getElementById('work-btn').addEventListener('click', calculateWork);
            document.getElementById('study-btn').addEventListener('click', calculateStudy);
            document.getElementById('accept-cookies').addEventListener('click', acceptCookies);
            document.getElementById('decline-cookies').addEventListener('click', declineCookies);
            window.addEventListener('resize', setCellSize);
        }

        // Initialisation
        function init() {
            createGrid();
            setCellSize();
            initEvents();
            checkCookieConsent();
        }

        document.addEventListener('DOMContentLoaded', init);