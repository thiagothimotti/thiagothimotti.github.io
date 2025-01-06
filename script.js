// Função base da inicialização do site
function initializeSite() {
    const sidebar = document.getElementById('sidebar');
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const bank = createBank(letter, i);
        const bankDetails = createBankPatches(letter, i);

        bankSelect(bank, bankDetails, i);

        sidebar.appendChild(bank);
        sidebar.appendChild(bankDetails);
    }
}

// Cria um banco
function createBank(letter, index) {
    const bank = document.createElement('div');
    bank.className = 'bank';

    const ball = document.createElement('span');
    ball.textContent = '\u2B24';
    ball.style.marginRight = '10px';
    bank.appendChild(ball);

    const bankText = document.createTextNode(`Bank ${letter}`);
    bank.appendChild(bankText);

    const arrow = document.createElement('span');
    arrow.textContent = '\u276E';
    arrow.style.transform = 'rotate(-90deg) scale(1.8)';
    bank.appendChild(arrow);

    setBankColor(bank, ball, arrow, index);

    return bank;
}

// Calcula a cor do banco
function setBankColor(bank, ball, arrow, index) {
    const color = index % 2 === 0 ? '#53bfeb' : '#9f18fd';
    ball.style.color = color;
    arrow.style.color = color;
    bank.dataset.color = color;
}

// Lida com a seleção de um banco
function bankSelect(bank, bankDetails, index) {
    bank.addEventListener('click', () => {
        const isActive = bank.classList.contains('active');

        document.querySelectorAll('.bank').forEach(b => {
            b.classList.remove('active');
            b.style.backgroundColor = '';
        });

        document.querySelectorAll('.bank-details').forEach(details => details.style.display = 'none');

        if (!isActive) {
            bank.style.backgroundColor = index % 2 === 0
                ? 'rgba(83, 191, 235, 0.5)'
                : 'rgba(159, 24, 253, 0.5)';
            bank.classList.add('active');
            bankDetails.style.display = 'block';
        }
    });
}

// Base para a criação dos patches
function createBankPatches(letter, index) {
    const bankDetails = document.createElement('div');
    bankDetails.className = 'bank-details';

    const patchList = document.createElement('ul');
    for (let j = 1; j <= 8; j++) {
        const patchId = `${letter}${j}`; // Identificador do patch
        const patchItem = createPatch(letter, j, index);
        patchItem.dataset.patchId = patchId;

        patchItem.addEventListener('click', () => {
            const patchNameValue = patchItem.querySelector('input').value || `Patch ${patchId}`;
            const selectedPatchText = document.getElementById('selectedPatch');
            if (patchItem.querySelector('input').value)
                selectedPatchText.textContent = `${patchId} - ${patchNameValue}`;
            else selectedPatchText.textContent = `Patch ${patchId}`;

            createLoopTable(patchId, index);
        });

        patchList.appendChild(patchItem);
    }

    bankDetails.appendChild(patchList);
    return bankDetails;
}

// Cria um patch
function createPatch(letter, number, index) {
    const patchItem = document.createElement('li');

    const patchLabel = document.createElement('span');
    patchLabel.textContent = `${letter}${number}`;
    patchItem.appendChild(patchLabel);

    const patchName = createNameInput(letter, number);
    patchItem.appendChild(patchName);

    const patchTypeButton = createPatchTypeButton(letter, number);
    patchItem.appendChild(patchTypeButton);

    const presetOptions = createPresetOptions(patchTypeButton, letter, number, index);
    patchItem.appendChild(presetOptions);

    setPatchColor(patchItem, patchTypeButton, index);

    return patchItem;
}

// Cria o input de nome
function createNameInput(letter, number) {
    const patchName = document.createElement('input');
    patchName.type = 'text';
    patchName.placeholder = `Patch ${letter}${number}`;
    patchName.value = localStorage.getItem(`${letter}${number}_name`) || '';
    patchName.maxLength = 5;

    patchName.addEventListener('input', () => {
        localStorage.setItem(`${letter}${number}_name`, patchName.value);
    });

    return patchName;
}

// Cria o botão de tipo
function createPatchTypeButton(letter, number) {
    const patchTypeButton = document.createElement('button');
    patchTypeButton.textContent = localStorage.getItem(`${letter}${number}_type`) || 'Preset';
    return patchTypeButton;
}

// Calcula a cor do patch
function setPatchColor(patchItem, patchTypeButton, index) {
    const color = index % 2 === 0 ? '#53bfeb' : '#9f18fd';
    patchItem.style.color = color;
    patchTypeButton.style.color = color;
}

// Revela a tabela de loops
function createLoopTable(patchId, index) {
    const loopTable = document.getElementById('loop-table');

    const states = loadLoopStates(patchId);

    loopTable.innerHTML = '';
    loopTable.style.display = 'grid';
    loopTable.style.gridTemplateColumns = '1fr 1fr'; // Duas colunas
    loopTable.style.columnGap = '70px';
    loopTable.style.rowGap = '20px';
    loopTable.style.backgroundColor = index % 2 === 0
        ? 'rgba(83, 191, 235, 0.5)'
        : 'rgba(159, 24, 253, 0.5)';
    loopTable.style.fontWeight = 'bold';
    loopTable.style.padding = '20px';
    loopTable.style.marginTop = '20px';
    loopTable.style.marginLeft = '20vh';
    loopTable.style.borderRadius = '10px';
    loopTable.style.width = '40vh';

    // Cria as linhas da tabela de loops
    for (let i = 0; i < 8; i++) {
        const loopContainer = document.createElement('div');
        loopContainer.style.display = 'flex';
        loopContainer.style.justifyContent = 'space-between';
        loopContainer.style.alignItems = 'center';
    
        const loopLabel = document.createElement('span');
        loopLabel.textContent = `Loop ${i + 1}`;
        loopLabel.style.color = '#fff';
        loopLabel.style.marginRight = '10px';
    
        const loopButton = document.createElement('span');
        loopButton.textContent = states[i] ? 'ON' : 'OFF';
        loopButton.style.color = states[i] ? 'lime' : 'red';
        loopButton.style.cursor = 'pointer';
        loopButton.style.fontWeight = 'bold';
    
        loopButton.addEventListener('click', () => toggleState(loopButton, patchId, i));
    
        loopContainer.appendChild(loopLabel);
        loopContainer.appendChild(loopButton);
        loopTable.appendChild(loopContainer);
    }
}

// Revela as opções de tipos do patch
function createPresetOptions(patchTypeButton, letter, number, index) {
    const presetOptions = document.createElement('div');
    presetOptions.className = 'preset-options';

    ['Preset', 'Action', 'Toggle Action', 'Momentary', 'Tap', 'Tuner'].forEach((preset) => {
        const optionButton = document.createElement('button');
        optionButton.textContent = preset;
        configurePresetOptionEvents(optionButton, patchTypeButton, presetOptions, letter, number, index);
        presetOptions.appendChild(optionButton);
    });

    patchTypeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        presetOptions.style.display = presetOptions.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
        if (!patchTypeButton.contains(e.target) && !presetOptions.contains(e.target)) {
            presetOptions.style.display = 'none';
        }
    });

    return presetOptions;
}

// Gerencia a tabela de tipos de patch
function configurePresetOptionEvents(optionButton, patchTypeButton, presetOptions, letter, number, index) {
    const color = index % 2 === 0 ? '#53bfeb' : '#9f18fd';

    optionButton.addEventListener('mouseover', () => {
        optionButton.style.color = color;
    });

    optionButton.addEventListener('mouseout', () => {
        optionButton.style.color = '#fff';
    });

    optionButton.addEventListener('click', () => {
        patchTypeButton.textContent = optionButton.textContent;
        localStorage.setItem(`${letter}${number}_type`, optionButton.textContent);
        presetOptions.style.display = 'none';
    });
}

// Alterna os valores da tabela loops
function toggleState(button, index, loopIndex) {
    const states = loadLoopStates(index);

    states[loopIndex] = !states[loopIndex];

    if (states[loopIndex]) {
        button.textContent = "ON";
        button.style.color = 'lime';
    } else {
        button.textContent = "OFF";
        button.style.color = 'red';
    }

    saveLoopStates(index, states);
}

// Salva os estados dos loops
function saveLoopStates(index, states) {
    localStorage.setItem(`${index}_loops`, JSON.stringify(states));
}

// Carrega os estados dos loops
function loadLoopStates(index) {
    const savedStates = localStorage.getItem(`${index}_loops`);
    return savedStates ? JSON.parse(savedStates) : Array(8).fill(false);
}

initializeSite();