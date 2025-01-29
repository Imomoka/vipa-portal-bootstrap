//declare values for sign-in page
window.addEventListener("DOMContentLoaded", ()=>{
    updateCountdown();
});



const initialtime = 60000;


function getEndTime() {
    let endTime = localStorage.getItem(STORAGE_KEY);
    if (!endTime) {
        endTime = Date.now() + TOTAL_TIME; // Set future timestamp
        localStorage.setItem(STORAGE_KEY, endTime);
    }
    return parseInt(endTime);
}

function updateCountdown() {
    const endTime = getEndTime();
    let timeLeft = endTime - Date.now(); // Calculate remaining time

    if (timeLeft <= 0) {
        document.getElementById("countdown").innerHTML = "Time's up!";
        localStorage.removeItem(STORAGE_KEY); // Clear storage
        return;
    }

    let days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    let hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    document.getElementById("timerReflector").innerHTML = 
        `${days}d ${hours}h ${minutes}m ${seconds}s`;

}

setInterval(updateCountdown, 1000); // Update every second
 // Initial call
