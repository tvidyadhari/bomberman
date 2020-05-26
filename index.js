const cells = document.querySelectorAll(".cell");
const ROWS = 9;
const score = document.querySelector(".score");
const reset = document.querySelector(".replay");
const result = document.querySelector(".result");
const grid = document.querySelector(".game-grid");
let curBombInd = 0;
let bombsIndices = [];

let init = () => {
    bombsIndices = [];
    curBombInd = 0;
    placeBombs();
    addEventListener();
}

let addEventListener = () => {
    cells.forEach((cell) => {
        cell.addEventListener("click", cellClicked, {once: true});
    })
}
let removeEventListener = () => {
    cells.forEach((cell) => {
        cell.removeEventListener("click", cellClicked, {once: true});
    })
}

// generate N random values for bombs
let generateNRandomValues = (n)=>{
    let max = n*n;
    let set = new Set();
    for(let i = 0; i < n; i++) {
        let randomIndex = Math.floor(Math.random()*max);
        while(set.has(randomIndex)){
            console.log(randomIndex);
            randomIndex = Math.floor(Math.random()*max);
        }
        set.add(randomIndex);
        bombsIndices.push(randomIndex);
    }
    console.log(bombsIndices);
    return bombsIndices;
}

// place bombs 
let placeBombs = ()=> {
    bombsIndices = generateNRandomValues(ROWS);
    bombsIndices.forEach((bombIndex) => {
        cells[bombIndex].classList.add("bomb");
    });
}

// ref: https://stackoverflow.com/questions/3583724/how-do-i-add-a-delay-in-a-javascript-loop
// blast all bombs with delay
let blastAllBombs = (target)=> {
    target.classList.add("blast");
     if(curBombInd < ROWS - 1){
        setTimeout(()=>{
            blastAllBombs(cells[bombsIndices[curBombInd]]);
            curBombInd += 1;
        }, 100);
    }
}

// when a cell is clicked
let cellClicked = (event) => {
    // lose
    if(event.target.classList.contains("bomb")) {
        removeEventListener();
        blastAllBombs(event.target);
        result.classList.add("lose");
        result.innerHTML = "YOU LOSE:/"
        grid.classList.add("disable");

    }
    else {
        // open the cell
        event.target.classList.add("safe");
        let scoreVal = +score.innerHTML;
        score.innerHTML = scoreVal + 1;
        // win
        if(scoreVal+1 == 72) {
            removeEventListener();
            result.classList.add("win");
            result.innerHTML = "YOU WIN!!!";
            grid.classList.add("disable");
        }

    }
}

// reset
reset.addEventListener("click", ()=> {
    // remove all added classes
    cells.forEach((cell) => {
        cell.classList.remove("safe");
        cell.classList.remove("blast");
        cell.classList.remove("bomb");
    })
    // make score 0
    score.innerHTML = 0;
    // remove result
    result.innerHTML = "";
    result.classList.remove("win");
    result.classList.remove("lose");
    grid.classList.remove("disable");

    init();
})

// start the game
init();
