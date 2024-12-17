/* VIDs e PIDs apenas ilustrativos */
const SATURNO_VID = 1241;
const VID2 = 9610;

const SUPERNOVA_PID = 22;
const TITAN_PID = 64560;

let selectedDevice = null;

function getUsbDevice() {
    if ('usb' in navigator) {
        navigator.usb.requestDevice({ filters: [] })
            .then(device => {
                if (device.vendorId === SATURNO_VID || device.vendorId === VID2) {
                    const usbDeviceDiv = document.getElementById('device');
                    const usbDevice = document.getElementById('usbDevice');
                    const selectButton = document.getElementById('select');

                    if (device.productId === SUPERNOVA_PID) {
                        usbDevice.textContent = 'Controladora Supernova';
                        selectedDevice = 'supernova';
                    } else if (device.productId === TITAN_PID) {
                        usbDevice.textContent = 'Controladora Titan';
                        selectedDevice = 'titan';
                    } else {
                        alert('Dispositivo Saturno não cadastrado no editor.');
                        return;
                    }
                    selectButton.textContent = "Selecionar outro controlador";
                    usbDeviceDiv.style.display = 'block';
                } else {
                    alert('Dispositivo selecionado não é um controlador Saturno.');
                }
            })
            .catch(error => {
                if (error.name === 'NotFoundError' && error.message.includes('No device selected')) {
                    alert('Selecione seu controlador Saturno para continuar.');
                } else {
                    alert('Erro ao acessar dispositivos USB: ' + error);
                }
            });
    } else {
        alert('Navegador não suportado, por favor utilize navegadores como Chrome ou Edge.');
    }
}

function confirmSelection() {
    if (selectedDevice === 'supernova') {
        window.location.href = 'templates/supernova.html'; // Redireciona para supernova.html
    } else if (selectedDevice === 'titan') {
        window.location.href = 'templates/titan.html'; // Redireciona para titan.html
    }
}