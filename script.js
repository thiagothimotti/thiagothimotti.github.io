const SATURNO_VID = 5824;

const SUPERNOVA_PID = 1234;
const TITAN_PID = 1508;

let selectedDevice = null;

function getUsbDevice() {
    if ('usb' in navigator) {
        navigator.usb.requestDevice({ filters: [{vendorId: 5824}] })
            .then(device => {
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
        window.location.href = 'templates/supernova.html';
    } else if (selectedDevice === 'titan') {
        window.location.href = 'templates/titan.html';
    }
}