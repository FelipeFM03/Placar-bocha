// Variáveis de Estado
let scoreBlue = 0;
let scoreRed = 0;
let currentSet = 1;
let timerInterval = null;
let blueSetsWon = 0;
let redSetsWon = 0;
let logsArray = []; 

// Configuração de Sets
let setConfig = {
    totalSets: 4,  // Sets necessários para vencer
    setsWon: { red: 0, blue: 0 }
};

// Relógio Fischer (estilo xadrez)
let timerConfig = {
    minutes: 15,  // Tempo padrão por jogador
    activeTeam: null  // 'red' ou 'blue' - qual time está jogando
};

let timeRed = 15 * 60;  // Segundos restantes
let timeBlue = 15 * 60;

// Configuração das Equipes
let teamConfig = {
    red: {
        teamName: "EQP 1",
        players: [],
        logo: ""
    },
    blue: {
        teamName: "EQP 2",
        players: [],
        logo: ""
    },
    matchTitle: "BC1 - BOCHA",
    gameType: "1"
};

window.onload = function() {
    loadState();
    updatePlayerFields();
};

// --- FUNÇÕES DE SALVAMENTO ---
function saveState() {
    const state = { 
        scoreBlue, scoreRed, currentSet, 
        timeRed, timeBlue, 
        blueSetsWon, redSetsWon, 
        logsArray, teamConfig, timerConfig 
    };
    localStorage.setItem('bochaState', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('bochaState');
    if (saved) {
        const state = JSON.parse(saved);
        scoreBlue = state.scoreBlue;
        scoreRed = state.scoreRed;
        currentSet = state.currentSet;
        timeRed = state.timeRed || 15 * 60;
        timeBlue = state.timeBlue || 15 * 60;
        blueSetsWon = state.blueSetsWon;
        redSetsWon = state.redSetsWon;
        logsArray = state.logsArray || [];
        
        // Carrega configuração das equipes se existir
        if (state.teamConfig) {
            teamConfig = state.teamConfig;
        }
        
        // Carrega configuração do timer
        if (state.timerConfig) {
            timerConfig = state.timerConfig;
        }

        updateUI();
        updateTeamDisplay();
        fillConfigFields();
        updatePlayerFields();
        updateTimerDisplay();
        updateBallsDisplay();

        for(let i = 0; i < blueSetsWon; i++) addDotUI('blue');
        for(let i = 0; i < redSetsWon; i++) addDotUI('red');
        logsArray.forEach(log => addRowUI(log.set, log.equipe, log.jogador, log.acao));
    }
}

function updateUI() {
    // Atualiza Placar
    document.getElementById('scoreBlue').innerHTML = scoreBlue + ' <span class="turn-dot"></span>'; // Mantém a bolinha branca na TV
    document.getElementById('scoreRed').innerText = scoreRed;
    document.getElementById('currentSet').innerText = currentSet;
    
    updateTimerDisplay();
    updateBallsDisplay();
}

function updateBallsDisplay() {
    const totalSets = setConfig.totalSets || 4;
    
    // Atualiza bolas vermelhas
    const ballsRed = document.getElementById('ballsRed');
    ballsRed.innerHTML = '';
    for(let i = 0; i < totalSets; i++) {
        const ball = document.createElement('div');
        ball.className = 'ball';
        if(i < redSetsWon) {
            ball.classList.add('won');
        }
        ballsRed.appendChild(ball);
    }
    
    // Atualiza bolas azuis
    const ballsBlue = document.getElementById('ballsBlue');
    ballsBlue.innerHTML = '';
    for(let i = 0; i < totalSets; i++) {
        const ball = document.createElement('div');
        ball.className = 'ball';
        if(i < blueSetsWon) {
            ball.classList.add('won');
        }
        ballsBlue.appendChild(ball);
    }
}

function updateTimerDisplay() {
    // Atualiza display do timer no painel admin
    document.getElementById('timerRed').innerText = formatTime(timeRed);
    document.getElementById('timerBlue').innerText = formatTime(timeBlue);
    
    // Atualiza display do timer na TV
    document.getElementById('timerRedTV').innerText = formatTime(timeRed);
    document.getElementById('timerBlueTV').innerText = formatTime(timeBlue);
}

// --- CONTROLE DE PLACAR ---
function changeScore(team, amount) {
    if(team === 'blue') {
        scoreBlue += amount;
        if(scoreBlue < 0) scoreBlue = 0;
        if(scoreBlue > 99) scoreBlue = 99;
    } else {
        scoreRed += amount;
        if(scoreRed < 0) scoreRed = 0;
        if(scoreRed > 99) scoreRed = 99;
    }
    updateUI();
    saveState();
}

// --- CONTROLE DE SETS ---
function updateSetConfig() {
    setConfig.totalSets = parseInt(document.getElementById('totalSets').value) || 4;
    document.getElementById('tvTotalSets').innerText = setConfig.totalSets;
    document.getElementById('tvTotalSetsBottom').innerText = setConfig.totalSets;
    updateBallsDisplay();
    saveState();
}

function winSet(team) {
    if(team === 'blue') {
        blueSetsWon++;
        addDotUI('blue');
    } else {
        redSetsWon++;
        addDotUI('red');
    }
    
    // Atualiza display de sets vencidos na TV
    document.getElementById('tvRedSetsWon').innerText = redSetsWon;
    document.getElementById('tvBlueSetsWon').innerText = blueSetsWon;
    
    scoreBlue = 0;
    scoreRed = 0;
    currentSet++;
    updateUI();
    saveState();
}

function addDotUI(team) {
    let dot = document.createElement('div');
    dot.className = 'dot';
    if(team === 'blue') {
        document.getElementById('blueSets').appendChild(dot);
    } else {
        document.getElementById('redSets').appendChild(dot);
    }
}

// --- CONTROLE DA TABELA DE LANCES ---
function addLog() {
    let equipe = document.getElementById('logEquipe').value;
    let jogador = document.getElementById('logJogador').value || "Não informado";
    let acao = document.getElementById('logAcao').value;

    if(acao.trim() === "") return alert("Digite a ação do lance!");

    addRowUI(currentSet, equipe, jogador, acao);
    logsArray.unshift({ set: currentSet, equipe, jogador, acao });
    saveState();
    document.getElementById('logAcao').value = "";
}

function addRowUI(set, eqp, jog, ac) {
    let table = document.getElementById('logTable').getElementsByTagName('tbody')[0];
    let newRow = table.insertRow(0);
    newRow.insertCell(0).innerText = set;
    newRow.insertCell(1).innerText = eqp;
    newRow.insertCell(2).innerText = jog;
    newRow.insertCell(3).innerText = ac;
}

// --- CONTROLE DOS CRONÔMETROS (Estilo Xadrez) ---
function formatTime(seconds) {
    let m = Math.floor(seconds / 60).toString().padStart(2, '0');
    let s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateTimerConfig() {
    const minutes = parseInt(document.getElementById('configTime').value) || 15;
    timerConfig.minutes = minutes;
    
    // Se o timer não estiver rodando, aplica o novo tempo para ambos
    if (!timerInterval) {
        timeRed = minutes * 60;
        timeBlue = minutes * 60;
        updateTimerDisplay();
    }
    saveState();
}

function toggleTimer() {
    if (timerInterval) {
        // Pausa o timer
        clearInterval(timerInterval);
        timerInterval = null;
    } else {
        // Se não há time ativo, pede para selecionar
        if (!timerConfig.activeTeam) {
            alert("⚠️ Selecione qual time está jogando!\nClique em 'Trocar Turno' para selecionar.");
            return;
        }
        
        // Inicia o timer decrementando apenas o time ativo
        timerInterval = setInterval(() => {
            if (timerConfig.activeTeam === 'red') {
                timeRed--;
                if (timeRed <= 0) {
                    timeRed = 0;
                    clearInterval(timerInterval);
                    timerInterval = null;
                    alert("⏰ Tempo esgotado! Time Vermelho sem tempo.");
                }
            } else if (timerConfig.activeTeam === 'blue') {
                timeBlue--;
                if (timeBlue <= 0) {
                    timeBlue = 0;
                    clearInterval(timerInterval);
                    timerInterval = null;
                    alert("⏰ Tempo esgotado! Time Azul sem tempo.");
                }
            }
            updateTimerDisplay();
            if ((timeRed + timeBlue) % 5 === 0) saveState();
        }, 1000);
    }
    saveState();
}

function switchTurn() {
    // Pausa o timer se estiver rodando
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Alterna o time ativo
    if (timerConfig.activeTeam === 'red') {
        timerConfig.activeTeam = 'blue';
    } else if (timerConfig.activeTeam === 'blue') {
        timerConfig.activeTeam = 'red';
    } else {
        // Primeira vez - pergunta qual time começa
        const choice = confirm("🔴 Clique em OK para Time Vermelho começar\n❌ Clique em Cancelar para Time Azul começar");
        timerConfig.activeTeam = choice ? 'red' : 'blue';
    }
    
    updateTurnIndicator();
    saveState();
}

function updateTurnIndicator() {
    // Remove indicador de todos os lados
    document.querySelectorAll('.side').forEach(side => {
        side.classList.remove('active-turn');
    });
    
    // Adiciona indicador no time ativo
    if (timerConfig.activeTeam) {
        const activeSide = document.querySelector(`.${timerConfig.activeTeam}-side`);
        if (activeSide) {
            activeSide.classList.add('active-turn');
        }
    }
}

function resetAllTimers() {
    let confirmacao = confirm("⚠️ Zerar todos os tempos?");
    if (confirmacao) {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        const minutes = timerConfig.minutes || 15;
        timeRed = minutes * 60;
        timeBlue = minutes * 60;
        timerConfig.activeTeam = null;
        
        updateTimerDisplay();
        updateTurnIndicator();
        saveState();
    }
}

function resetMatch() {
    let confirmacao = confirm("⚠️ Tem certeza que deseja ZERAR A PARTIDA?");
    if(confirmacao) {
        localStorage.removeItem('bochaState');
        location.reload();
    }
}

// --- CONFIGURAÇÃO DAS EQUIPES ---
function updateTeamConfig() {
    // Atualiza tipo de jogo
    teamConfig.gameType = document.getElementById('gameType').value;
    
    // Atualiza configuração vermelho - só adiciona se tiver conteúdo
    teamConfig.red.teamName = document.getElementById('configRedTeamName').value || "EQP 1";
    teamConfig.red.players = [];
    for(let i = 1; i <= 4; i++) {
        const playerValue = document.getElementById('configRedPlayer' + i).value;
        if(playerValue.trim() !== "") {
            teamConfig.red.players.push(playerValue);
        }
    }
    teamConfig.red.logo = document.getElementById('configRedLogo').value || "";
    
    // Atualiza configuração azul - só adiciona se tiver conteúdo
    teamConfig.blue.teamName = document.getElementById('configBlueTeamName').value || "EQP 2";
    teamConfig.blue.players = [];
    for(let i = 1; i <= 4; i++) {
        const playerValue = document.getElementById('configBluePlayer' + i).value;
        if(playerValue.trim() !== "") {
            teamConfig.blue.players.push(playerValue);
        }
    }
    teamConfig.blue.logo = document.getElementById('configBlueLogo').value || "";
    
    // Título do match (suporta quebra de linha com \n)
    teamConfig.matchTitle = document.getElementById('configMatchTitle').value || "BC1 - BOCHA";
    
    updateTeamDisplay();
    saveState();
}

function updatePlayerFields() {
    const gameType = document.getElementById('gameType').value;
    teamConfig.gameType = gameType;
    
    const playerFields = document.querySelectorAll('.player-field');
    playerFields.forEach((field, index) => {
        const playerNum = index % 4 + 1;
        if (playerNum <= gameType) {
            field.style.display = 'block';
        } else {
            field.style.display = 'none';
        }
    });
    
    saveState();
}

function updateTeamDisplay() {
    // Equipe Vermelha
    document.getElementById('tvRedTeamName').innerText = teamConfig.red.teamName;
    document.getElementById('tvRedPlayers').innerText = teamConfig.red.players.join('\n');
    
    const redLogo = document.getElementById('tvRedLogo');
    if (teamConfig.red.logo) {
        redLogo.src = teamConfig.red.logo;
        redLogo.style.display = 'block';
    } else {
        redLogo.src = '';
        redLogo.style.display = 'none';
    }
    
    // Equipe Azul
    document.getElementById('tvBlueTeamName').innerText = teamConfig.blue.teamName;
    document.getElementById('tvBluePlayers').innerText = teamConfig.blue.players.join('\n');
    
    const blueLogo = document.getElementById('tvBlueLogo');
    if (teamConfig.blue.logo) {
        blueLogo.src = teamConfig.blue.logo;
        blueLogo.style.display = 'block';
    } else {
        blueLogo.src = '';
        blueLogo.style.display = 'none';
    }
    
    // Título do match (suporta quebra de linha)
    document.getElementById('tvMatchTitle').innerText = teamConfig.matchTitle;
}

function saveTeamConfig() {
    updateTeamConfig();
    alert("✅ Configuração salva com sucesso!");
}

// --- UPLOAD DE LOGO LOCAL ---
function handleLogoUpload(team) {
    const fileInput = document.getElementById(`config${team.charAt(0).toUpperCase() + team.slice(1)}LogoFile`);
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Salva a imagem como base64 no localStorage
            if (team === 'red') {
                teamConfig.red.logo = e.target.result;
                document.getElementById('configRedLogo').value = "";
            } else {
                teamConfig.blue.logo = e.target.result;
                document.getElementById('configBlueLogo').value = "";
            }
            updateTeamDisplay();
            saveState();
        };
        reader.readAsDataURL(file);
    }
}

function fillConfigFields() {
    // Define o tipo de jogo no select
    document.getElementById('gameType').value = teamConfig.gameType || "1";
    
    // Preenche campos vermelho
    document.getElementById('configRedTeamName').value = teamConfig.red.teamName || "";
    document.getElementById('configRedPlayer1').value = teamConfig.red.players[0] || "";
    document.getElementById('configRedPlayer2').value = teamConfig.red.players[1] || "";
    document.getElementById('configRedPlayer3').value = teamConfig.red.players[2] || "";
    document.getElementById('configRedPlayer4').value = teamConfig.red.players[3] || "";
    document.getElementById('configRedLogo').value = teamConfig.red.logo && teamConfig.red.logo.startsWith('http') ? teamConfig.red.logo : "";
    
    // Preenche campos azul
    document.getElementById('configBlueTeamName').value = teamConfig.blue.teamName || "";
    document.getElementById('configBluePlayer1').value = teamConfig.blue.players[0] || "";
    document.getElementById('configBluePlayer2').value = teamConfig.blue.players[1] || "";
    document.getElementById('configBluePlayer3').value = teamConfig.blue.players[2] || "";
    document.getElementById('configBluePlayer4').value = teamConfig.blue.players[3] || "";
    document.getElementById('configBlueLogo').value = teamConfig.blue.logo && teamConfig.blue.logo.startsWith('http') ? teamConfig.blue.logo : "";
    
    // Preenche título do match
    document.getElementById('configMatchTitle').value = teamConfig.matchTitle || "";
    
    // Preenche configuração do timer
    document.getElementById('configTime').value = timerConfig.minutes || 15;
    
    // Preenche configuração de sets
    if (setConfig && setConfig.totalSets) {
        document.getElementById('totalSets').value = setConfig.totalSets;
    }
}