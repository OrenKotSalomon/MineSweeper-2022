'use strict'
// SPRINT 1 MineSweeper


const secondsLabel = document.getElementById("seconds");
const MINE = '💣'
const EMPTY = ''

var gCountMines = 0
var gInterval
var gNumberOfClicks = 0
var gBoard
var firstTimeStamp = 0
var gInterval
var bestTimeElement = document.querySelector('.best-time');
var bestTime = 0

var gLevel = {
    SIZE: 4,
    MINES: 4,
    lifes: 3,
    hints: 3,
    safeClicks: 3
};

var gGame = {
    isOn: false,
    isHintOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    safeClicksRemaining: gLevel.safeClicks,
    lifeRemaining: gLevel.lifes,
    hintsRemaining: gLevel.hints,
}

function initGame() {
    gGame.isOn = true
    gBoard = buildBoard()
    updateMines()
    updateNumbers()
    renderBoard(gBoard)
    var bestTime = localStorage.getItem('bestTime');
    if (bestTime) { bestTimeElement.innerHTML = 'Best Time: ' + bestTime + ' Seconds'; }
    addHint()
    addLife()
    addSafeClick()
}

function updateMines() {
    var randCell = getEmptyCell(gBoard)
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]

            if (!currCell.isMine) {
                if (gCountMines < gLevel.MINES) {
                    gBoard[randCell[gCountMines].i][randCell[gCountMines].j].isMine = true
                    gCountMines++
                }
            }
        }
    }
}

function setMinesNegsCount(board, rowIdx, colIdx) {
    var countAroundCell = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) {
                countAroundCell++
            }
        }
    }
    return countAroundCell
}

function startTimeByClick() {
    if (gNumberOfClicks === 1) {
        gInterval = setInterval(setTime, 1000);
    }
}

function cellMarked(elFlag, i, j) {
    var currCell = gBoard[i][j]

    if (!gGame.isOn) return
    gNumberOfClicks++
    startTimeByClick()
    if (currCell.isShown) return
    if (currCell.isMarked) {
        currCell.isMarked = false
        gGame.markedCount--
        elFlag.classList.remove('flag')
        return
    }
    if (gGame.markedCount === gCountMines) return
    if (!currCell.isMarked) {
        currCell.isMarked = true
        ++gGame.markedCount
        OpenCellsValue()
        checkIfWin(i, j)
        elFlag.classList.add('flag')

    }
}

function cellClicked(elCell, i, j) {
    var currCell = gBoard[i][j]
    var elRestart = document.querySelector('.restart')
    var elLife = document.querySelector('.lifes .hearts')
    var elHints = document.querySelector('.hints .bulbs')

    if (!gGame.isOn) return
    if (elCell.classList.contains('flag')) return

    if (!gNumberOfClicks && currCell.isMine) {
        elCell = restartGame()
        return
    }
    if (gGame.isHintOn && !currCell.isShown) {
        if (elCell) {
            revealWithHint(gBoard, i, j)
            setTimeout(() => {
                hideCells(gBoard, i, j)
            }, 1000);
            gGame.isHintOn = false
            gGame.hintsRemaining--
            elHints.innerText = ''
            addHint()
            return
        }
    }
    if (!currCell.isShown) {
        ++gNumberOfClicks
        elCell.classList.remove('closed')
        if (currCell.minesAroundCount !== 0 && !currCell.isMine) {
            currCell.isShown = true
        }
        OpenCellsValue()
        checkIfWin(i, j)
        elCell.innerText = (currCell.isMine) ? MINE : currCell.minesAroundCount
    }
    if (currCell.isMine && !currCell.isShown) {
        if (currCell.isShown) return
        gGame.lifeRemaining--
        gGame.shownCount--
        OpenCellsValue()
        checkIfWin(i, j)
        gCountMines--
        elCell.innerText = MINE
        elCell.classList.remove('closed')
        elLife.innerText = ''
        addLife()
        currCell.isShown = true
    }
    if (gGame.lifeRemaining === 0) {
        openAllMines()
        elRestart.innerText = '🤬'
        elLife.innerText = 'You are out of LUCK'
        clearInterval(gInterval)
        gGame.isOn = false
    }
    if (currCell.minesAroundCount === 0 && !currCell.isMine) {
        ++gNumberOfClicks
        elCell.innerText = EMPTY
        expandCells(gBoard, i, j)
    }
    if (gNumberOfClicks === 1) {
        startTimeByClick()
        gNumberOfClicks++
    }
    OpenCellsValue()
    checkIfWin(i, j)

}

function onClickMode(levelSize, levelMines, lifes, hints) {
    gLevel.lifes = lifes
    gLevel.SIZE = levelSize
    gLevel.MINES = levelMines
    restartGame()
}

function onSafeClick() {
    var counter = 0
    var randCell = Object.values(getRandomCell(gBoard))
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var elCell = document.querySelector(`.cell-${randCell[0]}-${randCell[1]}`)
            if (counter === 0) {
                if (!randCell.isShown && !randCell.isMine) {
                    elCell.classList.remove('closed')
                    elCell.classList.add('safe-cell')
                    counter++
                    setTimeout(() => {
                        elCell.classList.remove('safe-cell')
                        elCell.classList.add('closed')
                    }, 2000);
                }
            }
        }
    }
    var elSafeClick = document.querySelector('.safe-click .in-safe-click')
    gGame.safeClicksRemaining--
    elSafeClick.innerText = ''
    addSafeClick()
    counter = 0
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
    return emptyCells[0]
}

function restartGame() {
    var elRestart = document.querySelector('.restart')
    var elLife = document.querySelector('.lifes .hearts')
    var elHints = document.querySelector('.hints .bulbs')
    var elSafeClick = document.querySelector('.safe-click .in-safe-click')

    clearInterval(gInterval)
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.lifeRemaining = gLevel.lifes
    gGame.hintsRemaining = gLevel.hints
    gGame.safeClicksRemaining = gLevel.safeClicks
    elLife.innerText = ''
    elHints.innerText = ''
    elSafeClick.innerText = ''
    gCountMines = 0
    gNumberOfClicks = 0
    elRestart.innerText = '🙂'
    secondsLabel.innerHTML = '00'
    initGame()
}

function checkIfWin() {
    var elRestart = document.querySelector('.restart')
    if (gGame.markedCount === gCountMines) {
        if (gGame.shownCount === (gLevel.SIZE * gLevel.SIZE) - gLevel.MINES) {
            timeSave()
            elRestart.innerText = '😎'
            clearInterval(gInterval)
            gGame.isOn = false
        }
    }
}

function expandCells(board, rowIdx, colIdx) {

    if (board[rowIdx][colIdx].isShown) return
    board[rowIdx][colIdx].isShown = true


    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue

            var elCell = document.querySelector(`.cell-${i}-${j}`)
            var currCell = board[i][j]

            if (elCell.classList.contains('flag')) return
            if (!currCell.isMine && !currCell.isMarked && !currCell.isShown) {
                elCell.innerText = (currCell.minesAroundCount) ? currCell.minesAroundCount : EMPTY
                if (!currCell.isShown && currCell.minesAroundCount !== 0) {
                    currCell.isShown = true
                }
                elCell.classList.remove('closed')
            }

            if (currCell.minesAroundCount && !currCell.isMine) {
                elCell.innerText = (currCell.minesAroundCount) ? currCell.minesAroundCount : EMPTY
                elCell.classList.remove('closed')
            }
            else if (currCell.minesAroundCount === 0) expandCells(board, i, j)
            checkIfWin(i, j)
            if (currCell.isMine) {
                currCell.isShown = false
            }
            // need to fix condition with timestart with recursion
        }
    }
}

function timeSave() {
    var gameSeconds = gGame.secsPassed
    var bestTime = localStorage.getItem('bestTime');

    if (bestTime) {
        if (gameSeconds < bestTime) {
            localStorage.setItem('bestTime', gameSeconds);
            bestTimeElement.innerText = 'Best Time: ' + gameSeconds + ' Seconds';
        }
    } else {
        localStorage.setItem('bestTime', gameSeconds);
        bestTimeElement.innerText = 'Best Time: ' + gameSeconds + ' Seconds';
    }
    firstTimeStamp = 0;
}

function revealWithHint(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            var currCell = board[i][j]

            if (currCell.isMine) {
                elCell.classList.remove('closed')
                elCell.innerText = MINE
            } else if (currCell.minesAroundCount) {

                elCell.classList.remove('closed')
                elCell.innerText = currCell.minesAroundCount
            } else {
                elCell.classList.remove('closed')
                elCell.innerText = currCell.minesAroundCount
            }
        }
    }
    return
}

function hideCells(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            var currCell = board[i][j]

            if (currCell.isMine && !currCell.isShown) {
                elCell.classList.add('closed')
                elCell.innerText = EMPTY
            } else if (currCell.minesAroundCount && !currCell.isShown) {

                elCell.classList.add('closed')
                elCell.innerText = EMPTY
            } else if (!currCell.minesAroundCount && !currCell.isShown) {
                elCell.classList.add('closed')
                elCell.innerText = EMPTY
            }
        }
    }
    return
}






