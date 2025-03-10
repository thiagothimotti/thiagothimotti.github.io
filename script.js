let midiAccess;

let lastMessage = [];

let loops = [];

let remotes = [];

let patchName;

let patchesNames = [];

let currentBankLetter = null;

let activePatch = null;

let isProcessingPatch = false; // Flag para impedir cliques multiplos

let loopsNames = [];
let loopsNamesChars = [];

let remoteNames = [];
let remoteNamesChars = [];

let midiChannelNames = [];
let midiChannelNamesChars = [];
let midiChannelMap = {};

let midiChannelNames2 = [];
let midiChannelNamesChars2 = [];
let midiChannelMap2 = {};

let midiChannelNames3 = [];
let midiChannelNamesChars3 = [];
let midiChannelMap3 = {};

let selectedButtonIndices = {
    'midi-table': 0,
    'midi-table-2': 0,
    'midi-table-3': 0
};

let advanced1 = [];
let advanced2 = [];
let advanced3 = [];
let usb1 = [];
let usb2 = [];
let air1 = [];
let air2 = [];
let air3 = [];

// Função base da inicialização do site
async function initializeSite() {

    setupMidiListener();
    sendMessage([0xF0,0x01,0x00,0xF7])

    while (nomeControladora === null) {
        console.log('Aguardando nomeControladora...');
        
        // Aqui você pode aguardar algum tempo antes de verificar novamente
        await new Promise(resolve => setTimeout(resolve, 100)); // espera 1 segundo
    }

    sendMessage([0xF0,0x1B,0x00,0xF7])
    sendMessage([0xF0,0x1C,0x00,0xF7])
    sendMessage([0xF0,0x1D,0x00,0xF7])
    sendMessage([0xF0,0x1E,0x00,0xF7])
    sendMessage([0xF0,0x1F,0x00,0xF7])

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
let swapping = false;
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

    // Criar um contêiner para os botões do Bank
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'bank-button-container';
    buttonContainer.style.display = 'inline-flex';
    buttonContainer.style.gap = '8px';
    buttonContainer.style.marginLeft = '10px';

    // Botão copy
    const copyIcon = document.createElement('i');
    copyIcon.className = 'fa-regular fa-copy bank-copy-icon';
    copyIcon.title = 'Copy Bank';
    copyIcon.style.display = 'none';
    copyIcon.style.cursor = 'pointer';
    copyIcon.style.marginTop = '4px';

    // Botão de colar
    const pasteIcon = document.createElement('i');
    pasteIcon.className = 'fa-regular fa-paste bank-paste-icon';
    pasteIcon.title = 'Paste Bank';
    pasteIcon.style.display = 'none';
    pasteIcon.style.cursor = 'pointer';

    // Ao clicar no copyIcon, salva o bank copiado e exibe todos os botões de paste
    copyIcon.onclick = () => {
        event.stopPropagation();
        copiedBank = `Bank ${letter}`;
        notify(`Bank ${letter} copied!`);

        // Esconder todos os botões Swap ao copiar
        document.querySelectorAll('.bank-swap-icon').forEach(icon => {
            const bankElement = icon.closest('.bank'); // Encontra o bank mais próximo
            if (bankElement && bankElement.dataset.letter == currentBankLetter) {
                icon.style.display = 'inline-block';
            } else {
                icon.style.display = 'none';
            }
        });

        // Exibir botões Paste em todos os outros Banks
        document.querySelectorAll('.bank-paste-icon').forEach(icon => {
            const bankElement = icon.closest('.bank'); // Encontra o bank mais próximo
            if (bankElement && bankElement.dataset.letter !== currentBankLetter) {
                icon.style.display = 'inline-block';
            } else {
                icon.style.display = 'none';
            }
        });
    };

    // Ao clicar no pasteIcon, envia mensagem, exibe alerta e oculta todos os botões de paste
    pasteIcon.onclick = () => {
        sendMessage([0xF0, 0x17, letter.charCodeAt(0) - 65, 0xF7]);
        notify(`Bank ${letter} updated with the content from ${copiedBank}`);
        document.querySelectorAll('.bank-paste-icon').forEach(icon => {
            icon.style.display = 'none';
        });
    };

    // Criar ícone de Swap para os Banks
    const swapIcon = document.createElement('i');
    swapIcon.className = 'fa-solid fa-rotate bank-swap-icon';
    swapIcon.title = 'Swap Bank';
    swapIcon.style.display = 'none';
    swapIcon.style.cursor = 'pointer';
    swapIcon.style.marginTop = '4px';

    // Evento de clique no Swap (seleciona um banco para troca)
    swapIcon.onclick = () => {
        if (swapping) {
            swapping = false;
            notify(`Switching Bank ${swapBank} with Bank ${letter}`);

            sendMessage([0xF0,0x18,letter-65,0xF7])

            // Esconder todos os botões Swap após a troca
            document.querySelectorAll('.bank-swap-icon').forEach(icon => {
                const bankElement = icon.closest('.bank'); // Encontra o bank mais próximo
                if (bankElement && bankElement.dataset.letter !== currentBankLetter) {
                    icon.style.display = 'inline-block';
                } else {
                    icon.style.display = 'none';
                }
            });
        } else {
            event.stopPropagation();
            swapping = true;
            swapBank = letter; // Armazena apenas a letra para facilitar a lógica
            notify(`Bank ${swapBank} selected for a swap`);
        
            // Esconder todos os botões Paste ao selecionar Swap
            document.querySelectorAll('.bank-paste-icon').forEach(icon => {
                icon.style.display = 'none';
            });
        
            // Exibir botões Swap em todos os outros Banks
            document.querySelectorAll('.bank-swap-icon').forEach(icon => {
                const bankElement = icon.closest('.bank'); // Encontra o bank mais próximo
                if (bankElement && bankElement.dataset.letter !== currentBankLetter) {
                    icon.style.display = 'inline-block';
                } else {
                    //icon.style.display = 'none';
                }
            });
        }
    };

    // Criar ícone de Clear (Resetar Bank)
    const clearIcon = document.createElement('i');
    clearIcon.className = 'fa-solid fa-xmark bank-clear-icon';
    clearIcon.title = 'Clear Bank';
    clearIcon.style.display = 'none';
    clearIcon.style.cursor = 'pointer';
    clearIcon.style.fontSize = '23px';
    clearIcon.style.marginLeft = '8px';

    // Evento de clique no Clear (resetar o Bank)
    clearIcon.onclick = () => {
        notify(`Bank ${letter} was reseted!`);
        sendMessage([0xF0, 0x19, 0x00, 0xF7]); // Enviar comando de reset
    };

    buttonContainer.appendChild(copyIcon);
    buttonContainer.appendChild(pasteIcon);
    buttonContainer.appendChild(swapIcon);
    buttonContainer.appendChild(clearIcon);

    // Agora, adicionamos o container ao Bank
    bank.appendChild(buttonContainer);

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

let copiedBank = null; // Variável global para armazenar o banco copiado
let swapBank = null;
// Lida com a seleção de um banco
function bankSelect(bank, bankDetails, index) {
    bank.addEventListener('click', () => {

        activePatch = null;

        const patchCopyIcon = document.getElementById('patch-copy-icon');
        if (patchCopyIcon) {
            patchCopyIcon.remove();
        }
        const patchSwapIcon = document.getElementById('patch-swap-icon');
        if (patchSwapIcon) {
            patchSwapIcon.remove();
        }
        const patchClearIcon = document.getElementById('patch-clear-icon');
        if (patchClearIcon) {
            patchClearIcon.remove();
        }

        const isActive = bank.classList.contains('active');

        document.querySelectorAll('.table-section').forEach(table => {
            table.style.display = 'none';
        });
        document.getElementById('patchTitle').style.display = 'none';
        document.getElementById('saveButton').style.display = 'none';
        document.getElementById('cancelButton').style.display = 'none';
        
        // Atualiza a variável global com a letra do banco atual
        if (!isActive) {
            currentBankLetter = bank.dataset.letter; // Atribui a letra do banco atual
            console.log(`Banco selecionado: ${currentBankLetter}`);

            // Remove a configuração antiga se existir
            const existingConfig = document.getElementById('bnkCfg');
            if (existingConfig) existingConfig.remove();

            // Chama createBnkCfg passando a letra do banco
            createBnkCfg(currentBankLetter);
        } else {
            //currentBankLetter = null; // Nenhum banco ativo
        }
        //alert([0xF0, 0x0B, currentBankLetter.charCodeAt(0) - 65, 0xF7])

        // Envia mensagens MIDI relacionadas ao banco
        sendMessage([0xF0, 0x09, index - 65, 0, 0xF7]);
        sendMessage([0xF0, 0x0A, index - 65, 0xF7]);
        sendMessage([0xF0, 0x10, currentBankLetter.charCodeAt(0) - 65, 0xF7]);
        sendMessage([0xF0, 0x0B, currentBankLetter.charCodeAt(0) - 65, 0xF7]);

        // Remove o estado ativo e oculta o ícone de copiar de todos os bancos
        document.querySelectorAll('.bank').forEach(b => {
            b.classList.remove('active');
            b.style.backgroundColor = '';
            const copyIcon = b.querySelector('.bank-copy-icon');
            if (copyIcon) {
                copyIcon.style.display = 'none';
            }
            const pasteIcon = b.querySelector('.bank-paste-icon');
            if (pasteIcon) {
                pasteIcon.style.display = 'none';
            }
            const swapIcon = b.querySelector('.bank-swap-icon');
            if (swapIcon) {
                swapIcon.style.display = 'none';
            }
            const clearIcon = b.querySelector('.bank-clear-icon');
            if (clearIcon) {
                clearIcon.style.display = 'none';
            }
            const arrow = b.querySelector('span:last-child');
            arrow.style.transform = 'rotate(-90deg) scale(1.8)';
        });

        document.querySelectorAll('.bank-details').forEach(details => details.style.display = 'none');

        if (!isActive) {
            bank.style.backgroundColor = index % 2 === 0
                ? 'rgba(83, 191, 235, 0.5)'
                : 'rgba(159, 24, 253, 0.5)';
            bank.classList.add('active');
            const arrow = bank.querySelector('span:last-child');
            arrow.style.transform = 'rotate(90deg) scale(1.8)';
            bankDetails.style.display = 'block';
            // Exibe o ícone de copiar para o banco selecionado
            const copyIcon = bank.querySelector('.bank-copy-icon');
            if (copyIcon) {
                copyIcon.style.display = 'inline-block';
            }
            const swapIcon = bank.querySelector('.bank-swap-icon');
            if (swapIcon) {
                swapIcon.style.display = 'inline-block';
            }
            const clearIcon = bank.querySelector('.bank-clear-icon');
            if (clearIcon) {
                clearIcon.style.display = 'inline-block';
            }
        }
        swapping = false;
    });
}

function createBnkCfg(letter) {
    const bnkCfg = document.createElement('div');
    bnkCfg.id = 'bnkCfg';
    bnkCfg.style.position = 'absolute';
    bnkCfg.style.right = '20px';
    bnkCfg.style.top = '50%';
    bnkCfg.style.transform = 'translateY(-50%)';
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

    titleRow.innerHTML = `<span style="color: #53bfeb;">Bank ${letter}</span> <span style="color: white;">Configuration</span>`;
    
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
                for (let letterAux = 65; letterAux <= 90; letterAux++) {
                    if (String.fromCharCode(letterAux) != letter){
                        options.push(`Load from ${String.fromCharCode(letterAux)}`);
                    }
                }
            } else {
                options.push('Locked');
                for (let letterAux = 65; letterAux <= 90; letterAux++) {
                    if (String.fromCharCode(letterAux) != letter){
                    options.push(`Load from ${String.fromCharCode(letterAux)}`);
                        for (let num = 1; num <= 8; num++) {
                            options.push(`Load from ${String.fromCharCode(letterAux)}${num}`);
                        }
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
                const selectedValues = Array.from(document.querySelectorAll('#bnkCfg button'))
                    .map(btn => btn.textContent)
                //alert(`Valores atuais: ${selectedValues}`);
                let data = []; // Cria um array vazio

                selectedValues.forEach((value, index) => {
                    if (value == 'OFF'){
                        data.push(0)
                    } else if (value == 'Locked'){
                        data.push(1)
                    } else if (index < 2){
                        let aux = value.slice(-1).charCodeAt(0);
                        data.push(aux - 64)
                    } else {
                        let aux = value.replace("Load from ", "");
                        if (aux.length === 1) {
                            aux = (aux.charCodeAt(0) - 65) * 9 + 2;
                        } else {
                            aux = (aux.charCodeAt(0) - 65) * 9 + parseInt(aux[1]) + 2;
                        }
                        data.push(aux)
                    }
                });
                //alert(data[2])
                //alert([...data].map(num => Number(num).toString(2).padStart(8, '0')).join(' '))
                sendMessage([0xF0,0x0C, currentBankLetter.charCodeAt(0)-65,data[0],data[1],
                    data[2]&0b00001111,((data[2] & 0b11110000) >> 4),data[3]&0b00001111,((data[3]&0b11110000)>>4) ,0xF7])
                valuePopup.remove();
            });

            valuePopup.appendChild(valueButton);
        });
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
let copiedPatchId = null; // Armazena o ID do patch copiado
let swapPatchId = null; // Armazena o ID do patch para troca (swap)
function createBankPatches(letter, index) {
    const bankDetails = document.createElement('div');
    bankDetails.className = 'bank-details';

    const patchList = document.createElement('ul');

    let size = 8;
    if (nomeControladora === 'supernova') {
        size = 5;
    }

    for (let j = 1; j <= size; j++) {
        const patchId = `${letter}${j}`; // Identificador do patch
        const patchItem = createPatch(letter, j, index);
        const inputElement = patchItem.querySelector('input');
        patchItem.dataset.patchId = patchId;

        // Botão de colar (inicialmente oculto)
        const pasteButton = document.createElement('button');
        pasteButton.className = 'paste-button';
        pasteButton.style.display = 'none'; // Oculto por padrão

        // Usando o ícone de paste da Font Awesome
        const pasteIcon = document.createElement('i');
        pasteIcon.className = 'fa-regular fa-paste';
        pasteIcon.style.fontSize = '20px';
        pasteButton.appendChild(pasteIcon);

        pasteButton.onclick = async () => {
            if (copiedPatchId) {
                sendMessage([0xF0,0x09,copiedPatchId.charCodeAt(0)-65,copiedPatchId.slice(-1),0xF7])
                await(2000)
                //alert(copiedPatchId)
                sendMessage([0xF0, 0x15, letter.charCodeAt(0)-65, j, 0xF7])

                // Esconde todos os botões "Paste" ao clicar em um
                document.querySelectorAll('.paste-button').forEach(button => {
                    button.style.display = 'none';
                });
            }
        };

        patchItem.appendChild(pasteButton);

        const swapButton = document.createElement('button');
        swapButton.className = 'swap-button';
        swapButton.style.display = 'none';

        const swapIcon = document.createElement('i');
        //swapIcon.className = 'fa-solid fa-rotate';
        swapIcon.className = 'fa-solid fa-arrows-rotate';
        swapIcon.style.fontSize = '20px';
        swapButton.appendChild(swapIcon);

        swapButton.onclick = () => {
            if (swapPatchId) {
                sendMessage([0xF0,0x09,swapPatchId.charCodeAt(0)-65,swapPatchId.slice(-1),0xF7])
                notify(`Switching ${swapPatchId} with ${patchId}`);
                document.querySelectorAll('.swap-button').forEach(button => {
                    button.style.display = 'none';
                });
                //sendMessage([0xF0,0x16,swapPatchId.charCodeAt(0)-65,swapPatchId.slice(1),0xF7])
                sendMessage([0xF0,0x16,patchId.charCodeAt(0)-65,patchId.slice(1),0xF7])
            }
        };

        patchItem.appendChild(swapButton);
 
        patchItem.addEventListener('click', async () => {
            if (isProcessingPatch || activePatch === patchId) return;

            isProcessingPatch = true;

            activePatch = letter + j;

            document.getElementById('patchTitle').style.display = 'flex';

            selectedButtonIndices = {
                'midi-table': 0,
                'midi-table-2': 0,
                'midi-table-3': 0
            };

            const patchNameValue = inputElement.value || `Patch ${patchId}`;
            const selectedPatchText = document.getElementById('selectedPatch');
            const selectedPatchType = document.getElementById('patchType');
            selectedPatchText.textContent = inputElement.value 
                ? `${patchId} - ${patchNameValue}` 
                : `Patch ${patchId}`;

            const type = localStorage.getItem(`${letter}${j}_type`) || 'Preset';
            selectedPatchType.textContent = `(${type})`;

            // Remove ícone de cópia para ser recriado pertencendo a esse patch
            const existingCopyIcon = document.getElementById('patch-copy-icon');
            const existingSwapIcon = document.getElementById('patch-swap-icon');
            const existingClearIcon = document.getElementById('patch-clear-icon');
            if (existingCopyIcon) existingCopyIcon.remove();
            if (existingSwapIcon) existingSwapIcon.remove();
            if (existingClearIcon) existingClearIcon.remove();

            // Cria um novo ícone de cópia
            const patchCopyIcon = document.createElement('i');
            patchCopyIcon.id = 'patch-copy-icon';
            patchCopyIcon.className = 'fa-regular fa-copy';
            patchCopyIcon.title = 'Copy Patch';
            patchCopyIcon.style.position = 'absolute';
            patchCopyIcon.style.cursor = 'pointer';
            patchCopyIcon.style.fontSize = '20px';

            patchCopyIcon.onclick = () => {
                copiedPatchId = patchId;
                notify(`Patch ${patchId} Copied!`);

                document.querySelectorAll('.swap-button').forEach(button => {
                    button.style.display = 'none';
                });

                document.querySelectorAll('.paste-button').forEach(button => {
                    if (button.parentNode.dataset.patchId !== copiedPatchId) {
                        button.style.display = 'inline-block';
                    } else {
                        button.style.display = 'none';
                    }
                });
            };

            // Cria um novo ícone de swap
            const patchSwapIcon = document.createElement('i');
            patchSwapIcon.id = 'patch-swap-icon';
            //patchSwapIcon.className = 'fa-solid fa-rotate';
            patchSwapIcon.className = 'fa-solid fa-arrows-rotate';
            patchSwapIcon.title = 'Swap Patch';
            patchSwapIcon.style.position = 'absolute';
            patchSwapIcon.style.cursor = 'pointer';
            patchSwapIcon.style.fontSize = '20px';
            patchSwapIcon.style.marginLeft = '30px';

            patchSwapIcon.onclick = () => {
                swapPatchId = patchId;
                notify(`${patchId} selected for a swap`);

                document.querySelectorAll('.paste-button').forEach(button => {
                    button.style.display = 'none';
                });

                document.querySelectorAll('.swap-button').forEach(button => {
                    if (button.parentNode.dataset.patchId !== swapPatchId) {
                        button.style.display = 'inline-block';
                    } else {
                        button.style.display = 'none';
                    }
                });
            };

            // Cria um novo ícone de clear
            const patchClearIcon = document.createElement('i');
            patchClearIcon.id = 'patch-clear-icon';
            patchClearIcon.className = 'fa-solid fa-xmark';
            patchClearIcon.title = 'Clear Patch';
            patchClearIcon.style.position = 'absolute';
            patchClearIcon.style.cursor = 'pointer';
            patchClearIcon.style.fontSize = '25px';
            patchClearIcon.style.marginLeft = '50px';

            patchClearIcon.onclick = () => {
                notify(`Patch ${patchId} reseted!`);
                sendMessage([0xF0, 0x14, letter.charCodeAt(0) - 65, j, 0xF7]);
            };

            const mainContent = document.getElementById('mainContent');
            mainContent.appendChild(patchCopyIcon);
            mainContent.appendChild(patchSwapIcon);
            mainContent.appendChild(patchClearIcon);

            const rect = selectedPatchText.getBoundingClientRect();
            const mainRect = mainContent.getBoundingClientRect();
            const scrollY = mainContent.scrollTop;
            const scrollX = mainContent.scrollLeft;

            patchCopyIcon.style.top = `${rect.top - mainRect.top + scrollY}px`;
            patchCopyIcon.style.left = `${rect.right - mainRect.left + scrollX + 50}px`;
            patchSwapIcon.style.top = patchCopyIcon.style.top;
            patchSwapIcon.style.left = `${parseInt(patchCopyIcon.style.left) + 20}px`;
            patchClearIcon.style.top = `${parseInt(patchCopyIcon.style.top) - 2}px`;
            patchClearIcon.style.left = `${parseInt(patchSwapIcon.style.left) + 20}px`;


            patchChange(letter, j);

            sendMessage([0xF0, 0x06, 0x00, 0xF7]);
            const existingTable = document.getElementById('bnkCfg');
            if (existingTable) {
                existingTable.remove();
            }
            createBnkCfg(letter);

            sendMessage([0xF0,0x10,currentBankLetter.charCodeAt(0)-65,0xF7])

            await delay(200);
            sendMessage([0xF0, 0x0B, letter.charCodeAt(0) - 65, 0xF7]);

            sendMessage([0xF0, 0x0D, 0x00, 0x00, 0xF7]); 
            sendMessage([0xF0, 0x0D, 0x01, 0x00, 0xF7]);
            sendMessage([0xF0, 0x0D, 0x02, 0x00, 0xF7]);

            createLoopTable(patchId, index);
            createTableRemoteSwitch(patchId, index);
            createMidiTable(patchId, index, "midi-table");
            createMidiTable(patchId, index, "midi-table-2");
            createMidiTable(patchId, index, "midi-table-3");
            document.getElementById('saveButton').style.display = 'inline-block';
            document.getElementById('cancelButton').style.display = 'inline-block';

            setTimeout(() => {
                isProcessingPatch = false; // Libera para novos cliques
            }, 300);
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

    advanced1 = [];
    advanced2 = [];
    advanced3 = [];
    usb1 = [];
    usb2 = [];
    air1 = [];
    air2 = [];
    air3 = [];

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
        // alert (inputs[0].name)
        // alert (inputs[0].manufacturer)

        if (inputs.length === 0) {
            console.log("Nenhum dispositivo MIDI de entrada encontrado.");
            return;
        }

        // Detecta se é um dispositivo saturno
        let aux = 0;
        let input = null;
        while(aux >= 0){
            if (inputs[aux].name === 'Saturno Pedais'){
                input = inputs[aux];
                aux = -1;
            } else aux++;
        }

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
                        sendMessage([0xF0,0x0A,currentBankLetter.charCodeAt(0)-65,0xF7]);
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
                                    buttons[i].textContent = `Load from ${String.fromCharCode(sysexData[i]+64)}`;
                                    buttons[i].style.color = 'lime';
                                }
                            }
                        }
                        //alert([...sysexData].map(num => Number(num).toString(2).padStart(8, '0')).join(' '));
                        sysexData[2] = sysexData[2]+(sysexData[3]<<4)
                        sysexData[3] = sysexData[4]+(sysexData[5]<<4)
                        //alert([...sysexData].map(num => Number(num).toString(2).padStart(8, '0')).join(' '));
                        for (let i=2; i<4; i++){
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
                                    if (patchToGo == 0) buttons[i].textContent = `Load from ${bankToGo}`; 
                                    else buttons[i].textContent = `Load from ${bankToGo}${patchToGo}`;                                        buttons[i].style.color = 'lime';
                                    break;
                            }
                            
                        }
                        break;
                    case 0x0D:

                        const tableMapping = {
                            0: "midi-table",
                            1: "midi-table-2",
                            2: "midi-table-3"
                        };
                        
                        const tableId = tableMapping[sysexData[1]];

                        const novaOrdem = [
                            0,1,2, 15,16,17, 3,4,5, 18,19,20, 6,7,8, 21,22,23, 9,10,11, 27,28,29, 12,13,14,24,25,26, 
                        ];
                        
                        const results = novaOrdem.map(index => sysexData.slice(3)[index]);

                        if (sysexData[1] === 0) {
                            if (sysexData[2] === 0 && advanced1.length !== 0){
                                fillMidiTable(advanced1, tableId);
                                break;
                            }else if (sysexData[2] === 1 && advanced2.length !== 0){
                                fillMidiTable(advanced2, tableId);
                                break;
                            }else if (sysexData[2] === 2 && advanced3.length !== 0){
                                fillMidiTable(advanced3, tableId);
                                break;
                            }
                        } else if (sysexData[1] === 1) {
                            if (sysexData[2] === 0 && usb1.length !== 0){
                                fillMidiTable(usb1, tableId);
                                break;
                            }else if (sysexData[2] === 1 && usb2.length !== 0){
                                fillMidiTable(usb2, tableId);
                                break;
                            }
                        } else if (sysexData[1] === 2) {
                            if (sysexData[2] === 0 && air1.length !== 0){
                                fillMidiTable(air1, tableId);
                                break;
                            }else if (sysexData[2] === 1 && air2.length !== 0){
                                fillMidiTable(air2, tableId);
                                break;
                            }else if (sysexData[2] === 2 && air3.length !== 0){
                                fillMidiTable(air3, tableId);
                                break;
                            }
                        }
                        
                        if (tableId) {
                            const values = sysexData.slice(3);
                            fillMidiTable(results, tableId);
                        }
                        break;
                    
                    case 0x10:
                        console.log(sysexData.slice(1));
                        updatePatchTypes(currentBankLetter, sysexData.slice(1));
                        break;

                    case 0x12:
                        notify("Changes saved", 'success')
                        break;

                    case 0x13:
                        notify("Changes canceled")
                        const selectedPatch = document.querySelector(`.bank-details li[data-patch-id="${activePatch}"]`);
                        if (selectedPatch) {
                            activePatch = null;
                            selectedPatch.click();
                        } else {
                            console.warn("Nenhum patch selecionado para simular o clique.");
                        }
                        break;
                    
                    case 0x14:
                        notify("Clear")
                        const actualPatch = document.querySelector(`.bank-details li[data-patch-id="${activePatch}"]`);
                        if (actualPatch) {
                            activePatch = null;
                            actualPatch.click();
                        } else {
                            console.warn("Nenhum patch selecionado para simular o clique.");
                        }
                        break;

                    case 0x1B:
                        loopsNames = sysexData.slice(1);
                        loopsNamesChars = Array.from(loopsNames).map(num => String.fromCharCode(num));
                        break;
                    case 0x1C:
                        remoteNames = sysexData.slice(1);
                        remoteNamesChars = Array.from(remoteNames).map(num => String.fromCharCode(num));
                        break;

                    case 0x1D:
                        midiChannelNames = sysexData.slice(1);
                        midiChannelNamesChars = Array.from(midiChannelNames).map(num => String.fromCharCode(num));
                        for (let i = 0; i < midiChannelNamesChars.length; i += 2) {
                            let key = midiChannelNamesChars[i] + midiChannelNamesChars[i + 1];  // Concatenando os dois valores como chave
                            if (key.trim() !== "") {
                                midiChannelMap[key] = Math.floor(i / 2) + 1;  // Atribuindo um valor crescente de 1 a 16
                            }
                        }
                        for (let key in midiChannelMap) {
                            let value = midiChannelMap[key];
                            midiChannelMap[value] = key;  // Adiciona o par inverso (valor-chave)
                        }
                        //alert(JSON.stringify(midiChannelMap, null, 2));
                        break;
                    case 0x1E:
                        midiChannelNames2 = sysexData.slice(1);
                        midiChannelNamesChars2 = Array.from(midiChannelNames2).map(num => String.fromCharCode(num));
                        for (let i = 0; i < midiChannelNamesChars2.length; i += 2) {
                            let key = midiChannelNamesChars2[i] + midiChannelNamesChars2[i + 1];  // Concatenando os dois valores como chave
                            if (key.trim() !== "") {
                                midiChannelMap2[key] = Math.floor(i / 2) + 1;  // Atribuindo um valor crescente de 1 a 16
                            }
                        }
                        for (let key in midiChannelMap2) {
                            let value = midiChannelMap2[key];
                            midiChannelMap2[value] = key;  // Adiciona o par inverso (valor-chave)
                        }
                        //alert(JSON.stringify(midiChannelMap2, null, 2));
                        break;
                    case 0x1F:
                        midiChannelNames3 = sysexData.slice(1);
                        midiChannelNamesChars3 = Array.from(midiChannelNames3).map(num => String.fromCharCode(num));
                        for (let i = 0; i < midiChannelNamesChars3.length; i += 2) {
                            let key = midiChannelNamesChars3[i] + midiChannelNamesChars3[i + 1];  // Concatenando os dois valores como chave
                            if (key.trim() !== "") {
                                midiChannelMap3[key] = Math.floor(i / 2) + 1;  // Atribuindo um valor crescente de 1 a 16
                            }
                        }
                        for (let key in midiChannelMap3) {
                            let value = midiChannelMap3[key];
                            midiChannelMap3[value] = key;  // Adiciona o par inverso (valor-chave)
                        }
                        //alert(JSON.stringify(midiChannelMap3, null, 2));
                        break;

                    default:
                        break;
                }
                console.log('removendo ', lastMessage[0])
                lastMessage.shift()
            } else {
                console.log("Mensagem MIDI não SysEx recebida:", message.data);
            }
        };
    } catch (error) {
        console.error("Erro ao configurar o listener MIDI:", error);
    }
}

function fillMidiTable(values, tableId) {
    if (values.length !== 30) {
        console.error("A função requer exatamente 30 valores.");
        return;
    }

    const midiTable = document.getElementById(tableId);
    if (!midiTable) {
        console.error("Tabela não encontrada: ", tableId);
        return;
    }

    midiTable.innerHTML = ''; // Limpa a tabela antes de preencher
    for (let i = 0; i < 10; i++) {
        values[i*3+1]=(values[i*3+1]&0b01111111)+((values[i*3+2]&0b00100000)<<2)
        values[i*3+0]=(values[i*3+0]&0b01111111)+((values[i*3+2]&0b00010000)<<3)
        values[i*3+2]=values[i*3+2]&0b00001111
    }
    //alert([...values])
    
    for (let i = 0; i < 30; i += 3) {
        const midiRow = document.createElement('div');
        midiRow.className = 'midi-row';
        midiRow.style.display = 'flex';
        midiRow.style.maxHeight = '17px';
        midiRow.style.maxWidth = '120px';

        const midiButton = document.createElement('span');
        midiButton.textContent = values[i] === 0 ? 'OFF' : values[i] === 1 ? 'PC' : `CC${values[i] - 2}`;
        midiButton.className = 'toggle';
        midiButton.style.color = midiButton.textContent === 'OFF' ? 'red' : 'lime';
        midiButton.style.cursor = 'pointer';
        midiButton.style.minWidth = '30px';
        midiButton.style.maxWidth = '30px';

        midiButton.addEventListener('click', () => {
            createMidiPopup(midiButton, values, i, tableId);
        });

        midiRow.appendChild(midiButton);
        //alert(values)

        for (let j = 0; j < 2; j++) {
            const detailButton = document.createElement('span');
            if (j === 1){
                let currentValue = values[i + j + 1]+1;
                switch (tableId) {
                    case 'midi-table':
                        if (midiChannelMap.hasOwnProperty(currentValue)) {
                            detailButton.textContent = midiChannelMap[currentValue];
                        } else {
                            detailButton.textContent = currentValue;
                        }
                        break;
                    case 'midi-table-2':
                        if (midiChannelMap2.hasOwnProperty(currentValue)) {
                            detailButton.textContent = midiChannelMap2[currentValue];
                        } else {
                            detailButton.textContent = currentValue;
                        }
                        break;
                    case 'midi-table-3':
                        if (midiChannelMap3.hasOwnProperty(currentValue)) {
                            detailButton.textContent = midiChannelMap3[currentValue];
                        } else {
                            detailButton.textContent = currentValue;
                        }
                        break;
                }
            } else detailButton.textContent = values[i + j + 1];  //voltar
            detailButton.className = 'midi-detail';
            detailButton.style.cursor = 'pointer';
            detailButton.style.marginTop = '-5px';
            detailButton.style.minWidth = '15px';
            detailButton.style.maxWidth = '15px';
            detailButton.style.visibility = values[i] === 0 ? 'hidden' : 'visible';
            //detailButton.style.textOverflow = 'ellipsis';
        
            // Evento de clique para abrir popup e atualizar valor
            detailButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const rangeStart = j === 0 ? 0 : 1;
                const rangeEnd = j === 0 ? 127 : 16;
        
                createValuePopup(detailButton, rangeStart, rangeEnd, (selectedValue) => {
                    detailButton.textContent = selectedValue;
                    values[10 + i * 2 + j] = selectedValue;
                });
            });
        
            midiRow.appendChild(detailButton);
        }

        midiTable.appendChild(midiRow);
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.left = '10px';
    buttonContainer.style.bottom = '3px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';

    const buttonCount = tableId === 'midi-table-2' ? 2 : 3;

    for (let i = 1; i <= buttonCount; i++) {
        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.display = 'flex';
        buttonWrapper.style.flexDirection = 'column';
        buttonWrapper.style.alignItems = 'center';

        const button = document.createElement('button');
        button.textContent = i;
        button.style.minWidth = '10px';
        button.style.padding = '5px';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.border = 'none';
        button.style.backgroundColor = 'transparent';
        button.style.color = 'white';

        const arrow = document.createElement('div');
        arrow.textContent = '\u276E';
        arrow.style.color = '#53bfeb';
        arrow.style.marginTop = '-10px';
        arrow.style.transform = "rotate(90deg)";
        arrow.style.fontSize = '10px';
        arrow.style.visibility = i - 1 === selectedButtonIndices[tableId] ? 'visible' : 'hidden';

        button.addEventListener('click', () => {
            //alert(`Botão ${i} pressionado na tabela ${tableId}`);
            const aux = selectedButtonIndices[tableId];
            selectedButtonIndices[tableId] = i - 1;

            midiTable.querySelectorAll('.arrow-indicator').forEach(arrow => {
                arrow.style.visibility = 'hidden';
            });
            arrow.style.visibility = 'visible';

            switch (tableId) {
                case 'midi-table':
                    //voltar
                    switch (aux) {
                        case 0: 
                            advanced1 = Array.from(document.querySelectorAll("#midi-table .midi-row")).map(row => {
                                let buttons = row.querySelectorAll("span");
                                return buttons.length >= 3 ? [
                                    buttons[0].textContent === "OFF" ? 0 : (buttons[0].textContent === "PC" ? 1 : parseInt(buttons[0].textContent.replace("CC", "")) + 2),
                                    parseInt(buttons[1].textContent),
                                    parseInt(buttons[2].textContent)-1
                                ] : [0, 0, 0];
                            }).flat();
                            break;
                        case 1: 
                            advanced2 = Array.from(document.querySelectorAll("#midi-table .midi-row")).map(row => {
                                let buttons = row.querySelectorAll("span");
                                return buttons.length >= 3 ? [
                                    buttons[0].textContent === "OFF" ? 0 : (buttons[0].textContent === "PC" ? 1 : parseInt(buttons[0].textContent.replace("CC", "")) + 2),
                                    parseInt(buttons[1].textContent),
                                    parseInt(buttons[2].textContent)-1
                                ] : [0, 0, 0];
                            }).flat();
                            break;
                        case 2: 
                            advanced3 = Array.from(document.querySelectorAll("#midi-table .midi-row")).map(row => {
                                let buttons = row.querySelectorAll("span");
                                return buttons.length >= 3 ? [
                                    buttons[0].textContent === "OFF" ? 0 : (buttons[0].textContent === "PC" ? 1 : parseInt(buttons[0].textContent.replace("CC", "")) + 2),
                                    parseInt(buttons[1].textContent),
                                    parseInt(buttons[2].textContent)-1
                                ] : [0, 0, 0];
                            }).flat();
                        break;
                    }
                    sendMessage([0xF0, 0x0D, 0x00, i - 1, 0xF7]);
                    break;
                case 'midi-table-2':
                    switch (aux) {
                        case 0:
                            usb1 = Array.from(document.querySelectorAll("#midi-table-2 .midi-row")).map(row => {
                                let buttons = row.querySelectorAll("span");
                                return buttons.length >= 3 ? [
                                    buttons[0].textContent === "OFF" ? 0 : (buttons[0].textContent === "PC" ? 1 : parseInt(buttons[0].textContent.replace("CC", "")) + 2),
                                    parseInt(buttons[1].textContent),
                                    parseInt(buttons[2].textContent)-1
                                ] : [0, 0, 0];
                            }).flat();
                            break;
                        case 1:
                            usb2 = Array.from(document.querySelectorAll("#midi-table-2 .midi-row")).map(row => {
                                let buttons = row.querySelectorAll("span");
                                return buttons.length >= 3 ? [
                                    buttons[0].textContent === "OFF" ? 0 : (buttons[0].textContent === "PC" ? 1 : parseInt(buttons[0].textContent.replace("CC", "")) + 2),
                                    parseInt(buttons[1].textContent),
                                    parseInt(buttons[2].textContent)-1
                                ] : [0, 0, 0];
                            }).flat();
                            break;
                    }
                    sendMessage([0xF0, 0x0D, 0x01, i - 1, 0xF7]);
                    break;
                case 'midi-table-3':
                    switch (aux) {
                        case 0: 
                            air1 = Array.from(document.querySelectorAll("#midi-table-3 .midi-row")).map(row => {
                                let buttons = row.querySelectorAll("span");
                                return buttons.length >= 3 ? [
                                    buttons[0].textContent === "OFF" ? 0 : (buttons[0].textContent === "PC" ? 1 : parseInt(buttons[0].textContent.replace("CC", "")) + 2),
                                    parseInt(buttons[1].textContent),
                                    parseInt(buttons[2].textContent)-1
                                ] : [0, 0, 0];
                            }).flat();
                            break;
                        case 1: 
                            air2 = Array.from(document.querySelectorAll("#midi-table-3 .midi-row")).map(row => {
                                let buttons = row.querySelectorAll("span");
                                return buttons.length >= 3 ? [
                                    buttons[0].textContent === "OFF" ? 0 : (buttons[0].textContent === "PC" ? 1 : parseInt(buttons[0].textContent.replace("CC", "")) + 2),
                                    parseInt(buttons[1].textContent),
                                    parseInt(buttons[2].textContent)-1
                                ] : [0, 0, 0];
                            }).flat();
                            break;
                        case 2: 
                            air3 = Array.from(document.querySelectorAll("#midi-table-3 .midi-row")).map(row => {
                                let buttons = row.querySelectorAll("span");
                                return buttons.length >= 3 ? [
                                    buttons[0].textContent === "OFF" ? 0 : (buttons[0].textContent === "PC" ? 1 : parseInt(buttons[0].textContent.replace("CC", "")) + 2),
                                    parseInt(buttons[1].textContent),
                                    parseInt(buttons[2].textContent)-1
                                ] : [0, 0, 0];
                            }).flat();
                            break;
                    }
                    sendMessage([0xF0, 0x0D, 0x02, i - 1, 0xF7]);
                    break;
            }
            //alert(advanced1 + advanced2 + advanced3)
        });

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.color = 'lightgray';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.color = 'white';
        });

        arrow.className = 'arrow-indicator';
        buttonWrapper.appendChild(button);
        buttonWrapper.appendChild(arrow);
        buttonContainer.appendChild(buttonWrapper);
    }
    midiTable.appendChild(buttonContainer);
}

function updatePatchTypes(bankLetter, patchTypesArray) {
    const patchItems = document.querySelectorAll(`.bank[data-letter="${bankLetter}"] + .bank-details li`);

    if (patchItems.length !== patchTypesArray.length) {
        console.error("A quantidade de patches não corresponde ao número de tipos fornecido.");
        return;
    }

    patchItems.forEach((patchItem, index) => {
        const patchTypeButton = patchItem.querySelector('button');
        if (patchTypeButton) {
            let patchText;
            switch (patchTypesArray[index]) {
                case 0:
                    patchText = 'Preset';
                    break;
                case 1:
                    patchText = 'Action';
                    break;
                case 2:
                    patchText = 'Toggle Action';
                    break;
                case 3:
                    patchText = 'Momentary';
                    break;
                case 4:
                    patchText = 'Tap';
                    break;
                case 5:
                    patchText = 'Tuner';
                    break;
                default:
                    patchText = 'Unknown';
            }
            patchTypeButton.textContent = patchText;
            localStorage.setItem(`${bankLetter}${index + 1}_type`, patchText);
        }
    });

    console.log(`Tipos de patch do banco ${bankLetter} atualizados.`);
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
    const color = '#53bfeb'; //'#9f18fd'; // Azul ou roxo
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
    patchTypeButton.style.minWidth = '65px';
    patchTypeButton.style.maxWidth = '65px';
    return patchTypeButton;
}

// Calcula a cor do patch
function setPatchColor(patchItem, patchTypeButton, index) {
    const color = '#53bfeb';
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
    loopTableFull.style.backgroundColor = 'rgba(159, 24, 253, 0.5)';
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
        let size = '0px';
        let varAuxType = document.getElementById("patchType").textContent;
        if (varAuxType == "(Preset)" || varAuxType == "(Tuner)") {
            switch (states[i - 1]) {
                case 0: states[i - 1] = 'OFF'; break;
                case 1: states[i - 1] = 'ON'; break;
                case 2: states[i - 1] = 'NUL'; break;
                default: states[i - 1] = 'Error'; break;
            }
            size = '16px';
        } else if (varAuxType === "(Tap)") {
            states[i - 1] = 'Inactive';
            size = '14px';
            loopTable.style.columnGap = '5px';
        } else {
            switch (states[i - 1]) {
                case 0: states[i - 1] = 'NUL'; break;
                case 1: states[i - 1] = 'TGL'; break;
                case 2: states[i - 1] = 'ON'; break;
                case 3: states[i - 1] = 'OFF'; break;
                default: states[i - 1] = 'Error'; break;
            }
            size = '16px';
        }

        const loopContainer = document.createElement('div');
        loopContainer.style.display = 'flex';
        loopContainer.style.alignItems = 'center';
        loopContainer.style.justifyContent = 'center'; // Centraliza o conteúdo
        loopContainer.style.width = '100%';

        const loopLabel = document.createElement('span');
        const startIdx = (i-1) * 3;
        const hasOnlySpaces = loopsNamesChars.slice(startIdx, startIdx + 3).every(item => item.trim() === "");
        if (hasOnlySpaces) loopLabel.textContent = `Loop ${i}`;
        else loopLabel.textContent = `L${i} ${loopsNamesChars.slice(startIdx, startIdx + 3).join("")}`;
        loopLabel.style.color = '#fff';
        loopLabel.style.textAlign = 'center';
        loopLabel.style.marginRight = nomeControladora === "supernova" ? '20px' : '10px';

        const loopButton = document.createElement('span-button');
        loopButton.textContent = states[i - 1];
        loopButton.style.color =
            states[i - 1] === 'ON' ? 'lime' :
            states[i - 1] === 'NUL' ? 'red' :
            states[i - 1] === 'TGL' ? 'white' :
            states[i - 1] === 'Inactive' ? 'gray' :
            'red';
        loopButton.style.fontSize = size;
        loopButton.style.cursor = 'pointer';
        if (loopButton.textContent == 'Inactive') loopButton.style.cursor = 'default';
        loopButton.style.fontWeight = '600';
        loopButton.style.textAlign = 'center';
        loopButton.style.minWidth = '35px';  // Define um tamanho mínimo para o botão
        loopButton.style.textAlign = 'left';  // Garante alinhamento central
        loopButton.style.display = 'inline-block';  // Mantém o tamanho fixo corretamente


        loopButton.addEventListener('click', () => {
            if (loopButton.textContent === 'Inactive') return; // Impede clique se for Inactive
            
            if (event.ctrlKey) {
                event.stopPropagation(); // Evita o fechamento do popup ao clicar no botão
            
                // Criar popup com opções
                let options = ["OFF", "ON", "NUL", "TGL"];
                if (document.getElementById("patchType").textContent == "(Preset)" || document.getElementById("patchType").textContent == "(Tuner)") options = ["OFF", "ON", "NUL"];
                remotePopup(loopButton, options, (selectedValue) => {
                    loopButton.textContent = selectedValue;
                    loopButton.style.color = selectedValue === "ON" ? "lime" : 
                                            selectedValue === "NUL" ? "red" :
                                            selectedValue === "TGL" ? "white" : "red";
                    states = updateStates();
                    sendMessage(states);
                });
            } else {
                toggleState(loopButton, patchId, i);
                states = updateStates();
                sendMessage(states);
            }
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
    let varAuxType = document.getElementById("patchType").textContent;
    loopButtons.forEach((loopButton, index) => {
        let state;

        // Verifica o texto do botão e atribui o valor correspondente
        if (varAuxType == "(Preset)") {
            switch (loopButton.textContent) {
                case 'OFF': state = 0; break;
                case 'ON': state = 1; break;
                case 'NUL': state = 2; break;
            }
            size = '16px';
        } else if (varAuxType === "(Tuner)") {
            state = 'Inactive';
            size = '14px';
        } else {
            switch (loopButton.textContent) {
                case 'NUL': state = 0; break;
                case 'TLG': state = 1; break;
                case 'ON': state = 2; break;
                case 'OFF': state = 3; break;
            }
            size = '16px';
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
        
        optionButton.addEventListener('click', () => {
            console.log(`Valor selecionado: ${preset}`);
            switch (preset) {
                case 'Preset':
                    sendMessage([0xF0, 0x11, 0, 0xF7]);
                    break;
                case 'Action':
                    sendMessage([0xF0, 0x11, 1, 0xF7]);
                    break;
                case 'Toggle Action':
                    sendMessage([0xF0, 0x11, 2, 0xF7]);
                    break;
                case 'Momentary':
                    sendMessage([0xF0, 0x11, 3, 0xF7]);
                    break;
                case 'Tap':
                    sendMessage([0xF0, 0x11, 4, 0xF7]);
                    break;
                case 'Tuner':
                    sendMessage([0xF0, 0x11, 5, 0xF7]);
                    break;
            }

            patchTypeButton.textContent = preset;
            document.getElementById("patchType").textContent = `(${preset})`
            localStorage.setItem(`${letter}${number}_type`, preset);
            presetOptions.style.display = 'none';

            sendMessage([0xF0,0x0D,0x00,0x00,0xF7]);
            sendMessage([0xF0,0x0D,0x01,0x00,0xF7]);
            sendMessage([0xF0,0x0D,0x02,0x00,0xF7]);
            createLoopTable(letter+number, index);
            createTableRemoteSwitch(letter+number, index);
        });

        configurePresetOptionEvents(optionButton, patchTypeButton, presetOptions, letter, number, index);
        presetOptions.appendChild(optionButton);
    });

    patchTypeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        presetOptions.style.display = presetOptions.style.display === 'block' ? 'none' : 'block';
        currentOpenPresetOptions = presetOptions.style.display === 'block' ? presetOptions : null;
    });

    document.addEventListener('click', (e) => {
        if (!patchTypeButton.contains(e.target) && !presetOptions.contains(e.target)) {
            presetOptions.style.display = 'none';
        }
    });

    const savedType = localStorage.getItem(`${letter}${number}_type`);
    if (savedType) {
        patchTypeButton.textContent = savedType;
    }

    return presetOptions;
}


// Gerencia a tabela de tipos de patch
function configurePresetOptionEvents(optionButton, patchTypeButton, presetOptions, letter, number, index) {
    const color = '#53bfeb';

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

    if (button.textContent !== 'ON') {
        button.textContent = "ON";
        button.style.color = 'lime';
    } else {
        button.textContent = "OFF";
        button.style.color = 'red';
    }
}

// Remote Switch
async function createTableRemoteSwitch(patchId, index) {
    sendMessage([0xF0, 0x04, 0x00, 0xF7]);

    const remoteTable = document.getElementById('remote-table');
    const remoteTableFull = document.getElementById('table-3');

    const tableAux = document.getElementById('table-6');
    tableAux.style.display = 'flex';

    await delay(200);

    let states = remotes;

    remoteTableFull.style.margin = 'auto';
    remoteTableFull.style.display = 'flex';
    remoteTableFull.style.flexDirection = 'column';
    remoteTableFull.style.alignItems = 'center';
    remoteTableFull.style.backgroundColor = 'rgba(159, 24, 253, 0.5)';
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
        let size = '0';
        let varAuxType = document.getElementById("patchType").textContent;
        if (varAuxType == "(Preset)") {
            switch (states[i - 1]) {
                case 0: states[i - 1] = 'OFF'; break;
                case 1: states[i - 1] = 'ON'; break;
                case 2: states[i - 1] = 'NUL'; break;
                default: states[i - 1] = 'Error'; break;
            }
            size = '16px';
        } else if (varAuxType === "(Tuner)") {
            states[i - 1] = 'Inactive';
            size = '14px';
        } else {
            switch (states[i - 1]) {
                case 0: states[i - 1] = 'NUL'; break;
                case 1: states[i - 1] = 'TGL'; break;
                case 2: states[i - 1] = 'ON'; break;
                case 3: states[i - 1] = 'OFF'; break;
                default: states[i - 1] = 'Error'; break;
            }
            size = '16px';
        }

        const loopContainer = document.createElement('div');
        loopContainer.style.display = 'flex';
        loopContainer.style.alignItems = 'center';
        loopContainer.style.justifyContent = 'space-between';
        loopContainer.style.width = '100%';

        const loopLabel = document.createElement('span');
        const startIdx = (i - 1) * 3;
        const hasOnlySpaces = remoteNamesChars.slice(startIdx, startIdx + 3).every(item => item.trim() === "");

        const remoteName = remoteNamesChars.slice(startIdx, startIdx + 3).join("");
        if (hasOnlySpaces) {
            loopLabel.textContent = [
                'Rmt Switch 1 Tip:',
                'Rmt Switch 1 Ring:',
                'Rmt Switch 2 Tip:',
                'Rmt Switch 2 Ring:'
            ][i - 1];
        } else {
            loopLabel.innerHTML = [
                `RmtSw1 Tip: <span style="color: #53bfeb; font-weight: 600;">${remoteName}</span>`,
                `RmtSw1 Ring: <span style="color: #53bfeb; font-weight: 600;">${remoteName}</span>`,
                `RmtSw2 Tip: <span style="color: #53bfeb; font-weight: 600;">${remoteName}</span>`,
                `RmtSw2 Ring: <span style="color: #53bfeb; font-weight: 600;">${remoteName}</span>`
            ][i - 1];
        }
        loopLabel.style.color = '#fff';
        loopLabel.style.minWidth = '150px'; // Define largura fixa para alinhamento
        loopLabel.style.textAlign = 'left';
        loopLabel.style.marginRight = '20px';

        const loopButton = document.createElement('span-button');
        loopButton.textContent = states[i - 1];
        loopButton.style.color =
            states[i - 1] === 'ON' ? 'lime' :
            states[i - 1] === 'NUL' ? 'red' :
            states[i - 1] === 'TGL' ? 'white' :
            states[i - 1] === 'Inactive' ? 'gray' :
            'red';
        loopButton.style.fontSize = size;
        loopButton.style.cursor = 'pointer';
        if (loopButton.textContent === 'Inactive') loopButton.style.cursor = 'default';
        loopButton.style.fontWeight = 'bold';
        loopButton.style.minWidth = '50px'; // Define tamanho fixo do botão
        loopButton.style.textAlign = 'left';

        loopButton.addEventListener('click', (event) => {
            if (loopButton.textContent === 'Inactive') return; // Impede clique se for Inactive
            
            if (event.ctrlKey) {
                event.stopPropagation(); // Evita o fechamento do popup ao clicar no botão
            
                // Criar popup com opções
                let options = ["OFF", "ON", "NUL", "TGL"];
                if (document.getElementById("patchType").textContent == "(Preset)") options = ["OFF", "ON", "NUL"];
                remotePopup(loopButton, options, (selectedValue) => {
                    loopButton.textContent = selectedValue;
                    loopButton.style.color = selectedValue === "ON" ? "lime" : 
                                            selectedValue === "NUL" ? "red" :
                                            selectedValue === "TGL" ? "white" : "red";
                    states = updateStatesRemote();
                    sendMessage(states);
                });
            } else {
                toggleState(loopButton, patchId, i);
                states = updateStatesRemote();
                sendMessage(states);
            }
        });
        
        loopContainer.appendChild(loopLabel);
        loopContainer.appendChild(loopButton);
        remoteTable.appendChild(loopContainer);
    });
}

function remotePopup(targetButton, options, onSelectCallback) {
    // Remove popups anteriores
    const existingPopup = document.querySelector('.value-popup');
    if (existingPopup) existingPopup.remove();

    // Criar o popup
    const popup = document.createElement('div');
    popup.className = 'value-popup';
    popup.style.position = 'absolute';
    popup.style.backgroundColor = '#242424';
    popup.style.border = '1px solid #000';
    popup.style.borderRadius = '5px';
    popup.style.padding = '5px';
    popup.style.zIndex = '1000';
    popup.style.textAlign = 'center';
    
    // Posicionar perto do botão clicado
    const rect = targetButton.getBoundingClientRect();
    popup.style.top = `${rect.bottom + window.scrollY}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;

    // Criar opções dentro do popup
    options.forEach(option => {
        const optionButton = document.createElement('button');
        optionButton.textContent = option;
        optionButton.style.display = 'block';
        optionButton.style.width = '100%';
        optionButton.style.padding = '5px';
        optionButton.style.cursor = 'pointer';
        optionButton.style.backgroundColor = '#242424';
        optionButton.style.color = '#fff';
        optionButton.style.border = 'none';
        optionButton.style.marginBottom = '5px';

        optionButton.addEventListener('click', () => {
            onSelectCallback(option);
            popup.remove();
        });

        popup.appendChild(optionButton);
    });

    // Adiciona o popup à página
    document.body.appendChild(popup);

    // Fechar popup ao clicar fora
    document.addEventListener('click', (e) => {
        if (!popup.contains(e.target) && e.target !== targetButton) {
            popup.remove();
        }
    }, { once: true });
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

        const outputs = Array.from(midiAccess.outputs.values());
        if (outputs.length !== 0) {
            sendMessage([0xF0,0x1A,0x00,0xF7])
        }

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
        const patchCopyIcon = document.getElementById('patch-copy-icon');
        if (patchCopyIcon) {
            patchCopyIcon.remove();
        }
        const patchSwapIcon = document.getElementById('patch-swap-icon');
        if (patchSwapIcon) {
            patchSwapIcon.remove();
        }
        const patchClearIcon = document.getElementById('patch-clear-icon');
        if (patchClearIcon) {
            patchClearIcon.remove();
        }

        document.getElementById('editor-title').textContent = 'Saturno Web Editor';
        
        // Alterar o texto do botão
        button.textContent = "Connect";

        activePatch = null;
        isProcessingPatch = false; // Flag para impedir cliques multiplos
    }
}

async function heartBeat() {
    try {
        isExecuting = true;  // Marcar a execução em andamento

        const outputs = Array.from(midiAccess.outputs.values());
        if (outputs.length === 0) {
            //alert("Nenhum dispositivo MIDI encontrado. Abortando conexão.");
            toggleConnection(document.getElementById('connectButton'));
            notify ("Nenhum dispositivo MIDI encontrado. Abortando conexão.", 'error');
            //await(10000)
            //window.location.reload();
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
    //alert("Changes saved!");
    sendMessage([0xF0,0x12,0x00,0xF7])
}

function cancelChanges(button) {
    //alert("Changes canceled!");
    sendMessage([0xF0,0x13,0x00,0xF7])
}

function notify(mensagem, icon) {
    Swal.fire({
      toast: true,
      background: "#2a2a40",
      color: "rgb(83, 191, 235)",
      position: "bottom-end",
      icon: icon,
      title: mensagem,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
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
    midiTableFull.style.backgroundColor = 'rgba(159, 24, 253, 0.5)';
    midiTableFull.style.fontWeight = 'bold';
    midiTableFull.style.padding = '10px';
    midiTableFull.style.margin = 'auto';
    midiTableFull.style.flexDirection = 'column';
    midiTableFull.style.alignItems = 'center';
    midiTableFull.style.marginTop = '5vh';
    midiTableFull.style.borderRadius = '10px';
    midiTableFull.style.width = '230px';
    midiTableFull.style.height = '165px';
    midiTableFull.style.minHeight = '165px';
    midiTableFull.style.position = 'relative'; // Para que os botões fiquem posicionados corretamente dentro dela
    
    midiTable.innerHTML = ''; // Limpa a tabela MIDI
    midiTable.style.display = 'grid';
    midiTable.style.gridTemplateColumns = '1fr 1fr'; // Divide em duas colunas
    midiTable.style.columnGap = '0px';
    midiTable.style.rowGap = '5px';

    // Agora os estados são carregados separadamente para cada tabela
    const states = [] //loadMidiStates(patchId, tableId);

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
    
        // Lista para armazenar os botões secundários
        const detailButtons = [];

        const values =  [0, 1];
        values.forEach((value, idx) => {
            const detailButton = createDetailButton(value, idx, patchId, i, tableId);
            let mappedValue = value;
            if (value === 1) {
                switch (tableId) {
                    case 'midi-table':
                        mappedValue = midiChannelMap.hasOwnProperty(value) ? midiChannelMap[value] : value;
                        break;
                    case 'midi-table-2':
                        mappedValue = midiChannelMap2.hasOwnProperty(value) ? midiChannelMap2[value] : value;
                        break;
                    case 'midi-table-3':
                        mappedValue = midiChannelMap3.hasOwnProperty(value) ? midiChannelMap3[value] : value;
                        break;
                }
            }
            //alert (mappedValue)

            detailButton.textContent = mappedValue.toString();
            detailButton.className = 'midi-detail';
            detailButton.style.cursor = 'pointer';
            detailButton.style.minWidth = '15px';
            detailButton.style.maxWidth = '15px';
            detailButton.style.opacity = '0';
    
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

            detailButtons.push(detailButton);
            midiRow.appendChild(detailButton);
        });

        // Evento de clique do botão principal para abrir popup e mostrar botões secundários
        midiButton.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`Clique detectado no botão ${i} da tabela ${tableId}`);
            createMidiPopup(midiButton, patchId, i, tableId);
    
            // Atualiza a visibilidade dos botões secundários
            if (midiButton.textContent !== 'OFF') {
                detailButtons.forEach(btn => btn.style.opacity = '1');
            } else {
                detailButtons.forEach(btn => btn.style.opacity = '0');
            }
        });

        // Adiciona o botão MIDI na linha
        midiRow.appendChild(midiButton);
        
        // Adiciona a linha na tabela MIDI
        midiTable.appendChild(midiRow);
    }

    // Criar a div para os botões adicionais
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.left = '10px';
    buttonContainer.style.bottom = '10px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';

    
    // Definir o número de botões com base no tableId
    const buttonCount = tableId === 'midi-table-3' ? 2 : 3;
    
    for (let i = 1; i <= buttonCount; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.style.minWidth = '10px';
        button.style.padding = '5px';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.border = 'none';
        button.style.backgroundColor = 'transparent';
        button.style.color = 'white';
        
        button.addEventListener('click', () => {
            //alert(`Botão ${i} pressionado na tabela ${tableId}`);
            switch(tableId) {
                case 'midi-table':
                    sendMessage([0xF0,0x0D,0x00,i-1,0xF7])
                    break
                case 'midi-table-2':
                    sendMessage([0xF0,0x0D,0x01,i-1,0xF7])
                    break
                case 'midi-table-3':
                    sendMessage([0xF0,0x0D,0x02,i-1,0xF7])
                    break
            }
        });

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.color = 'lightgray';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.color = 'white';
        });
        
        buttonContainer.appendChild(button);
    }
    
    // Adicionar o container de botões na tabela MIDI
    midiTable.appendChild(buttonContainer);
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
        if (tableId === 'midi-table-2') {
            left -= 310
        } else left -= 40

        const popupHeight = 200;

        // Evita que o popup ultrapasse a tela
        if (top + popupHeight > window.innerHeight + scrollTop) {
            top = Math.max(rect.top + scrollTop - popupHeight, 0);
        }

        midiPopup.style.top = `${top}px`;
        midiPopup.style.left = `${left}px`;
        midiPopup.style.maxWidth = '80px';
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

                // Identifica qual tabela MIDI originou esse popup
                const midiTable = midiButton.closest('.table'); 
                if (!midiTable) {
                    console.error("Não foi possível identificar a tabela MIDI.");
                    return;
                }

                // Captura todos os valores dos botões dentro dessa tabela específica
                let midiValues = Array.from(midiTable.querySelectorAll('span'))
                .map(btn => {
                    let text = btn.textContent.trim();
    
                    if (text === "OFF") return 0;
                    if (text === "PC") return 1;
                    if (text.startsWith("CC")) return parseInt(text.slice(2)) + 2;
                    if (text === "EXP1") return 128;
                    if (text === "EXP2") return 129;
                    
                    return text// || 0;
                });
                //alert([...midiValues])
                midiValues2 = Array.from(midiValues)
                    .map((value, index) => {
                    if ((index - 2) % 3 === 0) { // Identifica as posições 2, 5, 8, 11...
                        switch (tableId) {
                            case 'midi-table':
                                if (midiChannelMap.hasOwnProperty(value)) {
                                    return midiChannelMap[value]-1;
                                }
                                break;
                            case 'midi-table-2':
                                if (midiChannelMap2.hasOwnProperty(value)) {
                                    return midiChannelMap2[value]-1;
                                }
                                break;
                            case 'midi-table-3':
                                if (midiChannelMap3.hasOwnProperty(value)) {
                                    return midiChannelMap3[value]-1;
                                }
                                break;
                        }
                        return value - 1; // Diminui 1 do valor
                    } else return value;
                });
                //alert([...midiValues2])

                //alert(`Valores da ${midiTable.id} na pagina ${selectedButtonIndices[midiTable.id]}: ${midiValues}`);
                
                let tableAux = '';
                switch (midiTable.id) {
                    case 'midi-table':
                        tableAux = 0;
                        break;
                    case 'midi-table-2':
                        tableAux = 1;
                        break;
                    case 'midi-table-3':
                        tableAux = 2;
                        break;
                }

                const novaOrdem = [
                    0,1,2, 6,7,8, 12,13,14, 18,19,20, 24,25,26, 
                    3,4,5, 9,10,11, 15,16,17, 21,22,23, 27,28,29
                ];
                
                let results = novaOrdem.map(index => midiValues2[index]);

                for (let i = 0; i < 10; i++) {
                    results[i*3+2]=results[i*3+2]+((results[i*3+0]&0b10000000)>>3)+((results[i*3+1]&0b10000000)>>2)
                    results[i*3+0]=results[i*3+0]&0b01111111
                    results[i*3+1]=results[i*3+1]&0b01111111
                }

                //alert([...results])

                //alert([0xF0, 0x0E, tableAux, selectedButtonIndices[midiTable.id], ...results, 0xF7])

                // Envia os valores da tabela específica
                sendMessage([0xF0, 0x0E, tableAux, selectedButtonIndices[midiTable.id], ...results, 0xF7]);
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
                
                // Identifica qual tabela MIDI originou esse popup
                const midiTable = midiButton.closest('.table'); 
                if (!midiTable) {
                    console.error("Não foi possível identificar a tabela MIDI.");
                    return;
                }

                // Captura todos os valores dos botões dentro dessa tabela específica
                let midiValues = Array.from(midiTable.querySelectorAll('span'))
                .map(btn => {
                    let text = btn.textContent.trim();
    
                    if (text === "OFF") return 0;
                    if (text === "PC") return 1;
                    if (text.startsWith("CC")) return parseInt(text.slice(2)) + 2;
                    if (text === "EXP1") return 128;
                    if (text === "EXP2") return 129;
                    
                    return text// || 0;
                });
                //alert([...midiValues])
                midiValues2 = Array.from(midiValues)
                    .map((value, index) => {
                    if ((index - 2) % 3 === 0) { // Identifica as posições 2, 5, 8, 11...
                        switch (tableId) {
                            case 'midi-table':
                                if (midiChannelMap.hasOwnProperty(value)) {
                                    return midiChannelMap[value]-1;
                                }
                                break;
                            case 'midi-table-2':
                                if (midiChannelMap2.hasOwnProperty(value)) {
                                    return midiChannelMap2[value]-1;
                                }
                                break;
                            case 'midi-table-3':
                                if (midiChannelMap3.hasOwnProperty(value)) {
                                    return midiChannelMap3[value]-1;
                                }
                                break;
                        }
                        return value - 1; // Diminui 1 do valor
                    } else return value;
                });
                //alert([...midiValues2])

                //alert(`Valores da ${midiTable.id} na pagina ${selectedButtonIndices[midiTable.id]}: ${midiValues}`);
                
                let tableAux = '';
                switch (midiTable.id) {
                    case 'midi-table':
                        tableAux = 0;
                        break;
                    case 'midi-table-2':
                        tableAux = 1;
                        break;
                    case 'midi-table-3':
                        tableAux = 2;
                        break;
                }

                const novaOrdem = [
                    0,1,2, 6,7,8, 12,13,14, 18,19,20, 24,25,26, 
                    3,4,5, 9,10,11, 15,16,17, 21,22,23, 27,28,29
                ];
                
                const results = novaOrdem.map(index => midiValues2[index]);
                for (let i = 0; i < 10; i++) {
                    results[i*3+2]=results[i*3+2]+((results[i*3+0]&0b10000000)>>3)+((results[i*3+1]&0b10000000)>>2)
                    results[i*3+0]=results[i*3+0]&0b01111111
                    results[i*3+1]=results[i*3+1]&0b01111111
                }
                //alert([...results])
                // Envia os valores da tabela específica
                sendMessage([0xF0, 0x0E, tableAux, selectedButtonIndices[midiTable.id], ...results, 0xF7]);
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
function createDetailButton(initialValue, index, patchId, midiIndex, tableId) {
    const detailButton = document.createElement('button');
    
    // Verifica se o valor inicial deve ser traduzido pelo midiChannelMap correspondente
    let mappedValue = initialValue;
    if (initialValue === 1) {
        switch (tableId) {
            case 'midi-table':
                mappedValue = midiChannelMap.hasOwnProperty(initialValue) ? midiChannelMap[initialValue] : initialValue;
                break;
            case 'midi-table-2':
                mappedValue = midiChannelMap2.hasOwnProperty(initialValue) ? midiChannelMap2[initialValue] : initialValue;
                break;
            case 'midi-table-3':
                mappedValue = midiChannelMap3.hasOwnProperty(initialValue) ? midiChannelMap3[initialValue] : initialValue;
                break;
        }
    }
    detailButton.textContent = mappedValue.toString();
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
            //localStorage.setItem(`${patchId}_${tableId}`, JSON.stringify(states)); // Salva no banco
        });
    });

    return detailButton;
}


// Lida com a seleção de comando
function handleMidiSelection(type, midiButton, patchId, index, tableId) {
    const parentRow = midiButton.parentElement;

    // Atualiza o botão principal
    midiButton.textContent = type;
    midiButton.style.color = type === 'OFF' ? 'red' : 'lime';

    // Limpa botões secundarios
    const existingDetailButtons = parentRow.querySelectorAll('.midi-detail');
    existingDetailButtons.forEach((btn) => btn.remove());

    for (let j = 0; j < 2; j++) {
        const detailButton = document.createElement('span');
        let mappedValue = j;
        if (j === 1) {
            switch (tableId) {
                case 'midi-table':
                    mappedValue = midiChannelMap.hasOwnProperty(j) ? midiChannelMap[j] : j;
                    break;
                case 'midi-table-2':
                    mappedValue = midiChannelMap2.hasOwnProperty(j) ? midiChannelMap2[j] : j;
                    break;
                case 'midi-table-3':
                    mappedValue = midiChannelMap3.hasOwnProperty(j) ? midiChannelMap3[j] : j;
                    break;
            }
        }
        detailButton.textContent = mappedValue.toString();
        
        detailButton.className = 'midi-detail';
        detailButton.style.height = '15px';
        detailButton.style.cursor = 'pointer';
        detailButton.style.minWidth = '15px';
        detailButton.style.maxWidth = '15px';
        detailButton.style.marginTop = '-5px';
        if (type === 'OFF') detailButton.style.visibility = 'hidden';

        // Evento de clique para abrir popup de seleção
        detailButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const rangeStart = j === 0 ? 0 : 1;
            const rangeEnd = j === 0 ? 127 : 16;

            createValuePopup(detailButton, rangeStart, rangeEnd, (selectedValue) => {
                detailButton.textContent = selectedValue;
            });
        });

        parentRow.appendChild(detailButton);
    }

    // Salva o estado inicial
    const midiData = { type: type, values: [0, 1] };
    const states = loadMidiStates(patchId);
    states[index] = midiData;
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
    const mainContent = document.getElementById('mainContent');
    const rect = detailButton.getBoundingClientRect();
    const mainRect = mainContent.getBoundingClientRect();

    const top = rect.bottom - mainRect.top + mainContent.scrollTop;
    const left = rect.left - mainRect.left + mainContent.scrollLeft;

    valuePopup.style.top = `${top}px`;
    valuePopup.style.left = `${left}px`;

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
            // Identifica qual tabela MIDI originou esse popup
            const midiTable = detailButton.closest('.table'); 
            if (!midiTable) {
                console.error("Não foi possível identificar a tabela MIDI.");
                return;
            }

            // Captura todos os valores dos botões dentro dessa tabela específica
            let midiValues = Array.from(midiTable.querySelectorAll('span'))
                .map(btn => {
                    let text = btn.textContent.trim();
    
                    if (text === "OFF") return 0;
                    if (text === "PC") return 1;
                    if (text.startsWith("CC")) return parseInt(text.slice(2)) + 2;
                    if (text === "EXP1") return 128;
                    if (text === "EXP2") return 129;
                    
                    return text// || 0;
                });
            //alert([...midiValues])
            midiValues2 = Array.from(midiValues)
                .map((value, index) => {
                if ((index - 2) % 3 === 0) { // Identifica as posições 2, 5, 8, 11...
                    switch (tableId) {
                        case 'midi-table':
                            if (midiChannelMap.hasOwnProperty(value)) {
                                return midiChannelMap[value]-1;
                            }
                            break;
                        case 'midi-table-2':
                            if (midiChannelMap2.hasOwnProperty(value)) {
                                return midiChannelMap2[value]-1;
                            }
                            break;
                        case 'midi-table-3':
                            if (midiChannelMap3.hasOwnProperty(value)) {
                                return midiChannelMap3[value]-1;
                            }
                            break;
                    }
                    return value - 1; // Diminui 1 do valor
                } else return value;
            });
            //alert([...midiValues2])

            //alert(`Valores da ${midiTable.id} na pagina ${selectedButtonIndices[midiTable.id]}: ${midiValues}`);
            
            let tableAux = '';
            switch (midiTable.id) {
                case 'midi-table':
                    tableAux = 0;
                    break;
                case 'midi-table-2':
                    tableAux = 1;
                    break;
                case 'midi-table-3':
                    tableAux = 2;
                    break;
            }

            const novaOrdem = [
                0,1,2, 6,7,8, 12,13,14, 18,19,20, 24,25,26, 
                3,4,5, 9,10,11, 15,16,17, 21,22,23, 27,28,29
            ];
            
            const results = novaOrdem.map(index => midiValues2[index]);
            for (let i = 0; i < 10; i++) {
                results[i*3+2]=results[i*3+2]+((results[i*3+0]&0b10000000)>>3)+((results[i*3+1]&0b10000000)>>2)
                results[i*3+0]=results[i*3+0]&0b01111111
                results[i*3+1]=results[i*3+1]&0b01111111
            }
            //alert([...results])
            // Envia os valores da tabela específica
            sendMessage([0xF0, 0x0E, tableAux, selectedButtonIndices[midiTable.id], ...results, 0xF7]);

            valuePopup.remove();
        });

        valuePopup.appendChild(valueButton);
    }
    
    let tableElement = detailButton.closest('.table'); 
    let tableId = tableElement ? tableElement.id : 'desconhecido';
    //alert(tableId)
    // Adiciona numeros ao popup
    for (let i = rangeStart; i <= rangeEnd; i++) {
        const valueButton = document.createElement('button');
        
        // Verifica se o rangeEnd é 16 e substitui o número pelos valores de midiChannelNames se não estiverem vazios
        if (rangeEnd === 16) {
            
            let channelName1 = midiChannelNamesChars[(i - 1) * 2];
            let channelName2 = midiChannelNamesChars[(i - 1) * 2 + 1];
            switch (tableId) {
                case 'midi-table-2':
                    channelName1 = midiChannelNamesChars2[(i - 1) * 2];
                    channelName2 = midiChannelNamesChars2[(i - 1) * 2 + 1];
                    break;
                case 'midi-table-3':
                    channelName1 = midiChannelNamesChars3[(i - 1) * 2];
                    channelName2 = midiChannelNamesChars3[(i - 1) * 2 + 1];
                    break;
                default:
                    break;
            }
            
            const validChannelName1 = channelName1.trim();
            const validChannelName2 = channelName2.trim();
    
            if (validChannelName1 && validChannelName2) {
                valueButton.textContent = `${validChannelName1}${validChannelName2}`;
            } else if (validChannelName1) {
                valueButton.textContent = validChannelName1;
            } else if (validChannelName2) {
                valueButton.textContent = validChannelName2;
            } else {
                valueButton.textContent = i.toString(); // Caso os dois estejam vazios, usa o número
            }
            /*switch (tableId) {
                case 'midi-table-2':
                    midiChannelMap2[valueButton.textContent] = i;
                    break;
                case 'midi-table-3':
                    midiChannelMap3[valueButton.textContent] = i;
                    break;
                default:
                    midiChannelMap[valueButton.textContent] = i;
                    midiChannelMap[i] = valueButton.textContent;
                    break;
            }*/
            
        } else {
            valueButton.textContent = i.toString();
        }
    
        valueButton.style.display = 'block';
        valueButton.style.width = '100%';
        valueButton.style.padding = '5px';
        valueButton.style.cursor = 'pointer';
    
        // Salva e esconde o popup
        valueButton.addEventListener('click', (e) => {
            e.stopPropagation();
            onSelectCallback(valueButton.textContent);
    
            // Identifica qual tabela MIDI originou esse popup
            const midiTable = detailButton.closest('.table'); 
            if (!midiTable) {
                console.error("Não foi possível identificar a tabela MIDI.");
                return;
            }
    
            // Captura todos os valores dos botões dentro dessa tabela específica
            let midiValues = Array.from(midiTable.querySelectorAll('span'))
                .map(btn => {
                    let text = btn.textContent.trim();
    
                    if (text === "OFF") return 0;
                    if (text === "PC") return 1;
                    if (text.startsWith("CC")) return parseInt(text.slice(2)) + 2;
                    if (text === "EXP1") return 128;
                    if (text === "EXP2") return 129;
                    
                    return text// || 0;
                });
            //alert([...midiValues])
            midiValues2 = Array.from(midiValues)
                .map((value, index) => {
                if ((index - 2) % 3 === 0) { // Identifica as posições 2, 5, 8, 11...
                    switch (tableId) {
                        case 'midi-table':
                            if (midiChannelMap.hasOwnProperty(value)) {
                                return midiChannelMap[value]-1;
                            }
                            break;
                        case 'midi-table-2':
                            if (midiChannelMap2.hasOwnProperty(value)) {
                                return midiChannelMap2[value]-1;
                            }
                            break;
                        case 'midi-table-3':
                            if (midiChannelMap3.hasOwnProperty(value)) {
                                return midiChannelMap3[value]-1;
                            }
                            break;
                    }
                    return value - 1; // Diminui 1 do valor
                } else return value;
            });
            //alert([...midiValues2])
            //alert(`Valores da ${midiTable.id} na pagina ${selectedButtonIndices[midiTable.id]}: ${midiValues}`);
    
            let tableAux = '';
            switch (midiTable.id) {
                case 'midi-table':
                    tableAux = 0;
                    break;
                case 'midi-table-2':
                    tableAux = 1;
                    break;
                case 'midi-table-3':
                    tableAux = 2;
                    break;
            }
    
            const novaOrdem = [
                0,1,2, 6,7,8, 12,13,14, 18,19,20, 24,25,26, 
                3,4,5, 9,10,11, 15,16,17, 21,22,23, 27,28,29
            ];
    
            const results = novaOrdem.map(index => midiValues2[index]);
            //alert([...results])
            for (let i = 0; i < 10; i++) {
                results[i * 3 + 2] = results[i * 3 + 2] + ((results[i * 3 + 0] & 0b10000000) >> 3) + ((results[i * 3 + 1] & 0b10000000) >> 2);
                results[i * 3 + 0] = results[i * 3 + 0] & 0b01111111;
                results[i * 3 + 1] = results[i * 3 + 1] & 0b01111111;
            }
            //alert([...results]);
            
            // Envia os valores da tabela específica
            sendMessage([0xF0, 0x0E, tableAux, selectedButtonIndices[midiTable.id], ...results, 0xF7]);
    
            valuePopup.remove();
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
                // Identifica qual tabela MIDI originou esse popup
                const midiTable = detailButton.closest('.table'); 
                if (!midiTable) {
                    console.error("Não foi possível identificar a tabela MIDI.");
                    return;
                }

                // Captura todos os valores dos botões dentro dessa tabela específica
                let midiValues = Array.from(midiTable.querySelectorAll('span'))
                .map(btn => {
                    let text = btn.textContent.trim();
    
                    if (text === "OFF") return 0;
                    if (text === "PC") return 1;
                    if (text.startsWith("CC")) return parseInt(text.slice(2)) + 2;
                    if (text === "EXP1") return 128;
                    if (text === "EXP2") return 129;
                    
                    return text// || 0;
                });
                //alert([...midiValues])
                midiValues2 = Array.from(midiValues)
                    .map((value, index) => {
                    if ((index - 2) % 3 === 0) { // Identifica as posições 2, 5, 8, 11...
                        switch (tableId) {
                            case 'midi-table':
                                if (midiChannelMap.hasOwnProperty(value)) {
                                    return midiChannelMap[value]-1;
                                }
                                break;
                            case 'midi-table-2':
                                if (midiChannelMap2.hasOwnProperty(value)) {
                                    return midiChannelMap2[value]-1;
                                }
                                break;
                            case 'midi-table-3':
                                if (midiChannelMap3.hasOwnProperty(value)) {
                                    return midiChannelMap3[value]-1;
                                }
                                break;
                        }
                        return value - 1; // Diminui 1 do valor
                    } else return value;
                });
                //alert([...midiValues2])

                //alert(`Valores da ${midiTable.id} na pagina ${selectedButtonIndices[midiTable.id]}: ${midiValues}`);
                
                let tableAux = '';
                switch (midiTable.id) {
                    case 'midi-table':
                        tableAux = 0;
                        break;
                    case 'midi-table-2':
                        tableAux = 1;
                        break;
                    case 'midi-table-3':
                        tableAux = 2;
                        break;
                }

                const novaOrdem = [
                    0,1,2, 6,7,8, 12,13,14, 18,19,20, 24,25,26, 
                    3,4,5, 9,10,11, 15,16,17, 21,22,23, 27,28,29
                ];
                
                const results = novaOrdem.map(index => midiValues2[index]);
                for (let i = 0; i < 10; i++) {
                    results[i*3+2]=results[i*3+2]+((results[i*3+0]&0b10000000)>>3)+((results[i*3+1]&0b10000000)>>2)
                    results[i*3+0]=results[i*3+0]&0b01111111
                    results[i*3+1]=results[i*3+1]&0b01111111
                }
                //alert([...results])
                // Envia os valores da tabela específica
                sendMessage([0xF0, 0x0E, tableAux, selectedButtonIndices[midiTable.id], ...results, 0xF7]);
                
                valuePopup.remove();
            });

            valuePopup.appendChild(valueButton);
        });
    }

    // Adicionar popup à página
    document.getElementById('mainContent').appendChild(valuePopup);

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
