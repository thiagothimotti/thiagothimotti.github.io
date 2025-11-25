console.log("Script de fallback ativado!");
console.log(nomeControladora);

window.activePreset = null;

const algorithmData = {
    "Glassy Delay": ["High Cut", "Low Cut", "Saturation", "Mod Type"],
    "Bucket Brigade": ["Tone", "Compression", "Modulation", "Grit", "Ducking", "Low Cut"],
    "TransistorTape": ["Tone", "Wow & Flutter", "Degradation", "High Cut"],
    "Quantum Pitch": ["Interval A", "Tone A", "Level A", "Interval B", "Tone B", "Level B", "Mode"],
    "Holo Filter": ["Type", "Ressonance", "Tone", "Envelope", "Sensitivity/Range", "Response/Rate"],
    "RetroVerse": ["Sensitivity", "Release"],
    "Memory Man": ["Tone", "Compression", "Grit", "Mod Type ", "Modulation", "Ducking"],
    "Nebula Swell": ["Sensitivity", "Response"],
    "WhammyDelay": ["Heel", "Toe", "Tone", "Mode ", "Speed"]
};

const algorithmDataSpacewalk = {
    "SpaceRoom": ["EarlyR. Level", "EarlyR. Tone", "Diffusion"],
    "HALL 9000": ["EarlyR. Level", "EarlyR. Tone", "Diffusion"],
    "Star Plate": ["Plate Size", "Modulation"],
    "GravitySprings": ["Shape", "Speed", "Depth"],
    "SunlightWings": ["Speed", "Depth", "Diffusion"],
    "Dark Galaxy": ["Fundamental", "Harmonics", "Regeneration", "Tone"],
    "Sci-fi Shimmer": ["Fundamental", "Harmonics", "Regeneration", "Tone"],
    "Frosted Verb": ["Mode   ", "Velocity", "Modulation", "Harmonics"],
    "Spatial Vowels": ["Home Vowel", "Target Vowel", "Resonance", "Sensitivity", "Response"],
    "Stellar Swell": ["Sensitivity", "Response"]
};

const algorithmStart = {
    "Glassy Delay": ["400ms", "80%", "80%", "OFF", "OFF", "0%", "OFF"],
    "Bucket Brigade": ["400ms", "80%", "80%", "50%", "75%", "60%", "20%", "10%", "OFF"],
    "TransistorTape": ["600ms", "80%", "80%", "50%", "35%", "0%", "OFF"],
    "Quantum Pitch": ["63ms", "0%", "100%", "-12", "60%", "100%", "0", "20%", "0%", "Fixed"],
    "Holo Filter": ["0ms", "80%", "80%", "LPF", "70%", "50%", "RMS", "40%", "50%"],
    "RetroVerse": ["800ms", "80%", "80%", "70%", "50%"],
    "Memory Man": ["200ms", "80%", "80%", "60%", "75%", "0%", "Vibrato", "10%", "10%"],
    "Nebula Swell": ["0ms", "0%", "80%", "50%", "50%"],
    "WhammyDelay": ["600ms", "80%", "80%", "-12", "7", "50%", "Auto", "0%"],
    "SpaceRoom": ["30%", "0ms", "80%", "60%", "80%", "80%", "80%", "75%", "75%"],
    "HALL 9000": ["30%", "0ms", "80%", "40%", "70%", "60%", "60%", "100%", "10%"],
    "Star Plate": ["30%", "0ms", "80%", "50%", "60%", "20%", "40%", "0%"],
    "GravitySprings": ["70%", "0ms", "80%", "15%", "60%", "40%", "Sine", "60%", "0%"],
    "SunlightWings": ["70%", "0ms", "80%", "20%", "15%", "15%", "40%", "40%", "60%"],
    "Dark Galaxy": ["70%", "0ms", "80%", "40%", "10%", "10%", "80%", "20%", "0%", "60%"],
    "Sci-fi Shimmer": ["70%", "0ms", "80%", "40%", "10%", "10%", "80%", "20%", "0%", "40%"],
    "Frosted Verb": ["70%", "0ms", "80%", "20%", "30%", "30%", "Soft", "Slow", "60%", "80%"],
    "Spatial Vowels": ["70%", "0ms", "80%", "50%", "40%", "10%", "U", "A", "80%", "80%", "20%"],
    "Stellar Swell": ["70%", "0ms", "80%", "20%", "20%", "20%", "80%", "80%"]
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
    "Mod Type ": { tipo: "lista", valores: ["", "Vibrato", "Tremolo"], complemento: "" },
    "Tone": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Compression": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Modulation": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Grit": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Ducking": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Wow & Flutter": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Degradation": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Interval A": {
        tipo: "lista", valores: [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3,
            4, 5, 6, 7, 8, 9, 10, 11, 12], complemento: ""
    },
    "Tone A": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Level A": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Interval B": {
        tipo: "lista", valores: [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3,
            4, 5, 6, 7, 8, 9, 10, 11, 12], complemento: ""
    },
    "Tone B": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Level B": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Mode": { tipo: "lista", valores: ["Fixed", "Gradual"], complemento: "" },
    "Mode ": { tipo: "lista", valores: ["CC", "Auto"], complemento: "" },
    "Mode  ": { tipo: "lista", valores: ["Vintage", "Modern"], complemento: "" },
    "Type": { tipo: "lista", valores: ["LPF", "HPF", "BPF"], complemento: "" },
    "Ressonance": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Envelope": { tipo: "lista", valores: ["Triangle", "Square", "Sine", "RMS"], complemento: "" },
    "Sensitivity/Range": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Response/Rate": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Sensitivity": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Release": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Response": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Heel": {
        tipo: "lista", valores: [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5,
            6, 7, 8, 9, 10, 11, 12], complemento: ""
    },
    "Toe": {
        tipo: "lista", valores: [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6,
            7, 8, 9, 10, 11, 12], complemento: ""
    },
    "Shape": { tipo: "lista", valores: ["Triangle", "Square", "Sine"], complemento: "" },
    "Speed": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    // Glassy Delay
    "Speed": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Depth": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    //"Shape": { tipo: "lista", valores: ["Sine", "Triangle", "Square"], complemento: "" },
    "Voices": { tipo: "lista", valores: ["", "", 2, 3, 4, 5], complemento: "" },
    "Stages": { tipo: "lista", valores: ["", "", 2, 3, 4], complemento: "" },
    "Mode    ": { tipo: "lista", valores: ["Vintage", "Modern"], complemento: "" },
    "Regen": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Manual": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    // Spacewalk extras
    "Decay": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Pre-Delay": { tipo: "porcentagem", valor_inicial: 0, valor_final: 125, complemento: "ms" },
    "ReverbMix": { tipo: "porcentagem", valor_inicial: 0, valor_final: 120, complemento: "%" },
    "Dampening": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Low Damp": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "High Damp": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "EarlyR. Level": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "EarlyR. Tone": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Diffusion": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Plate Size": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Depth": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Fundamental": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Harmonics": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Regeneration": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" },
    "Mode   ": { tipo: "lista", valores: ["Soft", "Deep"], complemento: "" },
    "Velocity": { tipo: "lista", valores: ["Slow", "Fast"], complemento: "" },
    "Home Vowel": { tipo: "lista", valores: ["A", "E", "I", "O", "U"], complemento: "" },
    "Target Vowel": { tipo: "lista", valores: ["A", "E", "I", "O", "U"], complemento: "" },
    "Resonance": { tipo: "porcentagem", valor_inicial: 0, valor_final: 100, complemento: "%" }
};

const timeAlg = {
    "Glassy Delay": { min: 0, max: 900, start: 400 },
    "Bucket Brigade": { min: 0, max: 944, start: 400 },
    "TransistorTape": { min: 2, max: 937, start: 400 },
    "Quantum Pitch": { min: 63, max: 823, start: 400 },
    "Holo Filter": { min: 0, max: 948, start: 400 },
    "RetroVerse": { min: 0, max: 830, start: 400 },
    "Memory Man": { min: 0, max: 940, start: 400 },
    "Nebula Swell": { min: 0, max: 948, start: 400 },
    //"WhammyDelay": { min: 63, max: 823, start: 400 }
    "WhammyDelay": { min: 63, max: 823, start: 400 },
    "SpaceRoom": { min: 0, max: 900, start: 400 },
    "HALL 9000": { min: 0, max: 944, start: 400 },
    "Star Plate": { min: 2, max: 937, start: 400 },
    "GravitySprings": { min: 63, max: 823, start: 400 },
    "SunlightWings": { min: 0, max: 948, start: 400 },
    "Dark Galaxy": { min: 0, max: 830, start: 400 },
    "Sci-fi Shimmer": { min: 0, max: 940, start: 400 },
    "Frosted Verb": { min: 0, max: 948, start: 400 },
    "Spatial Vowels": { min: 63, max: 823, start: 400 },
    "Stellar Swell": { min: 63, max: 823, start: 400 }
}

const modTypeData = {
    "OFF": [],
    "Vibrato": ["Speed", "Depth"],
    "Tremolo": ["Speed", "Depth", "Shape"],
    "Chorus": ["Speed", "Depth", "Voices"],
    "Phaser": ["Speed", "Depth", "Stages"],
    "Flanger": ["Speed", "Depth", "Mode    ", "Regen", "Manual"]
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
    "Shape": { tipo: "lista", valores: ["Triangle", "Square", "Sine"], complemento: "" },
    "Voices": { tipo: "lista", valores: ["", "", 2, 3, 4, 5], complemento: "" },
    "Stages": { tipo: "lista", valores: ["", "", 2, 3, 4], complemento: "" },
    "Mode    ": { tipo: "lista", valores: ["Vintage", "Modern"], complemento: "" },
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
    Purple: "#5200ff",
    Pink:   "#ff0084",
    Cyan:   "#00ffff",
    Green:  "#00ff00",
    Orange: "#ff8200",
    Red:    "#ff0000",
    Yellow: "#ffff84",
    //Blue:   "#0000ff"
    Blue:   "#0082ff"
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
orange = "rgb(255, 130, 0)";
purple ="rgb(115, 0, 255)";
let blue = "rgb(0, 255, 255)";

let saveBlue = "rgb(0, 130, 255)";

//alert("Script dos pedais carregado");

let patchChanged = false;
let imageInicialized = 2;
let copiedPresetIndex = null;
window.originalPresetName = "";
let waitPresetChange = 40;
let waitMessage = 2;

const model = nomeControladora == "timespace"? 0x01 : 0x02;
const protocoloVersion = 0x01;
const compatibility = 0x01;

async function createPresets() {

    const mainContent = document.getElementById("mainContent");

    mainContent.addEventListener("dragover", (e) => {
        e.preventDefault(); // necessário para permitir o drop
        mainContent.classList.add("drag-over");
    });

    mainContent.addEventListener("dragleave", () => {
        mainContent.classList.remove("drag-over");
    });

    mainContent.addEventListener("drop", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.activePreset) return;

        mainContent.classList.remove("drag-over");

        // Tenta identificar se o arquivo arrastado é um backup
        let isBackup = false;
        try {
            const jsonData = e.dataTransfer.getData('application/json');
            if (jsonData) {
                const byteArray = JSON.parse(jsonData);
                const fileTypeFlag = byteArray[0];
                if (fileTypeFlag === 103) isBackup = true;
            }
        } catch (err) {
            console.warn("Falha ao ler tipo de arquivo no drop:", err);
        }

        if (!window.activePreset && !isBackup) return;

        const dropEvent = new DragEvent("drop", {
            dataTransfer: e.dataTransfer,
            bubbles: true,
            cancelable: true
        });

        window.activePreset.dispatchEvent(dropEvent);
    });


    const sidebar = document.getElementById("sidebar");
    sidebar.addEventListener("dragover", (e) => {
        e.preventDefault();
        //sidebar.classList.add("drag-over");
    });
    sidebar.addEventListener("dragleave", () => {
        //sidebar.classList.remove("drag-over");
    });

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
        presetInput.maxLength = 8;
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
        copyButton.addEventListener("click", (event) => {
            event.stopPropagation();

            const preset = event.target.closest(".preset");
            copiedPresetIndex = [...document.querySelectorAll(".preset")].indexOf(preset);

            notify(`Patch ${copiedPresetIndex.toString().padStart(3, '0')} copied!`, "success");

            document.querySelectorAll(".preset").forEach((p, i) => {
                if (i === copiedPresetIndex) {
                    const existingPaste = p.querySelector(".paste-button");
                    if (existingPaste) existingPaste.remove();
                    return;
                }

                const nameContainer = p.querySelector(".name-container");
                if (!nameContainer) return;

                // Evita duplicar o botão paste
                if (!nameContainer.querySelector(".paste-button")) {
                    const pasteButton = document.createElement("span");
                    pasteButton.className = "fa-regular fa-paste paste-button";
                    pasteButton.title = "Paste preset";
                    pasteButton.style.fontSize = "15px";
                    pasteButton.style.cursor = "pointer";
                    pasteButton.addEventListener("click", (e) => {
                        e.stopPropagation();
                        if (copiedPresetIndex === null || copiedPresetIndex === i) return;
                        notify(`Preset ${i.toString().padStart(3, '0')} has been replaced with Preset ${copiedPresetIndex.toString().padStart(3, '0')}'s data.`, "success");                        
                        //alert([0xF0,0x15,i,0xF7]);
                        sendMessage([0xF0,0x15,i,0xF7]);
                        
                        const presetList = document.querySelectorAll(".preset");
                        const sourcePreset = presetList[copiedPresetIndex];
                        const targetPreset = presetList[i];
                        const sourceNameInput = sourcePreset.querySelector(".preset-name");
                        const targetNameInput = targetPreset.querySelector(".preset-name");

                        if (sourceNameInput && targetNameInput) {
                            targetNameInput.value = sourceNameInput.value;
                            targetNameInput.dispatchEvent(new Event("input")); // Atualiza o nome
                        }

                        // Seleciona o preset colado como ativo
                        if (targetPreset) {
                            targetPreset.click();
                        }
                    });

                    nameContainer.appendChild(pasteButton);
                }
            });
        });

        const swapButton = document.createElement("span");
        swapButton.className = 'fa-solid fa-rotate';
        swapButton.title = "Swap preset";
        swapButton.style.fontSize = '15px'
        swapButton.style.marginTop = '3px';
        swapButton.addEventListener("click", (event) => {
            event.stopPropagation();

            const preset = event.target.closest(".preset");
            const sourceIndex = [...document.querySelectorAll(".preset")].indexOf(preset);

            notify(`Preset ${sourceIndex.toString().padStart(3, '0')} selected for swap`, "info");

            document.querySelectorAll(".preset").forEach((p, i) => {
                if (i === sourceIndex) return; 

                const nameContainer = p.querySelector(".name-container");
                if (!nameContainer) return;

                // Impede duplicação
                const existingSwapTo = nameContainer.querySelector(".fa-solid.fa-rotate.swap-to");
                if (existingSwapTo) existingSwapTo.remove();

                const swapToButton = document.createElement("span");
                swapToButton.className = 'fa-solid fa-rotate swap-to';
                swapToButton.title = "Swap to";
                swapToButton.style.fontSize = '15px';
                swapToButton.style.cursor = "pointer";

                swapToButton.addEventListener("click", (e) => {
                    e.stopPropagation();

                    const targetPreset = e.target.closest(".preset");
                    const targetIndex = [...document.querySelectorAll(".preset")].indexOf(targetPreset);

                    // Troca os nomes dos presets como exemplo de swap
                    const sourcePresetInput = preset.querySelector(".preset-name");
                    const targetPresetInput = targetPreset.querySelector(".preset-name");

                    const tempName = sourcePresetInput.value;
                    sourcePresetInput.value = targetPresetInput.value;
                    targetPresetInput.value = tempName;

                    sendMessage([0xF0,0x16,targetIndex,0xF7]);
                    notify(`Presets ${sourceIndex.toString().padStart(3, '0')} and ${targetIndex.toString().padStart(3, '0')} swapped!`, "success");
                
                    // Seleciona o preset de destino como o ativo
                    if (targetPreset) {
                        targetPreset.click();
                    }
                });

                nameContainer.appendChild(swapToButton);
            });
        });

        const clearButton = document.createElement("span");
        clearButton.className = 'fa-solid fa-xmark';
        clearButton.title = "Clear preset";
        clearButton.style.fontSize = '20px'
        clearButton.style.marginLeft = '10px'
        clearButton.addEventListener("click", (event) => {
            event.stopPropagation();

            const preset = event.target.closest(".preset");
            const presetIndex = [...document.querySelectorAll(".preset")].indexOf(preset);

            Swal.fire({
                title: "Are you sure?",
                text: `This will clear all settings from Patch ${presetIndex.toString().padStart(3, '0')}.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, clear it!",
                cancelButtonText: "Cancel",
                confirmButtonColor: "red",
                cancelButtonColor: "#53bfeb",
                background: "#2a2a40",
                color: "white",
                width: "500px"
            }).then((result) => {
                if (result.isConfirmed) {
                    imageInicialized = 2;
                    sendMessage([0xF0,0x14,0x00,0xF7]);
                    notify(`Patch ${presetIndex.toString().padStart(3, '0')} has been cleared.`, "success");

                    const nameInput = preset.querySelector(".preset-name");
                    nameInput.value = "";
                    window.originalPresetName = "";
                    nameInput.dispatchEvent(new Event("input")); // Apaga o nome na lista
                    patchChanged = false; //aqui
                }
            });
        });

        const arrow = document.createElement("span");
        arrow.textContent = "\u276E";
        arrow.className = "preset-arrow";

        preset.appendChild(presetNumber);

        const nameContainer = document.createElement("div");
        nameContainer.className = "name-container";
        nameContainer.style.display = "flex";
        nameContainer.style.alignItems = "center";
        nameContainer.style.gap = "6px";
        nameContainer.appendChild(presetInput);
        preset.appendChild(nameContainer);

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
                if (event.target.tagName === "INPUT") return;

                preset.classList.remove("selected");
                preset.style.backgroundColor = "";
                arrow.style.transform = "rotate(-90deg) scale(1.8)";
                preset.querySelector(".preset-icon-container").style.display = "none";

                const existingConfig = document.getElementById("preset-config-table");
                if (existingConfig) {
                    existingConfig.remove();
                }

                mainContent.innerHTML = '';
                //activePreset = null;
                return;
            }
            
            const autosaveBtn = [...document.querySelectorAll(".preset-config-row")]
                .find(row => row.querySelector(".preset-config-label")?.textContent === "Auto Save")
                ?.querySelector(".preset-config-button");

            const autosaveOn = autosaveBtn?.textContent === "On";
            if (patchChanged && activePreset !== preset) {
                if (autosaveOn) {
                    patchChanged = false;
                    proceedToSelectPatch();
                    return;
                }
                Swal.fire({
                    title: "Are you sure?",
                    text: `All changes on Patch ${activePreset ? activePreset.querySelector(".preset-number").textContent : ''} will be lost!`,
                    icon: "warning",
                    color: "white",
                    width: "600px",
                    background: "#2a2a40",
                    showCancelButton: true,
                    confirmButtonText: "Yes, change!",
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "red",
                    cancelButtonColor: "#53bfeb"
                }).then((result) => {
                    if (result.isConfirmed) {
                        patchChanged = false;  // Reseta o flag
                        const previousInput = activePreset.querySelector(".preset-name");
                        previousInput.value = window.originalPresetName;
                        previousInput.dispatchEvent(new Event("input"));
                        proceedToSelectPatch();
                    }
                });
            } else {
                proceedToSelectPatch();
            }

            async function proceedToSelectPatch() {
                document.querySelectorAll(".preset").forEach(p => {
                    p.classList.remove("selected");
                    p.style.backgroundColor = "";
                    p.querySelector(".preset-arrow").style.transform = "rotate(-90deg) scale(1.8)";
                });

                const presetNameInput = preset.querySelector(".preset-name");
                window.originalPresetName = presetNameInput.value;

                const existingConfig = document.getElementById("preset-config-table");
                if (existingConfig) {
                    existingConfig.remove();
                }

                // Remove todos os botões paste e swapTo
                document.querySelectorAll(".paste-button").forEach(el => el.remove());
                document.querySelectorAll(".swap-to").forEach(btn => btn.remove());

                sendMessage([0xF0, 0x43, i, 0xF7]);
                await delay(waitPresetChange)
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
                imageInicialized = 2;
            }
        });

        presetInput.addEventListener("input", function (event) {
            // Regex para limitar characteres
            const allowedRegex = /^[A-Za-z0-9!"#$%&'*\+\-_.?@ ]*$/;
            const currentValue = this.value;

            // Se algum caractere inválido for digitado, remove-o
            if (!allowedRegex.test(currentValue)) {
                this.value = currentValue
                    .split("")
                    .filter(c => allowedRegex.test(c))
                    .join("");
            }

            // Atualiza o título do preset se estiver selecionado
            const presetTitle = document.querySelector(".preset-title");
            if (preset.classList.contains("selected")) {
                if (this.value)
                    presetTitle.textContent = `${presetNumber.textContent} | ${this.value}`;
                else
                    presetTitle.textContent = this.placeholder;
            }
        });

        presetInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") this.blur();
        });
        
        presetInput.addEventListener("blur", function () {
            const asciiArray = [];
            for (let i = 0; i < 8; i++) {
                if (i < this.value.length) {
                    asciiArray.push(this.value.charCodeAt(i));
                } else {
                    asciiArray.push(32);
                }
            }
            sendMessage([0xF0, 0x07, ...asciiArray, 0xF7]);
            //alert([this.value, window.originalPresetName])
            if (this.value != window.originalPresetName){
                patchChanged = true;
            }
        });

        // Lida com o import de presets
        preset.addEventListener("dragover", (e) => {
            e.preventDefault();
            preset.classList.add("drag-over");
        });

        preset.addEventListener("dragleave", () => {
            preset.classList.remove("drag-over");
        });

        preset.addEventListener("drop", async (e) => {
            e.preventDefault();
            preset.classList.remove("drag-over");

            const file = e.dataTransfer.files[0];

            // Arrastando diretamente do computador
            if (file && file.name.endsWith(".stnpreset")) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const arrayBuffer = event.target.result;
                    const array = new Uint8Array(arrayBuffer);
                    console.log(`Conteúdo do arquivo ${file.name}:`, array);
                    window.lastPresetArray = array;
                };
                reader.readAsArrayBuffer(file);
                return;
            } 

            // Arrastando de dentro do site
            const content = e.dataTransfer.getData("application/json");
            const fileName = e.dataTransfer.getData("text/plain");
            const fromSaturnRepo = e.dataTransfer.getData("isSaturnRepo") === "true";
            const arr = JSON.parse(e.dataTransfer.getData('application/json'));
            const uint8 = new Uint8Array(arr).slice(0, -1);
            //alert(uint8)

            if (content && fileName.endsWith(".stnpreset")) {
                let originalArray;
                let isBackup;
                //alert([...content]);

                if (fromSaturnRepo) {
                    //aqui to enviando o ultimo valor como 0 por algum motivo eu estou perdendo ele na leitura (por hora todos os sons oficiais são 0 então tudo certo)
                    // Converte o texto do github para int
                    const byteArray = new Uint8Array(uint8); // já é array de bytes
                    const fullArray = new Uint8Array(byteArray); // cópia (poderia até usar byteArray direto)

                    // Decodifica ignorando o primeiro byte
                    const decoded = decode(fullArray.slice(1));

                    // Cria originalArray com +0 no final
                    if (decoded.length == 152)
                        originalArray = Uint8Array.from([...decoded, 0]);
                    else originalArray = Uint8Array.from([...decoded.slice(0, -1), 0]);

                    //alert([...byteArray]);     // correto
                    //alert([...originalArray]); // também correto
                    //alert([...decoded]);     // idem
                    //alert(originalArray.length);
                    //alert(decoded.length);
                } else {
                    const parsed = JSON.parse(content);
                    const fullArray = new Uint8Array(parsed);
                    isBackup = parsed[0]
                    //alert(isBackup)
                    originalArray = decode(fullArray.slice(1));
                    //alert([...fullArray])
                    //alert([...originalArray]);
                }

                // Verifica a compatibilidade do arquivo
                if (originalArray[0] !== model || originalArray[1] !== protocoloVersion || originalArray[5] !== compatibility){
                    //alert([[originalArray[0], originalArray[1], originalArray[5]], [model, protocoloVersion, compatibility]])
                    Swal.fire({
                        toast: true,
                        background: "#2a2a40",
                        color: "rgb(83, 191, 235)",
                        position: "bottom-end",
                        icon: "error",
                        title: "Incompatible file format.",
                        text: "Please use a compatible file for your device.",
                        showConfirmButton: false,
                        timer: 5000,
                        timerProgressBar: true
                    });
                    //notify ("Incompatible file format. Please use a compatible file for your device.", "error");
                    return;
                }

                console.log(`Conteúdo do arquivo ${fileName}:`, originalArray);
                window.lastPresetArray = originalArray;

                patchChanged = false;

                const partes = [];
                let header = isBackup == 103 ? [...originalArray.slice(0, 9)] : [i, ...originalArray.slice(0, 9)];
                //alert (header)
                let resto = originalArray.slice(9);
                console.log(resto)
                

                // Envia as mensagens (você pode substituir alert por sendMessage depois)
                //alert(`Header: [${[...header]}]`);
                const command = isBackup == 103 ? 0x4D : 0x4B;
                if (command == 0x4D) {
                    document.getElementById("loading-overlay").style.display = "flex";
                    // Reparte a informação em partes de até 44 bytes
                    while (resto.length > 0) {
                        const parte = resto.slice(0, 42);
                        partes.push(parte);
                        resto = resto.slice(42);
                    }
                    //alert(partes[partes.length-1].length)
                    sendMessage([0xF0,command,0x00, 0x00,...header,0xF7]);
                    //alert([0xF0,command,0x00, 0x00,...header,0xF7]);
                    //console.log([0xF0,command,0x00, 0x00,...header,0xF7]);
                    for (let index = 0; index < partes.length; index++) {
                        //alert(`Parte ${index + 1}: [${[...parte]}]`);
                        //alert([0xF0,command,(index+1) % 128,Math.floor((index+1)/128),...partes[index],0xF7]);
                        //console.log([0xF0,command,(index+1) % 128,Math.floor(index/128),...partes[i],0xF7])
                        /*aux = 1 % 25;
                        if (aux != 0) {
                            await delay(100);
                        }*/
                        await delay(10);
                        sendMessage([0xF0,command,(index+1) % 128,Math.floor((index+1)/128),...partes[index],0xF7]);
                    };
                    sendMessage([0xF0,0x30,0x00,0xF7]);
                    /*if (preset !== activePreset) {
                        preset.click();
                    }*/
                    return;
                }
                // Reparte a informação em partes de até 44 bytes
                while (resto.length > 0) {
                    const parte = resto.slice(0, 44);
                    partes.push(parte);
                    resto = resto.slice(44);
                }
                
                sendMessage([0xF0,command,0x00,...header,0xF7]);
                //alert([0xF0,command,0x00,...header,0xF0]);
                //console.log([0xF0,command,0x00,...header,0xF0]);
                partes.forEach((parte, index) => {
                    //alert(`Parte ${index + 1}: [${[...parte]}]`);
                    //alert([0xF0,command,index + 1,...parte,0xF7]);
                    //console.log([0xF0,command,index + 1,...parte,0xF7])
                    sendMessage([0xF0,command,index + 1,...parte,0xF7]);
                });

                if (preset !== activePreset) {
                    preset.click();
                }

                return;
            }

            console.log("Arquivo inválido ou nenhum arquivo.");
        });


        sidebar.appendChild(preset);
    }

    sendMessage([0xF0, 0x30, 0x00, 0xF7]);
}

function charToSaturnValue(char) {
    if (char === ' ') return 0; // espaço

    const code = char.charCodeAt(0);

    // A-Z
    if (code >= 65 && code <= 90) return code - 65 + 1;
    // a-z
    if (code >= 97 && code <= 122) return code - 97 + 27;
    // 0-9
    if (code >= 48 && code <= 57) return code - 48 + 53;
    // ! " # $ % & '
    if (code >= 33 && code <= 39) return code - 33 + 63;
    // * +
    if (code >= 42 && code <= 43) return code - 42 + 70;
    // -
    if (char === '-') return 72;
    // _
    if (char === '_') return 73;
    // ? @
    if (code >= 63 && code <= 64) return code - 63 + 74;
    // .
    if (char === '.') return 76;

    return 0; // padrão: espaço se for caractere inválido
}

function reloadActivePreset() {
    if (!activePreset) return;

    const presetIndex = [...document.querySelectorAll(".preset")].indexOf(activePreset);
    const presetName = activePreset.querySelector(".preset-name").value || activePreset.querySelector(".preset-name").placeholder;

    patchChanged = false; // reseta flag de mudanças
    attachPresetConfig(activePreset);
    createTable(presetIndex, presetName);
    sendMessage([0xF0, 0x33, 0x00, 0xF7]);
    sendMessage([0xF0, 0x3B, 0x00, 0xF7]);
}
window.reloadActivePreset = reloadActivePreset;

function extractPresets(data) {
    //alert(data)
    if (data.length !== 33) {
        console.error("O array não possui 33 elementos");
        //return;
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
    await delay(waitMessage)
    sendMessage([0xF0, 0x38, 0x00, 0xF7]);
    await delay(waitMessage)

    const presetTitle = createPresetTitle(presetName);
    mainContent.appendChild(presetTitle);

    const topologyContainer = createTopologySection(updateTopologyImage);
    mainContent.appendChild(topologyContainer);

    // Adiciona imagem logo abaixo da topology
    const topologyImage = document.createElement("img");
    topologyImage.id = "topology-image";
    topologyImage.src = "assets/Single.png"; //single
    topologyImage.alt = "Topology Image";
    topologyImage.style.display = "block";
    topologyImage.style.marginTop = "-10px";
    topologyImage.style.marginBottom = "20px";
    topologyImage.style.maxWidth = "370px"; // responsivo
    mainContent.appendChild(topologyImage);

    const mainTable = createFormattedTable();
    const smallTables = await createSmallTables();
    mainContent.appendChild(mainTable);
    mainContent.appendChild(smallTables);

    const imageTable = createImageTable();
    mainContent.appendChild(imageTable.container);
    sendMessage([0xF0, 0x33, 0x00, 0xF7]);
    await delay(waitMessage)
    
    updateImageRowsFunct = imageTable.updateImageRows;
    const topology = document.querySelector(".type-display")?.textContent || "Single";
    const imageDisplay = document.getElementById("imageDisplay");

    if (imageDisplay) {
        const observer = new MutationObserver(() => {
            const selectedImage = imageDisplay.textContent.trim();
            updatePanVisibility(selectedImage, topology);
            observer.disconnect(); // evita multiplas chamadas
        });

        observer.observe(imageDisplay, { childList: true, subtree: true });
    }

    sendMessage([0xF0, 0x3B, 0x00, 0xF7]);
    await delay(waitMessage)

    const commandCenterTitle = document.createElement("h2");
    commandCenterTitle.textContent = "Command Center";
    commandCenterTitle.style.marginTop = "20px";
    commandCenterTitle.style.textAlign = "center";

    mainContent.appendChild(commandCenterTitle);
    mainContent.appendChild(createCommandCenterTables());
    mainContent.appendChild(createCommandCenterPage3());

    const sidebar2 = document.getElementById("sidebar2");
    //sidebar2.appendChild(createSystemButtons())
    mainContent.appendChild(createSystemButtons())

    sendMessage([0xF0, 0x3D, 0x00, 0xF7]);
    await delay(waitMessage)
    sendMessage([0xF0, 0x3E, 0x00, 0xF7]);
    await delay(waitMessage)
    sendMessage([0xF0,0x3F,0x00,0xF7]);
    await delay(waitPresetChange)

    const allElements = mainContent.querySelectorAll("*");
    allElements.forEach(el => {
        el.setAttribute("draggable", "false");
    });
}

function updatePanVisibility(selectedImage, topology) {
    let panVisibility = [true, true];

    if (selectedImage === "Ping-Pong" || selectedImage === "Transverse") {
        panVisibility = [false, false];
    } else if (topology === "Mixed") {
        panVisibility = [false, true];
    } else if (topology === "Single") {
        panVisibility = [true, false];
    }

    setPanDisplayVisibility(panVisibility);
}

function updateTopologyImage(topology) {
    const topologyImage = document.getElementById("topology-image");
    if (!topologyImage) return;

    //setPanDisplayVisibility([true, true]);
    if (topology === "Single") {
        //setPanDisplayVisibility([false, true]);
        topologyImage.src = "assets/Single.png";
    } else if (topology === "Dual") {
        topologyImage.src = "assets/Dual.png";
    } else if (topology === "Series") {
        topologyImage.src = "assets/Series.png";
    } else if (topology === "Mixed") {
        //setPanDisplayVisibility([false, true]);
        topologyImage.src = "assets/Mixed.png";
    } else if (topology === "Cascade") {
        topologyImage.src = "assets/Cascade.png";
    }
}

// Função para criar o título do preset
function createPresetTitle(presetName) {
    const presetTitle = document.createElement("h1");
    presetTitle.className = "preset-title";
    presetTitle.textContent = presetName;
    return presetTitle;
}

// Função para criar a seção de topologia com setas de navegação
window.currentTypeIndex = 0;
//alert(window.currentTypeIndex)
function createTopologySection(onTopologyChange) {
    
    const topologyContainer = document.createElement("div");
    topologyContainer.className = "topology-container";

    const topologyTitle = document.createElement("h2");
    topologyTitle.className = "topology-title";
    topologyTitle.textContent = "Topology:";

    const typeDisplay = document.createElement("span");
    typeDisplay.className = "type-display";
    typeDisplay.id = "topology-type-display";
    typeDisplay.textContent = getType(window.currentTypeIndex);
    typeDisplay.style.width = '70px';
    typeDisplay.style.cursor = "pointer";

    const topologyOptions = ["Single", "Dual", "Series", "Mixed", "Cascade"];

    function handleTopologyChange(selectedOption) {
        window.currentTypeIndex = topologyOptions.indexOf(selectedOption);
        typeDisplay.textContent = selectedOption;
        sendMessage([0xF0, 0x32, window.currentTypeIndex, 0xF7]);
        //alert([0xF0, 0x32, window.currentTypeIndex, 0xF7])
        patchChanged = true;

        const dsp2 = document.getElementById("dsp-table-2");
        if (dsp2 && dsp2.updateLabels) {
            dsp2.updateLabels(true);
        }

        const imageDisplay = document.getElementById("imageDisplay");
        const selectedImage = imageDisplay.textContent.trim();
        //console.log(selectedImage)
        if (selectedOption === "Mixed") {
            updatePanVisibility(selectedImage, "Mixed")
            //setPanDisplayVisibility([false, true]);
        } else if (selectedOption === "Single") {
            updatePanVisibility(selectedImage, "Single")
            //setPanDisplayVisibility([true, false]);
        } else {
            updatePanVisibility(selectedImage, "Dual")
            //setPanDisplayVisibility([true, true]);
        }

        if (selectedOption != "Single") sendMessage([0xF0,0x38,0x00,0xF7])

        if (typeof onTopologyChange === 'function') {
            onTopologyChange(selectedOption);
        }
    }

    typeDisplay.addEventListener("click", (event) => {
        createPopup(topologyOptions, (selectedOption) => {
            handleTopologyChange(selectedOption);
        }, event);
    });

    const leftArrow = document.createElement("span");
    leftArrow.className = "arrow left-arrow";
    leftArrow.textContent = "\u276E";
    leftArrow.style.cursor = "pointer";
    leftArrow.style.margin = "0 10px";
    leftArrow.addEventListener("click", () => {
        window.currentTypeIndex = (window.currentTypeIndex - 1 + 5) % 5;
        const selectedOption = getType(window.currentTypeIndex);
        handleTopologyChange(selectedOption);
    });

    const rightArrow = document.createElement("span");
    rightArrow.className = "arrow right-arrow";
    rightArrow.textContent = "\u276E";
    rightArrow.style.transform = 'rotate(180deg)';
    rightArrow.style.cursor = "pointer";
    rightArrow.style.margin = "0 10px";
    rightArrow.addEventListener("click", () => {
        window.currentTypeIndex = (window.currentTypeIndex + 1) % 5;
        const selectedOption = getType(window.currentTypeIndex);
        handleTopologyChange(selectedOption);
    });

    topologyContainer.appendChild(topologyTitle);
    topologyContainer.appendChild(leftArrow);
    topologyContainer.appendChild(typeDisplay);
    topologyContainer.appendChild(rightArrow);

    sendMessage([0xF0, 0x31, 0x00, 0xF7]);

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
        patchChanged = true;
    }
    window.setDryMode = setMode;

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
            patchChanged = true;
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
        patchChanged = true;
    });

    // Resetar para o centro com double click (somente para Dry Pan)
    slider.addEventListener("dblclick", () => {
        if (nameCell.textContent === "Dry Pan") {
            slider.value = 0;
            valueCell.textContent = "Center";
            valueCell.style.color = green;
            slider.style.background = "white";

            // Recalcula valores para enviar mensagem MIDI
            const sliders = document.querySelectorAll(".slider");
            const sliderValues = Array.from(sliders).map(s => parseInt(s.value));
            sliderValues[1] = sliderValues[1] + 100; // Dry Pan tratado como type 0
            const [lsb, msb] = BinaryOperationSend(sliderValues[1], 4);
            sendMessage([0xf0, 0x34, 0, sliderValues[0], lsb, msb, 0xf7]);
            patchChanged = true;
        }
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
    table1.container.style.width = "300px"; // era 240

    const table2 = createIndividualTable(2, algorithmDSP[1]);
    table2.container.style.width = "300px"; // era 240

    smallTablesContainer.appendChild(table1.container);
    smallTablesContainer.appendChild(table2.container);

    window.dsp1 = table1;
    window.dsp2 = table2;

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
    const algorithmValues = nomeControladora == "timespace" ? [
        "OFF", "Glassy Delay", "Bucket Brigade", "TransistorTape", "Quantum Pitch", "Holo Filter", "RetroVerse", "Memory Man", "Nebula Swell", "WhammyDelay"
    ] : [
        "OFF", "SpaceRoom", "HALL 9000", "Star Plate", "GravitySprings", "SunlightWings", "Dark Galaxy", "Sci-fi Shimmer", "Frosted Verb", "Spatial Vowels", "Stellar Swell"
    ];

    // Lida com o envio das mensagens DSP
    let dspDebounceTimeout;
    function triggerDSPAlert() { //preciso fazer a verificação do disp
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
                //alert(input.value)
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

        if (nomeControladora === "timespace") {
            const time = displayValues[0];
            const currentAlgorithm = algorithmDisplay.textContent;
            //const minTime = timeAlg[currentAlgorithm]?.min || 0;
            //displayValues[0] = displayValues[0] - minTime; aqui pode dar ruim
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
            patchChanged = true;
            
            //alert(algorithmDSP2)
            algorithmDSP2 = [time, ...displayValues.slice(2), ...paramAlternativo];
            //alert (algorithmDSP2);
        } else {
            while (displayValues.length < 12) {
                displayValues.push(0);
            }
            //alert([0xf0, 0x38 + number, indexAlg, ...displayValues, 0xf7])
            sendMessage([0xf0, 0x38 + number, indexAlg, ...displayValues, 0xf7])
        }
    }
    // Seta o debounce para o envio da mensagem
    function scheduleDSPAlert() {
        clearTimeout(dspDebounceTimeout);
        dspDebounceTimeout = setTimeout(triggerDSPAlert, 100);
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
        //alert(algorithmDataSpacewalk[algorithmDisplay.textContent])
        //alert(algorithmDisplay.textContent)
        //let labels = ["Time", "Feedback", "DelayMix", ...algorithmData[algorithmDisplay.textContent] || []];

        const parameters = algorithmDataSpacewalk[algorithmDisplay.textContent] || [];
        let labels;
        if (nomeControladora === "timespace") {
            labels = ["Time", "Feedback", "DelayMix", ...algorithmData[algorithmDisplay.textContent] || []];
        } else if (nomeControladora === "spacewalk") {
            labels = ["Decay", "Pre-Delay", "ReverbMix", "Dampening", "Low Damp", "High Damp", ...parameters || []];
            //alert([...labels]);
        } else {
            labels = [];
        }

        let startValues = algorithmStart[algorithmDisplay.textContent];

        if (document.querySelector(".type-display").textContent == "Single" && number == 2) {
            algorithmDisplay.textContent = "Inactive";
            algorithmDisplay.style.color = "gray";
            algorithmDisplay.style.cursor = "default";
            leftArrow.style.cursor = "default";
            leftArrow.style.color = "gray";
            rightArrow.style.cursor = "default";
            rightArrow.style.color = "gray";
            labels = [];
        } else {
            algorithmDisplay.style.color = "white";
            algorithmDisplay.style.cursor = "pointer";
            leftArrow.style.cursor = "pointer";
            leftArrow.style.color = "white";
            rightArrow.style.cursor = "pointer";
            rightArrow.style.color = "white";
            algorithmDisplay.textContent = algorithmValues[currentAlgorithmIndex];
            if (nomeControladora === "timespace") {
                labels = ["Time", "Feedback", "DelayMix", ...algorithmData[algorithmDisplay.textContent] || []];
            } else if (nomeControladora === "spacewalk") {
                labels = ["Decay", "Pre-Delay", "ReverbMix", "Dampening", "Low Damp", "High Damp", ...parameters || []];
                //alert([...labels]);
            } else {
                labels = [];
            }
            startValues = algorithmStart[algorithmDisplay.textContent];
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
                //alert(extraValue)
            } else {
                if (range?.tipo === "porcentagem") {
                    extraValue = parseInt(displayValue);
                } else if (label === "Time") {
                    extraValue = parseInt(displayValue) - timeAlg[algorithmDisplay.textContent].min;
                    //alert(extraValue)
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
                        //input.value = mm.min + extraValue;
                        input.value = extraValue;
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

                        input.addEventListener("keydown", (event) => {
                            if (event.key === "Enter") {
                                input.blur();
                            }
                        });
                        input.addEventListener("blur", () => {
                            const value = parseInt(input.value);
                            const min = parseInt(input.min);
                            const max = parseInt(input.max);

                            if (isNaN(value) || value < min) input.value = min;
                            else if (value > max) input.value = max;

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
                    patchChanged = true;
                });

                renderTimeCell();
            } else if (label === "Pre-Delay") {
                const mm = parameterRanges[label];

                const container = document.createElement("div");
                container.style.display = "flex";
                container.style.alignItems = "center";
                container.style.justifyContent = "flex-end";
                container.style.gap = "0px";

                const input = document.createElement("input");
                input.type = "number";
                input.min = mm.valor_inicial;
                input.max = mm.valor_final;
                input.value = mm.valor_inicial + (extraValue ?? 0);
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
                suffix.textContent = mm.complemento;
                suffix.style.fontSize = "14px";
                suffix.style.color = blue;
                container.appendChild(input);
                container.appendChild(suffix);

                input.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        input.blur();
                    }
                });

                input.addEventListener("blur", () => {
                    const value = parseInt(input.value);
                    const min = parseInt(input.min);
                    const max = parseInt(input.max);

                    if (isNaN(value) || value < min) input.value = min;
                    else if (value > max) input.value = max;

                    scheduleDSPAlert();
                });

                valueCell.appendChild(container);
            } else if (range?.tipo === "lista") {
                const current = readingValues
                    ? (range.valores[extraValue] ?? "OFF")
                    : (startValues[index] ?? "OFF");
                valueCell.textContent = current === "OFF" ? "OFF" : `${current} ${range.complemento}`;
                valueCell.style.cursor = "pointer";
                valueCell.addEventListener("click", (e) => {
                    const options = range.valores.map(v => v === "OFF" ? "OFF" : `${v} ${range.complemento}`);
                    createPopup(options, async sel => {
                        valueCell.textContent = sel;

                        if (label === "Mod Type" && algorithmDisplay.textContent === "Glassy Delay") {
                            updateModTypeExtraRows(tbody, sel, false);
                            const optionsMT = ["OFF", "Vibrato", "Tremolo", "Chorus", "Phaser", "Flanger"];
                            const cleanSel = sel.replace(range.complemento, "").trim();
                            //alert([0xF0, 0x47, optionsMT.indexOf(cleanSel), number-1, 0xF7]);
                            await delay(waitPresetChange)
                            sendMessage([0xF0, 0x47, optionsMT.indexOf(cleanSel), number-1, 0xF7]);
                            await delay(waitPresetChange)
                            //alert([0xF0,0x36+number,0x00,0xF7]);
                            sendMessage([0xF0,0x36+number,0x00,0xF7]);
                            patchChanged = true;
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
                        //alert(toggleButton.dataset.pressed);
                        if(isPressed) sendMessage([0xF0,0x48,0,number-1,0xF7]);
                        else sendMessage([0xF0,0x48,1,number-1,0xF7]);
                        sendMessage([0xF0,0x36+number,0x00,0xF7]);
                        patchChanged = true;
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

                input.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        input.blur();
                    }
                });
                input.addEventListener("blur", () => {
                    scheduleDSPAlert();
                });

                extraValueCell.appendChild(input);
            }

            // Cores
            if ((modTypeIndex + 1) % 3 === 0) {
                if ((modTypeIndex) < modTypeData[modType].length+6) {
                    extraNameCell.style.borderBottom = "1px solid rgba(211, 169, 169, 0.3)";
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
            sendMessage([0xF0,0x44,currentAlgorithmIndex,number-1,0xF7]);
            sendMessage([0xF0,0x36 + number,0x00,0xF7]);
            patchChanged = true;
            //scheduleDSPAlert();
        }, event);

    });

    leftArrow.addEventListener("click", function () {
        if (document.querySelector(".type-display").textContent == "Single" && number == 2) return;
        currentAlgorithmIndex = (currentAlgorithmIndex - 1 + algorithmValues.length) % algorithmValues.length;
        updateAlgorithmDisplay(false);
        //scheduleDSPAlert();
        /**///alert(currentAlgorithmIndex)
        sendMessage([0xF0,0x44,currentAlgorithmIndex,number-1,0xF7]);
        //alert([0xF0,0x44,currentAlgorithmIndex,number-1,0xF7])
        //alert([0xF0,0x44,currentAlgorithmIndex,number-1,0xF7])
        sendMessage([0xF0,0x36 + number,0x00,0xF7]);
        //alert([0xF0,0x36 + number,0x00,0xF7])
        patchChanged = true;
    });

    rightArrow.addEventListener("click", function () {
        if (document.querySelector(".type-display").textContent == "Single" && number == 2) return;
        currentAlgorithmIndex = (currentAlgorithmIndex + 1) % algorithmValues.length;
        updateAlgorithmDisplay(false);
        //scheduleDSPAlert();
        /**/sendMessage([0xF0,0x44,currentAlgorithmIndex,number-1,0xF7]);
        //alert([0xF0,0x44,currentAlgorithmIndex,number-1,0xF7])
        sendMessage([0xF0,0x36 + number,0x00,0xF7]);
        patchChanged = true;
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
    dspLabel.style.color = number === 1 ? orange : saveBlue;
    dspLabel.style.textAlign = "right";
    dspLabel.style.fontSize = "16px";

    // Adiciona a tabela e a label no wrapper
    wrapper.appendChild(table);
    wrapper.appendChild(dspLabel);

    return {
        container: wrapper,
        updateModTypeExtraRows: updateModTypeExtraRows
    };
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
        case 8: algorithmDisplay.textContent = 'Nebula Swell'; break;
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
        "Trails",
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

        } else if (["Trails", "Midi Clock", "Auto Save", "Spill Over"].includes(setting)) {
            button.style.color = 'red';
            button.addEventListener("click", () => {
                button.textContent = button.textContent === "Off" ? "On" : "Off";
                if (button.textContent === "Off") button.style.color = 'red';
                else button.style.color = green;
                sendPresetConfigValues();
            });

        } /*else if (setting === "Spill Over") {
            button.textContent = "Inactive";
            row.style.paddingBottom = "3px";
            row.style.borderBottom = 'solid rgba(216, 216, 216, 0.2) 1px'; // Separador do preset config, tirar? 

        }*/ else if (setting === "Preset BPM") {
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
    patchChanged = true;
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
            /*case 'Spill Over':
                button.textContent = 'Inactive';
                break;*/
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
            const topology = document.querySelector(".type-display")?.textContent || "";
            if (topology == "Single")
                setPanDisplayVisibility([true, false]);
            else if (topology == "Mixed")
                setPanDisplayVisibility([false, true]);
            else setPanDisplayVisibility([true, true]);
        } //aqui
        //collectAndAlertImageValues()
        sendMessage([0xF0,0x45,currentImageIndex,0xF7]);
        patchChanged = true;
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
            if (imageInicialized > 0) {
                imageInicialized--;
                return;
            }
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

        displayValue.style.cursor = "default";
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
        patchChanged = true;
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
        return;
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

    await delay(100);

    const leftRows = imageTableLeft.querySelectorAll("tr");
    for (let i = 1; i < Math.min(3, leftRows.length); i++) {
        const slider = leftRows[i].querySelector("input[type=range]");
        const span = leftRows[i].querySelector("span");

        if (slider && span) {
            const wasInactive = span.textContent === "Inactive";

            slider.value = values[1 + i];

            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            const percentage = ((slider.value - min) / (max - min)) * 100;
            slider.style.background = `linear-gradient(to right, ${blue} ${percentage}%, white ${percentage}%)`;

            const complemento = span.textContent.replace(/[0-9\-]+/, "").trim();
            span.textContent = `${slider.value}${complemento}`;

            if (wasInactive) {
                span.textContent = "Inactive";
                span.style.color = "gray";
            }
        }
    }

    const rightRows = imageTableRight.querySelectorAll("tr");

    const selectedImage = imageOptions[values[1]];
    const isPanInactive = selectedImage === "Ping-Pong" || selectedImage === "Transverse";

    if (!isPanInactive) {
        if (rightRows[0]) {
            const slider = rightRows[0].querySelector("input[type='range']");
            const span = rightRows[0].querySelector("span:last-child");

            if (slider && span) {
                const wasInactive = span.textContent === "Inactive";

                const newValue = binaryOperation(values[5], values[6], 4) - 100;
                slider.value = newValue;
                slider.dispatchEvent(new Event('input'));

                if (wasInactive) {
                    span.textContent = "Inactive";
                    span.style.color = "gray";
                }
            }
        }

        if (rightRows[1]) {
            const slider = rightRows[1].querySelector("input[type='range']");
            const span = rightRows[1].querySelector("span:last-child");

            if (slider && span) {
                const wasInactive = span.textContent === "Inactive";

                const newValue = binaryOperation(values[7], values[8], 4) - 100;
                slider.value = newValue;
                slider.dispatchEvent(new Event('input'));

                if (wasInactive) {
                    span.textContent = "Inactive";
                    span.style.color = "gray";
                }
            }
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
            slider.setAttribute('data-inactive', 'true');
            slider.style.filter = "grayscale(100%)"; // aplica o filtro cinza
            slider.style.pointerEvents = "none"; // impede interação com o slider
            displaySpan.textContent = "Inactive";
            displaySpan.style.color = "gray";
        } else {
            slider.removeAttribute('data-inactive');
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
                extractCommandCenterData(table);
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

        nameInput.addEventListener("focus", function () {
            this.select();
        });

        nameInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                this.blur();
            }
        });

        nameInput.addEventListener("blur", function () {
            extractCommandCenterData(table);
        });

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
            createColorPopup(colorOptions, (selected) => {
                colorButton.textContent = selected;
                const rgb = colorMap[selected];
                colorButton.style.color = rgb;
                extractCommandCenterData(table);
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
        fswLabel.style.color = page == 1? orange: saveBlue;
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
            extractCommandCenterData(table);
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
            extractCommandCenterData(table);
        }, event);
    });

    targetButtonCell.appendChild(targetButton);
    targetRow.appendChild(targetLabel);
    targetRow.appendChild(targetButtonCell);

    tbody.appendChild(holdRow);
    tbody.appendChild(targetRow);
}

function addActionOptions(table, tbody) {
    let actionOptions = ["OFF", "Fdback", "DlyMix", "DryLvl", "AlterI", "AlterII"];
    if (nomeControladora == "spacewalk") actionOptions = ["OFF", "Decay", "RvbMix", "DryLvl", "Dmpng"];

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

        let debounceTimeout;
        function debouncedExtract() {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                extractCommandCenterData(table);
            }, 100);
        }

        slider.addEventListener("input", () => {
            updateSliderBackground();
            debouncedExtract();
        });

        slider.addEventListener("wheel", (event) => {
            event.preventDefault();
            const step = 1;
            const current = parseInt(slider.value);
            const direction = event.deltaY < 0 ? 1 : -1;
            const newValue = Math.min(parseInt(slider.max), Math.max(parseInt(slider.min), current + direction * step));
            slider.value = newValue;
            updateSliderBackground();
            debouncedExtract();
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

                if (selected === "DlyMix" || selected === "RvbMix") {
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
                extractCommandCenterData(table);
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

            let actionOptions = ["OFF", "Fdback", "DlyMix", "DryLvl", "AlterI", "AlterII"];
            if (nomeControladora == "spacewalk") actionOptions = ["OFF", "Decay", "RvbMix", "DryLvl", "Dmpng"];
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
                    if (paramName === "DlyMix" || paramName === "RvbMix") firstSlider.max = 120;
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
                    if (paramName2 === "DlyMix" || paramName2 === "RvbMix") secondSlider.max = 120;
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
    let actionParameterOptions = ["OFF", "Fdback", "DlyMix", "DryLvl", "AlterI", "AlterII"];
    if (nomeControladora == "spacewalk") actionParameterOptions = ["OFF", "Decay", "RvbMix", "DryLvl", "Dmpng"];
    const dspTargetOptions = ["DSP1", "DSP2", "D1+D2"];
    const dryTargetOptions = ["DryL+R", "DryL", "DryR"];

    function getIndexFromOptions(text, options) {
        const normalized = text.trim().replace(/\s+/g, " ");
        return options.indexOf(normalized) !== -1 ? options.indexOf(normalized) : 0;
    }

    function charToPresetValue(c) {
        if (!c || c === '\0') return 0;
        else if (c === ' ') return 0; // case 0

        const code = c.charCodeAt(0);

        // A-Z
        if (code >= 65 && code <= 90) {
            return code - 65 + 1; // 1...26
        }
        // a-z
        else if (code >= 97 && code <= 122) {
            return code - 97 + 27; // 27...52
        }
        // 0-9
        else if (code >= 48 && code <= 57) {
            return code - 48 + 53; // 53...62
        }
        // ! " # $ % & '
        else if (code >= 33 && code <= 39) {
            return code - 33 + 63; // 63...69
        }
        // * +
        else if (code >= 42 && code <= 43) {
            return code - 42 + 70; // 70...71
        }
        // -
        else if (code === 45) return 72;
        // _
        else if (code === 95) return 73;
        // ? @
        else if (code >= 63 && code <= 64) {
            return code - 63 + 74; // 74...75
        }
        else return 0;
    }

    function getAsciiFromInput(input) {
        const text = input?.value || "";
        const padded = text.padEnd(4, '\0').slice(0, 4);
        return Array.from(padded).map(charToPresetValue);
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
    //alert([0xF0,0x3f+parseInt(tableElement.id.split("-").pop(), 10), ...result,0xF7]);
    sendMessage([0xF0,0x3f+parseInt(tableElement.id.split("-").pop(), 10), ...result,0xF7]);
    patchChanged = true;
    return result;
}

function createCommandCenterPage3() {
    const wrapper = document.createElement("div");
    wrapper.className = "command-center-wrapper page3";
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
    cell1Left.style.paddingTop = "10px";

    const buttonExpr = document.createElement("button");
    buttonExpr.classList.add("expression-control-button");
    buttonExpr.textContent = "OFF";
    buttonExpr.style.color = red;
    cell1Left.appendChild(buttonExpr);

    row1Left.appendChild(cell1Left);

    let exprOptions = ["OFF", "Feedback", "DelayMix", "DryLevel", "AlterI", "AlterII"];
    if (nomeControladora == "spacewalk") exprOptions = ["OFF", "Decay", "ReverbMix", "DryLevel", "Dampening"];

    // Linha From
    const rowFrom = document.createElement("tr");
    const cellFromLabel = document.createElement("td");
    cellFromLabel.textContent = "From:";

    const cellFromSlider = document.createElement("td");
    const sliderFrom = document.createElement("input");
    sliderFrom.className = "slider";
    sliderFrom.type = "range";
    sliderFrom.min = 0;
    sliderFrom.max = 100;
    sliderFrom.value = 0;
    sliderFrom.style.width = "170px";

    const fromValue = document.createElement("span");
    fromValue.className = "value-display";
    fromValue.style.color = green;
    fromValue.textContent = `${sliderFrom.value}%`;
    fromValue.style.marginLeft = "8px";
    fromValue.style.textAlign = "right";
    fromValue.style.marginRight = "20px";

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
    sliderTo.className = "slider";
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
    toValue.style.textAlign = "right";
    toValue.style.marginRight = "20px";

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
    buttonDSP.style.color = orange;
    buttonDSP.style.marginLeft = "10px";
    cellTargetButton.appendChild(buttonDSP);
    rowTarget.appendChild(cellTargetLabel);
    rowTarget.appendChild(cellTargetButton);

    buttonDSP.addEventListener("click", (ev) => {
        const options = buttonExpr.textContent == "DryLevel"? ["DryL+R", "DryL", "DryR"]: ["DSP1", "DSP2", "D1+D2"];
        createPopup(options, (sel) => {
            buttonDSP.textContent = sel;
            if (sel === "DSP1") {
                buttonDSP.style.color = orange;
            } else if (sel === "DSP2") {
                buttonDSP.style.color = blue;
            } else if (sel === "D1+D2") {
                buttonDSP.innerHTML = `<span style="color:${orange};">D1</span><span style="color:white;">+</span><span style="color:${blue};">D2</span>`;
            } else buttonDSP.style.color = colorMap["Pink"];;
            extractCommandCenterDataPage3()
        }, ev);
    });

    let debounceTimeout;
    function debouncedExtract() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            extractCommandCenterDataPage3();
        }, 100);
    }

    function addSliderEvents(slider, valueDisplay) {
        slider.addEventListener("input", () => {
            valueDisplay.textContent = `${slider.value}%`;
            const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
            slider.style.background = `linear-gradient(to right, ${blue} ${percentage}%, white ${percentage}%)`;
            debouncedExtract();
        });

        slider.addEventListener("wheel", (event) => {
            event.preventDefault();
            const step = 1;
            const current = parseInt(slider.value);
            const direction = event.deltaY < 0 ? 1 : -1;
            const newValue = Math.min(parseInt(slider.max), Math.max(parseInt(slider.min), current + direction * step));
            slider.value = newValue;
            valueDisplay.textContent = `${slider.value}%`;
            const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
            slider.style.background = `linear-gradient(to right, ${blue} ${percentage}%, white ${percentage}%)`;
            debouncedExtract();
        });

        const initialPercentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.background = `linear-gradient(to right, ${blue} ${initialPercentage}%, white ${initialPercentage}%)`;
    }

    addSliderEvents(sliderFrom, fromValue);
    addSliderEvents(sliderTo, toValue);

    function updateSliderRange() {
        const isDelayMix = (buttonExpr.textContent === "DelayMix" || buttonExpr.textContent === "ReverbMix");
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

    let previousExpr = buttonExpr.textContent;

    buttonExpr.addEventListener("click", (ev) => {
        previousExpr = buttonExpr.textContent;
        createPopup(exprOptions, (sel) => {
            buttonExpr.textContent = sel;
            buttonExpr.style.color = sel === "OFF" ? red : green;
            updateSliderRange();

            const wasDry = previousExpr === "DryLevel";
            const isDry = sel === "DryLevel";

            if (wasDry !== isDry) {
                const dspOptions = isDry ? ["DryL+R", "DryL", "DryR"] : ["DSP1", "DSP2", "D1+D2"];
                //alert (dspOptions);
                buttonDSP.textContent = dspOptions[0];
                buttonDSP.style.color = isDry ? colorMap["Pink"] : orange;
            }

            previousExpr = sel;

            extractCommandCenterDataPage3();
        }, ev);
    });

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

        if (i === 1) {
            td.style.paddingBottom = "60px";
        }

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
                extractCommandCenterDataPage3();
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
                extractCommandCenterDataPage3();
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
    tableLeft.style.height = "120px";
    tableRight.style.height = "50px";

    wrapper.appendChild(tableLeft);
    wrapper.appendChild(tableRight);

    return wrapper;
}

function updateCommandCenterPage3(array) {
    let exprOptions = ["OFF", "Feedback", "DelayMix", "DryLevel", "AlterI", "AlterII"];
    if (nomeControladora == "spacewalk") exprOptions = ["OFF", "Decay", "ReverbMix", "DryLevel", "Dampening"];
    let targetOptions = ["DSP1", "DSP2", "D1+D2"];

    const [
        exprIndex, expFrom, expTo, expTargetIndex,
        pc1lsb, pc1msb, channel1,
        pc2lsb, pc2msb, channel2
    ] = array;

    if(exprIndex == 3) targetOptions = ["DryL+R", "DryL", "DryR"];

    const wrapper = document.querySelector(".page3");
    if (!wrapper) return;

    const [tableLeft, tableRight] = wrapper.children;
    if (!tableLeft || !tableRight) return;

    // Tabela da esquerda
    const buttonExpr = tableLeft.querySelector(".expression-control-button");
    if (buttonExpr) {
        const selectedExpr = exprOptions[exprIndex] ?? "OFF";
        buttonExpr.textContent = selectedExpr;
        buttonExpr.style.color = selectedExpr === "OFF" ? red : green;
    }

    const sliders = tableLeft.querySelectorAll("input[type=range]");
    const fromSlider = sliders[0];
    const toSlider = sliders[1];

    if (fromSlider) {
        fromSlider.max = (buttonExpr?.textContent === "DelayMix" || buttonExpr?.textContent === "ReverbMix") ? 120 : 100;
        fromSlider.value = expFrom;
        const fromDisplay = fromSlider.parentElement.querySelector(".value-display");
        if (fromDisplay) fromDisplay.textContent = `${expFrom}%`;
        const per1 = ((expFrom - fromSlider.min) / (fromSlider.max - fromSlider.min)) * 100;
        fromSlider.style.background = `linear-gradient(to right, ${blue} ${per1}%, white ${per1}%)`;
    }

    if (toSlider) {
        toSlider.max = (buttonExpr?.textContent === "DelayMix" || buttonExpr?.textContent === "ReverbMix") ? 120 : 100;
        toSlider.value = expTo;
        const toDisplay = toSlider.parentElement.querySelector(".value-display");
        if (toDisplay) toDisplay.textContent = `${expTo}%`;
        const per2 = ((expTo - toSlider.min) / (toSlider.max - toSlider.min)) * 100;
        toSlider.style.background = `linear-gradient(to right, ${blue} ${per2}%, white ${per2}%)`;
    }

    const targetButton = tableLeft.querySelector("tr:last-child button");
    if (targetButton) {
        const selectedTarget = targetOptions[expTargetIndex] ?? "DSP1";
        if (selectedTarget === "D1+D2") {
            targetButton.innerHTML = `<span style="color:${orange};">D1</span><span style="color:white;">+</span><span style="color:${blue};">D2</span>`;
        } else {
            targetButton.textContent = selectedTarget;
            targetButton.style.color = selectedTarget === "DSP1" ? orange : blue;
        }
        if(exprIndex == 3) targetButton.style.color = colorMap["Pink"];
    }

    // Tabela da direita
    const binaryOperation = (lsb, msb, offset) => (msb << offset) + lsb;

    const rows = tableRight.querySelectorAll("tr");
    if (rows.length < 2) return;

    const rightData = [
        { lsb: pc1lsb, msb: pc1msb, channel: channel1 },
        { lsb: pc2lsb, msb: pc2msb, channel: channel2 }
    ];

    rightData.forEach((data, i) => {
        const row = rows[i];
        if (!row) return;

        const container = row.querySelector("td > div");
        if (!container) return;

        const buttons = container.querySelectorAll("button");
        const btnPC = buttons[0];
        const btnCh = buttons[1];

        if (btnPC) {
            const pcValue = binaryOperation(data.lsb, data.msb, 4);
            btnPC.textContent = pcValue == 0? "OFF": pcValue-1;
            btnPC.style.color = pcValue === 0 ? red : green;
        }

        if (btnCh) {
            const chValue = data.channel === 16 ? "All" : `${data.channel + 1}`;
            btnCh.textContent = chValue;
            btnCh.style.color = data.channel === 16 ? blue : green;
        }
    });
}

function extractCommandCenterDataPage3() {
    let exprOptions = ["OFF", "Feedback", "DelayMix", "DryLevel", "AlterI", "AlterII"];
    if (nomeControladora == "spacewalk") exprOptions = ["OFF", "Decay", "ReverbMix", "DryLevel", "Dampening"];
    //const targetOptions = ["DSP1", "DSP2", "D1+D2"];

    const wrapper = document.querySelector(".command-center-wrapper.page3");
    if (!wrapper) {
        //alert("Wrapper não encontrado!");
        return;
    }

    const tableLeft = wrapper.querySelector(".command-center-table-3");
    const tableRight = wrapper.querySelector(".right-command-table");

    const buttonExpr = tableLeft.querySelector(".expression-control-button");
    const exprText = buttonExpr.textContent;
    const exprIndex = exprOptions.indexOf(exprText);

    const targetOptions = buttonExpr.textContent == "DryLevel"? ["DryL+R", "DryL", "DryR"]: ["DSP1", "DSP2", "D1+D2"];

    const sliders = tableLeft.querySelectorAll("input[type=range]");
    const sliderFrom = sliders[0];
    const sliderTo = sliders[1];

    const expFrom = parseInt(sliderFrom.value);
    const expTo = parseInt(sliderTo.value);

    const buttonTarget = tableLeft.querySelector("tr:last-child button");
    let expTargetIndex = targetOptions.indexOf(buttonTarget.textContent);

    function BinaryOperationSend(result, deslocamento) {
        const lsb = result & ((1 << deslocamento) - 1); 
        const msb = result >> deslocamento;            
        return [lsb, msb];
    }

    const binaryOffset = 4;

    const rowsRight = tableRight.querySelectorAll("tr");

    const dataRight = Array.from(rowsRight).map(row => {
        const container = row.querySelector("td > div");
        const buttons = container.querySelectorAll("button");
        const buttonPC = buttons[0];
        const buttonCh = buttons[1];

        const pcValue = buttonPC.textContent === "OFF" ? 0 : parseInt(buttonPC.textContent)+1;
        const [lsb, msb] = BinaryOperationSend(pcValue, binaryOffset);

        const chText = buttonCh.textContent;
        const channel = chText === "All" ? 16 : parseInt(chText)-1;

        return { lsb, msb, channel };
    });

    const resultArray = [
        exprIndex, 
        expFrom, 
        expTo, 
        expTargetIndex, 
        dataRight[0].lsb, 
        dataRight[0].msb, 
        dataRight[0].channel, 
        dataRight[1].lsb, 
        dataRight[1].msb, 
        dataRight[1].channel
    ];

    //alert([0xF0,0x42,resultArray,0xF7]);
    sendMessage([0xF0,0x42,...resultArray,0xF7]);
    patchChanged = true;
}

function createSystemButtons() {

    if (document.getElementById("system-button-container")) {
        return document.getElementById("system-button-container");
    }

    const buttonContainer = document.createElement("div");
    buttonContainer.id = "system-button-container";
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "center";
    buttonContainer.style.gap = "25px";
    buttonContainer.style.marginTop = "25px";
    buttonContainer.style.marginLeft = "0px";

    // Botão Save
    const saveButton = document.createElement("button");
    saveButton.className = "system-button";
    saveButton.textContent = "Save";
    saveButton.style.width = "100px";
    saveButton.addEventListener("click", async () => {
        await delay(waitPresetChange)
        sendMessage([0xF0,0x12,0x00,0xF7]);
        await delay(waitPresetChange)
        const presetNameInput = activePreset.querySelector(".preset-name");
        window.originalPresetName = presetNameInput.value;
        notify("Changes saved", 'success');
        patchChanged = false;
    });


    // Botão Cancel
    const cancelButton = document.createElement("button");
    cancelButton.className = "system-button";
    cancelButton.id = "cancel-button";
    cancelButton.textContent = "Cancel";
    cancelButton.style.width = "100px";
    cancelButton.addEventListener("click", () => {
        sendMessage([0xF0,0x13,0x00,0xF7]);
        const isSimulated = cancelButton.getAttribute("data-simulated-click") === "true";
        if (!isSimulated) {
            notify("Your changes have been canceled");
        }

        // Atualiza o nome do preset caso cancele as mudanças
        if (activePreset && window.originalPresetName !== undefined) {
            const input = activePreset.querySelector(".preset-name");
            //alert(originalPresetName);
            input.value = window.originalPresetName;
            input.dispatchEvent(new Event("input"));
        }

        reloadActivePreset();
        patchChanged = false;
    });

    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(cancelButton);

    return buttonContainer;
}

function createPopup(options, callback, event) {
    options = options
        .map(opt => String(opt).trim())  // força string
        .filter(opt => opt !== "");

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

function createColorPopup(options, callback, event) {
    const popup = document.createElement("div");
    popup.className = "popup-container";

    // Posicionar o popup no cursor
    const x = event.clientX;
    let y = event.clientY;

    // Limitar à janela
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

        // Aplica a cor do texto conforme o colorMap
        if (colorMap[option]) {
            button.style.color = colorMap[option];
        }

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
        if (document.body.contains(popup)) {
            document.body.removeChild(popup);
        }
        document.removeEventListener("click", outsideClickListener);
    }

    function outsideClickListener(e) {
        if (!popup.contains(e.target)) {
            closePopup();
        }
    }

    // Adiciona um evento de clique ao documento depois da criação
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

function pedalSavePreset() {
    sendMessage([0xF0,0x4A, parseInt(activePreset.querySelector(".preset-number").textContent),0xF7])
}

createPresets();
