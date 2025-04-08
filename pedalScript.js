console.log("Script de fallback ativado!");
console.log(nomeControladora);

let activePreset = null;

const algorithmData = {
    "Glassy Delay": ["High Cut", "Low Cut", "Saturation", "Mod Type"],
    "Bucket Brigade": ["Tone", "Compression", "Modulation", "Grit", "Ducking", "Low Cut"],
    "TransistorTape": ["Tone", "Wow & Flutter", "Degradation", "High Cut"],
    "Quantum Pitch": ["Interval A", "Tone A", "Level A", "Interval B", "Tone B", "Level B", "Mode"],
    "Holo Filter": ["Type", "Ressonance", "Tone", "Envelope", "Sensitivity/Range", "Responce/Rate"],
    "RetroVerse": ["Sensitivity", "Release"],
    "Momery Man": ["Tone", "Compression", "Grit", "Mod Type", "Modulation", "Ducking"],
    "Nebula Swel": ["Sensitivity", "Responce"],
    "WhammyDelay": ["Heel", "Toe", "Tone", "Mode", "Speed"]
};

const algorithmStart = {
    "Glassy Delay": ["400ms", "80%", "80%", "OFF", "OFF", "0%", "OFF"],
    "Bucket Brigade": ["400ms", "80%", "80%", "50%", "75%", "60%", "20%", "10%", "OFF"],
    "TransistorTape": ["600ms", "80%", "80%", "50%", "35%", "0%", "OFF"],
    "Quantum Pitch": ["63ms", "0%", "100%", "-12", "60%", "100%", "0", "20%", "0%", "Fixed"],
    "Holo Filter": ["0ms", "80%", "80%", "LPF", "70%", "50%", "RMS", "40%", "50%"],
    "RetroVerse": ["800ms", "80%", "80%", "70%", "50%"],
    "Momery Man": ["200ms", "80%", "80%", "60%", "75%", "0%", "Vibrato", "10%", "10%"],
    "Nebula Swel": ["0ms", "0%", "80%", "50%", "50%"],
    "WhammyDelay": ["600ms", "80%", "80%", "-12", "7", "50%", "Auto", "0%"]
};

const parameterRanges = {
    "Time": { valor_inicial: 0, valor_final: 900, complemento: "ms" },
    "Feedback": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "DelayMix": { valor_inicial: 0, valor_final: 120, complemento: "%" },
    "High Cut": { valor_inicial: 500, valor_final: 8000, complemento: "Hz" },
    "Low Cut": { valor_inicial: 50, valor_final: 1500, complemento: "Hz" },
    "Saturation": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Tone": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Compression": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Modulation": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Grit": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Ducking": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Wow & Flutter": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Degradation": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Interval A": { valor_inicial: -12, valor_final: 12, complemento: "" },
    "Tone A": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Level A": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Interval B": { valor_inicial: -12, valor_final: 12, complemento: "" },
    "Tone B": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Level B": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Mode": { valor_inicial: "Fixed", valor_final: "Gradual", complemento: "" },
    "Type": { valor_inicial: "HPF", valor_final: "LPF", complemento: "Tipo de efeito" },
    "Ressonance": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Envelope": { valor_inicial: "RMS", valor_final: "Sine", complemento: "%" },
    "Sensitivity/Range": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Response/Rate": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Sensitivity": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Release": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Responce": { valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Heel": { valor_inicial: -12, valor_final: 12, complemento: "" },
    "Toe": { valor_inicial: -12, valor_final: 12, complemento: "" },
    "Speed": { valor_inicial: 0, valor_final: 100, complemento: "%" }
};

let algorithmDSP = [1, 1];
let algorithmDSP1 = [0,0,0,0,0,0,0,0,0,0,0,0]
let algorithmDSP2 = [0,0,0,0,0,0,0,0,0,0,0,0]

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
            if (preset.classList.contains("selected")) {
                return;
            }
        
            document.querySelectorAll(".preset").forEach(p => {
                p.classList.remove("selected");
                p.querySelector(".preset-arrow").style.transform = "rotate(-90deg) scale(1.8)"; // Resetar seta
            });
        
            sendMessage([0xF0, 0x43, i, 0xF7]);
        
            attachPresetConfig(preset);
            preset.classList.add("selected");
            arrow.style.transform = "rotate(90deg) scale(1.8)"; // Rotacionar seta
        
            if (activePreset && activePreset !== preset) {
                activePreset.querySelector(".preset-icon-container").style.display = "none";
            }
        
            const currentIconContainer = preset.querySelector(".preset-icon-container");
            currentIconContainer.style.display = "inline-flex";
        
            createTable(i, presetInput.value ? `${presetNumber.textContent} | ${presetInput.value}` : `${presetInput.placeholder}`);
        
            activePreset = preset;
        });

        presetInput.addEventListener("input", function () {
            const presetTitle = document.querySelector(".preset-title"); // Seleciona o título globalmente
            if (preset.classList.contains("selected")) {
                if (this.value)
                    presetTitle.textContent = `${presetNumber.textContent} | ${this.value}` 
                else presetTitle.textContent = this.placeholder;
            }
        });

        sidebar.appendChild(preset);
    }

    sendMessage ([0xF0,0x30,0x00,0xF7]);
}

function extractPresets(data) {
    if (data.length !== 33) {
        console.error("O array não possui 33 elementos");
        return;
    }

    let index = data[0]; 
    let inputs = document.querySelectorAll(".preset-name");

    for (let i = 0; i < 4; i++) { 
        let presetIndex = index * 4 + i; 
        if (presetIndex >= inputs.length) {
            console.warn(`Preset ${presetIndex} está fora do alcance.`);
            continue;
        }

        let name = String.fromCharCode(...data.slice(1 + i * 8, 1 + (i + 1) * 8)).trim();
        inputs[presetIndex].value = name || '';
    }
}

async function createTable(index, presetName) {
    const mainContent = document.getElementById("mainContent");
    mainContent.innerHTML = "";

    sendMessage([0xF0,0x37,0x00,0xF7]);
    sendMessage([0xF0,0x38,0x00,0xF7]);

    const presetTitle = createPresetTitle(presetName);
    mainContent.appendChild(presetTitle);

    const topologyContainer = createTopologySection();
    mainContent.appendChild(topologyContainer);

    const mainTable = createFormattedTable();
    const smallTables = await createSmallTables();
    const imageTable = createImageTable();

    mainContent.appendChild(mainTable);
    mainContent.appendChild(smallTables);
    mainContent.appendChild(imageTable);

    sendMessage([0xF0,0x33,0x00,0xF7]);
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
    typeDisplay.style.width = '70px'

    const leftArrow = document.createElement("span");
    leftArrow.className = "arrow left-arrow";
    leftArrow.textContent = "\u276E";
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
        sendMessage ([0xF0,0x32,currentTypeIndex,0xF7])
    });

    const rightArrow = document.createElement("span");
    rightArrow.className = "arrow right-arrow";
    rightArrow.textContent = "\u276E";
    rightArrow.style.transform = 'rotate(180deg)';
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
        sendMessage ([0xF0,0x32,currentTypeIndex,0xF7])
    });

    topologyContainer.appendChild(topologyTitle);
    topologyContainer.appendChild(leftArrow);
    topologyContainer.appendChild(typeDisplay);
    topologyContainer.appendChild(rightArrow);

    sendMessage([0xF0,0x31,0x00,0xF7]);
   //sendMessage([0xF0,0x33,0x00,0xF7]);

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
        <span style="font-size: 16px; font-weight;">Style:</span>
        <span style="font-size: 12px; cursor: pointer; margin-left: 10px;"> \u276E </span>
        <span style="font-size: 14px; margin-left: 10px; margin-right: 10px;">Pan Control</span>
        <span style="font-size: 12px; cursor: pointer;" class="rotate-arrow"> \u276E</span>
    `;

    const row1 = createTableRow("Dry Level", -100, 100);
    const row2 = createTableRow("Dry Pan", -100, 100);

    titleCell.addEventListener("click", () => {
        if (titleCell.innerText.trim() === "Style: \u276E Pan Control \u276E") {
            titleCell.innerHTML = `
                <span style="font-size: 16px;">Style:</span>
                <span style="font-size: 12px; cursor: pointer; margin-left: 10px;"> \u276E </span>
                <span style="font-size: 14px; margin-left: 10px; margin-right: 10px;">Indiv. Level</span>
                <span style="font-size: 12px; cursor: pointer;" class="rotate-arrow"> \u276E</span>
            `;
            updateTableRow(row1, "Dry Level Left", 0, 100);
            updateTableRow(row2, "Dry Level Right", 0, 100);
        } else {
            titleCell.innerHTML = `
                <span style="font-size: 16px;">Style:</span>
                <span style="font-size: 12px; cursor: pointer; margin-left: 10px;"> \u276E </span>
                <span style="font-size: 14px; margin-left: 10px; margin-right: 10px;">Pan Control</span>
                <span style="font-size: 12px; cursor: pointer;" class="rotate-arrow"> \u276E</span>
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
    row.children[2].style.color = 'lime';
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
    if (newLabel == 'Dry Pan') slider.style.background = 'white';
    else slider.style.background = `linear-gradient(to right, #53bfeb ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, white ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%)`;
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
    valueCell.style.color = "lime";
    
    if (name != 'Dry Pan') {
        slider.min = "0";
        valueCell.textContent = "0";
        slider.style.background = `linear-gradient(to right, #53bfeb ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, white ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%)`;
    }
    else {
        slider.min = "-100";
        valueCell.textContent = "Center";
    }
    

    slider.addEventListener("input", function () {
        if (slider.value == 0 && name != 'Dry Level') {
            valueCell.textContent = 'Center';
            valueCell.style.color = "lime";
        }
        else if (nameCell.textContent == 'Dry Pan'){
            
            if (slider.value < 0) {
                valueCell.textContent = `Left ${slider.value * -1}%`;
                valueCell.style.color = "rgb(255, 194, 0)";
            }
            else {
                valueCell.textContent = `Right ${slider.value}%`;
                valueCell.style.color = "#53bfeb";
            }
        }
        else {
            valueCell.textContent = `${slider.value}%`;
            valueCell.style.color = "lime";
        }

        const min = this.min;
        const max = this.max;
        const value = this.value;

        let percentage = ((value - min) / (max - min)) * 100;
        if (nameCell.textContent == 'Dry Pan') percentage = 0;

        // Atualiza o fundo do slider
        this.style.background = `linear-gradient(to right, #53bfeb ${percentage}%, white ${percentage}%)`;
    });

    row.appendChild(nameCell);
    row.appendChild(sliderCell);
    row.appendChild(valueCell);

    return row;
}

async function createSmallTables() {
    const smallTablesContainer = document.createElement("div");
    
    await delay(100)
    
    smallTablesContainer.className = "small-tables-container";

    //alert([...algorithmDSP])
    const table1 = createIndividualTable(1, algorithmDSP[0]);
    table1.style.width = "240px";
    
    const table2 = createIndividualTable(2, algorithmDSP[1]);
    table2.style.width = "240px";

    smallTablesContainer.appendChild(table1);
    smallTablesContainer.appendChild(table2);

    //alert(document.querySelector(".type-display").textContent)
    /*if (document.querySelector(".type-display").textContent != "Single") {
        const table2 = createIndividualTable(2);
        table2.style.width = "240px";
        smallTablesContainer.appendChild(table2);
    }*/ // So cria segunda tabela se tipo for diferente de Single

    return smallTablesContainer;
}

function updateSliders(value1, value2) {
    const sliders = document.querySelectorAll(".slider");
    const valueDisplays = document.querySelectorAll(".value-display");

    if (sliders.length >= 2 && valueDisplays.length >= 2) {
        // Atualiza o primeiro slider
        sliders[0].value = value1;
        valueDisplays[0].textContent = `${value1}%`;
        sliders[0].style.background = `linear-gradient(to right, #53bfeb ${((value1 - sliders[0].min) / (sliders[0].max - sliders[0].min)) * 100}%, white ${(value1 - sliders[0].min) / (sliders[0].max - sliders[0].min) * 100}%)`;

        // Atualiza o segundo slider
        sliders[1].value = value2 -100;
        //alert(sliders[1].value) voltar
        if (sliders[1].min < 0) {
            if (sliders[1].value == 0)
                valueDisplays[1].textContent = "Center" 
            else if (sliders[1].value < 0) {
                valueDisplays[1].textContent = `Left ${sliders[1].value * -1}%`;
                valueDisplays[1].style.color = "rgb(255, 194, 0)";
            }
            else {
                valueDisplays[1].textContent = `Right ${sliders[1].value}%`;
                valueDisplays[1].style.color = "#53bfeb";
            }
        } else {
            valueDisplays[1].textContent = `${value2}%`;
            sliders[1].style.background = `linear-gradient(to right, #53bfeb ${((value2 - sliders[1].min) / (sliders[1].max - sliders[1].min)) * 100}%, white ${(value2 - sliders[1].min) / (sliders[1].max - sliders[1].min) * 100}%)`;
        }
        
    } else {
        console.warn("Não foram encontrados sliders suficientes.");
    }
}

// Função para criar as tabelas DSP
function createIndividualTable(number, currentAlgorithmIndex) {
    const algorithmValues = [
        "OFF", "Glassy Delay", "Bucket Brigade", "TransistorTape", "Quantum Pitch", "Holo Filter", "RetroVerse", "Momery Man", "Nebula Swel", "WhammyDelay"
    ];
    //let currentAlgorithmIndex = 0;

    const table = document.createElement("table");
    table.className = "preset-table";
    table.id = `dsp-table-${number}`;
    table.style.position = "relative";

    const thead = document.createElement("thead");
    const titleRow = document.createElement("tr");
    const titleCell = document.createElement("th");
    titleCell.colSpan = 2;
    
    const algorithmContainer = document.createElement("div");
    algorithmContainer.className = "topology-container";

    const algorithmTitle = document.createElement("h2");
    algorithmTitle.className = "algorithm-title";
    algorithmTitle.textContent = "Algorithm:";
    
    const leftArrow = document.createElement("span");
    leftArrow.textContent = "\u276E";
    leftArrow.style.cursor = "pointer";
    
    const algorithmDisplay = document.createElement("span");
    algorithmDisplay.textContent = algorithmValues[currentAlgorithmIndex];
    algorithmDisplay.style.width = '103px';
    
    const rightArrow = document.createElement("span");
    rightArrow.textContent = "\u276E";
    rightArrow.style.cursor = "pointer";
    rightArrow.style.transform = 'rotate(180deg)';
    
    algorithmContainer.appendChild(algorithmTitle);
    algorithmContainer.appendChild(leftArrow);
    algorithmContainer.appendChild(algorithmDisplay);
    algorithmContainer.appendChild(rightArrow);
    
    titleCell.appendChild(algorithmContainer);
    titleRow.appendChild(titleCell);
    thead.appendChild(titleRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    
    function updateLabels(readingValues) {
        let labels = ["Time", "Feedback", "DelayMix", ...algorithmData[algorithmDisplay.textContent] || []];
        let startValues = algorithmStart[algorithmDisplay.textContent];

        if (document.querySelector(".type-display").textContent == "Single" && number == 2) {
            labels = labels.map(() => "Inactive");
        }
        
        tbody.innerHTML = "";
        if (algorithmDisplay.textContent === "OFF") {
            const emptyRow = document.createElement("tr");
            emptyRow.style.height = "1px";
            tbody.appendChild(emptyRow);
            const dspRow = document.createElement("tr");
            const emptyCell = document.createElement("td");
            const dspCell = document.createElement("td");
dspCell.textContent = `DSP${number}`;
dspCell.style.color = number == 1 ? 'rgb(255, 194, 0)' : 'SkyBlue';
dspCell.style.textAlign = "right";
dspCell.style.fontWeight = "bold";
dspCell.style.position = "absolute";
dspCell.style.bottom = "10px";
dspCell.style.right = "10px";
            
            dspRow.appendChild(emptyCell);
            dspRow.appendChild(dspCell);
            tbody.appendChild(dspRow);
            
            table.appendChild(tbody);
            return;
        }

        labels.forEach((label, index) => {
            const row = document.createElement("tr");
            
            const nameCell = document.createElement("td");
            nameCell.textContent = label;
            
            const valueCell = document.createElement("td");
            valueCell.className = 'td button';
            if (label === "Inactive") {
                valueCell.textContent = "Inactive";
            } else {
                if(readingValues) {
                    const range = parameterRanges[label];
                    let valorInicial = startValues[index];
                    
                    // Soma o valor inicial com o valor recebido para exibir corretamente
                    if (range && typeof range.valor_inicial === 'number') {
                        let extra;
                        if (number == 1) extra = algorithmDSP1[index] ?? 0;
                        else extra = algorithmDSP2[index] ?? 0;
                        valorInicial = range.valor_inicial + extra;
                        //alert(`${range.valor_inicial} + ${extra}`)
                        valueCell.textContent = `${valorInicial} ${range.complemento}`;
                    } else {
                        // Para valores que não são numéricos (ex: "Fixed", "Gradual")
                        valueCell.textContent = `${valorInicial}`;
                    }
                } else valueCell.textContent = `${startValues[index]}`;
            }
            
            if ((index + 1) % 3 === 0 && index !== 0 && (index+1) < labels.length) {
                nameCell.style.borderBottom = "1px solid rgba(216, 216, 216, 0.3)";
                valueCell.style.borderBottom = "1px solid rgba(216, 216, 216, 0.3)";
                row.style.color = "lime";
            } else if((index + 2) % 3 === 0 && index !== 0) row.style.color = "red";
            else row.style.color = "#53bfeb";

            valueCell.addEventListener("click", (event) => {
                const label = labels[index];
                if (label === "Inactive") return;
            
                const rangeData = parameterRanges[label]; // Obter o intervalo do JSON
                if (!rangeData) return;
            
                const options = [];
                for (let i = rangeData.valor_inicial; i <= rangeData.valor_final; i++) {
                    options.push(`${i} ${rangeData.complemento}`);
                }
            
                createPopup(options, (selectedValue) => {
                    valueCell.textContent = selectedValue;

                    setTimeout(() => {
                        const valueCells = tbody.querySelectorAll('td.button');
                        const currentValues = Array.from(valueCells).map(cell => cell.textContent);


                
                        if (number === 1) {
                            alert (`tabela 1 - ${currentValues}`);
                        } else if (number === 2) {
                            alert (`tabela 2 - ${currentValues}`);
                        }
                    }, 0);
                }, event);
            });            

            row.appendChild(nameCell);
            row.appendChild(valueCell);
            tbody.appendChild(row);
        });
        
        const dspRow = document.createElement("tr");
        const emptyCell = document.createElement("td");
        const dspCell = document.createElement("td");
        dspCell.textContent = `DSP${number}`;
        dspCell.style.color = number == 1 ? 'rgb(255, 194, 0)' : 'SkyBlue';
        dspCell.style.textAlign = "right";
        dspCell.style.fontWeight = "bold";
        
        dspRow.appendChild(emptyCell);
        dspRow.appendChild(dspCell);
        tbody.appendChild(dspRow);
        
        table.appendChild(tbody);
    }

    function updateAlgorithmDisplay() {
        algorithmDisplay.textContent = algorithmValues[currentAlgorithmIndex];
        updateLabels(false);
    }
    
    leftArrow.addEventListener("click", function () {
        currentAlgorithmIndex = (currentAlgorithmIndex - 1 + algorithmValues.length) % algorithmValues.length;
        updateAlgorithmDisplay();
    });

    rightArrow.addEventListener("click", function () {
        currentAlgorithmIndex = (currentAlgorithmIndex + 1) % algorithmValues.length;
        updateAlgorithmDisplay();
    });
    
    updateLabels(true);
    return table;
}

function updateDSPButtons(tableNum, buttonTexts) {
    if (buttonTexts.length === 0) return;

    const table = document.getElementById(`dsp-table-${tableNum}`);
    // Atualiza o algorithmDisplay
    const algorithmDisplay = table.querySelector(".topology-container span:nth-child(3)");
    switch (buttonTexts[0]) {
        case 0: algorithmDisplay.textContent = 'OFF'; break;
        case 1: algorithmDisplay.textContent = 'Glassy Delay'; break;
        case 2: algorithmDisplay.textContent = 'Bucket Brigade'; break;
        case 3: algorithmDisplay.textContent = 'TransistorTape'; break;
        case 4: algorithmDisplay.textContent = 'Quantum Pitch'; break;
        case 5: algorithmDisplay.textContent = 'Holo Filter'; break;
        case 6: algorithmDisplay.textContent = 'RetroVerse'; break;
        case 7: algorithmDisplay.textContent = 'Momery Man'; break;
        case 8: algorithmDisplay.textContent = 'Nebula Swel'; break;
        case 9: algorithmDisplay.textContent = 'WhammyDelay'; break;
    }

    // Atualiza os botões da tabela
    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    let labels = ["Time", "Feedback", "DelayMix", ...algorithmData[algorithmDisplay.textContent] || []];
    let startValues = buttonTexts.slice(1); // Os valores dos botões começam no segundo elemento

    // Garante que há valores suficientes
    while (startValues.length < labels.length) {
        startValues.push("N/A"); // Preenche com "N/A" se faltarem valores
    }

    // Limpa a tabela antes de recriá-la
    tbody.innerHTML = "";

    labels.forEach((label, index) => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = label;

        const valueCell = document.createElement("td");
        valueCell.classList.add("td", "button");
        valueCell.textContent = startValues[index];

        row.appendChild(nameCell);
        row.appendChild(valueCell);
        tbody.appendChild(row);
    });

    // Adiciona a linha do DSP
    const dspRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    const dspCell = document.createElement("td");
    dspCell.textContent = table.querySelector("td:last-child").textContent; // Mantém o nome DSP1 ou DSP2
    dspCell.style.color = dspCell.textContent === "DSP1" ? "rgb(255, 194, 0)" : "SkyBlue";
    dspCell.style.textAlign = "right";
    dspCell.style.fontWeight = "bold";

    dspRow.appendChild(emptyCell);
    dspRow.appendChild(dspCell);
    tbody.appendChild(dspRow);
}


function binaryOperation(lsb, msb, deslocamento) {
    let newMsb = msb << deslocamento;
    let result = lsb + newMsb;
    
    return result;
}

function createPresetConfigSection() {
    const presetConfigContainer = document.createElement("div");
    presetConfigContainer.id = "preset-config-table";
    presetConfigContainer.className = "preset-config-container";

    /*const presetConfigTitle = document.createElement("h2");
    presetConfigTitle.className = "preset-config-title";
    presetConfigTitle.textContent = "Preset Config";

    presetConfigContainer.appendChild(presetConfigTitle);*/

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
            row.style.borderBottom = 'solid rgba(216, 216, 216, 0.2) 1px';
            
        }else if (setting === "Preset BPM") {
            button.textContent = "Off";
            button.style.color = 'red';
            button.addEventListener("click", () => {
                const bpmOptions = ["Off", ...Array.from({ length: 241 }, (_, i) => (i + 40).toString())];
                createPopup(bpmOptions, (selectedOption) => {
                    button.textContent = selectedOption;
                    if (button.textContent == 'Off') button.style.color = 'red';
                    else button.style.color = '#53bfeb';
                }, event);
            });
        }

        row.appendChild(label);
        row.appendChild(button);
        presetConfigContainer.appendChild(row);
    });
    sendMessage([0xF0,0x35,0x00,0xF7]);
    return presetConfigContainer;
}

function updateButtonTexts(buttonTexts) {
    const buttons = document.querySelectorAll(".preset-config-button");
    const labels = document.querySelectorAll(".preset-config-label");
    
    buttons.forEach((button, index) => {
        switch (labels[index].textContent){
            case 'Bypass Load State':
                if (buttonTexts[index] == 0) button.textContent = 'Keep Same';
                else if (buttonTexts[index] == 1) button.textContent = 'Turn On';
                else button.textContent = 'Turn Off';
                break;
            case 'Preset BPM':
                if (buttonTexts[index] != 0) button.textContent = (buttonTexts[index] + 39);
                else button.textContent = 'Off';
                break;
            case 'Spill Over':
                button.textContent = 'Inactive';
                break;
            default:
                if (buttonTexts[index] == 1) button.textContent = 'On';
                else button.textContent = 'Off';
                break;
        }
        if (button.textContent == 'On' || button.textContent == 'Turn On') button.style.color = 'lime';
        else if (button.textContent == 'Off' || button.textContent == 'Turn Off') button.style.color = 'red';
        else if (button.textContent == 'Inactive') button.style.color = 'white';
        else button.style.color = '#53bfeb';
    });
}

function createImageTable() {
    const container = document.createElement("div");
    container.classList.add("image-container");

    const titleContainer = document.createElement("div");
    titleContainer.classList.add("image-title");

    const leftArrow = document.createElement("span");
    leftArrow.classList.add("image-arrow");
    leftArrow.textContent = "\u276E";
    leftArrow.style.cursor = "pointer";

    const typeWrapper = document.createElement("span"); // Novo wrapper para alinhamento
    typeWrapper.classList.add("type-wrapper");
    typeWrapper.textContent = "Image: ";

    const typeDisplay = document.createElement("span");
    typeDisplay.classList.add("type-display");
    const types = ["OFF", "The Haas Effect", "Speill by the Edge", "Ping-Pong", "Wet-Panning", "Dry-Panning", "Cross-Panning", "Transverse"];
    let currentIndex = 0;
    typeDisplay.textContent = types[currentIndex];
    typeDisplay.style.display = "inline-block"; // Permite definir width
    typeDisplay.style.textAlign = "center";
    typeDisplay.style.width = '160px';

    const rightArrow = document.createElement("span");
    rightArrow.classList.add("image-arrow");
    rightArrow.textContent = "\u276F";
    rightArrow.style.cursor = "pointer";
    
    leftArrow.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + types.length) % types.length;
        typeDisplay.textContent = `${types[currentIndex]}`;
    });
    
    rightArrow.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % types.length;
        typeDisplay.textContent = `${types[currentIndex]}`;
    });
    
    titleContainer.appendChild(typeWrapper);
    titleContainer.appendChild(leftArrow);
    titleContainer.appendChild(typeDisplay);
    titleContainer.appendChild(rightArrow);
    container.appendChild(titleContainer);

    const table = document.createElement("table");
    table.classList.add("image-table");
    
    const tbody = document.createElement("tbody");
    const rowsData = [
        [{ text: "Option 1", buttonText: "Select" }, { text: "Option 2", buttonText: "Select" }],
        [{ text: "Option 3", buttonText: "Select" }, { text: "Option 4", buttonText: "Select" }]
    ];

    rowsData.forEach(rowData => {
        const row = document.createElement("tr");
        rowData.forEach(cellData => {
            const cell = document.createElement("td");
            
            const textSpan = document.createElement("span");
            textSpan.textContent = cellData.text;
            
            const button = document.createElement("button");
            button.textContent = cellData.buttonText;
            button.classList.add("image-button");
            
            cell.appendChild(textSpan);
            cell.appendChild(button);
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
    
    return container;
}


function createPopup(options, callback, event) {
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
        
        // Ao clicar retorna o valor e fecha o popup
        button.addEventListener("click", () => {
            callback(option);
            closePopup();
        });
        optionList.appendChild(button);
    });

    popup.appendChild(optionList);
    document.body.appendChild(popup);

    // Função para remover o popup ao clicar fora
    function closePopup() {
        document.body.removeChild(popup);
        document.removeEventListener("click", outsideClickListener);
    }

    function outsideClickListener(e) {
        if (!popup.contains(e.target)) {
            closePopup();
        }
    }

    // Adiciona um evento de clique ao documento
    setTimeout(() => document.addEventListener("click", outsideClickListener), 0);
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
