const headerTemplate = `
<style>
    .header {
        background-color: white;
        height: 3rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 1rem;
    }

    .header .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .header .logo {
        font-weight: bold;
        font-size: 1.5rem;
    }

    .header .title {
        font-size: 1.2rem;
    }

    .header #timer {
        font-size: 1.2rem;
    }
</style>

<div class="header">
    <div class="header-left">
        <div class="logo">ACME</div>
        <div class="title">Online Technical Assessment</div>
    </div>
    <div id="timer"></div>
</div>
`;

document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('afterbegin', headerTemplate);
    
    // could query another API to grab test start timestamp and then do the calculations
    let timeLeft = 3 * 60 * 60;
    function updateTimer() {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        document.getElementById('timer').textContent = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (timeLeft > 0) {
            timeLeft--;
        }
    }
    updateTimer();
    setInterval(updateTimer, 1000);
});

// arbitrary javascript code to be ran in browser
document.addEventListener('keydown', (event) => {
    console.log(`Key pressedddd: ${event.key}`);
});

