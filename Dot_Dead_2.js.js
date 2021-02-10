

//self explainitory
let gameRunning = false
let gameState = 0

//variables for design
let reload = 30

let bulletSpeed = 7

let playerSpeed = 5

let enemySpeed = 3

//Counts how many waves have been sent on player, used for difficulty and score
let waveNum = 1

let highScore = 0

//stores all data on the player
//postion(x, y), velocity(x, y), number of lives, and reload timer
let player = {x:300, y:300, xVel:0, yVel:0, lives:3, bulletTimer:0, iFrames: 0}

//enemies contains the positions, states, bullet timers, and statuses of all enemies
//Format: {x:number, y:number, state:thinking/long/mid/short, bulletTimer:number, stat:alive/dead}
let enemies = []

//bullets contains the positions, trajectories, affiliations, and statuses of all bullets
//Format: {x:number, y:number, ang:number(angle), afil:friend/foe, stat:live/dead}
let bullets = []

//calculates angle between two points. range[3pi/2, -pi/2)
function calcAngle (p1x, p1y, p2x, p2y) {
    let xDist = p1x - p2x
    let yDist = p1y - p2y
    if (p1x < p2x) {
        return Math.atan(yDist/xDist)
    } else {
        return Math.atan(yDist/xDist)+Math.PI
    }
}

function calcDist (p1x, p1y, p2x, p2y) {
    let xDist = p1x - p2x
    let yDist = p1y - p2y
    return Math.sqrt(xDist*xDist + yDist*yDist)
}

function checkBulletBounds () {
    bullets.forEach(bullet => {
        if (bullet.x < 0) {
            bullet.stat = "dead"
        }
        if (bullet.y < 0) {
            bullet.stat = "dead"
        }
        if (bullet.x > 600) {
            bullet.stat = "dead"
        }
        if (bullet.x > 600) {
            bullet.stat = "dead"
        }
    })
}

//clear enemies that are dead
function trimEnemies () {
    if (enemies.length >= 1) {
        enemies = enemies.filter(enemy => {
            if (enemy.stat === "alive") {
                return true
            } else {
                return false
            }
        })
    }
}

//clears bullets that are not in play anymore
function trimBullets () {
    if (bullets.length >= 1) {
        bullets = bullets.filter(bullet => {
            if (bullet.stat === "live") {
                return true
            } else {
                return false
            }
        })
    }
}

//spawns enemies with according attributes
function spawnEnemy (xPos, yPos) {
    enemies.push({x: xPos, y: yPos, state: "thinking", bulletTimer: reload*2, stat: "alive"})
    console.log(`Enemy spawned @ (${xPos}, ${yPos})`)
}

//spawns bullets with according attributes
function spawnBullet (xPos, yPos, angle, affili) {
    bullets.push({x: xPos, y: yPos, ang: angle, affil: affili, stat: "live"})
}

function spawnWave (wave) {
    let newSpawns = []
    let spawnNum = 1
    if (wave === 1) {
        spawnNum = 1
    } else if (wave >= 2 && wave <= 3) {
        spawnNum = 2
    } else if (wave > 3 && wave <= 5) {
        spawnNum = 3
    } else if (wave > 5 && wave <= 7) {
        spawnNum = 4
    } else if (wave > 7 && wave <= 12) {
        spawnNum = 5
    } else if (wave > 12 && wave <= 20) {
        spawnNum = 6
    } else {
        spawnNum = 7
    }
    for (i = 0;i < spawnNum;i ++) {
        newSpawns.push({x: 300, y: 300})
    }
    for (i = 0;i < spawnNum;i ++) {
        newSpawns[i] = {x: Math.round(Math.random()*500 + 50), y: Math.round(Math.random()*500 + 50)}
        if (calcDist(newSpawns[i].x, newSpawns[i].y, player.x, player.y) < 75) {
            i --
        }
    }
    newSpawns.forEach(spawn => {
        spawnEnemy(spawn.x, spawn.y)
    })
}

//draws player
function drawPlayer () {
    noStroke()
    fill(35, 194, 45, 150)
    if (player.iFrames > 0) {
        fill(35, 194, 45, 50 + Math.round(Math.random()*100))
    }
    if (player.bulletTimer > 0) {
        arc(player.x, player.y, 35, 35, Math.PI/2, Math.PI/2 + 2*Math.PI - 2*Math.PI*player.bulletTimer/reload)
    } else {
        ellipse(player.x, player.y, 35, 35)
    }
    fill(7, 172, 232)
    if (player.iFrames > 0) {
        fill(7, 172, 232, 50 + Math.round(Math.random()*100))
    }
    ellipse(player.x, player.y, 25, 25)
}

//draws enemies
function drawEnemies () {
    if (enemies.length >= 1) {
        noStroke()
        fill(224 - waveNum*10, 54 - waveNum*20, 54 - waveNum*20)
        enemies.forEach(enemy => {
            if (enemy.stat === "alive") {
                ellipse(enemy.x, enemy.y, 25, 25)
            }
        })
    }
}

//draws bullets
function drawBullets () {
    if (bullets.length >= 1) {
        noStroke()
        bullets.forEach(bullet => {
            if (bullet.stat === "live") {
                if (bullet.affil === "friend") {
                    fill(35, 194, 45)
                } else {
                    fill(227, 127, 14)
                }
                ellipse(bullet.x, bullet.y, 10, 10)
            }
        })
    }
}

function drawUI () {
    noStroke()
    fill(0, 0, 0)
    rect(0, 0, 600, 5)
    rect(0, 0, 5, 600)
    rect(0, 595, 600, 5)
    rect(595, 0, 5, 600)
    fill(7, 172, 232)
    textAlign(LEFT, TOP)
    textSize(20)
    text(`Health: ${player.lives}`, 20, 20)
    fill(224, 54, 54)
    textAlign(RIGHT, TOP)
    textSize(20)
    text(`Wave: ${waveNum}`, 580, 20)
    if (player.iFrames > 0) {
        fill(255, 0, 0, 2*player.iFrames)
        rect(0, 0, 600, 600)
    }
    if (gameState === 0) {
        fill(150, 150, 150, 100)
        rect(0, 0, 600, 600)
        fill(0, 0, 0)
        textAlign(CENTER, CENTER)
        textSize(40)
        text("Press Space to Start", 300, 200)
    } else {
        if (gameRunning === false) {
            if (gameState === 1) {
                fill(150, 150, 150, 100)
                rect(0, 0, 600, 600)
                fill(0, 0, 0)
                textAlign(CENTER, CENTER)
                textSize(40)
                text("Press Space to Resume", 300, 300)
            } else {
                fill(150, 150, 150, 100)
                rect(0, 0, 600, 600)
                fill(0, 0, 0)
                textAlign(CENTER, CENTER)
                textSize(40)
                text("You died", 300, 225)
                text(`Your score was: ${waveNum}`, 300, 275)
                text(`Your high-score is: ${highScore}`, 300, 325)
                text("Press space to play again", 300, 375)
            }
        }
    }
}

function accPlayer () {
    //governs UP and W keys
    if (player.yVel > -playerSpeed && keyIsDown(87)) {
        player.yVel -= playerSpeed/5
    } else if (player.yVel > -playerSpeed && keyIsDown(38)) {
        player.yVel -= playerSpeed/5
    }
    //governs LEFT and A keys
    if (player.xVel > -playerSpeed && keyIsDown(65)) {
        player.xVel -= playerSpeed/5
    } else if (player.xVel > -playerSpeed && keyIsDown(37)) {
        player.xVel -= playerSpeed/5
    }
    //governs DOWN and S keys
    if (player.yVel < playerSpeed && keyIsDown(83)) {
        player.yVel += playerSpeed/5
    } else if (player.yVel < playerSpeed && keyIsDown(40)) {
        player.yVel += playerSpeed/5
    }
    //governs RIGHT and D keys
    if (player.xVel < playerSpeed && keyIsDown(68)) {
        player.xVel += playerSpeed/5
    } else if (player.xVel < playerSpeed && keyIsDown(39)) {
        player.xVel += playerSpeed/5
    }
    //decelarates player vertically when no keys are pressed
    if (player.yVel > 0 && !keyIsDown(87) && !keyIsDown(38) && !keyIsDown(83) && !keyIsDown(40)) {
        player.yVel -= playerSpeed/5
    } else if (player.yVel < 0 && !keyIsDown(87) && !keyIsDown(38) && !keyIsDown(83) && !keyIsDown(40)) {
        player.yVel += playerSpeed/5
    }
    //decelarates player horizontally when no keys are pressed
    if (player.xVel > 0 && !keyIsDown(65) && !keyIsDown(37) && !keyIsDown(68) && !keyIsDown(39)) {
        player.xVel -= playerSpeed/5
    } else if (player.xVel < 0 && !keyIsDown(65) && !keyIsDown(37) && !keyIsDown(68) && !keyIsDown(39)) {
        player.xVel += playerSpeed/5
    }
}

function enemiesThink () {
    enemies.forEach(enemy => {
        if (enemy.state === "thinking") {
            let decide = Math.round(Math.random(1, 3))
            if (decide === 1) {
                enemy.state = "short"
            } else if (decide === 2) {
                enemy.state = "mid"
            } else {
                enemy.state = "long"
            }
        }
    })
}

function enemiesShoot () {
    enemies.forEach(enemy => {
        if (enemy.bulletTimer <= 0 &&  gameRunning) {
            spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y), "foe")
            enemy.bulletTimer = reload*2 + Math.round(Math.random()*reload)
        }
    })
}

//self explainitory
function movePlayer () {
    player.x += player.xVel
    player.y += player.yVel
    if (player.x < 5) {
        player.xVel = playerSpeed*3
    }
    if (player.x > 595) {
        player.xVel = -playerSpeed*3
    }
    if (player.y < 5) {
        player.yVel = playerSpeed*3
    }
    if (player.y > 595) {
        player.yVel = -playerSpeed*3
    }
}

function moveEnemies () {
    enemies.forEach(enemy => {
        let rangeFloor
        let rangeCeiling
        if (enemy.state === "short") {
            rangeFloor = 50
            rangeCeiling = 150
        } else if (enemy.state === "mid") {
            rangeFloor = 150
            rangeCeiling = 250
        } else if (enemy.state === "long") {
            rangeFloor = 250
            rangeCeiling = 400
        }
        //moves enemy closer if player leaves ideal range
        if (calcDist(enemy.x, enemy.y, player.x, player.y) > rangeCeiling) {
            if (enemy.x < player.x) {
                enemy.x += enemySpeed
            }
            if (enemy.x > player.x) {
                enemy.x -= enemySpeed
            }
            if (enemy.y < player.y) {
                enemy.y += enemySpeed
            }
            if (enemy.y > player.y) {
                enemy.y -= enemySpeed
            }
        }
        // moves enemy back if player comes too close
        if (calcDist(enemy.x, enemy.y, player.x, player.y) < rangeFloor) {
            if (enemy.x < player.x && enemy.x > 50) {
                enemy.x -= enemySpeed
            }
            if (enemy.x > player.x && enemy.x < 550) {
                enemy.x += enemySpeed
            }
            if (enemy.y < player.y && enemy.y > 50) {
                enemy.y -= enemySpeed
            }
            if (enemy.y > player.y && enemy.y < 550) {
                enemy.y += enemySpeed
            }
        }
    })
}

function moveBullets () {
    bullets.forEach(bullet => {
        bullet.x += bulletSpeed*Math.cos(bullet.ang)
        bullet.y += bulletSpeed*Math.sin(bullet.ang)
    })
}

function collideBullets () {
    bullets.forEach(bullet => {
        if (bullet.stat === "live") {
            enemies.forEach(enemy => {
                if (bullet.affil === "friend" && enemy.stat === "alive" && calcDist(bullet.x, bullet.y, enemy.x, enemy.y) <= 23) {
                    bullet.stat = "dead"
                    enemy.stat = "dead"
                }
            })
            if (bullet.affil === "foe" && calcDist(bullet.x, bullet.y, player.x, player.y) <= 23) {
                bullet.stat = "dead"
                if (player.iFrames < 1) {
                    player.lives --
                    player.iFrames = 40
                }
            }
        }
    })
}

function passBulletTimer () {
    player.bulletTimer --
    enemies.forEach(enemy => {
        enemy.bulletTimer --
    })
}

function passPlayerIFrames () {
    player.iFrames --
}

function checkNextWave () {
    if (enemies.length < 1) {
        waveNum ++
        spawnWave(waveNum)
    }
}

function checkPlayerHealth () {
    if (player.lives < 1) {
        gameRunning = false
        gameState = 2
        if (waveNum > highScore) {
            highScore = waveNum
        }
    }
}

function restart () {
    player.x = 300
    player.y = 300
    player.xVel = 0
    player.yVel = 0
    player.lives = 3
    player.bulletTimer = 0
    player.iFrames = 0
    waveNum = 1
    enemies = []
    bullets = []
    gameState = 1
    gameRunning = true
    spawnWave(waveNum)
}

//Makes canvas and is useful for debugging
function setup () {
    createCanvas(600, 600)

    spawnWave(waveNum)
}

//Runs repeatedly, most important stuff happens here
function draw () {
    background(255-Math.round(Math.random()*5*(3-player.lives)), 255-Math.round(Math.random()*5*(3-player.lives)), 255-Math.round(Math.random()*5*(3-player.lives)))
    
    drawBullets()
    drawEnemies()
    drawPlayer()

    drawUI()

    enemiesThink()

    if (gameRunning === true) {
        accPlayer()

        movePlayer()
        moveEnemies()
        moveBullets()

        enemiesShoot()

        collideBullets()

        passBulletTimer()
        passPlayerIFrames()

        checkNextWave()
    }

    checkBulletBounds()

    checkPlayerHealth()

    trimBullets()
    trimEnemies()
}

function keyTyped () {
    if (keyCode === 32) {
        if (gameRunning === false && gameState < 2) {
            gameRunning = true
            gameState = 1
        } else if (gameState === 2) {
            restart()
        } else {
            gameRunning = false
        }
    }
}

//called when player clicks, spawns a bullet
function mouseClicked () {
    if (player.bulletTimer < 1 && gameRunning === true) {
        spawnBullet(player.x, player.y, calcAngle(player.x, player.y, mouseX, mouseY), "friend")
        player.bulletTimer = reload
    }
}