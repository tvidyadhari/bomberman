const BOMBS = 10;
const GRID_LEN = 9;
let cellsOpened = 0;
let grid = new Array(GRID_LEN);
let bombsIndices = new Set();
let cells = document.querySelectorAll(".cell");
const score = document.querySelector(".score");
const flagCount = document.querySelector(".flag-count");
const game = document.querySelector(".game-grid");
const reset = document.querySelector(".replay");
const result = document.querySelector(".result");
let safeColorMap = {0:"zero", 1:"one", 2:"two", 3: "three", 4:"four", 5:"five", 6:"six", 7:"seven", 8:"eight"}

function Cell(r, c, id) {
    this.id = +id
    this.row = +r;
    this.col = +c;
    this.isBomb = false;
    this.hasFlag = false;
    this.bombCount = 0;
    this.opened = false;
}

let startGame = () => {
    // reset all to default
    cellsOpened = 0;
    bombsIndices = new Set();
    score.innerHTML = 0;
    flagCount.innerHTML = 10;
    result.setAttribute("class", "result");
    result.innerHTML = "";
    game.classList.remove("disable");

    //2d array for grid representation
    grid = new Array(GRID_LEN);
    for(let i = 0; i < GRID_LEN; i++)
        grid[i] = new Array(GRID_LEN);
    // generate bomb indices
    bombsIndices = generateNRandomValues(BOMBS);
    cells.forEach(cell => {
        // remove any additional classes/values
        cell.setAttribute("class", "cell");
        cell.innerHTML = "";
        // add left click event(click)
        cell.addEventListener("click", cellClick, {once: true});
        // add right click event(contextmenu)
        cell.addEventListener("contextmenu", toggleFlag);
        // placing cell in grid
        let r = getRow(cell.id);
        let c = getCol(cell.id);
        grid[r][c] = new Cell(r, c, +cell.id-1);
        // placing bomb
        if(bombsIndices.has(+cell.id - 1))
            grid[r][c].isBomb = true;
    });

    // update cell's adjacent bomb count 
    for(let i = 0; i < GRID_LEN; i++)
        for(let j = 0; j < GRID_LEN; j++)
            grid[i][j].count = countAdjacentBombs(grid[i][j]);

    // for(let i = 0; i < GRID_LEN; i++) {
    //     for(let j = 0; j < GRID_LEN; j++) {
    //         if(grid[i][j].isBomb)
    //             cells[grid[i][j].id].classList.add("red");
    //     }
    // }
}

// checks if a (r, c) is valid position in the grid
let validPos = (r, c) => {
    return (r >= 0) && (r < GRID_LEN) && (c >= 0) && (c < GRID_LEN);
}

// count adjacent bombs
let countAdjacentBombs = (cell) => {
    if(cell.isBomb) return -1;  
    let count = 0;
    for(let i = -1; i <= 1; i++) {
        for(let j = -1; j <= 1; j++) {
            if(validPos(cell.row+i, cell.col+j) && grid[cell.row + i][cell.col + j].isBomb)
                count += 1;
        }
    }    
    return count;  
}

// when a cell is clicked
let cellClick = (event) => {
    // if cell contains flag return
    if(event.target.classList.contains("flag"))
        return;

    let r = getRow(event.target.id);
    let c = getCol(event.target.id);
    // if bomb is clicked
    if(grid[r][c].isBomb)
        gameOver(event.target);
    else {
        floodFill(r, c);
        checkWin();
    }
}

// flood-fill algo; boundaries: bombs/ opened cells
let floodFill = (r, c) => {
    if((!validPos(r, c)) || grid[r][c].hasFlag || grid[r][c].opened || grid[r][c].isBomb)
        return;
    cells[grid[r][c].id].classList.add("open");
    cells[grid[r][c].id].classList.add(safeColorMap[grid[r][c].count]);
    cells[grid[r][c].id].classList.add("safe");
    cellsOpened += 1;
    score.innerHTML = +score.innerHTML + 1;
    grid[r][c].opened = true;
    if(grid[r][c].count === 0) {
        for(let i = -1; i <= 1; i++)
            for(let j = -1; j <= 1; j++)
                floodFill(r+i, c+j);
    } else {
        cells[grid[r][c].id].innerHTML = grid[r][c].count;
    }
}

// adds/removes flag on right click
let toggleFlag = (event) => {
    let curFlagCount = +flagCount.innerHTML;
    let r = getRow(+event.target.id);
    let c = getCol(+event.target.id);
    event.preventDefault();
    // remove flag
    if(event.target.classList.contains("flag")) {
        event.target.classList.remove("flag");
        flagCount.innerHTML = curFlagCount + 1;
    }
    // add flag 
    else if(curFlagCount > 0){
        event.target.classList.add("flag");
        flagCount.innerHTML = curFlagCount - 1;
    }
    grid[r][c].hasFlag = !grid[r][c].hasFlag;
}

let getRow = (val) => Math.ceil(+val/GRID_LEN) - 1;
let getCol = (val) => (+val - 1) % GRID_LEN; 

// generate N random values for bombs
let generateNRandomValues = (n)=>{
    let max = GRID_LEN*GRID_LEN;
    let set = new Set();
    for(let i = 0; i < n; i++) {
        let randomIndex = Math.floor(Math.random()*max);
        while(bombsIndices.has(randomIndex)){
            console.log(randomIndex);
            randomIndex = Math.floor(Math.random()*max);
        }
        bombsIndices.add(randomIndex);
    }
    return bombsIndices;
}

// check if the user won
let checkWin = () => {
    if(cellsOpened !== GRID_LEN*GRID_LEN - BOMBS)
        return;
    removeEventListeners();
    result.classList.add("win");
    result.innerHTML = "~ YOU WON🎉 ~";
    console.log("won");

}

// game over
let gameOver = (target) => {
    game.classList.add("disable");
    removeEventListeners();
    blastAllBombs(target);   
    result.classList.add("lose");
    result.innerHTML = "YOU LOST:/"
}
// remove all event listeners
let removeEventListeners = () => {
    cells.forEach(cell => {
        // remove left click event(click)
        cell.removeEventListener("click", cellClick, {once: true});
        // remove right click event(contextmenu)
        cell.removeEventListener("contextmenu", toggleFlag);
    });
}

// blast all bombs
let blastAllBombs = (target) => {
    target.classList.add("blast");
    let i = 1;
    bombsIndices.forEach((bombIndex) => {
        // IIFE
        (function() {
            setTimeout(() => {
                cells[bombIndex].classList.add("blast");
            }, i*100);
        })();
        i += 1;
    });
}
// replay 
reset.addEventListener("click", ()=> { 
    startGame();
});


startGame();