function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function setTime() {
    ++gGame.secsPassed
    secondsLabel.innerHTML = pad(gGame.secsPassed);
}

function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    }
    else {
        return valString;
    }
}

function shuffle(items) {
    var randIdx, keep, i;
    for (i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInt(0, items.length - 1);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}

function getEmptyCell(board) {
    var gCountCells = 0
    const emptyCells = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = board[i][j]
            emptyCells.push({ i: i, j: j })
            gCountCells++
        }
    }
    shuffle(emptyCells)
    return emptyCells
}

function addLife() {
    var elLife = document.querySelector('.lifes .hearts')
    for (let i = gGame.lifeRemaining; i > 0; i--) {
        elLife.innerText += '❤️‍🩹'
    }
}

function addHint() {
    var elHints = document.querySelector('.hints .bulbs')
    for (let i = gGame.hintsRemaining; i > 0; i--) {
        elHints.innerText += '💡'
    }
}

function addSafeClick() {
    var elSafeClick = document.querySelector('.safe-click .in-safe-click')
    for (let i = gGame.safeClicksRemaining; i > 0; i--) {
        elSafeClick.innerText += '🦺'
    }
}

function openAllMines() {
    var elMines = document.querySelectorAll('tr .cell.mine.closed')
    for (let i = 0; i < elMines.length; i++) {
        elMines[i].innerText = MINE
        elMines[i].classList.remove('closed')
        elMines[i].classList.remove('flag')
    }
}

function onDarkMode() {
    var elModes = document.querySelectorAll('.buttonLevel')
    var elBody = document.body
    var elContainer = document.querySelector('.container')
    var elDarkMode = elContainer.querySelector('.dark-mode-click')

    elBody.classList.toggle('dark-mode')
    elDarkMode.classList.toggle('in-dark-mode')
    for (var i = 0; i < elModes.length; i++) {
        elModes[i].classList.toggle('dark-mode')
    }
    elContainer.classList.toggle('dark-mode')
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]

            var className = (!currCell.isMine) ? `cell cell-${i}-${j} closed` : `cell cell-${i}-${j} mine closed`
            strHTML += `<td  class="${className}" oncontextmenu="cellMarked(this, ${i}, ${j});return false;"" onclick="cellClicked(this, ${i},${j} )"></td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function buildBoard() {
    const board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    return board
}

function updateNumbers() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            var numsOfMines = setMinesNegsCount(gBoard, i, j)

            currCell.minesAroundCount = numsOfMines
        }
    }
}

function OpenCellsValue() {
    var countCells = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isShown && !currCell.isMine) {
                countCells++
            }

        }
    }
    countCells = countCells
    gGame.shownCount = countCells
}


function getRandomCell(board) {
    const emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = board[i][j]
            if (!currCell.isShown && !currCell.isMine)
                emptyCells.push({ i: i, j: j })
        }
    }
    shuffle(emptyCells)
    console.log('emptyCells', emptyCells[0]);
    return emptyCells[0]
}

function onHintClick() {
    gGame.isHintOn = true
}