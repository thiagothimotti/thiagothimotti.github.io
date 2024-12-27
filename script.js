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
        const patchItem = createPatch(letter, j, index);
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

    const patchTypeButton = createPatchTypeButton(letter, number, index);
    patchItem.appendChild(patchTypeButton);

    const presetOptions = createPresetOptions(patchTypeButton, letter, number, index);
    patchItem.appendChild(presetOptions);

    setPatchColor(patchItem, patchTypeButton, index);

    patchSelection(patchItem, patchName, letter, number, index);

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
function createPatchTypeButton(letter, number, index) {
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

// Lida com a seleção de um patch
function patchSelection(patchItem, patchName, letter, number, index) {
    patchItem.addEventListener('click', () => {
        const selectedPatchText = document.getElementById('selectedPatch');
        const patchNameValue = patchName.value || `Patch ${letter}${number}`;
        if (patchName.value) {
            selectedPatchText.textContent = `${letter}${number} - ${patchNameValue}`;
        } else {
            selectedPatchText.textContent = `${patchNameValue}`;
        }
        createLoopTable(index);
    });
}

// Revela a tabela de loops
function createLoopTable(index) {
    const loopTable = document.getElementById('loop-table');
    loopTable.style.display = 'flex';
    loopTable.style.backgroundColor = index % 2 === 0
        ? 'rgba(83, 191, 235, 0.5)'
        : 'rgba(159, 24, 253, 0.5)';
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
function toggleState(button) {
    if (button.textContent === "OFF") {
        button.textContent = "ON";
        button.style.color = 'lime';
    } else {
        button.textContent = "OFF";
        button.style.color = 'red';
    }
}

initializeSite();