console.log("Script de fallback ativado!");
console.log(nomeControladora);

let activePreset = null;

//alert("Script dos pedais carregado");

function createPresets() {

    const sidebar = document.getElementById("sidebar");

    for (let i = 0; i < 128; i++) {
        const preset = document.createElement("div");
        preset.className = "preset";

        const presetNumber = document.createElement("span");
        presetNumber.className = "preset-number";
        if (i < 10) presetNumber.textContent = `00${i}`;
        else if (i < 100) presetNumber.textContent = `0${i}`;
        else presetNumber.textContent = `${i}`;

        const presetInput = document.createElement("input");
        presetInput.type = "text";
        presetInput.className = "preset-name";
        if (i < 10) presetInput.placeholder = `Preset 0${i}`;
        else presetInput.placeholder = `Preset ${i}`;

        const iconContainer = document.createElement("div");
        iconContainer.className = "preset-icon-container";
        iconContainer.style.display = "none";
        iconContainer.style.gap = "0px";
        iconContainer.style.marginRight = '10px';

        const copyButton = document.createElement("span");
        copyButton.className = 'fa-regular fa-copy';
        copyButton.title = "Copy preset";
        copyButton.style.fontSize = '15px'
        copyButton.style.marginTop = '3px';

        const swapButton = document.createElement("span");
        swapButton.className = 'fa-solid fa-rotate';
        swapButton.title = "Swap preset";
        swapButton.style.fontSize = '15px'
        swapButton.style.marginTop = '3px';

        const clearButton = document.createElement("span");
        clearButton.className = 'fa-solid fa-xmark';
        clearButton.title = "Clear preset";
        clearButton.style.fontSize = '20px'
        clearButton.style.marginLeft = '10px'

        const arrow = document.createElement("span");
        arrow.textContent = "\u276E";
        arrow.className = "preset-arrow";

        preset.appendChild(presetNumber);
        preset.appendChild(presetInput);
        iconContainer.appendChild(copyButton);
        iconContainer.appendChild(swapButton);
        iconContainer.appendChild(clearButton);
        preset.appendChild(iconContainer);
        preset.appendChild(arrow);

        preset.addEventListener("click", function () {

            document.querySelectorAll(".preset").forEach(p => p.classList.remove("selected"));

            attachPresetConfig(preset);
            preset.classList.add("selected");

            if (activePreset && activePreset !== preset) {
                activePreset.querySelector(".preset-icon-container").style.display = "none";
            }

            const currentIconContainer = preset.querySelector(".preset-icon-container");
            currentIconContainer.style.display = "inline-flex";

            createTable(i, presetInput.value ? `${presetNumber.textContent} | ${presetInput.value}`: `${presetInput.placeholder}`);

            activePreset = preset;
        });

        sidebar.appendChild(preset);
    }
}

function createTable(index, presetName) {
    const mainContent = document.getElementById("mainContent");
    mainContent.innerHTML = "";

    const presetTitle = createPresetTitle(presetName);
    mainContent.appendChild(presetTitle);

    const topologyContainer = createTopologySection();
    mainContent.appendChild(topologyContainer);

    const mainTable = createFormattedTable();
    const smallTables = createSmallTables();

    mainContent.appendChild(mainTable);
    mainContent.appendChild(smallTables);
}

// Função para criar o título do preset
function createPresetTitle(presetName) {
    const presetTitle = document.createElement("h1");
    presetTitle.className = "preset-title";
    presetTitle.textContent = presetName;
    return presetTitle;
}

// Função para criar a seção de topologia com setas de navegação
function createTopologySection() {
    let currentTypeIndex = 0;


    const topologyContainer = document.createElement("div");
    topologyContainer.className = "topology-container";

    const topologyTitle = document.createElement("h2");
    topologyTitle.className = "topology-title";
    topologyTitle.textContent = "Topology:";

    const typeDisplay = document.createElement("span");
    typeDisplay.className = "type-display";
    typeDisplay.textContent = getType(currentTypeIndex);

    const leftArrow = document.createElement("span");
    leftArrow.className = "arrow left-arrow";
    leftArrow.textContent = "◀";
    leftArrow.style.cursor = "pointer";
    leftArrow.style.margin = "0 10px";
        leftArrow.addEventListener("click", () => {
        switch (typeDisplay.textContent) {
            case "Single": currentTypeIndex = 0; break;
            case "Dual": currentTypeIndex = 1; break;
            case "Series": currentTypeIndex = 2; break;
            case "Mixed": currentTypeIndex = 3; break;
            case "Cascade": currentTypeIndex = 4; break;
            default: currentTypeIndex = 5; break;
        }
        currentTypeIndex = (currentTypeIndex - 1 + 5) % 5;
        typeDisplay.textContent = getType(currentTypeIndex);
    });

    const rightArrow = document.createElement("span");
    rightArrow.className = "arrow right-arrow";
    rightArrow.textContent = "▶";
    rightArrow.style.cursor = "pointer";
    rightArrow.style.margin = "0 10px";
    rightArrow.addEventListener("click", () => {
        switch (typeDisplay.textContent) {
            case "Single": currentTypeIndex = 0; break;
            case "Dual": currentTypeIndex = 1; break;
            case "Series": currentTypeIndex = 2; break;
            case "Mixed": currentTypeIndex = 3; break;
            case "Cascade": currentTypeIndex = 4; break;
            default: currentTypeIndex = 5; break;
        }
        currentTypeIndex = (currentTypeIndex + 1) % 5;
        typeDisplay.textContent = getType(currentTypeIndex);
    });

    topologyContainer.appendChild(topologyTitle);
    topologyContainer.appendChild(leftArrow);
    topologyContainer.appendChild(typeDisplay);
    topologyContainer.appendChild(rightArrow);

    sendMessage([0xF0,0x31,0x00,0xF7]);
    sendMessage([0xF0,0x33,0x00,0xF7]);

    return topologyContainer;
}

function getType(index) {
    switch (index) {
        case 0: return "Single";
        case 1: return "Dual";
        case 2: return "Series";
        case 3: return "Mixed";
        case 4: return "Cascade";
        default: return "Unknown";
    }
}

// Função para criar a tabela Dry
function createFormattedTable() {
    const table = document.createElement("table");
    table.className = "preset-table";

    const tbody = document.createElement("tbody");

    const titleRow = document.createElement("tr");
    const titleCell = document.createElement("th");
    titleCell.colSpan = 3; // Título na linha toda
    titleCell.className = "table-title";
    titleCell.innerHTML = `
        <span style="font-size: 16px; font-weight: bold;">Style:</span>
        <span style="font-size: 12px; cursor: pointer;"> ◀ </span>
        <span style="font-size: 14px;">Pan Control</span>
        <span style="font-size: 12px; cursor: pointer;"> ▶</span>
    `;

    const row1 = createTableRow("Dry Level", -100, 100);
    const row2 = createTableRow("Dry Pan", -100, 100);

    titleCell.addEventListener("click", () => {
        if (titleCell.innerText.trim() === "Style: ◀ Pan Control ▶") {
            titleCell.innerHTML = `
                <span style="font-size: 16px; font-weight: bold;">Style:</span>
                <span style="font-size: 12px; cursor: pointer;"> ◀ </span>
                <span style="font-size: 14px;">Indiv. Level</span>
                <span style="font-size: 12px; cursor: pointer;"> ▶</span>
            `;
            updateTableRow(row1, "Dry Level Left", 0, 100);
            updateTableRow(row2, "Dry Level Right", 0, 100);
        } else {
            titleCell.innerHTML = `
                <span style="font-size: 16px; font-weight: bold;">Style:</span>
                <span style="font-size: 12px; cursor: pointer;"> ◀ </span>
                <span style="font-size: 14px;">Pan Control</span>
                <span style="font-size: 12px; cursor: pointer;"> ▶</span>
            `;
            updateTableRow(row1, "Dry Level", 0, 100);
            updateTableRow(row2, "Dry Pan", -100, 100);
        }
    });

    titleRow.appendChild(titleCell);
    tbody.appendChild(titleRow);
    tbody.appendChild(row1);
    tbody.appendChild(row2);

    table.appendChild(tbody);
    return table;
}

// Função para atualizar as linhas da tabela dry
function updateTableRow(row, newLabel, min, max) {
    row.children[0].textContent = newLabel;
    const slider = row.children[1].querySelector("input");
    slider.min = min;
    slider.max = max;
    if (min != 0 || newLabel == 'Dry Level') {
        if (newLabel == 'Dry Level'){
            slider.value = min;
            row.children[2].textContent = `${slider.value}%`;
        } else {
            slider.value = (min + max) / 2;
            row.children[2].textContent = `Center`;
        }
        slider.style.width = "290px";
        row.children[2].style.width = '90px';
    }
    else {
        slider.value = max;
        row.children[2].textContent = `${slider.value}%`;
        slider.style.width = "280px";
        row.children[2].style.width = '50px';
    }
    slider.style.background = `linear-gradient(to right, #53bfeb ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, white ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%)`;
}

// Função para criar linhas da tabela Dry
function createTableRow(name) {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = name;

    const sliderCell = document.createElement("td");
    const slider = document.createElement("input");
    slider.type = "range";
    
    slider.max = "100";
    slider.value = "0";
    slider.className = "slider";
    sliderCell.appendChild(slider);

    const valueCell = document.createElement("td");
    valueCell.className = "value-display";
    
    if (name != 'Dry Pan') {
        slider.min = "0";
        valueCell.textContent = "0";
    }
    else {
        slider.min = "-100";
        valueCell.textContent = "Center";
    }
    slider.style.background = `linear-gradient(to right, #53bfeb ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, white ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%)`;

    slider.addEventListener("input", function () {
        if (slider.value == 0 && name != 'Dry Level') valueCell.textContent = 'Center';
        else if (nameCell.textContent == 'Dry Pan'){
            console.log(name)
            if (slider.value < 0) valueCell.textContent = `Left ${slider.value * -1}%`;
            else valueCell.textContent = `Right ${slider.value}%`;
        }
        else valueCell.textContent = `${slider.value}%`;

        const min = this.min;
        const max = this.max;
        const value = this.value;

        const percentage = ((value - min) / (max - min)) * 100;

        // Atualiza o fundo do slider
        this.style.background = `linear-gradient(to right, #53bfeb ${percentage}%, white ${percentage}%)`;
    });

    row.appendChild(nameCell);
    row.appendChild(sliderCell);
    row.appendChild(valueCell);

    return row;
}

function createSmallTables() {
    const smallTablesContainer = document.createElement("div");
    smallTablesContainer.className = "small-tables-container";

    const table1 = createIndividualTable();
    const table2 = createIndividualTable();

    table1.style.width = "240px";
    table2.style.width = "240px";

    smallTablesContainer.appendChild(table1);
    smallTablesContainer.appendChild(table2);

    return smallTablesContainer;
}

// Função para criar as tabelas DSP
function createIndividualTable() {
    const table = document.createElement("table");
    table.className = "preset-table";

    const tbody = document.createElement("tbody");
    const labels = ["Time", "Feedback", "DelayMix", "High Cut", "Low Cut", "Saturation", "Mod Type"];

    labels.forEach((label, index) => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = label;

        const valueCell = document.createElement("td");
        valueCell.textContent = `Valor${index + 1}`;

        row.appendChild(nameCell);
        row.appendChild(valueCell);
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    return table;
}

function createPresetConfigSection() {
    const presetConfigContainer = document.createElement("div");
    presetConfigContainer.id = "preset-config-table";
    presetConfigContainer.className = "preset-config-container";

    const presetConfigTitle = document.createElement("h2");
    presetConfigTitle.className = "preset-config-title";
    presetConfigTitle.textContent = "Preset Config";

    presetConfigContainer.appendChild(presetConfigTitle);

    const settings = [
        "Bypass Load State", 
        "Trail", 
        "Spill Over", 
        "Preset BPM", 
        "Midi Clock", 
        "Auto Save"
    ];

    settings.forEach(setting => {
        const row = document.createElement("div");
        row.className = "preset-config-row";

        const label = document.createElement("span");
        label.textContent = setting;
        label.className = "preset-config-label";

        const button = document.createElement("button");
        button.textContent = "Off";
        button.className = "preset-config-button";

        if (setting === "Bypass Load State") {
            button.textContent = "Keep Same";
            button.style.color = '#53bfeb';

            button.addEventListener("click", () => {
                createPopup(["Keep Same", "Turn On", "Turn Off"], (selectedOption) => {
                    button.textContent = selectedOption;
                    switch(button.textContent){
                        case 'Keep Same':
                            button.style.color = '#53bfeb';
                            break;
                        case 'Turn On':
                            button.style.color = 'lime';
                            break;
                        case 'Turn Off':
                            button.style.color = 'red';
                    }
                }, event);
            });

        }else if (["Trail", "Midi Clock", "Auto Save"].includes(setting)) {
            button.style.color = 'red';
            button.addEventListener("click", () => {
                button.textContent = button.textContent === "Off" ? "On" : "Off";
                if (button.textContent === "Off") button.style.color = 'red';
                else button.style.color = 'lime';
            });

        }else if (setting === "Spill Over") {
            button.textContent = "Inactive";
            
        }else if (setting === "Preset BPM") {
            button.textContent = "Off";
            button.style.color = 'red';
            button.addEventListener("click", () => {
                const bpmOptions = ["Off", ...Array.from({ length: 241 }, (_, i) => (i + 40).toString())];
                createPopup(bpmOptions, (selectedOption) => {
                    button.textContent = selectedOption;
                    if (button.textContent == 'Off') button.style.color = 'red';
                    else button.style.color = 'lime';
                }, event);
            });
        }

        row.appendChild(label);
        row.appendChild(button);
        presetConfigContainer.appendChild(row);
    });
    return presetConfigContainer;
}

function createPopup(options, callback, event) {
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";

    const popup = document.createElement("div");
    popup.className = "popup-container";

    // Posicionar o popup no cursor
    const x = event.clientX;
    const y = event.clientY;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;

    const optionList = document.createElement("div");
    optionList.className = "popup-option-list";

    options.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option;
        button.className = "popup-option-button";
        
        //Ao clicar retorna o valor e fecha o popup
        button.addEventListener("click", () => {
            callback(option);
            document.body.removeChild(overlay);
        });
        optionList.appendChild(button);
    });

    popup.appendChild(optionList);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Remove o popup ao clicar fora
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

function attachPresetConfig(preset) {
    // Impede múltiplas tabelas config de serem criadas
    let existingConfig = document.getElementById("preset-config-table");
    if (existingConfig) {
        existingConfig.remove();
    }

    const presetConfigSection = createPresetConfigSection();
    
    // Posiciona a tabela no local correto
    preset.parentNode.insertBefore(presetConfigSection, preset.nextSibling);
}

createPresets();
