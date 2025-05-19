console.log("Script de fallback ativado!");
console.log(nomeControladora);

let activePreset = null;

const algorithmData = {
    "Glassy Delay": ["High Cut", "Low Cut", "Saturation", "Mod Type"],
    "Bucket Brigade": ["Tone", "Compression", "Modulation", "Grit", "Ducking", "Low Cut"],
    "TransistorTape": ["Tone", "Wow & Flutter", "Degradation", "High Cut"],
    "Quantum Pitch": ["Interval A", "Tone A", "Level A", "Interval B", "Tone B", "Level B", "Mode"],
    "Holo Filter": ["Type", "Ressonance", "Tone", "Envelope", "Sensitivity/Range", "Response/Rate"],
    "RetroVerse": ["Sensitivity", "Release"],
    "Memory Man": ["Tone", "Compression", "Grit", "Mod Type", "Modulation", "Ducking"],
    "Nebula Swel": ["Sensitivity", "Responce"],
    "WhammyDelay": ["Heel", "Toe", "Tone", "Mode ", "Speed"]
};

const algorithmStart = {
    "Glassy Delay": ["400ms", "80%", "80%", "OFF", "OFF", "0%", "OFF"],
    "Bucket Brigade": ["400ms", "80%", "80%", "50%", "75%", "60%", "20%", "10%", "OFF"],
    "TransistorTape": ["600ms", "80%", "80%", "50%", "35%", "0%", "OFF"],
    "Quantum Pitch": ["63ms", "0%", "100%", "-12", "60%", "100%", "0", "20%", "0%", "Fixed"],
    "Holo Filter": ["0ms", "80%", "80%", "LPF", "70%", "50%", "RMS", "40%", "50%"],
    "RetroVerse": ["800ms", "80%", "80%", "70%", "50%"],
    "Memory Man": ["200ms", "80%", "80%", "60%", "75%", "0%", "Vibrato", "10%", "10%"],
    "Nebula Swel": ["0ms", "0%", "80%", "50%", "50%"],
    "WhammyDelay": ["600ms", "80%", "80%", "-12", "7", "50%", "Auto", "0%"]
};

const parameterRanges = {
    "Time": { tipo: "nenhum", valor_inicial: 0, valor_final: 900, complemento: "ms" },
    "Feedback": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "DelayMix": { tipo: "porcentagem", valor_inicial: 0, valor_final: 120, complemento: "%" },
    "High Cut": {
        tipo: "lista", valores: ["OFF", 500, 507, 525, 560, 617, 702, 821, 980, 1183, 1437,
            1747, 2120, 2559, 3072, 3664, 4340, 5105, 5967, 6930, 8000], complemento: "Hz"
    },
    "Low Cut": {
        tipo: "lista", valores: ["OFF", 50, 51, 54, 61, 72, 89, 112, 142, 182, 231, 291, 363,
            448, 547, 661, 792, 940, 1107, 1293, 1500], complemento: "Hz"
    },
    "Saturation": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Mod Type": {
        tipo: "lista", valores: ["OFF", "Vibrato", "Tremolo", "Chorus", "Phaser", "Flanger"],
        complemento: ""
    },
    "Tone": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Compression": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Modulation": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Grit": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Ducking": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Wow & Flutter": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Degradation": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Interval A": {
        tipo: "lista", valores: [-12, -11, -10, -9, -8, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3,
            4, 5, 6, 7, 8, 9, 10, 11, 12], complemento: ""
    },
    "Tone A": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Level A": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Interval B": {
        tipo: "lista", valores: [-12, -11, -10, -9, -8, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3,
            4, 5, 6, 7, 8, 9, 10, 11, 12], complemento: ""
    },
    "Tone B": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Level B": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Mode": { tipo: "lista", valores: ["Fixed", "Gradual"], complemento: "" },
    "Mode ": { tipo: "lista", valores: ["Auto", "CC"], complemento: "" },
    "Mode  ": { tipo: "lista", valores: ["Vintage", "Modern"], complemento: "" },
    "Type": { tipo: "lista", valores: ["LPF", "HPF", "BPF"], complemento: "" },
    "Ressonance": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Envelope": { tipo: "lista", valores: ["RMS", "Triangle", "Square", "Sine"], complemento: "" },
    "Sensitivity/Range": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Response/Rate": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Sensitivity": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Release": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Responce": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Heel": {
        tipo: "lista", valores: [-12, -11, -10, -9, -8, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5,
            6, 7, 8, 9, 10, 11, 12], complemento: ""
    },
    "Toe": {
        tipo: "lista", valores: [-12, -11, -10, -9, -8, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6,
            7, 8, 9, 10, 11, 12], complemento: ""
    },
    "Shape": { tipo: "lista", valores: ["Sine", "Triangle", "Square"], complemento: "" },
    "Speed": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" }
};

const timeAlg = {
    "Glassy Delay": { min: 0, max: 900, start: 400 },
    "Bucket Brigade": { min: 0, max: 944, start: 400 },
    "TransistorTape": { min: 2, max: 937, start: 400 },
    "Quantum Pitch": { min: 63, max: 823, start: 400 },
    "Holo Filter": { min: 0, max: 948, start: 400 },
    "RetroVerse": { min: 0, max: 830, start: 400 },
    "Memory Man": { min: 0, max: 940, start: 400 },
    "Nebula Swel": { min: 0, max: 948, start: 400 },
    "WhammyDelay": { min: 63, max: 823, start: 400 }
}

const modTypeData = {
    "OFF": [],
    "Vibrato": ["Speed", "Depth"],
    "Tremolo": ["Speed", "Depth", "Shape"],
    "Chorus": ["Speed", "Depth", "Voices"],
    "Phaser": ["Speed", "Depth", "Stages"],
    "Flanger": ["Speed", "Depth", "Mode  ", "Regen", "Manual"]
};

const modTypeDataStart = {
    "OFF": [],
    "Vibrato": [25, 60],
    "Tremolo": [25, 60, "Sine"],
    "Chorus": [25, 60, 3],
    "Phaser": [25, 60, 4],
    "Flanger": [25, 60, "Modern", 40, 50]
};

const modTypeValues = {
    "Speed": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Depth": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Shape": { tipo: "lista", valores: ["Sine", "Triangle", "Square"], complemento: "" },
    "Voices": { tipo: "nenhum", valor_inicial: 2, valor_final: 5, complemento: "" },
    "Stages": { tipo: "nenhum", valor_inicial: 2, valor_final: 4, complemento: "" },
    "Mode  ": { tipo: "lista", valores: ["Vintage", "Modern"], complemento: "" },
    "Regen": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Manual": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" }
};

const imageStereo = {
    "The Haas Effect": { Linhas: ["Delay"], start: [44] },
    "Spill by the Edge": { Linhas: ["Spill", "Distance"], start: [50, 40] },
    "Ping-Pong": { Linhas: ["Spread"], start: [50] },
    "Wet-Panning": { Linhas: ["Speed", "Depth"], start: [30, 100] },
    "Dry-Panning": { Linhas: ["Speed", "Depth"], start: [40, 100] },
    "Cross-Panning": { Linhas: ["Speed", "Depth"], start: [25, 100] },
    "Transverse": { Linhas: ["Speed", "Depth"], start: [30, 100] }
}

const imageRanges = {
    "Delay": { tipo: "lista", valor_inicial: 0, valor_final: 50, complemento: "ms" },
    "Spill": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Distance": { tipo: "lista", valor_inicial: 0, valor_final: 50, complemento: "ft" },
    "Spread": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Speed": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Depth": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
}

let algorithmDSP = [1, 1];
let algorithmDSP1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
let algorithmDSP2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

/*const colorMap = {
    Purple: 0x701F,
    Pink:   0xF80E,
    Cyan:   0x07FF,
    Green:  0x07E0,
    Orange: 0xFC00,
    Red:    0xF800,
    Yellow: 0xFFE0,
    Blue:   0x001F
};

const colorMap = {
    Purple: "rgb(115, 0, 255)",
    Pink:   "rgb(255, 0, 238)",
    Cyan:   "rgb(0, 255, 255)",
    Green:  "rgb(0, 255, 0)",
    Orange: "rgb(255, 194, 0)",
    Red:    "rgb(255, 0, 0)",
    Yellow: "rgb(255, 255, 0)",
    Blue:   "rgb(0, 0, 255)"
};*/

const colorMap = {
    Purple: "#7300ff",
    Pink:   "#ff0073",
    Cyan:   "#00ffff",
    Green:  "#00ff00",
    Orange: "#ff8200",
    Red:    "#ff0000",
    Yellow: "#ffff00",
    Blue:   "#0000ff"
}

function rgb565ToCss(rgb565) {
    const r = ((rgb565 >> 11) & 0x1F) * 255 / 31;
    const g = ((rgb565 >> 5) & 0x3F) * 255 / 63;
    const b = (rgb565 & 0x1F) * 255 / 31;
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// Cores
let myBlue = '#53bfeb';
let blueTransparent = 'rgba(83, 191, 235, 0.5)';
let purpleTransparent = 'rgba(159, 24, 253, 0.5)';
//blue = rgb565ToCss(colorMap["Cyan"]);
let green = rgb565ToCss(colorMap["Green"]);
let red = rgb565ToCss(colorMap["Red"]);
let yellow = rgb565ToCss(colorMap["Yellow"]);
let orange = rgb565ToCss(colorMap["Orange"]);
let purple = rgb565ToCss(colorMap["Purple"]);

green = "rgb(0, 255, 0)";
red = "rgb(255, 0, 0)";
orange = "rgb(255, 194, 0)";
purple ="rgb(115, 0, 255)";
let blue = "rgb(0, 255, 255)";

let saveBlue = "rgb(16, 130, 255)";

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

        if (i % 2 === 1) {
            preset.classList.add("preset-impar");
        }

        preset.addEventListener("click", function (event) {

            if (preset.classList.contains("selected")) {

                // Ignora cliques no input
                if (event.target.tagName === "INPUT") return;

                preset.classList.remove("selected");
                preset.style.backgroundColor = "";
                arrow.style.transform = "rotate(-90deg) scale(1.8)";
                preset.querySelector(".preset-icon-container").style.display = "none";

                // Remove a tabela de configuração se existir
                const existingConfig = document.getElementById("preset-config-table");
                if (existingConfig) {
                    existingConfig.remove();
                }

                mainContent.innerHTML = '';

                activePreset = null;
                return;
            }

            // Limpa seleção anterior
            document.querySelectorAll(".preset").forEach(p => {
                p.classList.remove("selected");
                p.style.backgroundColor = "";
                p.querySelector(".preset-arrow").style.transform = "rotate(-90deg) scale(1.8)";
            });

            // Remove qualquer config existente antes de abrir outro preset
            const existingConfig = document.getElementById("preset-config-table");
            if (existingConfig) {
                existingConfig.remove();
            }

            sendMessage([0xF0, 0x43, i, 0xF7]);

            attachPresetConfig(preset);
            preset.classList.add("selected");
            arrow.style.transform = "rotate(90deg) scale(1.8)";

            if (i % 2 === 0) {
                preset.style.backgroundColor = blueTransparent;
            } else {
                preset.style.backgroundColor = purpleTransparent;
            }

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

    sendMessage([0xF0, 0x30, 0x00, 0xF7]);
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

let updateImageRowsFunct = null;
async function createTable(index, presetName) {
    const mainContent = document.getElementById("mainContent");
    mainContent.innerHTML = "";

    sendMessage([0xF0, 0x37, 0x00, 0xF7]);
    //await delay(1000)
    sendMessage([0xF0, 0x38, 0x00, 0xF7]);
    //await delay(1000)

    const presetTitle = createPresetTitle(presetName);
    mainContent.appendChild(presetTitle);

    const topologyContainer = createTopologySection();
    mainContent.appendChild(topologyContainer);

    const mainTable = createFormattedTable();
    const smallTables = await createSmallTables();
    const imageTable = createImageTable();
    updateImageRowsFunct = imageTable.updateImageRows;

    mainContent.appendChild(mainTable);
    mainContent.appendChild(smallTables);
    mainContent.appendChild(imageTable.container);

    sendMessage([0xF0, 0x33, 0x00, 0xF7]);
    sendMessage([0xF0, 0x3B, 0x00, 0xF7]);

    const commandCenterTitle = document.createElement("h2");
    commandCenterTitle.textContent = "Command Center";
    commandCenterTitle.style.marginTop = "20px";
    commandCenterTitle.style.textAlign = "center";

    mainContent.appendChild(commandCenterTitle);
    mainContent.appendChild(createCommandCenterTables());
    mainContent.appendChild(createCommandCenterPage3());

    const sidebar2 = document.getElementById("sidebar2");
    sidebar2.appendChild(createSystemButtons())

    sendMessage([0xF0, 0x3D, 0x00, 0xF7]);
    sendMessage([0xF0, 0x3E, 0x00, 0xF7]);
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
    typeDisplay.id = "topology-type-display";
    typeDisplay.textContent = getType(currentTypeIndex);
    typeDisplay.style.width = '70px';
    typeDisplay.style.cursor = "pointer";

    const topologyOptions = ["Single", "Dual", "Series", "Mixed", "Cascade"];
    typeDisplay.addEventListener("click", (event) => {
        createPopup(topologyOptions, (selectedOption) => {
            currentTypeIndex = topologyOptions.indexOf(selectedOption);
            typeDisplay.textContent = selectedOption;
            sendMessage([0xF0, 0x32, currentTypeIndex, 0xF7]);

            const dsp2 = document.getElementById("dsp-table-2");
            if (dsp2 && dsp2.updateLabels) {
                dsp2.updateLabels(true);
            }
            if (selectedOption == "Mixed") setPanDisplayVisibility([false, true]);
            else setPanDisplayVisibility([true, true]);
        }, event);
    });


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
        sendMessage([0xF0, 0x32, currentTypeIndex, 0xF7])

        const dsp2 = document.getElementById("dsp-table-2");
        if (dsp2 && dsp2.updateLabels) {
            dsp2.updateLabels(true);
        }
        if (typeDisplay.textContent == "Mixed") setPanDisplayVisibility([false, true]);
        else setPanDisplayVisibility([true, true]);
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
        sendMessage([0xF0, 0x32, currentTypeIndex, 0xF7])

        const dsp2 = document.getElementById("dsp-table-2");
        if (dsp2 && dsp2.updateLabels) {
            dsp2.updateLabels(true);
        }
        if (typeDisplay.textContent == "Mixed") setPanDisplayVisibility([false, true]);
        else setPanDisplayVisibility([true, true]);
    });

    topologyContainer.appendChild(topologyTitle);
    topologyContainer.appendChild(leftArrow);
    topologyContainer.appendChild(typeDisplay);
    topologyContainer.appendChild(rightArrow);

    sendMessage([0xF0, 0x31, 0x00, 0xF7]);
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
    titleCell.colSpan = 3; // Titulo na linha toda
    titleCell.className = "table-title";

    const styleLabel = document.createElement("span");
    styleLabel.style.fontSize = "16px";
    styleLabel.textContent = "Style:";
    styleLabel.style.fontWeight = "bold";

    const arrowLeft = document.createElement("span");
    arrowLeft.style.fontSize = "12px";
    arrowLeft.style.cursor = "pointer";
    arrowLeft.style.marginLeft = "10px";
    arrowLeft.innerHTML = "\u276E";

    const modeLabel = document.createElement("span");
    modeLabel.style.fontSize = "16px";
    modeLabel.style.marginLeft = "10px";
    modeLabel.style.marginRight = "10px";
    modeLabel.style.cursor = "pointer";
    modeLabel.textContent = "Pan Control";
    modeLabel.style.display = "inline-block";
    modeLabel.style.width = "100px"

    const arrowRight = document.createElement("span");
    arrowRight.style.fontSize = "12px";
    arrowRight.style.cursor = "pointer";
    arrowRight.classList.add("rotate-arrow");
    arrowRight.innerHTML = "\u276E";

    titleCell.appendChild(styleLabel);
    titleCell.appendChild(arrowLeft);
    titleCell.appendChild(modeLabel);
    titleCell.appendChild(arrowRight);

    const row1 = createTableRow("Dry Level");
    const row2 = createTableRow("Dry Pan");

    function setMode(mode) {
        modeLabel.textContent = mode;

        if (mode === "Indiv. Level") {
            updateTableRow(row1, "Dry Level Left", 0, 100);
            updateTableRow(row2, "Dry Level Right", 0, 100);
            sendMessage([0xf0, 0x34, 0x01, 100, 4, 6, 0xf7]);
        } else {
            updateTableRow(row1, "Dry Level", 0, 100);
            updateTableRow(row2, "Dry Pan", -100, 100);
            sendMessage([0xf0, 0x34, 0x00, 100, 4, 6, 0xf7]);
        }
    }

    function toggleMode() {
        const current = modeLabel.textContent.trim();
        setMode(current === "Pan Control" ? "Indiv. Level" : "Pan Control");
    }

    arrowLeft.addEventListener("click", toggleMode);
    arrowRight.addEventListener("click", toggleMode);

    modeLabel.addEventListener("click", (event) => {
        const options = ["Pan Control", "Indiv. Level"];
        createPopup(options, (selectedValue) => {
            setMode(selectedValue);
        }, event);
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
    row.children[2].style.color = green;
    if (min != 0 || newLabel == 'Dry Level') {
        if (newLabel == 'Dry Level') {
            slider.value = max;
            row.children[2].textContent = `${slider.value}%`;
        } else {
            slider.value = (min + max) / 2;
            row.children[2].textContent = `Center`;
        }
        slider.style.width = "375px";
        row.children[2].style.width = '90px';
    }
    else {
        slider.value = max;
        row.children[2].textContent = `${slider.value}%`;
        slider.style.width = "375px";
        row.children[2].style.width = '50px';
    }
    if (newLabel == 'Dry Pan') slider.style.background = 'white';
    else slider.style.background = `linear-gradient(to right, ${blue} ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, white ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%)`;
}

// Função para criar linhas da tabela Dry
function createTableRow(name) {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = name;
    nameCell.style.minWidth = "110px";
    nameCell.style.maxWidth = "110px";

    const sliderCell = document.createElement("td");
    const slider = document.createElement("input");
    slider.type = "range";

    slider.max = "100";
    slider.value = "0";
    slider.className = "slider";
    sliderCell.appendChild(slider);

    const valueCell = document.createElement("td");
    valueCell.className = "value-display";
    valueCell.style.color = green;

    if (name != 'Dry Pan') {
        slider.min = "0";
        valueCell.textContent = "0";
        slider.style.background = `linear-gradient(to right, ${blue} ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, white ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%)`;
    }
    else {
        slider.min = "-100";
        valueCell.textContent = "Center";
    }

    let intervalId = null; // VAriavel para iniciar e encerrar o envio continuo
    let debounceTimeout; // Variavel para detectar se o usuario parou de interagir com o slider
    slider.addEventListener("input", function () {
        const min = this.min;
        const max = this.max;
        const value = this.value;
        let percentage = ((value - min) / (max - min)) * 100;

        if (nameCell.textContent === 'Dry Pan') {
            valueCell.textContent = value == 0 ? 'Center' :
                (value < 0 ? `Left ${-value}%` : `Right ${value}%`);
            valueCell.style.color = value < 0 ? orange : blue;
        } else {
            valueCell.textContent = `${value}%`;
            valueCell.style.color = green;
        }

        slider.style.background = nameCell.textContent === 'Dry Pan'
            ? 'white'
            : `linear-gradient(to right, ${blue} ${percentage}%, white ${percentage}%)`;

        const sliders = document.querySelectorAll(".slider");
        const sliderValues = Array.from(sliders).map(s => parseInt(s.value));
        let type = 1;
        if (nameCell.textContent === 'Dry Level' || nameCell.textContent === 'Dry Pan') {
            sliderValues[1] = sliderValues[1] + 100;
            type = 0;
        }
        const [lsb, msb] = BinaryOperationSend(sliderValues[1], 4);

        const sendDryMessage = () => {
            sendMessage([0xf0, 0x34, type, sliderValues[0], lsb, msb, 0xf7]);
        };

        // Inicia envio contínuo
        if (!intervalId) {
            intervalId = setInterval(sendDryMessage, 200);
        }

        // Inicia o debounce
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            clearInterval(intervalId);
            intervalId = null;
            // Envia a ultima mensagem 100ms apos encerrar o envio continuo
            setTimeout(sendDryMessage, 100);
        }, 100);
    });

    slider.addEventListener("wheel", (event) => {
        event.preventDefault(); // Impede scroll da página
        const step = 1;
        let newValue = parseInt(slider.value) + (event.deltaY < 0 ? step : -step);
        newValue = Math.max(parseInt(slider.min), Math.min(parseInt(slider.max), newValue));
        slider.value = newValue;

        if (nameCell.textContent === "Dry Pan" || nameCell.textContent === "Dry Level Right" || nameCell.textContent === "Dry Level Left") {
            if (newValue == 0 && nameCell.textContent === "Dry Pan") {
                valueCell.textContent = "Center";
                valueCell.style.color = green;
            } else if (newValue < 0 && nameCell.textContent === "Dry Pan") {
                valueCell.textContent = `Left ${-newValue}%`;
                valueCell.style.color = orange;
            } else if (newValue > 0 && nameCell.textContent === "Dry Pan") {
                valueCell.textContent = `Right ${newValue}%`;
                valueCell.style.color = blue;
            } else {
                valueCell.textContent = `${newValue}%`;
                valueCell.style.color = green;
            }
        } else {
            valueCell.textContent = `${newValue}%`;
            valueCell.style.color = green;
        }

        if (nameCell.textContent === "Dry Pan") {
            slider.style.background = "white";
        } else {
            const pct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
            slider.style.background = `linear-gradient(to right, ${blue} ${pct}%, white ${pct}%)`;
        }

        const sliders = document.querySelectorAll(".slider");
        const sliderValues = Array.from(sliders).map(s => parseInt(s.value));
        let type = 1;
        if (nameCell.textContent === 'Dry Level' || nameCell.textContent === 'Dry Pan' || nameCell.textContent === 'Dry Level Right' || nameCell.textContent === 'Dry Level Left') {
            sliderValues[1] = sliderValues[1] + 100;
            type = 0;
        }

        const [lsb, msb] = BinaryOperationSend(sliderValues[1], 4);
        sendMessage([0xf0, 0x34, type, sliderValues[0], lsb, msb, 0xf7]);
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
    table1.style.width = "300px"; // era 240

    const table2 = createIndividualTable(2, algorithmDSP[1]);
    table2.style.width = "300px"; // era 240

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
        sliders[0].style.background = `linear-gradient(to right, ${blue} ${((value1 - sliders[0].min) / (sliders[0].max - sliders[0].min)) * 100}%, white ${(value1 - sliders[0].min) / (sliders[0].max - sliders[0].min) * 100}%)`;

        // Atualiza o segundo slider
        sliders[1].value = value2 - 100;
        //alert(sliders[1].value) voltar
        if (sliders[1].min < 0) {
            if (sliders[1].value == 0)
                valueDisplays[1].textContent = "Center"
            else if (sliders[1].value < 0) {
                valueDisplays[1].textContent = `Left ${sliders[1].value * -1}%`;
                valueDisplays[1].style.color = orange;
            }
            else {
                valueDisplays[1].textContent = `Right ${sliders[1].value}%`;
                valueDisplays[1].style.color = blue;
            }
        } else {
            valueDisplays[1].textContent = `${value2}%`;
            sliders[1].style.background = `linear-gradient(to right, ${blue} ${((value2 - sliders[1].min) / (sliders[1].max - sliders[1].min)) * 100}%, white ${(value2 - sliders[1].min) / (sliders[1].max - sliders[1].min) * 100}%)`;
        }

    } else {
        console.warn("Não foram encontrados sliders suficientes.");
    }
}

// Função para criar as tabelas DSP
function createIndividualTable(number, currentAlgorithmIndex) {
    const algorithmValues = [
        "OFF", "Glassy Delay", "Bucket Brigade", "TransistorTape", "Quantum Pitch", "Holo Filter", "RetroVerse", "Memory Man", "Nebula Swel", "WhammyDelay"
    ];

    // Lida com o envio das mensagens DSP
    let dspDebounceTimeout;
    function triggerDSPAlert() {
        if (!table || !table.querySelectorAll) return;

        const algAux = table.querySelector(".topology-container span:nth-child(3)").textContent.trim();
        const indexAlg = algorithmValues.indexOf(algAux);
        let paramAlternativo = [0, 0];
        const figValues = ["1/1", "1/2 Dot", "1/2", "1/2 Trip", "1/4 Dot", "1/4", "1/4 Trip", "1/8 Dot", "1/8", "1/8 Trip", "1/16 Dot", "1/16", "1/16 Trip"];

        const displayValues = Array.from(table.querySelectorAll("tr")).map(row => {
            const labelEl = row.querySelector("td:first-child");
            const td = row.querySelector("td.button");

            if (!labelEl || !td) return null;

            const label = labelEl.textContent;
            const input = td.querySelector("input");
            const span = td.querySelector("span");

            // Caso especial: Time com Fig. Rit. ativo
            if (label === "TimeFig. Rit." || label === "SpeedFig. Rit.") {

                const figButton = row.querySelector(".time-toggle-button");
                if (figButton?.dataset.pressed === "true" && span) {
                    if (label === "TimeFig. Rit.") {
                        paramAlternativo[0] = 1;
                    } else paramAlternativo[1] = 1;
                    const figText = span.textContent.trim();
                    const figIndex = figValues.indexOf(figText);
                    //alert (figIndex)
                    return figIndex;
                }
            }

            // Se encontrar um input, retorna o valor dele
            if (input) {
                return Number(input.value);
            }

            let rawText = "";
            if (span) rawText = span.textContent.trim();
            else rawText = td.textContent.trim();

            const paramInfo = parameterRanges[label];
            if (paramInfo && paramInfo.tipo === "lista") {
                let cleanValue = rawText;

                // Remove complemento
                if (paramInfo.complemento && rawText.endsWith(paramInfo.complemento)) {
                    cleanValue = rawText.replace(paramInfo.complemento, "").trim();
                }

                // Converte para valor numerico se possível
                const testValue = isNaN(cleanValue) ? cleanValue : Number(cleanValue);
                const index = paramInfo.valores.indexOf(testValue);

                return index;
            }

            return rawText;
        }).filter(val => val !== null && val !== "");

        const time = displayValues[0];
        const [lsb, msb] = BinaryOperationSend(displayValues[0], 5);
        displayValues.splice(0, 1, lsb, msb);

        while (displayValues.length < 13) {
            displayValues.push(0);
        }

        //alert(`Valores da tabela DSP${number}:\n\n` + displayValues.join("\n"));
        //alert([...paramAlternativo])
        //alert(indexAlg)
        //alert([0xf0, 0x38 + number, indexAlg, ...displayValues, ...paramAlternativo, 0xf7])
        sendMessage([0xf0, 0x38 + number, indexAlg, ...displayValues, ...paramAlternativo, 0xf7])
        
        //alert(algorithmDSP2)
        algorithmDSP2 = [time, ...displayValues.slice(2), ...paramAlternativo];
        //alert (algorithmDSP2);
    }
    // Seta o debounce para o envio da mensagem
    function scheduleDSPAlert() {
        clearTimeout(dspDebounceTimeout);
        dspDebounceTimeout = setTimeout(triggerDSPAlert, 1000);
    }

    //let currentAlgorithmIndex = 0;

    const table = document.createElement("table");
    table.className = "preset-table2";
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
    algorithmTitle.style.marginRight = "30px";
    algorithmTitle.style.marginLeft = "10px";

    const leftArrow = document.createElement("span");
    leftArrow.textContent = "\u276E";
    leftArrow.style.cursor = "pointer";
    leftArrow.style.fontWeight = "normal";

    const algorithmDisplay = document.createElement("span");
    algorithmDisplay.textContent = algorithmValues[currentAlgorithmIndex];
    algorithmDisplay.style.width = '125px';
    algorithmDisplay.style.fontSize = '16px';
    algorithmDisplay.style.fontWeight = "normal";
    algorithmDisplay.style.cursor = "pointer";

    const rightArrow = document.createElement("span");
    rightArrow.textContent = "\u276E";
    rightArrow.style.cursor = "pointer";
    rightArrow.style.transform = 'rotate(180deg)';
    rightArrow.style.fontWeight = "normal";

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
            tbody.innerHTML = "";
            const inactiveRow = document.createElement("tr");
            const inactiveCell = document.createElement("td");
            inactiveCell.colSpan = 2;
            inactiveCell.textContent = "Inactive";
            inactiveCell.style.textAlign = "center";
            inactiveCell.style.color = "gray";
            inactiveCell.style.padding = "10px 0";
            inactiveRow.appendChild(inactiveCell);
            tbody.appendChild(inactiveRow);

            return;
        }

        tbody.innerHTML = "";
        if (algorithmDisplay.textContent === "OFF") {
            table.appendChild(tbody);
            return;
        }

        labels.forEach((label, index) => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.style.paddingLeft = '5px';

            const valueCell = document.createElement("td");
            valueCell.className = 'td button';
            valueCell.style.paddingRight = '5px';

            const labelContainer = document.createElement("div");
            labelContainer.style.display = "flex";
            labelContainer.style.alignItems = "center";
            labelContainer.style.gap = "6px";

            const labelText = document.createElement("span");
            labelText.textContent = label;
            labelContainer.appendChild(labelText);

            nameCell.appendChild(labelContainer);

            const range = parameterRanges[label];
            let extraValue;
            let displayValue = startValues[index] ?? "";

            if (readingValues) {
                extraValue = number === 1 ? (algorithmDSP1[index] ?? 0) : (algorithmDSP2[index] ?? 0);
            } else {
                if (range?.tipo === "porcentagem") {
                    extraValue = parseInt(displayValue);
                } else if (label === "Time") {
                    extraValue = parseInt(displayValue) - timeAlg[algorithmDisplay.textContent].min;
                }
                else if (range?.tipo === "lista") {

                }
                else {
                    extraValue = 0;
                }
            }

            let toggleButton;
            if (label === "Time") {
                toggleButton = document.createElement("button");
                toggleButton.textContent = "Fig. Rit.";
                toggleButton.className = "time-toggle-button";
                toggleButton.style.padding = "2px 6px";
                toggleButton.style.fontSize = "12px";
                toggleButton.style.borderRadius = "4px";
                toggleButton.style.border = "1px solid rgb(167, 167, 167)";
                toggleButton.style.background = "transparent";
                toggleButton.style.color = "rgb(167, 167, 167)";
                toggleButton.style.cursor = "pointer";
                toggleButton.style.marginLeft = "100px"; // Perto do input
                toggleButton.style.marginLeft = "5px"; // Perto do texto
                toggleButton.style.minWidth = "56px";
                toggleButton.dataset.pressed = "false";
                labelContainer.appendChild(toggleButton);

                // Lê se o Fig.Rit. esta ligado
                if (readingValues) {
                    const toggleState = (number === 1 ? algorithmDSP1[12] : algorithmDSP2[12]) === 1;
                    toggleButton.dataset.pressed = toggleState ? "true" : "false";
                    toggleButton.style.color = toggleState ? green : "rgb(167, 167, 167)";
                    toggleButton.style.border = toggleState ? "1px solid lime" : "1px solid rgb(167, 167, 167)";
                }

                function renderTimeCell() {
                    valueCell.innerHTML = "";
                    const container = document.createElement("div");
                    container.style.display = "flex";
                    container.style.alignItems = "center";
                    container.style.justifyContent = "flex-end";
                    container.style.gap = "0px";

                    const mm = timeAlg[algorithmDisplay.textContent];
                    if (toggleButton.dataset.pressed === "true") {
                        const figValues = ["1/1", "1/2 Dot", "1/2", "1/2 Trip", "1/4 Dot", "1/4", "1/4 Trip", "1/8 Dot", "1/8", "1/8 Trip", "1/16 Dot", "1/16", "1/16 Trip"];
                        const span = document.createElement("span");
                        span.textContent = figValues[extraValue] ?? figValues[0];
                        span.style.cursor = "pointer";
                        span.style.display = "inline-block";
                        span.style.padding = "2px 0";
                        span.style.fontSize = "16px";
                        span.style.minHeight = "18px";
                        //span.style.color = "lime";
                        span.addEventListener("click", ev => {
                            createPopup(figValues, sel => {
                                span.textContent = sel;
                                scheduleDSPAlert();
                            }, ev);
                        });                        
                        container.appendChild(span);
                    } else {
                        const input = document.createElement("input");
                        input.type = "number";
                        input.min = mm.min;
                        input.max = mm.max;
                        input.value = mm.min + extraValue;
                        input.style.width = "30px";
                        input.style.fontSize = "16px";
                        input.style.textAlign = "right";
                        input.style.background = "transparent";
                        input.style.border = "none";
                        input.style.color = blue;
                        input.style.borderRadius = "4px";
                        input.style.padding = "2px";
                        input.style.cursor = "pointer";

                        const suffix = document.createElement("span");
                        suffix.textContent = "ms";
                        suffix.style.fontSize = "14px";
                        suffix.style.color = blue;
                        container.appendChild(input);
                        container.appendChild(suffix);
                        input.addEventListener("input", () => {
                            scheduleDSPAlert();
                        });
                    }

                    valueCell.appendChild(container);
                }

                toggleButton.addEventListener("click", () => {
                    const isPressed = toggleButton.dataset.pressed === "true";
                    toggleButton.dataset.pressed = isPressed ? "false" : "true";
                    toggleButton.style.color = isPressed ? "rgb(167, 167, 167)" : green;
                    toggleButton.style.border = isPressed ? "1px solid rgb(167, 167, 167)" : "1px solid lime";
                    renderTimeCell();
                    //scheduleDSPAlert();
                    if (isPressed) sendMessage([0xF0,0x46,0,number-1,0xF7]);
                    else sendMessage([0xF0,0x46,1,number-1,0xF7]);
                    sendMessage([0xF0,0x36 + number,0x00,0xF7]);
                });

                renderTimeCell();
            } else if (range?.tipo === "lista") {
                const current = readingValues
                    ? (range.valores[extraValue] ?? "OFF")
                    : (startValues[index] ?? "OFF");
                valueCell.textContent = current === "OFF" ? "OFF" : `${current} ${range.complemento}`;
                valueCell.style.cursor = "pointer";
                valueCell.addEventListener("click", (e) => {
                    const options = range.valores.map(v => v === "OFF" ? "OFF" : `${v} ${range.complemento}`);
                    createPopup(options, sel => {
                        valueCell.textContent = sel;

                        if (label === "Mod Type" && algorithmDisplay.textContent === "Glassy Delay") {
                            updateModTypeExtraRows(tbody, sel, false);
                        }

                        scheduleDSPAlert();
                    }, e);
                });
            } else if (range?.tipo === "porcentagem") {
                const slider = document.createElement("input");
                slider.type = "range";
                slider.min = range.valor_inicial;
                slider.max = range.valor_final;
                slider.value = range.valor_inicial + extraValue;
                slider.className = "mini-slider";
                slider.style.width = "95px";
                slider.style.marginRight = "5px";
                const pct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
                slider.style.background = `linear-gradient(to right, ${blue} ${pct}%, white ${pct}%)`;

                const display = document.createElement("span");
                display.textContent = `${slider.value}${range.complemento}`;
                display.style.fontSize = "15px";
                display.style.display = "inline-block";
                display.style.width = "30px";
                display.style.textAlign = "right";

                slider.addEventListener("input", () => {
                    display.textContent = `${slider.value}${range.complemento}`;
                    const newPct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
                    slider.style.background = `linear-gradient(to right, ${blue} ${newPct}%, white ${newPct}%)`;
                    scheduleDSPAlert();
                });

                slider.addEventListener("wheel", (event) => {
                    event.preventDefault(); // Impede a rolagem da tela
                    const step = 1;
                    let newValue = parseInt(slider.value) + (event.deltaY < 0 ? step : -step);
                    newValue = Math.max(parseInt(slider.min), Math.min(parseInt(slider.max), newValue));
                    slider.value = newValue;

                    display.textContent = `${slider.value}${range.complemento}`;
                    const newPct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
                    slider.style.background = `linear-gradient(to right, ${blue} ${newPct}%, white ${newPct}%)`;

                    scheduleDSPAlert();
                });

                valueCell.innerHTML = "";
                valueCell.appendChild(slider);
                valueCell.appendChild(display);
            }

            if ((index + 1) % 3 === 0) {
                if ((index + 1) < labels.length) {
                    nameCell.style.borderBottom = "1px solid rgba(216, 216, 216, 0.3)";
                    nameCell.style.paddingBottom = "5px";
                    valueCell.style.borderBottom = "1px solid rgba(216, 216, 216, 0.3)";
                    valueCell.style.paddingBottom = "5px";
                }
                row.style.color = green;
            } else if ((index + 2) % 3 === 0 && index !== 0) {
                row.style.color = "red";
            } else {
                row.style.color = blue;
            }

            row.appendChild(nameCell);
            row.appendChild(valueCell);
            tbody.appendChild(row);

            if (label === "Mod Type" && algorithmDisplay.textContent == "Glassy Delay") {
                const modType = valueCell.textContent.trim();
                updateModTypeExtraRows(tbody, modType, readingValues);
            }
        });
        table.appendChild(tbody);
    }
    table.updateLabels = updateLabels; // Permite chamar a função de forea do createTable

    function updateModTypeExtraRows(tbody, modType, readingValues) {
        modType = modType.trim();

        // Remove linhas antigas
        tbody.querySelectorAll(".modtype-extra-row").forEach(el => el.remove());
        tbody.querySelectorAll(".modtype-empty-row").forEach(el => el.remove());
        // Remove a linha DSP se já existir
        tbody.querySelectorAll("tr").forEach(tr => {
            const lastCell = tr.lastElementChild;
            if (lastCell && lastCell.textContent?.includes("DSP")) {
                tr.remove();
            }
        });

        if (!modTypeData[modType] || modType === "OFF") return;

        let modTypeIndex = tbody.querySelectorAll("tr").length;

        const labelsMain = ["Time", "Feedback", "DelayMix", ...algorithmData[algorithmDisplay.textContent] || []];
        const extraBaseIndex = labelsMain.length;

        const currentDSPArray = (number === 1) ? algorithmDSP1 : algorithmDSP2;
        const defaultValues = modTypeDataStart[modType] || [];

        modTypeData[modType].forEach((extraLabel, extraIndex) => {
            const extraRow = document.createElement("tr");
            extraRow.classList.add("modtype-extra-row");

            const extraNameCell = document.createElement("td");
            extraNameCell.textContent = extraLabel;
            extraNameCell.style.paddingLeft = '5px';

            const extraValueCell = document.createElement("td");
            extraValueCell.className = 'td button';
            extraValueCell.style.paddingRight = '5px';

            const tipo = modTypeValues[extraLabel]?.tipo;
            let valor;
            if (readingValues) {
                const dsp = number === 1 ? algorithmDSP1 : algorithmDSP2;
                valor = dsp[extraBaseIndex + extraIndex];
            } else {
                valor = modTypeDataStart[modType]?.[extraIndex];
            }

            if (typeof valor === "string" && !isNaN(valor)) {
                valor = Number(valor);
            }

            if (tipo === "porcentagem") {
                const labelContainer = document.createElement("div");
                labelContainer.style.display = "flex";
                labelContainer.style.alignItems = "center";
                labelContainer.style.gap = "6px";
                extraNameCell.innerHTML = '';
                const labelSpan = document.createElement("span");
                labelSpan.textContent = extraLabel;
                labelContainer.appendChild(labelSpan);
                extraNameCell.appendChild(labelContainer);

                const figValues = ["1/1", "1/2 Dot", "1/2", "1/2 Trip", "1/4 Dot", "1/4", "1/4 Trip", "1/8 Dot", "1/8", "1/8 Trip", "1/16 Dot", "1/16", "1/16 Trip"];

                let toggleButton = null;
                if (extraLabel === "Speed") {
                    toggleButton = document.createElement("button");
                    toggleButton.textContent = "Fig. Rit.";
                    toggleButton.className = "time-toggle-button";
                    toggleButton.style.padding = "2px 6px";
                    toggleButton.style.fontSize = "12px";
                    toggleButton.style.borderRadius = "4px";
                    toggleButton.style.border = "1px solid rgb(167, 167, 167)";
                    toggleButton.style.background = "transparent";
                    toggleButton.style.color = "rgb(167, 167, 167)";
                    toggleButton.style.cursor = "pointer";
                    toggleButton.style.minWidth = "56px";
                    toggleButton.dataset.pressed = "false";

                    if (readingValues) {
                        const isPressed = (number === 1 ? algorithmDSP1[13] : algorithmDSP2[13]) === 1;
                        toggleButton.dataset.pressed = isPressed ? "true" : "false";
                        toggleButton.style.color = isPressed ? green : "rgb(167, 167, 167)";
                        toggleButton.style.border = isPressed ? "1px solid lime" : "1px solid rgb(167, 167, 167)";
                    }

                    labelContainer.appendChild(toggleButton);
                }

                function renderSliderOrFig() {
                    extraValueCell.innerHTML = '';

                    const isFig = toggleButton?.dataset.pressed === "true";

                    if (extraLabel === "Speed" && isFig) {
                        const span = document.createElement("span");
                        span.textContent = figValues[valor] ?? figValues[0];
                        span.style.cursor = "pointer";
                        //span.style.color = "lime";
                        span.style.fontSize = "16px";
                        span.addEventListener("click", ev => {
                            createPopup(figValues, sel => {
                                span.textContent = sel;
                                scheduleDSPAlert();
                            }, ev);
                        });
                        extraValueCell.appendChild(span);
                        return;
                    }

                    const slider = document.createElement("input");
                    slider.type = "range";
                    slider.min = modTypeValues[extraLabel].valor_inicial;
                    slider.max = modTypeValues[extraLabel].valor_final;
                    slider.value = valor;
                    slider.className = "mini-slider";
                    slider.style.width = "95px";
                    slider.style.marginRight = "5px";
                    const pct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
                    slider.style.background = `linear-gradient(to right, ${blue} ${pct}%, white ${pct}%)`;

                    const display = document.createElement("span");
                    display.textContent = `${slider.value}${modTypeValues[extraLabel].complemento}`;
                    display.style.fontSize = "15px";
                    display.style.display = "inline-block";
                    display.style.width = "30px";
                    display.style.textAlign = "right";

                    slider.addEventListener("input", () => {
                        display.textContent = `${slider.value}${modTypeValues[extraLabel].complemento}`;
                        const newPct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
                        slider.style.background = `linear-gradient(to right, ${blue} ${newPct}%, white ${newPct}%)`;
                        scheduleDSPAlert();
                    });

                    slider.addEventListener("wheel", (event) => {
                        event.preventDefault();
                        const step = 1;
                        let newValue = parseInt(slider.value) + (event.deltaY < 0 ? step : -step);
                        newValue = Math.max(parseInt(slider.min), Math.min(parseInt(slider.max), newValue));
                        slider.value = newValue;
                        display.textContent = `${slider.value}${modTypeValues[extraLabel].complemento}`;
                        const newPct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
                        slider.style.background = `linear-gradient(to right, ${blue} ${newPct}%, white ${newPct}%)`;
                        scheduleDSPAlert();
                    });

                    extraValueCell.appendChild(slider);
                    extraValueCell.appendChild(display);
                }

                if (toggleButton) {
                    toggleButton.addEventListener("click", () => {
                        const isPressed = toggleButton.dataset.pressed === "true";
                        toggleButton.dataset.pressed = isPressed ? "false" : "true";
                        toggleButton.style.color = isPressed ? "rgb(167, 167, 167)" : green;
                        toggleButton.style.border = isPressed ? "1px solid rgb(167, 167, 167)" : "1px solid lime";
                        renderSliderOrFig();
                        scheduleDSPAlert();
                    });
                }

                renderSliderOrFig();
            }


            else if (tipo === "lista") {
                const span = document.createElement("span");
                span.textContent = modTypeValues[extraLabel].valores[valor] ?? modTypeValues[extraLabel].valores[0];
                span.style.cursor = "pointer";
                span.style.display = "inline-block";
                span.style.padding = "2px 0";
                span.style.fontSize = "16px";
                span.style.minHeight = "18px";
                span.style.color = blue;

                span.addEventListener("click", ev => {
                    createPopup(modTypeValues[extraLabel].valores, sel => {
                        span.textContent = sel;
                        scheduleDSPAlert();
                    }, ev);
                });

                extraValueCell.appendChild(span);
            }

            else { // tipo === "nenhum"
                const input = document.createElement("input");
                input.type = "number";
                input.min = modTypeValues[extraLabel].valor_inicial;
                input.max = modTypeValues[extraLabel].valor_final;
                input.value = valor;
                input.style.width = "50px";
                input.style.fontSize = "16px";
                input.style.textAlign = "right";
                input.style.background = "transparent";
                input.style.border = "none";
                input.style.color = blue;
                input.style.borderRadius = "4px";
                input.style.padding = "2px";

                input.addEventListener("input", () => {
                    scheduleDSPAlert();
                });

                extraValueCell.appendChild(input);
            }

            // Cores
            if ((modTypeIndex + 1) % 3 === 0) {
                if ((modTypeIndex + 1) < modTypeData[modType].length+5) {
                    extraNameCell.style.borderBottom = "1px solid rgba(216, 216, 216, 0.3)";
                    extraNameCell.style.paddingBottom = "5px";
                    extraValueCell.style.borderBottom = "1px solid rgba(216, 216, 216, 0.3)";
                    extraValueCell.style.paddingBottom = "5px";
                }
                extraRow.style.color = green;
            } else if ((modTypeIndex + 2) % 3 === 0) {
                extraRow.style.color = "red";
            } else {
                extraRow.style.color = blue;
            }

            extraRow.appendChild(extraNameCell);
            extraRow.appendChild(extraValueCell);
            tbody.appendChild(extraRow);

            modTypeIndex++;
        });
    }

    function updateAlgorithmDisplay() {
        algorithmDisplay.textContent = algorithmValues[currentAlgorithmIndex];
        updateLabels(false);
    }

    algorithmDisplay.addEventListener("click", function () {
        if (document.querySelector(".type-display").textContent == "Single" && number == 2) return;
        createPopup(algorithmValues, (selectedValue) => {
            currentAlgorithmIndex = algorithmValues.indexOf(selectedValue);;
            updateAlgorithmDisplay(false);
            scheduleDSPAlert();
        }, event);

    });

    leftArrow.addEventListener("click", function () {
        if (document.querySelector(".type-display").textContent == "Single" && number == 2) return;
        currentAlgorithmIndex = (currentAlgorithmIndex - 1 + algorithmValues.length) % algorithmValues.length;
        updateAlgorithmDisplay(false);
        //scheduleDSPAlert();
        /**///alert(currentAlgorithmIndex)
        //sendMessage([0xF0,0x44,currentAlgorithmIndex,number-1,0xF7]);
        //alert([0xF0,0x44,currentAlgorithmIndex,number-1,0xF7])
        sendMessage([0xF0,0x36 + number,0x00,0xF7]);//aqui
        //alert([0xF0,0x36 + number,0x00,0xF7])
    });

    rightArrow.addEventListener("click", function () {
        if (document.querySelector(".type-display").textContent == "Single" && number == 2) return;
        currentAlgorithmIndex = (currentAlgorithmIndex + 1) % algorithmValues.length;
        updateAlgorithmDisplay(false);
        //scheduleDSPAlert();
        /**///sendMessage([0xF0,0x44,currentAlgorithmIndex,number-1,0xF7]);
        sendMessage([0xF0,0x36 + number,0x00,0xF7]);
    });

    updateLabels(true);

    // Envolve a tabela em um contêiner com posição relativa
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.paddingBottom = "10px";
    wrapper.style.maxWidth = "300px";
    wrapper.style.background = purpleTransparent;
    wrapper.style.borderRadius = "12px";

    // Cria a label fixa do DSP
    const dspLabel = document.createElement("div");
    dspLabel.textContent = `DSP${number}`;
    dspLabel.style.position = "absolute";
    dspLabel.style.bottom = "5px";
    dspLabel.style.right = "15px";
    dspLabel.style.fontWeight = "bold";
    dspLabel.style.color = number === 1 ? orange : blue;
    dspLabel.style.textAlign = "right";
    dspLabel.style.fontSize = "16px";

    // Adiciona a tabela e a label no wrapper
    wrapper.appendChild(table);
    wrapper.appendChild(dspLabel);

    return wrapper;
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
        case 7: algorithmDisplay.textContent = 'Memory Man'; break;
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
}

function binaryOperation(lsb, msb, deslocamento) {
    let newMsb = msb << deslocamento;
    let result = lsb + newMsb;

    return result;
}

function BinaryOperationSend(result, deslocamento) {
    const lsb = result & ((1 << deslocamento) - 1); // pega os bits baixos
    const msb = result >> deslocamento;            // pega os bits altos
    return [lsb, msb];
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
        label.style.paddingLeft = "8px"

        const button = document.createElement("button");
        button.textContent = "Off";
        button.className = "preset-config-button";

        if (setting === "Bypass Load State") {
            button.textContent = "Keep Same";
            button.style.color = blue;

            button.addEventListener("click", () => {
                createPopup(["Keep Same", "Turn On", "Turn Off"], (selectedOption) => {
                    button.textContent = selectedOption;
                    switch (button.textContent) {
                        case 'Keep Same':
                            button.style.color = blue;
                            break;
                        case 'Turn On':
                            button.style.color = green;
                            break;
                        case 'Turn Off':
                            button.style.color = 'red';
                    }
                    sendPresetConfigValues();
                }, event);
            });

        } else if (["Trail", "Midi Clock", "Auto Save"].includes(setting)) {
            button.style.color = 'red';
            button.addEventListener("click", () => {
                button.textContent = button.textContent === "Off" ? "On" : "Off";
                if (button.textContent === "Off") button.style.color = 'red';
                else button.style.color = green;
                sendPresetConfigValues();
            });

        } else if (setting === "Spill Over") {
            button.textContent = "Inactive";
            row.style.paddingBottom = "3px";
            row.style.borderBottom = 'solid rgba(216, 216, 216, 0.2) 1px'; /* Separador do preset config, tirar? */

        } else if (setting === "Preset BPM") {
            button.textContent = "Off";
            button.style.color = 'red';
            button.addEventListener("click", () => {
                const bpmOptions = ["Off", ...Array.from({ length: 241 }, (_, i) => (i + 40).toString())];
                createPopup(bpmOptions, (selectedOption) => {
                    button.textContent = selectedOption;
                    if (button.textContent == 'Off') button.style.color = 'red';
                    else button.style.color = blue;
                    sendPresetConfigValues();
                }, event);
            });
        }

        row.appendChild(label);
        row.appendChild(button);
        presetConfigContainer.appendChild(row);
    });
    sendMessage([0xF0, 0x35, 0x00, 0xF7]);
    return presetConfigContainer;
}

function sendPresetConfigValues() {
    const rows = document.querySelectorAll(".preset-config-row");
    const values = Array.from(rows).map(row => {
        const buttonText = row.querySelector(".preset-config-button").textContent.trim();

        let code;

        if (["Keep Same", "Off", "Inactive"].includes(buttonText)) {
            code = 0;
        } else if (["Turn On", "On"].includes(buttonText)) {
            code = 1;
        } else if (buttonText == "Turn Off") {
            code = 1;
        } else if (!isNaN(parseInt(buttonText))) {
            code = parseInt(buttonText) - 39;
        } else {
            code = -1; // fallback para caso apareça algo inesperado
        }

        return code;
    });

    // Não esta salvando na controladora, falar com o Thiago
    //alert([...values]);
    const [lsb, msb] = BinaryOperationSend(values[3], 4);
    values.splice(3, 1, lsb, msb);
    sendMessage([0xF0, 0x36, ...values, 0xF7])
    //alert([0xF0,0x36,...values,0xF7])
}

function updateButtonTexts(buttonTexts) {
    const buttons = document.querySelectorAll(".preset-config-button");
    const labels = document.querySelectorAll(".preset-config-label");

    buttons.forEach((button, index) => {
        switch (labels[index].textContent) {
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
        if (button.textContent == 'On' || button.textContent == 'Turn On') button.style.color = green;
        else if (button.textContent == 'Off' || button.textContent == 'Turn Off') button.style.color = 'red';
        else if (button.textContent == 'Inactive') button.style.color = 'white';
        else button.style.color = blue;
    });
}

const imageOptions = ["OFF", "The Haas Effect", "Spill by the Edge", "Ping-Pong", "Wet-Panning", "Dry-Panning", "Cross-Panning", "Transverse"];
let currentImageIndex = 0;
function createImageTable() {
    const mainContainer = document.createElement("div");
    mainContainer.classList.add("main-image-table-container");

    const leftTableContainer = document.createElement("div");
    leftTableContainer.classList.add("image-container");

    const rightTableContainer = document.createElement("div");
    rightTableContainer.classList.add("image-container");

    const leftTable = document.createElement("table");
    leftTable.classList.add("image-table");
    leftTable.id = "imageTable";

    const leftTbody = document.createElement("tbody");
    const titleRow = document.createElement("td");
    titleRow.colSpan = 2;
    const titleCell = document.createElement("td");
    //titleCell.colSpan = 2;
    titleCell.style.fontSize = "16px";
    titleCell.style.display = "flex";
    titleCell.style.justifyContent = "space-between";
    titleCell.style.alignItems = "center";
    titleCell.style.marginBottom = "10px";

    const imageHeaderContainer = document.createElement("div");
    imageHeaderContainer.className = "topology-container";
    imageHeaderContainer.style.marginBottom = '0px'

    const imageLabel = document.createElement("h2");
    imageLabel.className = "algorithm-title";
    imageLabel.textContent = "Image:";
    imageLabel.style.marginRight = "20px";
    imageLabel.style.marginLeft = "10px";

    const leftArrow = document.createElement("span");
    leftArrow.textContent = "\u276E";
    leftArrow.style.cursor = "pointer";
    leftArrow.style.marginRight = "10px";

    const imageDisplay = document.createElement("span");
    imageDisplay.id = "imageDisplay";
    imageDisplay.textContent = imageOptions[currentImageIndex];
    imageDisplay.style.width = '140px';
    imageDisplay.style.fontSize = '16px';
    imageDisplay.style.cursor = "pointer";
    imageDisplay.style.color = "white";
    imageDisplay.style.textAlign = "center";

    const rightArrow = document.createElement("span");
    rightArrow.textContent = "\u276E";
    rightArrow.style.transform = 'rotate(180deg)';
    rightArrow.style.cursor = "pointer";
    rightArrow.style.marginLeft = "10px";

    function updateImageSelection(index) {
        const selected = imageOptions[index];
        currentImageIndex = index;
        imageDisplay.textContent = selected;
        updateImageRows(selected);
    
        if (selected === "Transverse" || selected === "Ping-Pong") {
            setPanDisplayVisibility([false, false]);
        } else {
            setPanDisplayVisibility([true, true]);
        }
        //collectAndAlertImageValues()
        sendMessage([0xF0,0x45,currentImageIndex,0xF7]);
        sendMessage([0xF0,0x3B,0x00,0xF7]);
    }
    

    leftArrow.addEventListener("click", () => {
        currentImageIndex = (currentImageIndex - 1 + imageOptions.length) % imageOptions.length;
        updateImageSelection(currentImageIndex);
    });

    rightArrow.addEventListener("click", () => {
        currentImageIndex = (currentImageIndex + 1) % imageOptions.length;
        updateImageSelection(currentImageIndex);
    });

    imageDisplay.addEventListener("click", (event) => {
        createPopup(imageOptions, (selectedOption) => {
            currentImageIndex = imageOptions.indexOf(selectedOption);
            updateImageSelection(currentImageIndex);
        }, event);
    });

    function updateImageRows(selectedOption) {
        while (leftTbody.rows.length >= 1) leftTbody.deleteRow(0);
        const titleRow = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 2;
        cell.appendChild(titleCell);
        titleRow.appendChild(cell);
        leftTbody.appendChild(titleRow);

        if (selectedOption === "OFF") return;

        const config = imageStereo[selectedOption];
        if (!config) return;

        config.Linhas.forEach((linha, index) => {
            const row = document.createElement("tr");
            if (index == 0) row.style.color = blue;
            else row.style.color = "red";

            const labelCell = document.createElement("td");
            labelCell.textContent = linha;
            labelCell.style.fontSize = "16px";
            labelCell.style.padding = "5px";

            const buttonCell = document.createElement("td");
            buttonCell.style.width = "200px";
            buttonCell.style.padding = "5px";

            const rangeInfo = imageRanges[linha];
            const complemento = rangeInfo?.complemento || "";

            const miniSlider = document.createElement("input");
            miniSlider.className = "mini-slider";
            miniSlider.type = "range";
            miniSlider.min = rangeInfo.valor_inicial;
            miniSlider.max = rangeInfo.valor_final;
            miniSlider.value = config.start[index];
            miniSlider.style.width = "100px";

            const sliderValue = document.createElement("span");
            sliderValue.textContent = `${miniSlider.value}${complemento}`;
            sliderValue.style.marginLeft = "8px";
            sliderValue.style.width = "40px";
            sliderValue.style.display = "inline-block";

            let percentage = ((parseFloat(miniSlider.value) - miniSlider.min) / (miniSlider.max - miniSlider.min)) * 100;
            miniSlider.style.background = `linear-gradient(to right, ${blue} ${percentage}%, white ${percentage}%)`;

            miniSlider.addEventListener("input", () => {
                sliderValue.textContent = `${miniSlider.value}${complemento}`;
                const value = parseFloat(miniSlider.value);
                const min = parseFloat(miniSlider.min);
                const max = parseFloat(miniSlider.max);
                percentage = ((value - min) / (max - min)) * 100;
                miniSlider.style.background = `linear-gradient(to right, ${blue} ${percentage}%, white ${percentage}%)`;
                scheduleImageAlert();
            });

            miniSlider.addEventListener("wheel", (event) => {
                event.preventDefault();
                const step = 1;
                let newValue = parseInt(miniSlider.value) + (event.deltaY < 0 ? step : -step);
                newValue = Math.max(parseInt(miniSlider.min), Math.min(parseInt(miniSlider.max), newValue));
                miniSlider.value = newValue;
                sliderValue.textContent = `${miniSlider.value}${complemento}`;
                const min = parseFloat(miniSlider.min);
                const max = parseFloat(miniSlider.max);
                percentage = ((newValue - min) / (max - min)) * 100;
                miniSlider.style.background = `linear-gradient(to right, ${blue} ${percentage}%, white ${percentage}%)`;
                scheduleImageAlert();
            });

            buttonCell.appendChild(miniSlider);
            buttonCell.appendChild(sliderValue);
            row.appendChild(labelCell);
            row.appendChild(buttonCell);
            leftTbody.appendChild(row);
        });
    }

    imageHeaderContainer.appendChild(imageLabel);
    imageHeaderContainer.appendChild(leftArrow);
    imageHeaderContainer.appendChild(imageDisplay);
    imageHeaderContainer.appendChild(rightArrow);
    titleCell.appendChild(imageHeaderContainer);
    titleRow.appendChild(titleCell);
    leftTbody.appendChild(titleRow);
    leftTable.appendChild(leftTbody);
    leftTableContainer.appendChild(leftTable);

    // Segunda tabela com sliders e botões que exibem valor
    const rightTable = document.createElement("table");
    rightTable.classList.add("image-table");
    rightTable.id = "DSPPanTable";

    const dspData = ["Dsp 1 Pan:", "Dsp 2 Pan:"];
    const tbody = document.createElement("tbody");

    dspData.forEach((label, index) => {
        const row = document.createElement("tr");

        const cell = document.createElement("td");
        cell.colSpan = 2; // usa toda a largura da linha
        cell.style.padding = "8px 0";

        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.alignItems = "center";
        wrapper.style.gap = "6px";

        if (index === 0) {
            wrapper.style.marginTop = "10px";
        }

        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = -100;
        slider.max = 100;
        slider.value = 0;
        slider.className = "mini-slider";
        slider.style.width = "200px";

        const labelRow = document.createElement("div");
        labelRow.style.display = "flex";
        labelRow.style.justifyContent = "center";
        labelRow.style.alignItems = "center";
        labelRow.style.gap = "6px";
        labelRow.style.fontSize = "14px";

        const labelText = document.createElement("span");
        labelText.textContent = label;
        labelText.style.color = "white";

        const displayValue = document.createElement("span");
        displayValue.style.color = green;

        function updateDisplay(value) {
            if (value == 0) {
                displayValue.textContent = "Center";
                displayValue.style.color = green;
            } else if (value < 0) {
                displayValue.textContent = `Left ${-value}%`;
                displayValue.style.color = orange;
            } else {
                displayValue.textContent = `Right ${value}%`;
                displayValue.style.color = blue;
            }

            //const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100;
            //slider.style.background = `linear-gradient(to right, var(--blue) ${percentage}%, white ${percentage}%)`;
        }

        updateDisplay(slider.value);

        slider.addEventListener("input", () => {
            updateDisplay(parseInt(slider.value));
            scheduleImageAlert();
        });

        slider.addEventListener("wheel", (event) => {
            event.preventDefault();
            const step = 1;
            let newValue = parseInt(slider.value) + (event.deltaY < 0 ? step : -step);
            newValue = Math.max(parseInt(slider.min), Math.min(parseInt(slider.max), newValue));
            slider.value = newValue;
            updateDisplay(newValue);
            scheduleImageAlert();
        });

        displayValue.style.cursor = "pointer";
        // Centraliza ao clicar no numero
        /*displayValue.addEventListener("click", () => {
            slider.value = 0;
            updateDisplay(0);
        });*/

        labelRow.appendChild(labelText);
        labelRow.appendChild(displayValue);

        wrapper.appendChild(slider);
        wrapper.appendChild(labelRow);
        cell.appendChild(wrapper);
        row.appendChild(cell);
        tbody.appendChild(row);
    });

    //let interacted = false;
    let imageUpdateTimeout = null;
    function scheduleImageAlert() {
        //interacted = true;
        clearTimeout(imageUpdateTimeout);
        imageUpdateTimeout = setTimeout(() => {
            collectAndAlertImageValues();
        }, 100);
    }

    function collectAndAlertImageValues() {
        const imageName = imageDisplay.textContent.trim();
        const imageIndex = imageOptions.indexOf(imageName);

        // Esquerda
        const leftTable = leftTableContainer.querySelector("table");
        const leftRows = leftTable.querySelectorAll("tr");
        const leftValues = [];

        leftRows.forEach(row => {
            const input = row.querySelector("input");
            if (input) leftValues.push(Number(input.value));
        });
        
        while (leftValues.length < 3) leftValues.push(0);
        
        // Direita
        const rightTable = rightTableContainer.querySelector("table");
        const rightSliders = rightTable.querySelectorAll("input[type='range']");
        const rightValues = [];

        rightSliders.forEach(slider => {
            const val = Number(slider.value)+100;
            const [lsb, msb] = BinaryOperationSend(val, 4);
            rightValues.push(lsb, msb); // adiciona os dois
        });

        const result = [imageIndex, ...leftValues.slice(0, 3), ...rightValues];

        //alert([0xF0,0x3C,result,0xF7]);
        sendMessage([0xF0,0x3C,...result,0xF7]);
    }

    rightTable.appendChild(tbody);
    rightTableContainer.appendChild(rightTable);

    mainContainer.appendChild(leftTableContainer);
    mainContainer.appendChild(rightTableContainer);

    return {
        container: mainContainer,
        updateImageRows: updateImageRows // <<< agora acessível de fora
    };
}

async function updateImageTablesFromArray(values, imageTableLeft, imageTableRight, algorithmDisplay) {
    if (values.length !== 9) {
        console.error("Array inválido: esperado 9 valores, recebido", values.length);
        //return;
    }

    // Atualiza o algoritimo
    currentImageIndex = values[1];
    const selectedAlgorithm = imageOptions[currentImageIndex];
    if (selectedAlgorithm) {
        algorithmDisplay.textContent = selectedAlgorithm;
        updateImageRowsFunct(selectedAlgorithm);
    } else {
        console.warn("Algoritmo não encontrado para o índice:", currentImageIndex);
    }

    await delay(100)
    // Atualiza a tabela image
    const leftRows = imageTableLeft.querySelectorAll("tr");
    for (let i = 1; i < Math.min(3, leftRows.length); i++) {

        // Em vez de procurar por 'td.button', pegue o input de range e o span
        const slider = leftRows[i].querySelector("input[type=range]");
        const span = leftRows[i].querySelector("span");

        if (slider && span) {
            slider.value = values[1 + i];

            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            const percentage = ((slider.value - min) / (max - min)) * 100;
            slider.style.background = `linear-gradient(to right, ${blue} ${percentage}%, white ${percentage}%)`;

            // Atualizar o texto do span (mantendo o complemento, como % ou ms)
            const complemento = span.textContent.replace(/[0-9\-]+/, "").trim();
            span.textContent = `${slider.value}${complemento}`;
        }
    }

    // Atualiza a tabela DSP Pan
    const rightRows = document.querySelectorAll("#DSPPanTable tr");

    if (rightRows[0]) {
        const slider = rightRows[0].querySelector("input[type='range']");
        if (slider) {
            const newValue = binaryOperation(values[5], values[6], 4) - 100;
            //alert(`${values[5]}, ${values[6]}, ${newValue}`)
            slider.value = newValue;
            slider.dispatchEvent(new Event('input')); // Dispara o evento de input para atualizar os sliders
        }
    }

    if (rightRows[1]) {
        const slider = rightRows[1].querySelector("input[type='range']");
        if (slider) {
            const newValue = binaryOperation(values[7], values[8], 4) - 100;
            slider.value = newValue;
            slider.dispatchEvent(new Event('input')); // Dispara o evento de input para atualizar os sliders
        }
    }
}

function setPanDisplayVisibility([pan1Visible, pan2Visible]) {
    const panTable = document.getElementById("DSPPanTable");
    if (!panTable) return;

    const rows = panTable.querySelectorAll("tr");

    [pan1Visible, pan2Visible].forEach((isVisible, index) => {
        const row = rows[index];
        if (!row) return;

        const slider = row.querySelector("input[type='range']");
        const displaySpan = row.querySelector("span:last-child"); // assume que o último span é o valor

        if (!slider || !displaySpan) return;

        if (!isVisible) {
            slider.style.filter = "grayscale(100%)"; // aplica o filtro cinza
            slider.style.pointerEvents = "none"; // impede interação com o slider
            displaySpan.textContent = "Inactive";
            displaySpan.style.color = "gray";
        } else {
            slider.style.filter = "none"; // remove o filtro cinza
            slider.style.pointerEvents = "auto"; // permite interação
            const value = parseInt(slider.value);
            if (value === 0) {
                displaySpan.textContent = "Center";
                displaySpan.style.color = green;
            } else if (value < 0) {
                displaySpan.textContent = `Left ${-value}%`;
                displaySpan.style.color = orange;
            } else {
                displaySpan.textContent = `Right ${value}%`;
                displaySpan.style.color = blue;
            }
        }
    });
}

function createCommandCenterTables() {
    const wrapper = document.createElement("div");
    wrapper.className = "command-center-wrapper";

    for (let page = 1; page <= 2; page++) {
        const table = document.createElement("table");
        table.className = "command-center-table";
        table.id = `command-center-table-${page}`;

        const tbody = document.createElement("tbody");

        const row1 = document.createElement("tr");
        const cell1Label = document.createElement("td");
        cell1Label.textContent = `Foot ${page} Mode:`;

        const cell1Button = document.createElement("td");
        const modeButton = document.createElement("button");
        modeButton.textContent = "On/Off | Hold";
        modeButton.className = "foot-mode-button";
        modeButton.textAlign = "left";

        const modeOptions = [
            "On/Off | Hold", "On/Off | Mmtry", "On/Off | TgAct", "Tap | Scroll", "Tap | On/Off",
            "Momentary", "Toggle Action", "Scroll Mode", "ScrollUp", "ScrollDown", "Hold"
        ];

        modeButton.addEventListener("click", (event) => {
            createPopup(modeOptions, (selected) => {
                modeButton.textContent = selected;
        
                // Remove todas as linhas extras antes de adicionar novas
                table.querySelectorAll(".command-extra-row").forEach(row => row.remove());
                table.querySelectorAll(".outer-row").forEach(row => row.remove());
        
                if (selected.includes("Hold")) {
                    addHoldOptions(table, tbody);
                }
                const triggersAction = ["Mmtry", "TgAct", "Momentary", "Toggle Action"];
                if (triggersAction.some(keyword => selected.includes(keyword))) {
                    addActionOptions(table, tbody);
                }
                adjustBackgroundHeights(wrapper);

            }, event);
        });
        

        cell1Button.appendChild(modeButton);
        row1.appendChild(cell1Label);
        row1.appendChild(cell1Button);

        const row2 = document.createElement("tr");
        const cell2 = document.createElement("td");
        cell2.colSpan = 2;

        const nameLabel = document.createElement("span");
        nameLabel.textContent = "Name: ";

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.maxLength = 4;

        const colorLabel = document.createElement("span");
        colorLabel.textContent = " Color: ";

        const colorButton = document.createElement("button");
        colorButton.textContent = "Purple";
        colorButton.className = "color-button";
        colorButton.style.maxWidth = "70px";
        colorButton.style.textAlign = "center";
        colorButton.style.backgroundColor ="rgba(0, 0, 0, 0.5)";
        colorButton.style.borderRadius = "10px";

        const colorOptions = ["Purple", "Pink", "Cyan", "Green", "Orange", "Red", "Yellow", "Blue"];
        colorButton.addEventListener("click", (event) => {
            createPopup(colorOptions, (selected) => {
                colorButton.textContent = selected;
                //const rgb = rgb565ToCss(colorMap[selected]);
                const rgb = colorMap[selected];
                colorButton.style.color = rgb;
            }, event);
        });

        cell2.appendChild(nameLabel);
        cell2.appendChild(nameInput);
        cell2.appendChild(colorLabel);
        cell2.appendChild(colorButton);
        row2.appendChild(cell2);

        tbody.appendChild(row1);
        tbody.appendChild(row2);
        table.appendChild(tbody);
        
        const backgroundDiv = document.createElement("div");
        backgroundDiv.className = "command-bg";
        backgroundDiv.style.backgroundColor = "rgba(159, 24, 253, 0.5)";
        backgroundDiv.style.borderRadius = "10px";
        backgroundDiv.style.position = "absolute";
        backgroundDiv.style.maxWidth = "300px";
        backgroundDiv.style.inset = "0";
        backgroundDiv.style.zIndex = "0";
        backgroundDiv.style.margin = "0";
        backgroundDiv.style.borderRadius = "10px";
        backgroundDiv.style.backgroundColor = "rgba(159, 24, 253, 0.5)";

        const fswLabel = document.createElement("div");
        fswLabel.textContent = `FSW${page}`;
        fswLabel.style.position = "absolute";
        fswLabel.style.bottom = "5px";
        fswLabel.style.right = "15px";
        fswLabel.style.color = page == 1? orange: blue;
        fswLabel.style.fontWeight = "bold";
        fswLabel.style.fontSize = "16px";
        fswLabel.style.pointerEvents = "none";

        backgroundDiv.appendChild(fswLabel);

        const container = document.createElement("div");
        container.style.position = "relative";
        container.style.display = "inline-block";
        container.style.width = "fit-content";

        table.style.position = "relative";
        table.style.zIndex = "1";

        container.appendChild(backgroundDiv);
        container.appendChild(table);
        wrapper.appendChild(container);

    }

    function adjustBackgroundHeights(wrapper) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const containers = wrapper.querySelectorAll("div");
                let maxHeight = 0;

                containers.forEach(div => {
                    const table = div.querySelector(".command-center-table");
                    if (table) {
                        const height = table.offsetHeight+40;
                        if (height > maxHeight) maxHeight = height;
                    }
                });

                containers.forEach(div => {
                    const bg = div.querySelector(".command-bg");
                    if (bg) {
                        bg.style.height = `${maxHeight}px`;
                    }
                });
            });
        });
    }

    adjustBackgroundHeights(wrapper);

    return wrapper;
}

function addHoldOptions(table, tbody) {

    const holdRow = document.createElement("tr");
    holdRow.className = "hold-mode-row command-extra-row";

    const holdLabel = document.createElement("td");
    holdLabel.textContent = "Hold Mode:";

    const holdButtonCell = document.createElement("td");
    const holdButton = document.createElement("button");
    holdButton.textContent = "Freeze";
    holdButton.className = "hold-mode-button";
    holdButton.style.width = "100px";

    const holdOptions = ["Freeze", "Infinite"];
    holdButton.addEventListener("click", (event) => {
        createPopup(holdOptions, (selected) => {
            holdButton.textContent = selected;
        }, event);
    });

    holdButtonCell.appendChild(holdButton);
    holdRow.appendChild(holdLabel);
    holdRow.appendChild(holdButtonCell);

    const targetRow = document.createElement("tr");
    targetRow.className = "target-row command-extra-row";

    const targetLabel = document.createElement("td");
    targetLabel.textContent = "Target:";

    const targetButtonCell = document.createElement("td");
    const targetButton = document.createElement("button");
    targetButton.textContent = "DSP1";
    targetButton.className = "target-button";
    targetButton.style.width = "130px";
    targetButton.style.color = orange;

    const targetOptions = ["DSP1", "DSP2", "DSP1 + DSP2"];
    targetButton.addEventListener("click", (event) => {
        createPopup(targetOptions, (selected) => {
            targetButton.textContent = selected;

            const targetText = selected;
            targetButton.innerHTML = targetText;
            if (targetText === "DSP2") {
                targetButton.style.color = blue;
            } else if (targetText === "DSP1") {
                targetButton.style.color = orange;
            } else if (targetText === "DSP1 + DSP2") {
                targetButton.innerHTML = `<span style="color:${orange};">DSP1</span><span style="color:white;"> + </span><span style="color:${blue};">DSP2</span>`;
            } else {
                targetButton.style.color = green;
            }
        }, event);
    });

    targetButtonCell.appendChild(targetButton);
    targetRow.appendChild(targetLabel);
    targetRow.appendChild(targetButtonCell);

    tbody.appendChild(holdRow);
    tbody.appendChild(targetRow);
}

function addActionOptions(table, tbody) {
    const actionOptions = ["OFF", "Fdback", "DlyMix", "DryLvl", "AlterI", "AlterII"];

    for (let i = 0; i < 2; i++) {
        const outerRow = document.createElement("tr");
        outerRow.classList.add("outer-row");

        const outerCell = document.createElement("td");
        outerCell.colSpan = 2;

        const innerTable = document.createElement("table");
        innerTable.style.width = "100%";
        innerTable.style.tableLayout = "fixed";
        innerTable.style.borderCollapse = "collapse";

        const colgroup = document.createElement("colgroup");
        const col1 = document.createElement("col");
        col1.style.width = "45px";
        const col2 = document.createElement("col");
        col2.style.width = "auto";
        colgroup.appendChild(col1);
        colgroup.appendChild(col2);
        innerTable.appendChild(colgroup);

        const actionRow = document.createElement("tr");

        const labelCell = document.createElement("td");
        labelCell.textContent = "Actn:";
        labelCell.style.whiteSpace = "nowrap";

        const contentCell = document.createElement("td");
        contentCell.style.display = "flex";
        contentCell.style.alignItems = "center";
        contentCell.style.gap = "0px";

        const actionButton = document.createElement("button");
        actionButton.textContent = "OFF";
        actionButton.className = "action-button";
        actionButton.style.width = "60px";
        actionButton.style.maxWidth = "60px";
        actionButton.style.color = red;
        actionButton.style.marginLeft = "-10px";

        const slider = document.createElement("input");
        slider.type = "range";
        slider.className = "mini-slider";
        slider.min = 0;
        slider.max = 100;
        slider.value = 50;
        slider.style.width = "90px";
        slider.style.display = "none";
        slider.disabled = true;

        const valueDisplay = document.createElement("span");
        valueDisplay.textContent = "50%";
        valueDisplay.style.display = "none";
        valueDisplay.style.minWidth = "40px";
        valueDisplay.style.textAlign = "right";
        valueDisplay.style.color = green;

        const updateSliderBackground = () => {
            const pct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
            slider.style.background = `linear-gradient(to right, ${blue} ${pct}%, white ${pct}%)`;
            valueDisplay.textContent = `${slider.value}%`;
        };

        slider.addEventListener("input", updateSliderBackground);

        slider.addEventListener("wheel", (event) => {
            event.preventDefault();
            const step = 1;
            const current = parseInt(slider.value);
            const direction = event.deltaY < 0 ? 1 : -1;
            const newValue = Math.min(parseInt(slider.max), Math.max(parseInt(slider.min), current + direction * step));
            slider.value = newValue;
            updateSliderBackground();
        });

        const dspButton = document.createElement("button");
        dspButton.textContent = "DSP1";
        dspButton.style.display = "none";
        dspButton.disabled = true;
        dspButton.style.width = "50px";
        dspButton.style.color = orange;

        actionButton.addEventListener("click", (event) => {
            createPopup(actionOptions, (selected) => {
                actionButton.textContent = selected;
                actionButton.style.color = (selected === "OFF") ? red : green;

                const isActive = selected !== "OFF";

                if (selected === "DlyMix") {
                    slider.max = 120;
                } else {
                    slider.max = 100;
                }

                slider.style.display = isActive ? "inline-block" : "none";
                slider.disabled = !isActive;

                valueDisplay.style.display = isActive ? "inline-block" : "none";

                dspButton.style.display = isActive ? "inline-block" : "none";
                dspButton.disabled = !isActive;

                const wasDryLvl = dspButton.textContent === "DryR" || dspButton.textContent === "DryL" || dspButton.textContent === "DryL+R";
                if (wasDryLvl && selected !== "DryLvl") {
                    dspButton.innerHTML = "DSP1";
                    dspButton.style.color = orange;
                    dspButton.style.fontSize = "16px";
                } else if (!wasDryLvl && selected == "DryLvl") {
                    dspButton.innerHTML = "DryR";
                    //dspButton.style.color = rgb565ToCss(colorMap["Pink"]);
                    dspButton.style.color = colorMap["Pink"];
                    dspButton.style.fontSize = "16px";
                }
                updateSliderBackground();
            }, event);
        });

        dspButton.addEventListener("click", (event) => {
            const selectedParam = actionButton.textContent;
            let options = (selectedParam === "DryLvl")
                ? ["DryL+R", "DryL", "DryR"]
                : ["DSP1", "DSP2", "D1+D2"];

            createPopup(options, (selected) => {
                if (selectedParam === "DryLvl") {
                    dspButton.innerHTML = selected;
                    //dspButton.style.color = rgb565ToCss(colorMap["Pink"]);
                    dspButton.style.color = colorMap["Pink"];
                    //dspButton.style.fontSize = selected === "DryL+R" ? "10px" : "16px";
                } else {
                    if (selected === "DSP1") {
                        dspButton.innerHTML = "DSP1";
                        dspButton.style.color = orange;
                    } else if (selected === "DSP2") {
                        dspButton.innerHTML = "DSP2";
                        dspButton.style.color = blue;
                    } else if (selected === "D1+D2") {
                        dspButton.innerHTML = `<span style="color:${orange};">D1</span><span style="color:white;">+</span><span style="color:${blue};">D2</span>`;
                        dspButton.style.fontSize = "15px";
                    }
                }

                extractCommandCenterData(table);
            }, event);
        });

        contentCell.appendChild(actionButton);
        contentCell.appendChild(slider);
        contentCell.appendChild(valueDisplay);
        contentCell.appendChild(dspButton);

        actionRow.appendChild(labelCell);
        actionRow.appendChild(contentCell);
        innerTable.appendChild(actionRow);
        outerCell.appendChild(innerTable);
        outerRow.appendChild(outerCell);
        tbody.appendChild(outerRow);
    }
}

function updateCommandCenter(dataArray, table) {

    const modeOptions = [
        "On/Off | Hold", "On/Off | Mmtry", "On/Off | TgAct", "Tap | Scroll", "Tap | On/Off",
        "Momentary", "Toggle Action", "Scroll Mode", "ScrollUp", "ScrollDown", "Hold"
    ];

    const colorOptions = ["Purple", "Pink", "Cyan", "Green", "Orange", "Red", "Yellow", "Blue"];

    //alert(dataArray)
    const footModeIndex = dataArray[0];
    const footName = dataArray.slice(1, 5).map(c => String.fromCharCode(c)).join('');
    const footColorIndex = dataArray[5];
    const holdMode = dataArray[6];
    const holdTarget = dataArray[7];
    const actionParam = dataArray[8];
    const actionValue = dataArray[9];
    const actionTarget = dataArray[10];
    const actionParam2 = dataArray[11];
    const actionValue2 = dataArray[12];
    const actionTarget2 = dataArray[13];

    const nameInput = table.querySelector('input[type="text"]');
    if (nameInput) {
        nameInput.value = footName;
    }

   // Atualiza o modo e simula o comportamento do clique
    const modeButton = table.querySelector('.foot-mode-button');
    if (modeButton && modeOptions[footModeIndex]) {
        const selected = modeOptions[footModeIndex];
        modeButton.textContent = selected;

        table.querySelectorAll(".command-extra-row").forEach(row => row.remove());
        table.querySelectorAll(".outer-row").forEach(row => row.remove());

        if (selected.includes("Hold")) {
            const tbody = table.querySelector("tbody");
            addHoldOptions(table, tbody);
            const holdOptions = ["Freeze", "Infinite"];
            const targetOptions = ["DSP1", "DSP2", "DSP1 + DSP2"];

            const extraButtons = table.querySelectorAll(".command-extra-row button");
            if (extraButtons.length >= 2) {
                extraButtons[0].textContent = holdOptions[holdMode] ?? holdMode;
                const targetText = targetOptions[holdTarget] ?? "DSP1 + DSP2";

                const targetButton = extraButtons[1];
                targetButton.innerHTML = targetText;
                if (targetText === "DSP2") {
                    targetButton.style.color = blue;
                } else if (targetText === "DSP1") {
                    targetButton.style.color = orange;
                } else if (targetText === "DSP1 + DSP2") {
                    targetButton.innerHTML = `<span style="color:${orange};">DSP1</span><span style="color:white;"> + </span><span style="color:${blue};">DSP2</span>`;
                } else {
                    targetButton.style.color = green;
                }
            }
        }

        const triggersAction = ["Mmtry", "TgAct", "Momentary", "Toggle Action"];
        if (triggersAction.some(keyword => selected.includes(keyword))) {
            const tbody = table.querySelector("tbody");
            addActionOptions(table, tbody);

            const actionOptions = ["OFF", "Fdback", "DlyMix", "DryLvl", "AlterI", "AlterII"];
            const targetOptions = ["DSP1", "DSP2", "D1+D2"];

            const outerRows = table.querySelectorAll(".outer-row");
            if (outerRows.length >= 2) {
                const firstContent = outerRows[0].querySelector("td > table > tr > td:nth-child(2)");
                const firstButton = firstContent.querySelector(".action-button");
                const firstSlider = firstContent.querySelector("input[type='range']");
                const firstValue = firstContent.querySelector("span");
                const firstDSP = firstContent.querySelector("button:not(.action-button)");

                if (firstButton && firstSlider && firstValue && firstDSP) {
                    const option = actionOptions[actionParam] ?? "OFF";
                    firstButton.textContent = option;
                    firstButton.style.color = (option === "OFF") ? "red" : green;
                    const paramName = actionOptions[actionParam];
                    if (paramName === "DlyMix") firstSlider.max = 120;
                    else firstSlider.max = 100;
                    firstSlider.value = actionValue;
                    const pct1 = (actionValue - firstSlider.min) / (firstSlider.max - firstSlider.min) * 100;
                    firstSlider.style.background = `linear-gradient(to right, ${blue} ${pct1}%, white ${pct1}%)`;
                    firstValue.textContent = `${actionValue}%`;
                    
                    const targetList = (paramName === "DryLvl") ? ["DryL+R", "DryL", "DryR"] : targetOptions;
                    const dspTarget = targetList[actionTarget] ?? targetList[0];
                    firstDSP.style.fontSize = "16px";
                    firstDSP.innerHTML = dspTarget;

                    if (dspTarget === "DSP2") {
                        firstDSP.style.color = blue;
                    } else if (dspTarget === "DSP1") {
                        firstDSP.style.color = orange;
                    } else if (dspTarget === "D1+D2") {
                        firstDSP.style.fontSize = "15px";
                        firstDSP.innerHTML = `<span style="color:${orange};">D1</span><span style="color:white;">+</span><span style="color:${blue};">D2</span>`;
                    } else if (dspTarget === "DryR" || dspTarget === "DryL") {
                        //firstDSP.style.color = rgb565ToCss(colorMap["Pink"]);
                        firstDSP.style.color = colorMap["Pink"];
                    } else if (dspTarget === "DryL+R") {
                        //firstDSP.style.color = rgb565ToCss(colorMap["Pink"]);
                        firstDSP.style.color = colorMap["Pink"];
                        //firstDSP.style.fontSize = "10px";
                    }


                    const isActive = option !== "OFF";
                    firstSlider.style.display = isActive ? "inline-block" : "none";
                    firstSlider.disabled = !isActive;
                    firstValue.style.display = isActive ? "inline-block" : "none";
                    firstDSP.style.display = isActive ? "inline-block" : "none";
                    firstDSP.disabled = !isActive;
                }

                const secondContent = outerRows[1].querySelector("td > table > tr > td:nth-child(2)");
                const secondButton = secondContent.querySelector(".action-button");
                const secondSlider = secondContent.querySelector("input[type='range']");
                const secondValue = secondContent.querySelector("span");
                const secondDSP = secondContent.querySelector("button:not(.action-button)");

                if (secondButton && secondSlider && secondValue && secondDSP) {
                    const option2 = actionOptions[actionParam2] ?? "OFF";
                    secondButton.textContent = option2;
                    if (option2 !== "OFF") secondButton.style.color = green;
                    const paramName2 = actionOptions[actionParam2];
                    if (paramName2 === "DlyMix") secondSlider.max = 120;
                    else secondSlider.max = 100;
                    secondSlider.value = actionValue2;
                    const pct2 = (actionValue2 - secondSlider.min) / (secondSlider.max - secondSlider.min) * 100;
                    secondSlider.style.background = `linear-gradient(to right, ${blue} ${pct2}%, white ${pct2}%)`;
                    secondValue.textContent = `${actionValue2}%`;
                    
                    const targetList2 = (paramName2 === "DryLvl") ? ["DryL+R", "DryL", "DryR"] : targetOptions;
                    const dspTarget2 = targetList2[actionTarget2] ?? targetList2[0];
                    secondDSP.style.fontSize = "16px";
                    secondDSP.innerHTML = dspTarget2;
                    if (dspTarget2 === "DSP2") {
                        secondDSP.style.color = blue;
                    } else if (dspTarget2 === "DSP1") {
                        secondDSP.style.color = orange;
                    } else if (dspTarget2 === "D1+D2") {
                        secondDSP.style.fontSize = "15px";
                        secondDSP.innerHTML = `<span style="color:${orange};">D1</span><span style="color:white;">+</span><span style="color:${blue};">D2</span>`;
                    } else if (dspTarget2 === "DryR" || dspTarget2 === "DryL") {
                        //secondDSP.style.color = rgb565ToCss(colorMap["Pink"]);
                        secondDSP.style.color = colorMap["Pink"];
                    } else if (dspTarget2 === "DryL+R") {
                        //secondDSP.style.color = rgb565ToCss(colorMap["Pink"]);
                        secondDSP.style.color = colorMap["Pink"];
                        //secondDSP.style.fontSize = "10px";
                    }

                    const isActive2 = option2 !== "OFF";
                    secondSlider.style.display = isActive2 ? "inline-block" : "none";
                    secondSlider.disabled = !isActive2;
                    secondValue.style.display = isActive2 ? "inline-block" : "none";
                    secondDSP.style.display = isActive2 ? "inline-block" : "none";
                    secondDSP.disabled = !isActive2;
                }
            }
        }
    }

    const colorButton = table.querySelector('.color-button');
    if (colorButton && colorOptions[footColorIndex]) {
        const colorName = colorOptions[footColorIndex];
        colorButton.textContent = colorName;
        //const rgb = rgb565ToCss(colorMap[colorName]);
        const rgb = colorMap[colorName];
        colorButton.style.color = rgb;
    }

    const wrapper = table.closest('.command-center-wrapper');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const containers = wrapper.querySelectorAll("div");
            let maxHeight = 0;

            containers.forEach(div => {
                const table = div.querySelector(".command-center-table");
                if (table) {
                    const height = table.offsetHeight+40;
                    if (height > maxHeight) maxHeight = height;
                }
            });

            containers.forEach(div => {
                const bg = div.querySelector(".command-bg");
                if (bg) {
                    bg.style.height = `${maxHeight}px`;
                }
            });
        });
    });
}

function extractCommandCenterData(tableElement) {
    const modeOptions = [
        "On/Off | Hold", "On/Off | Mmtry", "On/Off | TgAct", "Tap | Scroll", "Tap | On/Off",
        "Momentary", "Toggle Action", "Scroll Mode", "ScrollUp", "ScrollDown", "Hold"
    ];
    const colorOptions = ["Purple", "Pink", "Cyan", "Green", "Orange", "Red", "Yellow", "Blue"];
    const holdModeOptions = ["Freeze", "Infinite"];
    const holdTargetOptions = ["DSP1", "DSP2", "DSP1 + DSP2"];
    const actionParameterOptions = ["OFF", "Fdback", "DlyMix", "DryLvl", "AlterI", "AlterII"];
    const dspTargetOptions = ["DSP1", "DSP2", "D1+D2"];
    const dryTargetOptions = ["DryL+R", "DryL", "DryR"];

    function getIndexFromOptions(text, options) {
        const normalized = text.trim().replace(/\s+/g, " ");
        return options.indexOf(normalized) !== -1 ? options.indexOf(normalized) : 0;
    }

    function getAsciiFromInput(input) {
        const text = input?.value || "";
        const padded = text.padEnd(4, '\0').slice(0, 4);
        return Array.from(padded).map(c => c.charCodeAt(0));
    }

    function getValueFromSlider(slider) {
        return slider ? parseInt(slider.value) : 0;
    }

    function extractDSPText(button) {
        if (!button) return "";
        const text = button.innerText.trim().replace(/\s+/g, " ");
        if (text.includes("D1") && text.includes("D2")) return "D1+D2";
        if (text.includes("DryL") && text.includes("R")) return "DryL+R";
        return text;
    }

    const nameInput = tableElement.querySelector('input[type="text"]');
    const sliders = tableElement.querySelectorAll("input[type='range']");

    const footMode = getIndexFromOptions(
        tableElement.querySelector(".foot-mode-button")?.textContent || "",
        modeOptions
    );

    const [footNameChar0, footNameChar1, footNameChar2, footNameChar3] = getAsciiFromInput(nameInput);

    const footColor = getIndexFromOptions(
        tableElement.querySelector(".color-button")?.textContent || "",
        colorOptions
    );

    const holdButtons = tableElement.querySelectorAll(".command-extra-row button");
    const footHoldMode = getIndexFromOptions(holdButtons[0]?.textContent || "", holdModeOptions);
    const footHoldTarget = getIndexFromOptions(holdButtons[1]?.textContent || "", holdTargetOptions);

    const actionButtons = tableElement.querySelectorAll(".outer-row .action-button");
    const dspButtons = tableElement.querySelectorAll(".outer-row button:not(.action-button)");

    const actionParam1 = getIndexFromOptions(actionButtons[0]?.textContent || "", actionParameterOptions);
    const actionValue1 = getValueFromSlider(sliders[0]);
    const target1Raw = extractDSPText(dspButtons[0]);
    const actionTarget1 = getIndexFromOptions(
        target1Raw,
        actionParameterOptions[actionParam1] === "DryLvl" ? dryTargetOptions : dspTargetOptions
    );

    const actionParam2 = getIndexFromOptions(actionButtons[1]?.textContent || "", actionParameterOptions);
    const actionValue2 = getValueFromSlider(sliders[1]);
    const target2Raw = extractDSPText(dspButtons[1]);
    const actionTarget2 = getIndexFromOptions(
        target2Raw,
        actionParameterOptions[actionParam2] === "DryLvl" ? dryTargetOptions : dspTargetOptions
    );

    const result = [
        footMode, footNameChar0, footNameChar1, footNameChar2, footNameChar3,
        footColor, footHoldMode, footHoldTarget,
        actionParam1, actionValue1, actionTarget1,
        actionParam2, actionValue2, actionTarget2
    ];

    //alert(JSON.stringify(result));
    alert([0xF0,0x3f+parseInt(tableElement.id.split("-").pop(), 10), ...result,0xF7]);
    sendMessage([0xF0,0x3f+parseInt(tableElement.id.split("-").pop(), 10), ...result,0xF7]);
    return result;
}

function createCommandCenterPage3() {
    const wrapper = document.createElement("div");
    wrapper.className = "command-center-wrapper";
    wrapper.style.display = "flex";
    wrapper.style.gap = "20px";
    wrapper.style.marginTop = "30px";

    // Tabela da esquerda
    const tableLeft = document.createElement("table");
    tableLeft.className = "command-center-table command-center-table-3";
    tableLeft.style.backgroundColor = purpleTransparent;
    tableLeft.style.tableLayout = "fixed";

    // Cria colgroup para definir largura das colunas
    const colgroup = document.createElement("colgroup");
    const col1 = document.createElement("col");
    col1.style.width = "60px";  // coluna 1
    const col2 = document.createElement("col");
    col2.style.width = "200px";  // coluna 2
    colgroup.appendChild(col1);
    colgroup.appendChild(col2);
    tableLeft.appendChild(colgroup);

    // Linha Expression Control
    const row1Left = document.createElement("tr");
    const cell1Left = document.createElement("td");
    cell1Left.colSpan = 2; // ocupa as duas colunas da tabela
    cell1Left.textContent = "Expression Control:";
    cell1Left.style.paddingTop = "10px"

    const buttonExpr = document.createElement("button");
    buttonExpr.textContent = "OFF";
    buttonExpr.style.color = red;
    cell1Left.appendChild(buttonExpr);

    row1Left.appendChild(cell1Left);

    const exprOptions = ["OFF", "Feedback", "DelayMix", "DryLevel", "AlterI", "AlterII"];

    buttonExpr.addEventListener("click", (ev) => {
        createPopup(exprOptions, (sel) => {
            buttonExpr.textContent = sel;
            buttonExpr.style.color = sel === "OFF" ? red : green;
            updateSliderRange();
        }, ev);
    });

    // Linha From
    const rowFrom = document.createElement("tr");
    const cellFromLabel = document.createElement("td");
    cellFromLabel.textContent = "From:";

    const cellFromSlider = document.createElement("td");

    const sliderFrom = document.createElement("input");
    sliderFrom.className = "slider"
    sliderFrom.type = "range";
    sliderFrom.min = 0;
    sliderFrom.max = 100;
    sliderFrom.value = 0;
    sliderFrom.style.width = "170px"; // largura do slider

    const fromValue = document.createElement("span");
    fromValue.className = "value-display";
    fromValue.style.color = green;
    fromValue.textContent = `${sliderFrom.value}%`;
    fromValue.style.marginLeft = "8px";

    sliderFrom.addEventListener("input", () => {
        fromValue.textContent = `${sliderFrom.value}%`;
        const percentage = ((sliderFrom.value - sliderFrom.min) / (sliderFrom.max - sliderFrom.min)) * 100;
        sliderFrom.style.background = `linear-gradient(to right, ${blue} ${percentage}%, white ${percentage}%)`;
    });
    const per1 = ((sliderFrom.value - sliderFrom.min) / (sliderFrom.max - sliderFrom.min)) * 100;
    sliderFrom.style.background = `linear-gradient(to right, ${blue} ${per1}%, white ${per1}%)`;

    const fromContainer = document.createElement("div");
    fromContainer.style.display = "flex";
    fromContainer.style.alignItems = "center";
    fromContainer.style.gap = "6px";
    fromContainer.appendChild(sliderFrom);
    fromContainer.appendChild(fromValue);

    cellFromSlider.appendChild(fromContainer);
    rowFrom.appendChild(cellFromLabel);
    rowFrom.appendChild(cellFromSlider);

    // Linha To
    const rowTo = document.createElement("tr");
    const cellToLabel = document.createElement("td");
    cellToLabel.textContent = "To:";

    const cellToSlider = document.createElement("td");
    const sliderTo = document.createElement("input");
    sliderTo.className = "slider"
    sliderTo.type = "range";
    sliderTo.min = 0;
    sliderTo.max = 100;
    sliderTo.value = 100;
    sliderTo.style.width = "150px";

    const toValue = document.createElement("span");
    toValue.className = "value-display";
    toValue.style.color = green;
    toValue.textContent = `${sliderTo.value}%`;
    toValue.style.marginLeft = "8px";

    sliderTo.addEventListener("input", () => {
        toValue.textContent = `${sliderTo.value}%`;
        const percentage = ((sliderTo.value - sliderTo.min) / (sliderTo.max - sliderTo.min)) * 100;
        sliderTo.style.background = `linear-gradient(to right, ${blue} ${percentage}%, white ${percentage}%)`;
    });
    const per2 = ((sliderTo.value - sliderTo.min) / (sliderTo.max - sliderTo.min)) * 100;
    sliderTo.style.background = `linear-gradient(to right, ${blue} ${per2}%, white ${per2}%)`;

    const toContainer = document.createElement("div");
    toContainer.style.display = "flex";
    toContainer.style.alignItems = "center";
    toContainer.style.gap = "0px";
    toContainer.appendChild(sliderTo);
    toContainer.appendChild(toValue);

    cellToSlider.appendChild(toContainer);
    rowTo.appendChild(cellToLabel);
    rowTo.appendChild(cellToSlider);

    // Linha Target
    const rowTarget = document.createElement("tr");
    const cellTargetLabel = document.createElement("td");
    cellTargetLabel.textContent = "Target:";

    const cellTargetButton = document.createElement("td");
    const buttonDSP = document.createElement("button");
    buttonDSP.textContent = "DSP1";
    buttonDSP.style.marginLeft = "10px";
    buttonDSP.addEventListener("click", (ev) => {
        const options = ["DSP1", "DSP2", "D1+D2"];
        createPopup(options, (sel) => {
            buttonDSP.textContent = sel;
    
            // Define a cor com base na seleção
            if (sel === "DSP1") {
                buttonDSP.style.color = orange;
            } else if (sel === "DSP2") {
                buttonDSP.style.color = blue;
            } else if (sel === "D1+D2") {
                buttonDSP.innerHTML = `<span style="color:${orange};">D1</span><span style="color:white;">+</span><span style="color:${blue};">D2</span>`;
            }
    
        }, ev);
    });
    

    cellTargetButton.appendChild(buttonDSP);
    rowTarget.appendChild(cellTargetLabel);
    rowTarget.appendChild(cellTargetButton);

    function updateSliderRange() {
        const isDelayMix = buttonExpr.textContent === "DelayMix";
        const maxVal = isDelayMix ? 120 : 100;
        sliderFrom.max = maxVal;
        sliderTo.max = maxVal;
        if (sliderFrom.value > maxVal) sliderFrom.value = maxVal;
        if (sliderTo.value > maxVal) sliderTo.value = maxVal;
        fromValue.textContent = `${sliderFrom.value}%`;
        toValue.textContent = `${sliderTo.value}%`;

        const perf = ((sliderFrom.value - sliderFrom.min) / (sliderFrom.max - sliderFrom.min)) * 100;
        sliderFrom.style.background = `linear-gradient(to right, ${blue} ${perf}%, white ${perf}%)`;
        const perT = ((sliderTo.value - sliderTo.min) / (sliderTo.max - sliderTo.min)) * 100;
        sliderTo.style.background = `linear-gradient(to right, ${blue} ${perT}%, white ${perT}%)`;
    }

    tableLeft.appendChild(row1Left);
    tableLeft.appendChild(rowFrom);
    tableLeft.appendChild(rowTo);
    tableLeft.appendChild(rowTarget);

    // Tabela da direita
    const tableRight = document.createElement("table");
    tableRight.className = "command-center-table right-command-table";
    tableRight.style.backgroundColor = purpleTransparent;

    for (let i = 0; i < 2; i++) {
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 2;

        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.gap = "10px";

        const labelPC = document.createElement("span");
        labelPC.textContent = "PC Send:";
        labelPC.style.width = "70px";

        const buttonPC = document.createElement("button");
        buttonPC.textContent = "OFF";
        buttonPC.style.width = "50px";
        buttonPC.style.textAlign = "center";
        buttonPC.style.color = red;
        buttonPC.addEventListener("click", (ev) => {
            const options = ["OFF", ...Array.from({ length: 128 }, (_, i) => i)];
            createPopup(options, (sel) => {
                buttonPC.textContent = sel;
                buttonPC.style.color = sel === "OFF" ? red : green;
            }, ev);
        });

        const labelCh = document.createElement("span");
        labelCh.textContent = "Channel:";
        labelCh.style.marginLeft = "30px";

        const buttonCh = document.createElement("button");
        buttonCh.textContent = "1";
        buttonCh.style.width = "30px";
        buttonCh.style.textAlign = "center";
        buttonCh.addEventListener("click", (ev) => {
            const options = [...Array.from({ length: 16 }, (_, i) => `${i + 1}`), "All"];
            createPopup(options, (sel) => {
                buttonCh.textContent = sel;
                buttonCh.style.color = sel === "All" ? blue : green;
            }, ev);
        });

        container.appendChild(labelPC);
        container.appendChild(buttonPC);
        container.appendChild(labelCh);
        container.appendChild(buttonCh);
        td.appendChild(container);
        row.appendChild(td);
        tableRight.appendChild(row);
    }

    tableLeft.style.flex = "1";
    tableRight.style.flex = "1";
    tableLeft.style.height = "100%";
    tableRight.style.height = "100%";

    wrapper.appendChild(tableLeft);
    wrapper.appendChild(tableRight);

    return wrapper;
}


function createSystemButtons() {
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "center";
    buttonContainer.style.gap = "20px";
    buttonContainer.style.marginTop = "300px";
    buttonContainer.style.marginLeft = "0px";

    // Botão Save
    const saveButton = document.createElement("button");
    saveButton.className = "system-button";
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", () => alert("Saved"));

    // Botão Cancel
    const cancelButton = document.createElement("button");
    cancelButton.className = "system-button";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", () => alert("Canceled"));

    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(cancelButton);

    return buttonContainer;
}

function createPopup(options, callback, event) {
    const popup = document.createElement("div");
    popup.className = "popup-container";

    // Posicionar o popup no cursor
    const x = event.clientX;
    let y = event.clientY;

    // Limitado a janela
    const popupHeight = 200;
    const paddingFromEdge = -25;
    if ((y + popupHeight + paddingFromEdge) > window.innerHeight) {
        y = window.innerHeight - popupHeight - paddingFromEdge;
    }

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
