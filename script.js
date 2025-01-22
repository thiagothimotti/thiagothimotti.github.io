let midiAccess;

let lastMessage = [];

let loops = [];

let remotes = [];

let patchName;

let patchesNames = [];

let currentBankLetter = null;

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
        });

        // Esconde os detalhes de todos os bancos
        document.querySelectorAll('.bank-details').forEach(details => details.style.display = 'none');

        // Ativa ou desativa o banco clicado
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

    let size = 8;
    if (nomeControladora === 'supernova'){
        size = 5;
    }
    for (let j = 1; j <= size; j++) {
        const patchId = `${letter}${j}`; // Identificador do patch
        const patchItem = createPatch(letter, j, index);
        const inputElement = patchItem.querySelector('input');
        patchItem.dataset.patchId = patchId;

        patchItem.addEventListener('click', () => {
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

            createLoopTable(patchId, index);
            createTableRemoteSwitch(patchId, index)
            createMidiTable(patchId, index);
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

    console.log(lastMessage)

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

// Troca de programa (so vai ate program 127)
/*async function programChange(channel, letter, j) {


    const valorASCII = letter.charCodeAt(0);
    const pc = (valorASCII - 65)*8 + j-1
    try {
        const outputs = Array.from(midiAccess.outputs.values());
        if (outputs.length === 0) {
            alert("Nenhum dispositivo MIDI encontrado.");
            return;
        }

        const output = outputs[0];
        const statusByte = 0xC0 | channel;

        output.send([statusByte, pc]); // Muda patch
        //alert(`Program Change enviado para Canal ${channel + 1}, Banco ${letter}, Programa ${j}`);
    } catch (error) {
        alert("Erro ao enviar mensagem MIDI: " + error);
    }
}*/

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
                        document.getElementById('selectedPatch').textContent = Array.from(sysexData).map(num => String.fromCharCode(num)).join('');
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


/*async function setupMidiListener() {
    try {
        console.log("Solicitando acesso aos dispositivos MIDI...");

        // Solicita o acesso ao MIDI
        const midiAccess = await navigator.requestMIDIAccess({ sysex: true });
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
            // Verifica se a mensagem é SysEx
            if (message.data[0] === 0xF0) {
                console.log("Mensagem SysEx recebida:", message.data);

                // Exibe a mensagem SysEx completa
                const sysexData = message.data.slice(1, -1); // Remove o 0xF0 de início e 0xF7 de fim
                console.log("Dados SysEx:", sysexData);
                if (sysexData["0"] === 2 || sysexData["0"] === 0){
                    nomeControladora = "supernova";
                }
            } else {
                console.log("Mensagem MIDI não SysEx recebida:", message.data);
            }
        };
    } catch (error) {
        console.error("Erro ao configurar o listener MIDI:", error);
    }
}*/

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
    patchName.maxLength = 6;

    patchName.addEventListener('input', () => {
        localStorage.setItem(`${letter}${number}_name`, patchName.value);
    });

    patchName.addEventListener('blur', () => {
        // Ação ao clicar fora do campo de entrada
        let asciiValues = [];
        for (let i = 0; i < 6; i++) {
            if (i < patchName.value.length){
                asciiValues.push(patchName.value.charCodeAt(i));
            } else {
                asciiValues.push(32)
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
    const color = index % 2 === 0 ? '#53bfeb' : '#9f18fd';
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

    loopTableFull.style.display = 'grid';
    loopTableFull.style.backgroundColor = index % 2 === 0
        ? 'rgba(83, 191, 235, 0.5)'
        : 'rgba(159, 24, 253, 0.5)';
    loopTableFull.style.fontWeight = 'bold';
    loopTableFull.style.padding = '10px';
    loopTableFull.style.marginLeft = '20vh';
    loopTableFull.style.borderRadius = '10px';
    loopTableFull.style.width = '50vh';
    loopTableFull.style.justifyContent = 'space-evenly';

    loopTable.innerHTML = '';
    loopTable.style.display = 'grid';

    loopTable.style.columnGap = '80px';
    loopTable.style.rowGap = '10px';

    // Verificar a resposta MIDI e determinar a quantidade de loops
    let loopNumbers = ['1', '5', '2', '6', '3', '7', '4', '8'];
    if (nomeControladora === "supernova") {
        loopNumbers = ['1', '2', '3', '4']; // Ajuste para 4 loops
        loopTable.style.gridTemplateColumns = '1fr';
    } else {
        loopTable.style.gridTemplateColumns = '1fr 1fr'; // Duas colunas
    }

    loopNumbers.forEach((i) => {
        switch (states[i - 1]) {
            case 0:
                states[i - 1] = 'OFF';
                break;
            case 1:
                states[i - 1] = 'ON';
                break;
            case 2:
                states[i - 1] = 'NUL';
                break;
            case 3:
                states[i - 1] = 'TGL';
                break;
            default:
                states[i - 1] = 'erro'
                break;
        }

        const loopContainer = document.createElement('div');
        loopContainer.style.display = 'flex';
        if (nomeControladora === "supernova") {
            loopContainer.style.justifyContent = 'space-evenly';
            loopContainer.style.width = '30vh';
        } else {
            loopContainer.style.justifyContent = 'space-between';
        }

        loopContainer.style.alignItems = 'center';

        const loopLabel = document.createElement('span');
        loopLabel.textContent = `Loop ${i}`;
        loopLabel.style.color = '#fff';
        loopLabel.style.marginRight = '10px';

        const loopButton = document.createElement('span-button');
        loopButton.textContent = states[i - 1];
        loopButton.style.color =
            states[i - 1] === 'ON' ? 'lime' :
            states[i - 1] === 'NUL' ? 'yellow' :
            states[i - 1] === 'TGL' ? 'white' :
            'red';
        loopButton.style.cursor = 'pointer';
        loopButton.style.fontWeight = 'bold';

        loopButton.addEventListener('click', () => {
            toggleState(loopButton, patchId, i);
            states = updateStates()
            sendMessage(states)
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
            presetOptions.style.position = 'absolute';
            presetOptions.style.left = `${e.clientX}px`;
            presetOptions.style.top = `${e.clientY}px`;

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

// Remote Switch
async function createTableRemoteSwitch(patchId, index) {
    sendMessage([0xF0, 0x04, 0x00, 0xF7]);

    const loopTable = document.getElementById('remote-table');
    const loopTableFull = document.getElementById('table-3');

    await delay(200);

    let states = remotes;

    loopTableFull.style.display = 'grid';
    loopTableFull.style.backgroundColor = index % 2 === 0
        ? 'rgba(83, 191, 235, 0.5)'
        : 'rgba(159, 24, 253, 0.5)';
    loopTableFull.style.fontWeight = 'bold';
    loopTableFull.style.padding = '10px';
    loopTableFull.style.marginLeft = '20vh';
    loopTableFull.style.marginTop = '30px';
    loopTableFull.style.borderRadius = '10px';
    loopTableFull.style.width = '50vh';
    loopTableFull.style.justifyContent = 'space-evenly';

    loopTable.innerHTML = '';
    loopTable.style.display = 'grid';

    loopTable.style.columnGap = '80px';
    loopTable.style.rowGap = '10px';

    const loopNumbers = ['1', '2', '3', '4']; // Ajuste para 4 loops

    loopNumbers.forEach((i) => {
        switch (states[i - 1]) {
            case 0:
                states[i - 1] = 'OFF';
                break;
            case 1:
                states[i - 1] = 'ON';
                break;
            case 2:
                states[i - 1] = 'NUL';
                break;
            case 3:
                states[i - 1] = 'TGL';
                break;
        }

        const loopContainer = document.createElement('div');
        loopContainer.style.display = 'flex';
        if (nomeControladora === "supernova") {
            loopContainer.style.justifyContent = 'space-evenly';
            loopContainer.style.width = '30vh';
        } else {
            loopContainer.style.justifyContent = 'space-between';
        }

        loopContainer.style.alignItems = 'center';

        const loopLabel = document.createElement('span');
        switch (i) {
            case '1':
                loopLabel.textContent = 'Rmt Switch 1 Tip:';
                break;
            case '2':
                loopLabel.textContent = 'Rmt Switch 1 Ring:';
                break;
            case '3':
                loopLabel.textContent = 'Rmt Switch 2 Tip:';
                break;
            default:
                loopLabel.textContent = 'Rmt Switch 2 Ring:';
                break;
        }
        loopLabel.style.color = '#fff';
        loopLabel.style.marginRight = '10px';

        const loopButton = document.createElement('span-button');
        loopButton.textContent = states[i - 1];
        loopButton.style.color =
            states[i - 1] === 'ON' ? 'lime' :
            states[i - 1] === 'NUL' ? 'yellow' :
            states[i - 1] === 'TGL' ? 'white' :
            'red';
        loopButton.style.cursor = 'pointer';
        loopButton.style.fontWeight = 'bold';

        loopButton.addEventListener('click', () => {
            toggleState(loopButton, patchId, i);
            states = updateStatesRemote()
            sendMessage(states)
        });

        loopContainer.appendChild(loopLabel);
        loopContainer.appendChild(loopButton);
        loopTable.appendChild(loopContainer);
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
        midiAccess = await navigator.requestMIDIAccess({ sysex: true });
        initializeSite();
        // Iniciar a execução repetida
        intervalId = setInterval(() => {
            if (!isExecuting) {
                heartBeat();
            }
        }, 200);
        
        // Alterar o texto do botão
        button.textContent = "Disconnect";
    } else {
        // Parar a execução repetida
        clearInterval(intervalId);
        intervalId = null;

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

    } catch (error) {
        alert("Erro ao enviar mensagem MIDI: " + error);
    } finally {
        isExecuting = false;  // Marcar a execução como finalizada
    }
}




























// Cria a tabela MIDI
let currentOpenMidiPopup = null;
function createMidiTable(patchId, index) {
    const midiTable = document.getElementById('midi-table');
    const midiTableFull = document.getElementById('table-2');

    midiTableFull.style.display = 'grid';
    midiTableFull.style.backgroundColor = index % 2 === 0
        ? 'rgba(83, 191, 235, 0.5)'
        : 'rgba(159, 24, 253, 0.5)';
    midiTableFull.style.fontWeight = 'bold';
    midiTableFull.style.padding = '10px';
    midiTableFull.style.marginLeft = '20vh';
    midiTableFull.style.marginTop = '5vh';
    midiTableFull.style.borderRadius = '10px';
    midiTableFull.style.width = '50vh';
    
    midiTable.innerHTML = ''; // Limpa a tabela MIDI
    midiTable.style.display = 'grid';
    midiTable.style.gridTemplateColumns = '1fr 1fr'; // Divide em duas colunas
    midiTable.style.columnGap = '30px';
    midiTable.style.rowGap = '10px';

    const states = loadMidiStates(patchId);

    // Cria as linhas da tabela MIDI
    for (let i = 0; i < 10; i++) {
        const midiRow = document.createElement('div');
        midiRow.className = 'midi-row';
        midiRow.style.display = 'flex';
        midiRow.style.justifyContent = 'space-between';
        midiRow.style.alignItems = 'center';
    
        // Cria o botão principal MIDI
        const midiButton = document.createElement('span');
        midiButton.textContent = states[i]?.type || 'OFF';
        midiButton.className = 'toggle';
        midiButton.style.color = midiButton.textContent === 'OFF' ? 'red' : 'lime';
    
        // Cria o popup ao clicar
        midiButton.addEventListener('click', (e) => {
            e.stopPropagation();
            createMidiPopup(midiButton, patchId, i);
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
                detailButton.style.marginLeft = '10px';
                detailButton.style.padding = '5px 10px';
                detailButton.style.borderRadius = '5px';
                detailButton.style.cursor = 'pointer';
        
                detailButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rangeStart = idx === 0 ? 1 : 0;
                    const rangeEnd = idx === 0 ? 16 : 127;
                    createValuePopup(detailButton, rangeStart, rangeEnd, (selectedValue) => {
                        detailButton.textContent = selectedValue.toString(); // Atualiza no front
                        
                        // Salva no banco
                        states[i].values[idx] = selectedValue;
                        localStorage.setItem(`${patchId}_midi`, JSON.stringify(states));
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
function createMidiPopup(midiButton, patchId, index) {

    // Fecha outros popups
    if (currentOpenMidiPopup) {
        currentOpenMidiPopup.style.display = 'none';
    }

    // Cria o popup
    let midiPopup = midiButton.querySelector('.popup-options');
    if (!midiPopup) {
        midiPopup = document.createElement('div');
        midiPopup.className = 'popup-options';

        const rect = midiButton.getBoundingClientRect();
        const popupHeight = 200;

        let top = rect.bottom;
        let left = rect.left;

        // Impede do popup "sair" da janela
        if (top + popupHeight > window.innerHeight) {
            top = Math.max(rect.top - popupHeight, 0);
        }

        midiPopup.style.top = `${top}px`;
        midiPopup.style.left = `${left}px`;

        midiPopup.style.maxWidth = '100px';
        midiPopup.style.maxHeight = '200px';
        midiPopup.style.overflowY = 'auto';
        midiPopup.style.overflowX = 'hidden';
        midiPopup.style.scrollbarWidth = 'none';

        // Adiciona as opções OFF e PC no popup
        ['OFF', 'PC'].forEach((option) => {
            const optionButton = document.createElement('button');
            optionButton.textContent = option;
            optionButton.style.marginRight = '10px';
            optionButton.style.width = '80px';
            optionButton.addEventListener('click', () => {
                handleMidiSelection(option, midiButton, patchId, index);
                midiPopup.style.display = 'none';
            });
            midiPopup.appendChild(optionButton);
        });

        // Adiciona as opções CCs no popup
        for (let i = 0; i <= 127; i++) {
            const optionButton = document.createElement('button');
            let option = `CC${i}`;
            optionButton.textContent = option;
            optionButton.style.marginRight = '10px';
            optionButton.style.width = '80px';
            optionButton.addEventListener('click', () => {
                handleMidiSelection(option, midiButton, patchId, index);
                midiPopup.style.display = 'none';
            });
            midiPopup.appendChild(optionButton);
        }

        midiButton.appendChild(midiPopup);
    }

    // Mostra o popup
    midiPopup.style.display = 'block';
    currentOpenMidiPopup = midiPopup;

    // Fecha o popup se clicar fora
    document.addEventListener(
        'click',
        (e) => {
            if (!midiPopup.contains(e.target)) {
                midiPopup.style.display = 'none';
                currentOpenMidiPopup = null;
            }
        },
        { once: true }
    );
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
            localStorage.setItem(`${patchId}_midi`, JSON.stringify(states)); // Salva no banco
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
        localStorage.setItem(`${patchId}_midi`, JSON.stringify({ type: 'OFF', values: [] }));
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
    localStorage.setItem(`${patchId}_midi`, JSON.stringify(states));
}

// Cria popup pro valor e canal
function createValuePopup(detailButton, rangeStart, rangeEnd, onSelectCallback) {

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
    valuePopup.style.width = '60px';
    valuePopup.style.textAlign = 'center';

    // Impede popup de "sair" da tela
    const rect = detailButton.getBoundingClientRect();
    const popupHeight = 200;
    const popupWidth = 60;

    let top = rect.bottom;
    let left = rect.left;

    if (top + popupHeight > window.innerHeight) {
        top = Math.max(rect.top - popupHeight, 0); 
    }
    
    if (left + popupWidth > window.innerWidth) {
        left = Math.max(window.innerWidth - popupWidth, 0);
    }

    valuePopup.style.top = `${top}px`;
    valuePopup.style.left = `${left}px`;
    
    // Adiciona numeros ao popup
    for (let i = rangeStart; i <= rangeEnd; i++) {
        const valueButton = document.createElement('button');
        valueButton.textContent = i.toString();
        valueButton.style.display = 'block';
        valueButton.style.width = '100%';
        valueButton.style.marginBottom = '5px';
        valueButton.style.padding = '5px';
        valueButton.style.cursor = 'pointer';

        // Salva e esconde o popup
        valueButton.addEventListener('click', () => {
            onSelectCallback(i);
            valuePopup.remove();
        });

        valuePopup.appendChild(valueButton);
    }

    // Adiciona EXP1 e EXP2 no primeiro botão
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
            valueButton.addEventListener('click', () => {
                onSelectCallback(option);
                valuePopup.remove();
            });
    
            valuePopup.appendChild(valueButton);
        });
    }

    // Acopla o popup ao site
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

// Salva do tabela no banco
function loadMidiStates(patchId) {
    const savedStates = localStorage.getItem(`${patchId}_midi`);
    return savedStates
        ? JSON.parse(savedStates)
        : Array(10).fill({ type: 'OFF', values: [] });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
