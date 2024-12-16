const blinkEvent = document.getElementById('blink');
    blinkEvent.style.transition = 'opacity 0.5s ease';
    setInterval(() => {
        blinkEvent.style.opacity = '0';
        setTimeout(() => {
            blinkEvent.style.opacity = '1';
        }, 500);
    }, 2000);