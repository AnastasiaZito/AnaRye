let timeLeft = 60; //60 seconds, or 1 minute
let timerInterval = null;
let isPaused = false;
//get DOM elements
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');

//function to update timer display
function updateDisplay(){
    const minutes = Math.floor(timeLeft/60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerDisplay.textContent = formattedTime;

    //check if timer is below 15 seconds to change text colour
    if(timeLeft <= 15 && timeLeft > 0){
        timerDisplay.classList.add('low-time');
    } else{
        timerDisplay.classList.remove('low-time');
    }
}
//function to start timer
function startTimer(){
    if(timerInterval !== null){
        //clear existing interval first
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerInterval = setInterval(() => {
        if (timeLeft >0 && !isPaused){
            timeLeft--;
            updateDisplay();
            //check if timer reached 0

            if(timeLeft === 0){
                    clearInterval(timerInterval);
                    timerInterval = null;
                    alert("Time's up! Take a short break!"); 
    
             //reset button states
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                stopBtn.disabled = true;
               pauseBtn.textContent = "Pause";
                isPaused = false;
                }
            }
        }, 1000);
    }

//start button click handler
startBtn.addEventListener('click', () => {
    if (timeLeft > 0){
        //if timer is running already, do nothing
        if(timerInterval !== null){
            return;
        }
        //if timer was paused, resume from current time
        if (isPaused){
            isPaused = false;
            pauseBtn.textContent = "Pause";
        }
        startTimer();
       
        //update button states
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
    }
});
//pause button click handler
pauseBtn.addEventListener('click', () => {
    if(timerInterval !== null && timeLeft > 0 && timeLeft <60){
        if(!isPaused){
            //pause timer
            isPaused = true;
            pauseBtn.textContent = "Resume";
        } else {
            // resume timer
            isPaused = false;
            pauseBtn.textContent = "Pause";
        }
    }
});
//stop button click handler
stopBtn.addEventListener('click', () => {
    //stop and reset timer
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    //reset timer to 1 minute
    timeLeft = 60;
    isPaused = false;
    pauseBtn.textContent = "Pause";
    updateDisplay();
    //reset button states to initial
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    //remove low-time class if it was applied
    timerDisplay.classList.remove('low-time');
});
//initialise display
updateDisplay();