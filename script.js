let midiAccess;

let lastMessage = [];

let loops = [];

let remotes = [];

let patchName;

let patchesNames = [];

let currentBankLetter = null;

let activePatch = null;

// Função base da inicialização do site
async function initializeSite() {

    setupMidiListener();
    sendMessage([0xF0,0x01,0x00,0xF7])

    while (nomeControladora === null) {
        console.log('Aguardando nomeControladora...');
        
        // Aqui você pode aguardar algum tempo antes de verificar novamente
        await new Promise(resolve => setTimeout(resolve, 100)); // espera 1 segundo
    }

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
    bank.dataset.letter = letter; // Define o atributo data-letter

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
        const connectButton = document.getElementById('connectButton');

        document.querySelectorAll('.table-section').forEach(table => {
            table.style.display = 'none';
        });
        document.getElementById('patchTitle').style.display = 'none';
        document.getElementById('saveButton').style.display = 'none';
        document.getElementById('cancelButton').style.display = 'none';

        if (!isActive) {
            const bankColor = '#9f18fd';
            connectButton.style.backgroundColor = bankColor;
            document.getElementById('saveButton').style.backgroundColor = bankColor;
            document.getElementById('cancelButton').style.backgroundColor = bankColor;
        }
        
        // Atualiza a variável global com a letra do banco atual
        if (!isActive) {
            currentBankLetter = bank.dataset.letter; // Atribui a letra do banco atual
            console.log(`Banco selecionado: ${currentBankLetter}`);
        } else {
            currentBankLetter = null; // Nenhum banco ativo
        }

        // Envia mensagens MIDI relacionadas ao banco
        sendMessage([0xF0, 0x09, index - 65, 0, 0xF7]);
        sendMessage([0xF0, 0x0A, index - 65, 0xF7]);

        // Remove a classe 'active' de todos os bancos
        document.querySelectorAll('.bank').forEach(b => {
            b.classList.remove('active');
            b.style.backgroundColor = '';
            const arrow = b.querySelector('span:last-child'); // Seleciona a arrow
            arrow.style.transform = 'rotate(-90deg) scale(1.8)';
        });

        // Esconde os detalhes de todos os bancos
        document.querySelectorAll('.bank-details').forEach(details => details.style.display = 'none');

        // Ativa ou desativa o banco clicado
        if (!isActive) {
            bank.style.backgroundColor = index % 2 === 0
                ? 'rgba(83, 191, 235, 0.5)'
                : 'rgba(159, 24, 253, 0.5)';
            bank.classList.add('active');
            const arrow = bank.querySelector('span:last-child');
            arrow.style.transform = 'rotate(90deg) scale(1.8)';
            bankDetails.style.display = 'block';
        }
    });
}

function createBnkCfg(letter) {
    /*sendMessage([0xF0,0x0B,bank.dataset.letter.charCodeAt(0)-65,0xF7]);*/
    const bnkCfg = document.createElement('div');
    bnkCfg.id = 'bnkCfg';
    bnkCfg.style.position = 'absolute';
    bnkCfg.style.right = '20px';
    bnkCfg.style.top = '50%';
    bnkCfg.style.transform = 'translateY(-50%)';
    /*bnkCfg.style.backgroundColor = bank.dataset.letter.charCodeAt(0) % 2 === 0
        ? 'rgba(83, 191, 235, 0.5)'
        : 'rgba(159, 24, 253, 0.5)';*/
    bnkCfg.style.backgroundColor = 'rgba(159, 24, 253, 0.5)';
    bnkCfg.style.borderRadius = '8px';
    bnkCfg.style.padding = '20px';
    bnkCfg.style.color = '#fff';
    bnkCfg.style.width = '250px';
    bnkCfg.style.height = '143px';
    bnkCfg.style.textAlign = 'center';
    bnkCfg.style.zIndex = '0';

    // Criar título
    const titleRow = document.createElement('div');

    /*if (bank.dataset.letter.charCodeAt(0) % 2 === 0) {
        titleRow.innerHTML = `<span style="color: #6c2ca7;">Bank ${bank.dataset.letter}</span> <span style="color: white;">Configuration</span>`;
    } else*/ titleRow.innerHTML = `<span style="color: #53bfeb;">Bank ${letter}</span> <span style="color: white;">Configuration</span>`;
    
    titleRow.style.fontSize = '18px';
    titleRow.style.fontWeight = '600';
    titleRow.style.marginBottom = '10px';
    bnkCfg.appendChild(titleRow);

    // Criar botões
    const labels = ['Reclick', 'Hold', 'BnkUp', 'BnkDown'];
    labels.forEach((label, i) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.marginBottom = '10px';

        const rowLabel = document.createElement('span');
        rowLabel.textContent = label;
        row.appendChild(rowLabel);

        const rowButton = document.createElement('button');
        rowButton.textContent = 'OFF';
        rowButton.style.backgroundColor = 'transparent';
        rowButton.style.color = 'red';
        rowButton.style.fontSize = '16px';
        rowButton.style.fontWeight = '600';
        rowButton.style.border = 'none';
        rowButton.style.cursor = 'pointer';
        rowButton.style.fontWeight = 'bold';

        rowButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const options = [];

            options.push('OFF');
            if (i <= 1) {
                for (let letter = 66; letter <= 90; letter++) {
                    options.push(`Load from ${String.fromCharCode(letter)}`);
                }
            } else {
                for (let letter = 66; letter <= 90; letter++) {
                    options.push(`Load from ${String.fromCharCode(letter)}`);
                    for (let num = 1; num <= 8; num++) {
                        options.push(`Load from ${String.fromCharCode(letter)}${num}`);
                    }
                }
            }
            createConfigPopup(rowButton, null, null, (selectedValue) => {
                rowButton.textContent = selectedValue;
                rowButton.style.color = selectedValue === 'OFF' ? 'red' : 'lime';
            }, options);
        });

        row.appendChild(rowButton);
        bnkCfg.appendChild(row);
    });

    document.body.appendChild(bnkCfg);
}

function createConfigPopup(detailButton, rangeStart, rangeEnd, onSelectCallback, customOptions = null) {
    // Fecha popups abertos
    const existingPopup = document.querySelector('.value-popup');
    if (existingPopup) existingPopup.remove();

    // Cria o popup
    const valuePopup = document.createElement('div');
    valuePopup.className = 'value-popup';
    valuePopup.style.position = 'absolute';
    valuePopup.style.backgroundColor = '#242424';
    valuePopup.style.borderRadius = '5px';
    valuePopup.style.maxHeight = '200px';
    valuePopup.style.overflowY = 'auto';
    valuePopup.style.scrollbarWidth = 'none';
    valuePopup.style.width = '100px';
    valuePopup.style.textAlign = 'center';

    // Impede popup de "sair" da tela
    const rect = detailButton.getBoundingClientRect();
    const popupHeight = 200;

    let top = rect.bottom;
    let left = rect.left;

    if (top + popupHeight > window.innerHeight) {
        top = Math.max(rect.top - popupHeight, 0);
    }

    valuePopup.style.top = `${top}px`;
    valuePopup.style.left = `${left}px`;

    // Adiciona valores personalizados, se fornecidos
    if (customOptions) {
        customOptions.forEach((option) => {
            const valueButton = document.createElement('button');
            valueButton.textContent = option;
            valueButton.style.display = 'block';
            valueButton.style.width = '100%';
            valueButton.style.marginBottom = '5px';
            valueButton.style.padding = '5px';
            valueButton.style.cursor = 'pointer';

            valueButton.addEventListener('click', () => {
                onSelectCallback(option);
                valuePopup.remove();
            });

            valuePopup.appendChild(valueButton);
        });
    } else {
        // Adiciona valores numéricos (rangeStart a rangeEnd)
        for (let i = rangeStart; i <= rangeEnd; i++) {
            const valueButton = document.createElement('button');
            valueButton.textContent = i.toString();
            valueButton.style.display = 'block';
            valueButton.style.width = '100%';
            valueButton.style.marginBottom = '5px';
            valueButton.style.padding = '5px';
            valueButton.style.cursor = 'pointer';

            valueButton.addEventListener('click', () => {
                onSelectCallback(i);
                valuePopup.remove();
            });

            valuePopup.appendChild(valueButton);
        }
    }

    // Adiciona popup ao documento
    document.body.appendChild(valuePopup);

    // Fecha o popup ao clicar fora
    document.addEventListener(
        'click',
        (e) => {
            if (!valuePopup.contains(e.target)) {
                valuePopup.remove();
            }
        },
        { once: true }
    );
}


// Base para a criação dos patches
function createBankPatches(letter, index) {
    const bankDetails = document.createElement('div');
    bankDetails.className = 'bank-details';

    const patchList = document.createElement('ul');

    let size = 8;
    if (nomeControladora === 'supernova'){
        size = 5;
    }
    for (let j = 1; j <= size; j++) {
        const patchId = `${letter}${j}`; // Identificador do patch
        const patchItem = createPatch(letter, j, index);
        const inputElement = patchItem.querySelector('input');
        patchItem.dataset.patchId = patchId;

        patchItem.addEventListener('click', async () => {
            activePatch = letter + j;

            document.getElementById('patchTitle').style.display = 'flex';
            const patchNameValue = patchItem.querySelector('input').value || `Patch ${patchId}`;
            const selectedPatchText = document.getElementById('selectedPatch');
            const selectedPatchType = document.getElementById('patchType');
            if (patchItem.querySelector('input').value)
                selectedPatchText.textContent = `${patchId} - ${patchNameValue}`;
            else selectedPatchText.textContent = `Patch ${patchId}`;
            const type = localStorage.getItem(`${letter}${j}_type`) || 'Preset';
            selectedPatchType.textContent = `(${type})`;

            patchChange(letter, j)

            sendMessage([0xF0,0x06,0x00,0xF7]) // Nome do patch

            const existingTable = document.getElementById('bnkCfg');
            if (existingTable) {
                existingTable.remove();
            }
            createBnkCfg(letter);
            await delay(200);
            sendMessage([0xF0,0x0B,letter.charCodeAt(0)-65,0xF7]); // Deletar em breve

            createLoopTable(patchId, index);
            createTableRemoteSwitch(patchId, index)
            createMidiTable(patchId, index, "midi-table");
            createMidiTable(patchId, index, "midi-table-2");
            createMidiTable(patchId, index, "midi-table-3");
            document.getElementById('saveButton').style.display = 'inline-block';
            document.getElementById('cancelButton').style.display = 'inline-block';
        });

        inputElement.addEventListener('input', () => {
            const selectedPatchText = document.getElementById('selectedPatch');
            if (inputElement.value.trim() === "") {
                selectedPatchText.textContent = `Patch ${patchId}`;
            } else {
                selectedPatchText.textContent = `${patchId} - ${inputElement.value}`;
            }
        });

        patchList.appendChild(patchItem);
    }

    bankDetails.appendChild(patchList);
    return bankDetails;
}

function writeAllNames(array, bankLetter) {
    // Seleciona os inputs do banco selecionado
    const inputs = document.querySelectorAll(`.bank[data-letter="${bankLetter}"] + .bank-details input`);

    if (inputs.length === 0) {
        console.error(`Nenhum input encontrado para o banco ${bankLetter}`);
        return;
    }

    inputs.forEach((input, index) => {
        if (index < array.length && array[index].trim() !== '') {
            input.value = array[index];
        } else {
            input.value = "";
        }
    });
}


async function sendMessage(message) {

    lastMessage.push(message[1]);
    
    console.log(message)

    if (message[1] == 10) {
        let numPatches = 8;
        if (nomeControladora === 'supernova') {
            numPatches = 5;
        }
        for (let i = 1; i < numPatches; i++) {
            lastMessage.push(message[1]);
        }
    }

    console.log('Mensagens enviadas: ', lastMessage)

    try {
        const outputs = Array.from(midiAccess.outputs.values());
        if (outputs.length === 0) {
            alert("Nenhum dispositivo MIDI encontrado.");
            return;
        }

        const output = outputs[0];

        output.send(message); 
    } catch (error) {
        alert("Erro ao enviar mensagem MIDI: " + error);
    }
}

async function patchChange(letter, j) {

    const valorASCII = letter.charCodeAt(0);
    try {
        const outputs = Array.from(midiAccess.outputs.values());
        if (outputs.length === 0) {
            alert("Nenhum dispositivo MIDI encontrado.");
            return;
        }

        const output = outputs[0];

        sendMessage([0xF0,0x09,valorASCII - 65,j,0xF7]); // Muda patch
        //alert([0xF0,0x09,valorASCII - 65,j,0xF7])
    } catch (error) {
        alert("Erro ao enviar mensagem MIDI: " + error);
    }
}

let nomeControladora = null
async function setupMidiListener() {
    try {
        console.log("Solicitando acesso aos dispositivos MIDI...");

        // Solicita o acesso ao MIDI
        
        console.log("Acesso ao MIDI concedido.");

        // Obtém as entradas MIDI
        const inputs = Array.from(midiAccess.inputs.values());

        if (inputs.length === 0) {
            console.log("Nenhum dispositivo MIDI de entrada encontrado.");
            return;
        }

        // Seleciona o primeiro dispositivo MIDI
        const input = inputs[0];
        console.log(`Conectado ao dispositivo MIDI: ${input.name}`);

        // Configura o evento para escutar as mensagens MIDI
        input.onmidimessage = (message) => {

            // Impede que o heartbeat interfira no funcionamento do site
            if (message.data[1] == 8){
                return;
            }

            // Verifica se a mensagem é SysEx
            if (message.data[0] === 0xF0) {
                console.log("Mensagem SysEx recebida:", message.data, message.data[1] != 8);

                // Exibe a mensagem SysEx completa
                const sysexData = message.data.slice(1, -1); // Remove o 0xF0 de início e 0xF7 de fim
                //console.log("Dados SysEx:", sysexData);
                switch (lastMessage[0]) {
                    case 1:
                        if (sysexData["0"] === 2 || sysexData["0"] === 0){
                            nomeControladora = "supernova";
                            document.getElementById('editor-title').textContent = 'Web Editor - Supernova';

                        } else {
                            nomeControladora = "titan";
                            document.getElementById('editor-title').textContent = 'Web Editor - Titan';
                        }
                        console.log(nomeControladora)
                        break;
                    case 2:
                        loops = Array.from(sysexData);
                        console.log('loops ', loops)
                        break;
                    case 4:
                        remotes = Array.from(sysexData);
                        console.log('remotes ', remotes)
                        break;
                    case 6:
                        patchName = sysexData;
                        console.log('patchname ', patchName )
                        const selectedPatchElement = document.getElementById('selectedPatch');
                        const textContent = Array.from(sysexData).map(num => String.fromCharCode(num)).join('').trim();
                        if (textContent)
                            selectedPatchElement.textContent = `${activePatch} - ${textContent.trim()}`;
                        else selectedPatchElement.textContent = `Patch ${activePatch}`;
                        
                        break;
                    case 10:
                        console.log(Array.from(sysexData).map(num => String.fromCharCode(num)).join(''));
                        patchesNames.push(Array.from(sysexData.slice(2)).map(num => String.fromCharCode(num)).join(''));
                        console.log(patchesNames)
                        writeAllNames(patchesNames, currentBankLetter)
                        if (lastMessage[1] != 10){
                            patchesNames = [];
                        }
                        break;
                    case 0x0B:
                        console.log('suas configurações do banco: ', sysexData)
                        const buttons = document.querySelectorAll('#bnkCfg button');
                        for (let i=0; i<2; i++) {
                            if (sysexData[i] === 0){
                                buttons[i].textContent = 'OFF';
                                buttons[i].style.color = 'red';
                            } else {
                                if (currentBankLetter.charCodeAt(0) <= sysexData[i]+65) {
                                    buttons[i].textContent = `Load from ${String.fromCharCode(sysexData[i]+64)}`;
                                    buttons[i].style.color = 'lime';
                                } else {
                                    buttons[i].textContent = `Load from ${String.fromCharCode(sysexData[i]+65)}`;
                                    buttons[i].style.color = 'lime';
                                }
                            }
                        }
                        for (let i=2; i<4; i++){
                            if (sysexData[i] === 0){
                                buttons[i].textContent = 'OFF';
                                buttons[i].style.color = 'red';
                            } else {
                                switch (sysexData[i]) {
                                    case 0:
                                        buttons[i].textContent = 'OFF';
                                        buttons[i].style.color = 'red';
                                        break;
                                    case 1:
                                        buttons[i].textContent = 'Locked';
                                        buttons[i].style.color = 'lime';
                                        break;
                                    default:
                                        sysexData[i] = sysexData[i] - 2;
                                        let bankToGo = String.fromCharCode(Math.floor(sysexData[i] / 9) + 65);
                                        let patchToGo = sysexData[i] % 9;
                                        buttons[i].textContent = `${bankToGo} ${patchToGo}`.replace(/\s+/g, "");
                                        buttons[i].style.color = 'lime';
                                        break;
                                }
                            }
                        }
                        
                    default:
                        break;
                }
            } else {
                console.log("Mensagem MIDI não SysEx recebida:", message.data);
            }
            console.log('removendo ', lastMessage[0])
            lastMessage.shift()
        };
    } catch (error) {
        console.error("Erro ao configurar o listener MIDI:", error);
    }
}

// Cria um patch
function createPatch(letter, number, index) {
    const patchItem = document.createElement('li');

    const patchLabel = document.createElement('span');
    patchLabel.textContent = `${letter}${number}`;
    patchLabel.style.cursor = 'pointer';
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
    patchName.maxLength = 6;

    // Define a cor com base na letra do banco
    const color = /*(letter.charCodeAt(0) - 65) % 2 === 0 ? '#9f18fd' : '#53bfeb';*/ '#9f18fd'; // Azul ou roxo
    patchName.style.border = `1px solid ${color}`;

    patchName.addEventListener('input', () => {
        localStorage.setItem(`${letter}${number}_name`, patchName.value);
    });

    patchName.addEventListener('blur', () => {
        let asciiValues = [];
        for (let i = 0; i < 6; i++) {
            if (i < patchName.value.length) {
                asciiValues.push(patchName.value.charCodeAt(i));
            } else {
                asciiValues.push(32);
            }
        }
        sendMessage([0xF0,0x07, asciiValues[0], asciiValues[1], asciiValues[2], asciiValues[3], asciiValues[4], asciiValues[5],0xF7])
    });

    patchName.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            patchName.blur(); // Sai do campo de entrada
        }
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
    const color = /*index % 2 === 0 ?*/ '#53bfeb' /*: '#9f18fd'*/;
    patchItem.style.color = color;
    patchTypeButton.style.color = color;
}

// Revela a tabela de loops
async function createLoopTable(patchId, index) {
    sendMessage([0xF0, 0x02, 0x00, 0xF7]);

    const loopTable = document.getElementById('loop-table');
    const loopTableFull = document.getElementById('table-1');

    await delay(200);

    let states = loops;

    loopTableFull.style.display = 'flex';
    loopTableFull.style.backgroundColor = /*index % 2 === 0
        ? 'rgba(83, 191, 235, 0.5)'
        :*/ 'rgba(159, 24, 253, 0.5)';
    loopTableFull.style.fontWeight = '500';
    loopTableFull.style.padding = '10px';
    loopTableFull.style.margin = 'auto';
    loopTableFull.style.borderRadius = '10px';
    loopTableFull.style.width = '230px';
    loopTableFull.style.display = 'flex';
    loopTableFull.style.flexDirection = 'column';
    loopTableFull.style.alignItems = 'center';
    loopTableFull.style.justifyContent = 'center';

    loopTable.innerHTML = '';
    loopTable.style.display = 'grid';
    loopTable.style.columnGap = '25px';
    loopTable.style.rowGap = '10px';
    loopTable.style.justifyContent = 'center';
    loopTable.style.alignItems = 'center';

    let loopNumbers = ['1', '5', '2', '6', '3', '7', '4', '8'];
    if (nomeControladora === "supernova") {
        loopNumbers = ['1', '2', '3', '4'];
        loopTable.style.gridTemplateColumns = '1fr';
    } else {
        loopTable.style.gridTemplateColumns = '1fr 1fr';
    }

    loopNumbers.forEach((i) => {
        switch (states[i - 1]) {
            case 0: states[i - 1] = 'OFF'; break;
            case 1: states[i - 1] = 'ON'; break;
            case 2: states[i - 1] = 'NUL'; break;
            case 3: states[i - 1] = 'TGL'; break;
            default: states[i - 1] = 'erro'; break;
        }

        const loopContainer = document.createElement('div');
        loopContainer.style.display = 'flex';
        loopContainer.style.alignItems = 'center';
        loopContainer.style.justifyContent = 'center'; // Centraliza o conteúdo
        loopContainer.style.width = '100%';

        const loopLabel = document.createElement('span');
        loopLabel.textContent = `Loop ${i}`;
        loopLabel.style.color = '#fff';
        loopLabel.style.textAlign = 'center';
        loopLabel.style.marginRight = nomeControladora === "supernova" ? '20px' : '10px';

        const loopButton = document.createElement('span-button');
        loopButton.textContent = states[i - 1];
        loopButton.style.color =
            states[i - 1] === 'ON' ? 'lime' :
            states[i - 1] === 'NUL' ? 'yellow' :
            states[i - 1] === 'TGL' ? 'white' :
            'red';
        loopButton.style.cursor = 'pointer';
        loopButton.style.fontWeight = '600';
        loopButton.style.textAlign = 'center';
        loopButton.style.minWidth = '35px';  // Define um tamanho mínimo para o botão
        loopButton.style.textAlign = 'left';  // Garante alinhamento central
        loopButton.style.display = 'inline-block';  // Mantém o tamanho fixo corretamente


        loopButton.addEventListener('click', () => {
            toggleState(loopButton, patchId, i);
            states = updateStates();
            sendMessage(states);
        });

        loopContainer.appendChild(loopLabel);
        loopContainer.appendChild(loopButton);
        loopTable.appendChild(loopContainer);
    });
}

function updateStates() {
    let updatedStates = [0xF0, 0x03];

    // Percorrer os botões de loop para obter os estados
    let loopButtons = document.querySelectorAll('#loop-table span-button');

    loopButtons.forEach((loopButton, index) => {
        let state;

        // Verifica o texto do botão e atribui o valor correspondente
        switch (loopButton.textContent) {
            case 'ON':
                state = 1;
                break;
            case 'NUL':
                state = 2;
                break;
            case 'TGL':
                state = 3;
                break;
            default: // Quando for 'OFF' ou qualquer outro valor
                state = 0;
                break;
        }
        // Atualiza o array states com o valor numérico
        updatedStates[index+2] = state;
    });

    if (nomeControladora === 'titan') {
        updatedStates = reorganizeArray(updatedStates)
    }
    updatedStates.push(0xF7);

    // Sobrescreve o array 'states' com os novos valores numéricos
    return updatedStates;
}

function reorganizeArray(arr) {
    const result = [];
    result.push(arr[0]);
    result.push(arr[1]);
    // 1,3,5,7, 2,4,6,8
    result.push(arr[2]); // 1
    result.push(arr[4]); // 5
    result.push(arr[6]); // 2
    result.push(arr[8]); // 6
    result.push(arr[3]); // 3
    result.push(arr[5]); // 7
    result.push(arr[7]); // 4
    result.push(arr[9]); // 8

    return result;
}

// Revela as opções de tipos do patch
let currentOpenPresetOptions = null;
function createPresetOptions(patchTypeButton, letter, number, index) {
    const presetOptions = document.createElement('div');
    presetOptions.className = 'popup-options';

    ['Preset', 'Action', 'Toggle Action', 'Momentary', 'Tap', 'Tuner'].forEach((preset) => {
        const optionButton = document.createElement('button');
        optionButton.textContent = preset;
        configurePresetOptionEvents(optionButton, patchTypeButton, presetOptions, letter, number, index);
        presetOptions.appendChild(optionButton);
    });

    patchTypeButton.addEventListener('click', (e) => {
        e.stopPropagation();
    
        if (currentOpenPresetOptions && currentOpenPresetOptions !== presetOptions) {
            currentOpenPresetOptions.style.display = 'none';
        }
    
        if (presetOptions.style.display === 'block') {
            presetOptions.style.display = 'none';
            currentOpenPresetOptions = null;
        } else {
            presetOptions.style.display = 'block';
            
            // Obtém o botão e o sidebar
            const rect = patchTypeButton.getBoundingClientRect();
            const sidebar = document.querySelector('.sidebar');
    
            // Ajusta a posição do popup considerando o scroll do sidebar
            const sidebarRect = sidebar.getBoundingClientRect();
            presetOptions.style.left = `${rect.left}px`;
            presetOptions.style.top = `${rect.bottom + sidebar.scrollTo}px`;
    
            // Garante que o popup fique dentro do sidebar
            const popupWidth = presetOptions.offsetWidth;
            const popupHeight = presetOptions.offsetHeight;
    
            // Se ultrapassar a largura do sidebar, ajusta para a esquerda
            if (rect.left + popupWidth > sidebarRect.right) {
                presetOptions.style.left = `${sidebarRect.right - popupWidth - 10}px`;
            }
    
            // Se ultrapassar a altura do sidebar, ajusta para cima
            if (rect.bottom + popupHeight > sidebarRect.bottom) {
                presetOptions.style.top = `${rect.top - popupHeight + sidebar.scrollTo}px`;
            }
    
            currentOpenPresetOptions = presetOptions;
        }
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
    const color = /*index % 2 === 0 ? '#53bfeb' : '#9f18fd';*/ '#53bfeb'

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

// Remote Switch
async function createTableRemoteSwitch(patchId, index) {
    sendMessage([0xF0, 0x04, 0x00, 0xF7]);

    const remoteTable = document.getElementById('remote-table');
    const remoteTableFull = document.getElementById('table-3');

    await delay(200);

    let states = remotes;

    remoteTableFull.style.margin = 'auto';
    remoteTableFull.style.display = 'flex';
    remoteTableFull.style.flexDirection = 'column';
    remoteTableFull.style.alignItems = 'center';
    remoteTableFull.style.backgroundColor = /*index % 2 === 0
        ? 'rgba(83, 191, 235, 0.5)'
        :*/ 'rgba(159, 24, 253, 0.5)';
    remoteTableFull.style.fontWeight = '500';
    remoteTableFull.style.padding = '10px';
    remoteTableFull.style.borderRadius = '10px';
    remoteTableFull.style.width = '230px';
    remoteTableFull.style.justifyContent = 'space-evenly';

    remoteTable.innerHTML = '';
    remoteTable.style.display = 'grid';
    remoteTable.style.rowGap = '10px';

    const loopNumbers = ['1', '2', '3', '4']; // Ajuste para 4 loops

    loopNumbers.forEach((i) => {
        switch (states[i - 1]) {
            case 0: states[i - 1] = 'OFF'; break;
            case 1: states[i - 1] = 'ON'; break;
            case 2: states[i - 1] = 'NUL'; break;
            case 3: states[i - 1] = 'TGL'; break;
        }

        const loopContainer = document.createElement('div');
        loopContainer.style.display = 'flex';
        loopContainer.style.alignItems = 'center';
        loopContainer.style.justifyContent = 'space-between';
        loopContainer.style.width = '100%';

        const loopLabel = document.createElement('span');
        loopLabel.textContent = [
            'Rmt Switch 1 Tip:',
            'Rmt Switch 1 Ring:',
            'Rmt Switch 2 Tip:',
            'Rmt Switch 2 Ring:'
        ][i - 1]; 
        loopLabel.style.color = '#fff';
        loopLabel.style.minWidth = '150px'; // Define largura fixa para alinhamento
        loopLabel.style.textAlign = 'left';
        loopLabel.style.marginRight = '20px';

        const loopButton = document.createElement('span-button');
        loopButton.textContent = states[i - 1];
        loopButton.style.color =
            states[i - 1] === 'ON' ? 'lime' :
            states[i - 1] === 'NUL' ? 'yellow' :
            states[i - 1] === 'TGL' ? 'white' :
            'red';
        loopButton.style.cursor = 'pointer';
        loopButton.style.fontWeight = 'bold';
        loopButton.style.minWidth = '50px'; // Define tamanho fixo do botão
        loopButton.style.textAlign = 'left';

        loopButton.addEventListener('click', () => {
            toggleState(loopButton, patchId, i);
            states = updateStatesRemote();
            sendMessage(states);
        });

        loopContainer.appendChild(loopLabel);
        loopContainer.appendChild(loopButton);
        remoteTable.appendChild(loopContainer);
    });
}

function updateStatesRemote() {
    let updatedStates = [0xF0, 0x05];

    // Percorrer os botões de loop para obter os estados
    let loopButtons = document.querySelectorAll('#remote-table span-button');

    loopButtons.forEach((loopButton, index) => {
        let state;

        // Verifica o texto do botão e atribui o valor correspondente
        switch (loopButton.textContent) {
            case 'ON':
                state = 1;
                break;
            case 'NUL':
                state = 2;
                break;
            case 'TGL':
                state = 3;
                break;
            default: // Quando for 'OFF' ou qualquer outro valor
                state = 0;
                break;
        }
        // Atualiza o array states com o valor numérico
        updatedStates[index+2] = state;
    });

    updatedStates.push(0xF7);

    // Sobrescreve o array 'states' com os novos valores numéricos
    return updatedStates;
}

// Trava a controladora para evitar problemas
let intervalId = null; // Variável para armazenar o ID do intervalo
let isExecuting = false; // Flag para garantir que não execute em paralelo

async function toggleConnection(button) {
    if (intervalId === null) {
        try {
            midiAccess = await navigator.requestMIDIAccess({ sysex: true });

            // Verifica se há dispositivos MIDI disponíveis
            const outputs = Array.from(midiAccess.outputs.values());
            if (outputs.length === 0) {
                alert("Nenhum dispositivo MIDI encontrado. Abortando conexão.");
                return; // Sai da função e impede a conexão
            }

            initializeSite();

            // Iniciar a execução repetida
            intervalId = setInterval(() => {
                if (!isExecuting) {
                    heartBeat();
                }
            }, 200);

            // Alterar o texto do botão
            button.textContent = "Disconnect";

        } catch (error) {
            alert("Erro ao tentar conectar ao MIDI: " + error);
        }
    } else {
        // Desconectar se já estiver conectado
        clearInterval(intervalId);
        intervalId = null;

        // Fechar conexão MIDI explicitamente
        if (midiAccess) {
            midiAccess.inputs.forEach(input => input.onmidimessage = null); // Remove listeners
            midiAccess = null;
        }

        // Remover elementos visuais
        document.querySelectorAll('.bank').forEach(bank => bank.remove());
        document.querySelectorAll('.bank-details').forEach(details => details.style.display = 'none');
        document.querySelector('.gear-icon')?.remove();
        document.querySelectorAll('.table-section').forEach(details => details.style.display = 'none');
        document.getElementById('patchTitle').style.display = 'none';
        if (document.getElementById('bnkCfg')) {
            document.getElementById('bnkCfg')?.remove();
        }
        document.getElementById('saveButton').style.display = 'none';
        document.getElementById('cancelButton').style.display = 'none';
        lastMessage = []
        
        // Alterar o texto do botão
        button.textContent = "Connect";
    }
}

async function heartBeat() {
    try {
        isExecuting = true;  // Marcar a execução em andamento

        const outputs = Array.from(midiAccess.outputs.values());
        if (outputs.length === 0) {
            alert("Nenhum dispositivo MIDI encontrado.");
            return;
        }

        const output = outputs[0];
        output.send([0xF0, 0x08, 0x00, 0xF7]); // Envia mensagem MIDI para o dispositivo
        console.log('heartbeat')

    } catch (error) {
        alert("Erro ao enviar mensagem MIDI: " + error);
    } finally {
        isExecuting = false;  // Marcar a execução como finalizada
    }
}

function saveChanges(button) {
    alert("Changes saved!");
}

function cancelChanges(button) {
    alert("Changes canceled!");
}





























// Cria a tabela MIDI
let currentOpenMidiPopup = null;
function createMidiTable(patchId, index, tableId) {
    const midiTable = document.getElementById(tableId);
    const tableMapping = {
        "midi-table": "table-2",
        "midi-table-2": "table-4",
        "midi-table-3": "table-5"
    };
    
    const midiTableFull = document.getElementById(tableMapping[tableId]);

    midiTableFull.style.display = 'flex';
    midiTableFull.style.backgroundColor = /*index % 2 === 0
        ? 'rgba(83, 191, 235, 0.5)'
        :*/ 'rgba(159, 24, 253, 0.5)';
    midiTableFull.style.fontWeight = 'bold';
    midiTableFull.style.padding = '10px';
    midiTableFull.style.margin = 'auto';
    midiTableFull.style.flexDirection = 'column';
    midiTableFull.style.alignItems = 'center';
    midiTableFull.style.marginTop = '5vh';
    midiTableFull.style.borderRadius = '10px';
    midiTableFull.style.width = '230px';
    
    midiTable.innerHTML = ''; // Limpa a tabela MIDI
    midiTable.style.display = 'grid';
    midiTable.style.gridTemplateColumns = '1fr 1fr'; // Divide em duas colunas
    midiTable.style.columnGap = '10px';
    midiTable.style.rowGap = '5px';

    // Agora os estados são carregados separadamente para cada tabela
    const states = loadMidiStates(patchId, tableId);

    // Cria as linhas da tabela MIDI
    for (let i = 0; i < 10; i++) {
        const midiRow = document.createElement('div');
        midiRow.className = 'midi-row';
        midiRow.style.display = 'flex';
        midiRow.style.alignItems = 'center';
        midiRow.style.maxHeight = '17px';
    
        // Cria o botão principal MIDI
        const midiButton = document.createElement('span');
        midiButton.textContent = states[i]?.type || 'OFF';
        midiButton.className = 'toggle';
        midiButton.style.color = midiButton.textContent === 'OFF' ? 'red' : 'lime';
        midiButton.style.cursor = 'pointer';
        midiButton.style.minWidth = '30px';
        midiButton.style.maxWidth = '30px';
    
        // Cria o popup ao clicar
        midiButton.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`Clique detectado no botão ${i} da tabela ${tableId}`);
            createMidiPopup(midiButton, patchId, i, tableId);
        });
    
        // Adiciona o botão MIDI na linha
        midiRow.appendChild(midiButton);
    
        if (states[i]?.type && states[i].type !== 'OFF') {
            const values = states[i]?.values || [0, 1];

            //cria botões secundarios
            values.forEach((value, idx) => {
                const detailButton = createDetailButton(value, idx, patchId, i);
                detailButton.textContent = value.toString();
                detailButton.className = 'midi-detail';
                detailButton.style.cursor = 'pointer';
                detailButton.style.minWidth = '25px';
                detailButton.style.maxWidth = '25px';
        
                detailButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rangeStart = idx === 0 ? 1 : 0;
                    const rangeEnd = idx === 0 ? 16 : 127;
                    createValuePopup(detailButton, rangeStart, rangeEnd, (selectedValue) => {
                        detailButton.textContent = selectedValue.toString(); // Atualiza no front
                        
                        // Salva no banco
                        states[i].values[idx] = selectedValue;
                        localStorage.setItem(`${patchId}_${tableId}_midi`, JSON.stringify(states));
                    });
                });

                midiButton.insertAdjacentElement('afterend', detailButton);
            });
        }        
        
        // Adiciona a linha na tabela MIDI
        midiTable.appendChild(midiRow);
    }
}

// Cria o popup do comando
function createMidiPopup(midiButton, patchId, index, tableId) {
    if (currentOpenMidiPopup) {
        currentOpenMidiPopup.style.display = 'none';
    }

    let midiPopup = midiButton.querySelector('.popup-options');
    if (!midiPopup) {
        midiPopup = document.createElement('div');
        midiPopup.className = 'popup-options';

        // Obtém posição correta do botão
        const rect = midiButton.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        let top = rect.bottom -'7vh';
        let left = rect.left -390

        const popupHeight = 200;

        // Evita que o popup ultrapasse a tela
        if (top + popupHeight > window.innerHeight + scrollTop) {
            top = Math.max(rect.top + scrollTop - popupHeight, 0);
        }

        midiPopup.style.top = `${top}px`;
        midiPopup.style.left = `${left}px`;
        midiPopup.style.maxWidth = '100px';
        midiPopup.style.maxHeight = '200px';
        midiPopup.style.overflowY = 'auto';
        midiPopup.style.overflowX = 'hidden';
        midiPopup.style.scrollbarWidth = 'none';

        // Adiciona as opções OFF e PC
        ['OFF', 'PC'].forEach((option) => {
            const optionButton = document.createElement('button');
            optionButton.textContent = option;
            optionButton.style.width = '80px';
            optionButton.addEventListener('click', (e) => {
                e.stopPropagation();
                handleMidiSelection(option, midiButton, patchId, index, tableId);
                midiPopup.style.display = 'none';
                currentOpenMidiPopup = null;
            });
            midiPopup.appendChild(optionButton);
        });

        // Adiciona as opções CCs
        for (let i = 0; i <= 127; i++) {
            const optionButton = document.createElement('button');
            optionButton.textContent = `CC${i}`;
            optionButton.style.width = '80px';
            optionButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede que o clique feche o popup
                handleMidiSelection(`CC${i}`, midiButton, patchId, index, tableId);
                midiPopup.style.display = 'none';
                currentOpenMidiPopup = null;
            });
            midiPopup.appendChild(optionButton);
        }

        midiButton.appendChild(midiPopup);
    }

    // Mostra o popup
    midiPopup.style.display = 'block';
    currentOpenMidiPopup = midiPopup;

    // Fecha o popup se clicar fora
    setTimeout(() => {
        document.addEventListener('click', (e) => {
            if (!midiPopup.contains(e.target) && e.target !== midiButton) {
                midiPopup.style.display = 'none';
                currentOpenMidiPopup = null;
            }
        }, { once: true });
    }, 100); // Pequeno atraso para evitar que o clique inicial feche o popup
}

// Cria botão secundario
function createDetailButton(initialValue, index, patchId, midiIndex) {
    const detailButton = document.createElement('button');
    detailButton.textContent = initialValue.toString();
    detailButton.className = 'midi-detail';
    detailButton.style.marginLeft = '10px';
    detailButton.style.padding = '5px 10px';
    detailButton.style.borderRadius = '5px';
    detailButton.style.cursor = 'pointer';

    // Lida com o clique no botão
    detailButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede bug ao trocar comando
        const rangeStart = index === 0 ? 0 : 1;
        const rangeEnd = index === 0 ? 127 : 16;
        createValuePopup(detailButton, rangeStart, rangeEnd, (selectedValue) => {
            detailButton.textContent = selectedValue.toString();

            const states = loadMidiStates(patchId);
            states[midiIndex].values[index] = selectedValue; // Atualiza no front
            localStorage.setItem(`${patchId}_${tableId}`, JSON.stringify(states)); // Salva no banco
        });
    });

    return detailButton;
}


// Lida com a seleção de comando
function handleMidiSelection(type, midiButton, patchId, index) {
    const parentRow = midiButton.parentElement;

    // Atualiza o botão principal
    midiButton.textContent = type;
    midiButton.style.color = type === 'OFF' ? 'red' : 'lime';

    // Limpa botões secundarios
    const existingDetailButtons = parentRow.querySelectorAll('.midi-detail');
    existingDetailButtons.forEach((btn) => btn.remove());

    // Salva e sai se escolher OFF
    if (type === 'OFF') {
        localStorage.setItem(`${patchId}_${tableId}`, JSON.stringify({ type: 'OFF', values: [] }));
        return;
    }

    // Cria botões secundarios
    for (let i = 0; i < 2; i++) {
        const detailButton = createDetailButton(0, i, patchId, index);
        parentRow.appendChild(detailButton);
    }

    // Salva
    const midiData = { type: type, values: [0, 1] };
    const states = loadMidiStates(patchId);
    states[index] = midiData;
    localStorage.setItem(`${patchId}_${tableId}`, JSON.stringify(states));
}

// Cria popup pro valor e canal
function createValuePopup(detailButton, rangeStart, rangeEnd, onSelectCallback) {
    // Fecha qualquer popup aberto antes de criar um novo
    document.querySelectorAll('.value-popup').forEach(popup => popup.remove());

    // Criar o popup
    const valuePopup = document.createElement('div');
    valuePopup.className = 'value-popup';
    valuePopup.style.position = 'absolute';
    valuePopup.style.backgroundColor = '#242424';
    valuePopup.style.borderRadius = '5px';
    valuePopup.style.maxHeight = '200px';
    valuePopup.style.overflowY = 'auto';
    valuePopup.style.scrollbarWidth = 'none';
    valuePopup.style.width = '60px';
    valuePopup.style.textAlign = 'center';
    valuePopup.style.padding = '5px';
    valuePopup.style.zIndex = '1000';

    // Obter posição correta do popup
    const rect = detailButton.getBoundingClientRect();
    valuePopup.style.top = `${rect.bottom + window.scrollY}px`;
    valuePopup.style.left = `${rect.left + window.scrollX}px`;

    if (rangeStart === 0) {
        const valueButton = document.createElement('button');
        valueButton.textContent = '127';
        valueButton.style.display = 'block';
        valueButton.style.width = '100%';
        valueButton.style.marginBottom = '5px';
        valueButton.style.padding = '5px';
        valueButton.style.cursor = 'pointer';

        // Salva e esconde o popup
        valueButton.addEventListener('click', (e) => {
            e.stopPropagation();
            onSelectCallback(127);
            closePopup();
        });

        valuePopup.appendChild(valueButton);
    }

    // Adiciona numeros ao popup
    for (let i = rangeStart; i <= rangeEnd; i++) {
        const valueButton = document.createElement('button');
        valueButton.textContent = i.toString();
        valueButton.style.display = 'block';
        valueButton.style.width = '100%';
        valueButton.style.padding = '5px';
        valueButton.style.cursor = 'pointer';

        // Salva e esconde o popup
        valueButton.addEventListener('click', (e) => {
            e.stopPropagation();
            onSelectCallback(i);
            closePopup();
        });

        valuePopup.appendChild(valueButton);
    }

    // Adiciona EXP1 e EXP2 no popup (opcional, se necessário)
    if (rangeStart === 0) {
        ['EXP1', 'EXP2'].forEach((option) => {
            const valueButton = document.createElement('button');
            valueButton.textContent = option;
            valueButton.style.display = 'block';
            valueButton.style.width = '100%';
            valueButton.style.marginBottom = '5px';
            valueButton.style.padding = '5px';
            valueButton.style.cursor = 'pointer';

            // Salva e esconde o popup
            valueButton.addEventListener('click', (e) => {
                e.stopPropagation();
                onSelectCallback(option);
                closePopup();
            });

            valuePopup.appendChild(valueButton);
        });
    }

    // Adicionar popup à página
    document.body.appendChild(valuePopup);

    // Função para fechar o popup ao clicar fora
    function closePopup() {
        valuePopup.remove();
        document.removeEventListener('click', closePopup);
    }

    // Aguardar um pequeno tempo para o evento de clique não ser cancelado
    setTimeout(() => {
        document.addEventListener('click', closePopup);
    }, 100);
}

// Salva do tabela no banco
function loadMidiStates(patchId, tableId) {
    const savedStates = localStorage.getItem(`${patchId}_${tableId}_midi`);
    console.log(`Estados carregados para ${tableId}:`, savedStates);

    return savedStates
        ? JSON.parse(savedStates)
        : Array(10).fill().map(() => ({ type: 'OFF', values: [] }));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
