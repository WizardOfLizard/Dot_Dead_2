

//self explainitory
let gameRunning = false
let gameState = 0

let gameLevel = 0

let changeDelay = 0

//Lists the wave transitions for each level
//Each item in array is a single wave transition
//type:number/"all" (represents the type of enemy it is counting before next transition)
//num:int (number it must be or b lower than to start next wave)
let level0Trans = [{type:"all", num:0}, {type:"all", num:0}, {type:"all", num:0}, {type:"all", num:0}, {type:"all", num:0}, {type:"all", num:0}, {type:"all", num:0}, {type:"all", num:0}]
let level1Trans = []
let level2Trans = []
let level3Trans = []
let level4Trans = []
let level5Trans = []

//lists the levels you have defeated
let defeated = [false, false, false, false, false, false]

//variables for design
let bulletSpeed = 6

let playerSpeed = 5
let playerReload = [30, 5, 55, 35, 60]
let playerBulletDamage = [30, 5, 50, 20, 80]

let enemySpeed = [3, 6, 2, 3, 3, 2, 3, 1]
let enemyReload = [55, 35, 80, 60, 55, 65, 100, 80]
let enemyHealth = [30, 20, 40, 60, 80, 100, 40, 55]
let enemyBulletDamage = [20, 15, 35, 20, 20, 10, 40, 10]
let enemyPowChance = [{health:0.1, speed:0.1, gun:0}, {health:0.1, speed:0.15, gun:0.05}, {health:0.1, speed:0.05, gun:0.1}, {health:0.1, speed:0.1, gun:0.1}, {health:0.1, speed:0.1, gun:0}, {health:0.1, speed:0.1, gun:0}, {health:0.1, speed:0.1, gun:0}, {health:0.1, speed:0.1, gun:0}]

//visual variables
let rumble = 0

let textShift = 0
let textDrift = 0.5

let isTransitioning = false
let bright = 0
let brightChange = 2
let transTo = undefined

//Counts how many waves have been sent on player, used for difficulty and score
let waveNum = 1

let highScore = 0

//stores all data on the player
//postion(x, y), velocity(x, y), health, gun type, reload timer, and invulnerability frames
let player = {x:300, y:300, xVel:0, yVel:0, health:100, gunType:0, bulletTimer:0, iFrames: 0, regenTime: 100}

//enemies contains the positions, states, bullet timers, health, statuses, and types of all enemies
//Format: {x:number, y:number, state:unique by enemy, bulletTimer:number, health:number, stat:alive/dead, type:number, threat: number}
let enemies = []

//counts the number of each type of enemy
let eTypeCount = []

//powers contain the given powerups on the battle field
//format: {x:number, y:number, lifetime:number, type:string(health, speed, gun), tier(non-gun powerups only):number(1-5), gun(gun powerups only):number}
let powers = []

//bullets contains the positions, trajectories, affiliations, statuses, and types of all bullets
//Format: {x:number, y:number, ang:number(angle), afil:friend/foe, stat:live/dead, type:number}
let bullets = []

//seekers contains the positions, directions, affiliations, statuses, and types of all seekers
//Format: {x:number, y:number, ang:number(angle), afil:friend/foe, stat:live/dead, type:string
let seekers = []

//lasers contains the start points, angles, affiliations, statuses, and types of all lasers
//Format: {startX:number, startY:number, ang:number(angle), afil:friend/foe, stat:live/dead, type:string
let lasers = []

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

function trimPowerups () {
    if (powers.length >= 1) {
        powers = powers.filter(power => {
            if (power.lifetime <= 150) {
                return true
            } else {
                return false
            }
        })
    }
}

//spawns enemies with according attributes
function spawnEnemy (xPos, yPos, eType) {
    enemies.push({x: xPos, y: yPos, state: "thinking", bulletTimer: enemyReload[eType], health: enemyHealth[eType],stat: "alive", type: eType, rangeFloor: 0, rangeCeiling: 999})
    console.log(`Enemy spawned @ (${xPos}, ${yPos})`)
}

function spawnPowerup (xPos, yPos, pType, pTier, gun) {
    if (pType === "gun") {
        powers.push({x:xPos, y:yPos, lifetime:0, type:pType, gun:gun})
    } else {
        powers.push({x:xPos, y:yPos, lifetime:0, type:pType, tier:pTier})
    }
}

//spawns bullets with according attributes
function spawnBullet (xPos, yPos, angle, affili, bType) {
    bullets.push({x: xPos, y: yPos, ang: angle, affil: affili, stat: "live", type: bType})
    rumble ++
}

function spawnWave (wave, level) {
    if (level === 0) {
        if (wave === 1) {
            spawnGroup(1, 0)
        } else if (wave === 2) {
            spawnGroup(2, 0)
        } else if (wave === 3) {
            spawnGroup(1, 0)
            spawnGroup(1, 1)
        } else if (wave === 4) {
            spawnGroup(1, 2)
            spawnGroup(2, 0)
        } else if (wave === 5) {
            spawnGroup(2, 0)
            spawnGroup(1, 3)
        } else if (wave === 6) {
            spawnGroup(3, 4)
        } else if (wave === 7) {
            spawnGroup(2, 5)
            spawnGroup(2, 2)
        } else if (wave === 8) {
            spawnGroup(2, 6)
        } else if (wave === 9) {
            spawnGroup(2, 4)
            spawnGroup(1, 7)
        }
    } else if (level === 1) {

    } else if (level === 2) {

    } else if (level === 3) {

    } else if (level === 4) {

    } else if (level === 5) {

    }
}

//spawns a given number of a given type of enemy
function spawnGroup (num, type) {
    let newSpawns = []
    for (i = 0;i < num;i ++) {
        newSpawns.push({x: 300, y: 300})
    }
    for (i = 0;i < num;i ++) {
        newSpawns[i] = {x: Math.round(Math.random()*500 + 50), y: Math.round(Math.random()*500 + 50)}
        if (calcDist(newSpawns[i].x, newSpawns[i].y, player.x, player.y) < 75) {
            i --
        }
    }
    newSpawns.forEach(spawn => {
        spawnEnemy(spawn.x, spawn.y, type)
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
        arc(player.x, player.y, 35, 35, Math.PI/2, Math.PI/2 + 2*Math.PI - 2*Math.PI*player.bulletTimer/playerReload[player.gunType])
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
        fill(224, 54, 54)
        enemies.forEach(enemy => {
            if (enemy.type === 0 || enemy.type === 4) {
                fill(224, 54, 54)
            } else if (enemy.type === 1) {
                fill(219, 219, 22)
            } else if (enemy.type === 2) {
                fill(147, 20, 201)
            } else if (enemy.type === 3) {
                fill(247, 118, 5)
            } else if (enemy.type === 5) {
                fill(14, 41, 140)
            } else if (enemy.type === 6) {
                fill(10, 228, 252)
            } else if (enemy.type === 7) {
                fill(89, 89, 89)
            }
            if (enemy.stat === "alive") {
                ellipse(enemy.x, enemy.y, 25, 25)
                if (enemy.type === 4) {
                    fill (0, 0, 0, 100)
                    ellipse(enemy.x, enemy.y, 30, 30)
                }
            }
        })
    }
}

function drawPowerups () {
    powers.forEach(power => {
        noStroke()
        fill(50, 107, 168)
        ellipse(power.x, power.y, 25, 25)
    })
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
    text(`Health: ${player.health}`, 20, 20)
    if (player.health > 0) {
        rect(300 - (player.health + ((100 - player.regenTime) / 100)) * 2, 25, (player.health + ((100 - player.regenTime) / 100))*4, 15)
        ellipse(300.5 - (player.health + ((100 - player.regenTime) / 100)) * 2, 32.5, 10, 15)
        ellipse(299.5 + (player.health + ((100 - player.regenTime) / 100)) * 2, 32.5, 10, 15)
    }
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

function drawMenu () {
    if (gameState === 0) {
        background(27, 81, 207)
        textAlign(CENTER, CENTER)
        textSize(50)
        fill(0, 0, 0)
        text("Dot Dead 2", 300, 100 + textShift)
        textSize(15)
        text("Daniel L. Hensler", 300, 140 + textShift)
        strokeWeight(5)
        stroke(0, 0, 0)
        fill(67, 219, 11)
        if (calcDist(mouseX, mouseY, 300, 300) <= 37) {
            stroke(255, 255, 255)
            fill(186, 15, 15)
        }
        ellipse(300, 300, 75, 75)
        strokeWeight(3)
        fill(251, 255, 0)
        if (calcDist(mouseX, mouseY, 300, 300) <= 37) {
            stroke(255, 255, 255)
            fill(0, 0, 0)
        }
        triangle(285, 285, 285, 315, 325, 300)
        if (calcDist(mouseX, mouseY, 300, 300) <= 37 && mouseIsPressed && !isTransitioning) {
            isTransitioning = true
            transTo = 1
        }
    }
    fill(255, 255, 255, 2*bright)
}

function transitionScene () {
    if (isTransitioning) {
        noStroke()
        fill(255, 255, 255, 2.5*bright)
        rect(0, 0, 600, 600)
        bright += brightChange
        if (bright >= 100) {
            brightChange = -2
            if (transTo === 1) {
                gameState = 1
                gameRunning = true
                changeDelay = 25
                spawnWave(waveNum, gameLevel)
                transTo = undefined
            }
            if (transTo === 0) {
                restart()
            }
        }
        if (bright <= 0 && brightChange === -2) {
            bright = 0
            brightChange = 2
            isTransitioning = false
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
    //decelerates player vertically when no keys are pressed
    if (player.yVel > 0 && !keyIsDown(87) && !keyIsDown(38) && !keyIsDown(83) && !keyIsDown(40)) {
        player.yVel -= playerSpeed/5
    } else if (player.yVel < 0 && !keyIsDown(87) && !keyIsDown(38) && !keyIsDown(83) && !keyIsDown(40)) {
        player.yVel += playerSpeed/5
    }
    //decelerates player horizontally when no keys are pressed
    if (player.xVel > 0 && !keyIsDown(65) && !keyIsDown(37) && !keyIsDown(68) && !keyIsDown(39)) {
        player.xVel -= playerSpeed/5
    } else if (player.xVel < 0 && !keyIsDown(65) && !keyIsDown(37) && !keyIsDown(68) && !keyIsDown(39)) {
        player.xVel += playerSpeed/5
    }
}

function enemiesThink () {
    enemies.forEach(enemy => {
        if (enemy.state === "thinking" && (enemy.type === 0 || enemy.type === 4)) {
            let decide = Math.round(Math.random(1, 3))
            if (decide === 1) {
                enemy.state = "move0A"
            } else if (decide === 2) {
                enemy.state = "move0B"
            } else {
                enemy.state = "move0C"
            }
        }
        if (enemy.state === "thinking" && enemy.type === 1) {
            let decide = Math.round(Math.random(1, 3))
            if (decide === 1) {
                enemy.state = "move1A"
            } else if (decide === 2) {
                enemy.state = "move1B"
            } else {
                enemy.state = "move1C"
            }
        }
        if (enemy.state === "thinking" && enemy.type === 2) {
            let decide = Math.round(Math.random(1, 3))
            if (decide === 1) {
                enemy.state = "move2A"
            } else if (decide === 2) {
                enemy.state = "move2B"
            } else {
                enemy.state = "move2C"
            }
        }
        if (enemy.state === "thinking" && enemy.type === 3) {
            let decide = Math.round(Math.random(1, 3))
            if (decide === 1) {
                enemy.state = "move3A"
            } else if (decide === 2) {
                enemy.state = "move3B"
            } else {
                enemy.state = "move3C"
            }
        }
        if (enemy.state === "thinking" && enemy.type === 5) {
            enemy.state = "move5"
        }
        if (enemy.state === "thinking" && enemy.type === 6) {
            let decide = Math.round(Math.random(1, 3))
            if (decide === 1) {
                enemy.state = "move6A"
            } else if (decide === 2) {
                enemy.state = "move6B"
            } else {
                enemy.state = "move6C"
            }
        }
        if (enemy.state === "thinking" && enemy.type === 7) {
            let decide = Math.round(Math.random(1, 3))
            if (decide === 1) {
                enemy.state = "move7A"
            } else if (decide === 2) {
                enemy.state = "move7B"
            } else {
                enemy.state = "move7C"
            }
        }
    })
}

function driftText () {
    textShift += textDrift
    if (textShift > 0) {
        textDrift -= 0.01
    }
    if (textShift < 0) {
        textDrift += 0.01
    }
}

function enemiesShoot () {
    enemies.forEach(enemy => {
        if (enemy.bulletTimer <= 0 && gameRunning && !isTransitioning) {
            if (enemy.type !== 6 && enemy.type !== 7) {
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y), "foe", enemy.type)
            }
            if (enemy.type === 3) {
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y) + Math.PI/6, "foe", enemy.type)
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y) - Math.PI/6, "foe", enemy.type)
            }
            enemy.bulletTimer = enemyReload[enemy.type] + Math.round(Math.random()*enemyReload[enemy.type])
            enemy.state = "thinking"
            if (enemy.type === 6) {
                enemy.state = "exploding"
                enemy.bulletTimer = enemyReload[enemy.type]
            }
            if (enemy.type === 7) {
                enemy.state = "shooting"
                enemy.bulletTimer = enemyReload[enemy.type]
            }
        }
        if (enemy.type === 6 && enemy.state === "exploding" && gameRunning && !isTransitioning) {
            if (enemy.bulletTimer % 40 === 0) {
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y), "foe", enemy.type)
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y) + Math.PI/3, "foe", enemy.type)
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y) - Math.PI/3, "foe", enemy.type)
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y) + 2 * Math.PI/3, "foe", enemy.type)
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y) - 2 * Math.PI/3, "foe", enemy.type)
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y) + Math.PI, "foe", enemy.type)
            } else if (enemy.bulletTimer % 20 === 0) {
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y) + Math.PI/6, "foe", enemy.type)
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y) + Math.PI/3 + Math.PI/6, "foe", enemy.type)
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y) - Math.PI/3 + Math.PI/6, "foe", enemy.type)
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y) + 2 * Math.PI/3 + Math.PI/6, "foe", enemy.type)
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y) - 2 * Math.PI/3 + Math.PI/6, "foe", enemy.type)
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y) + Math.PI + Math.PI/6, "foe", enemy.type)
            } else if (enemy.bulletTimer < 50) {
                enemy.state = "thinking"
                enemy.bulletTimer = enemyReload[enemy.type]
            }
        }
        if (enemy.type === 7 && enemy.state === "shooting" && gameRunning && !isTransitioning) {
            if (enemy.bulletTimer % 5 === 0) {
                spawnBullet(enemy.x, enemy.y, calcAngle(enemy.x, enemy.y, player.x, player.y) - Math.PI/6 + 2*Math.PI*Math.random()/6, "foe", enemy.type)
            } else if (enemy.bulletTimer < 30) {
                enemy.state = "thinking"
                enemy.bulletTimer = enemyReload[enemy.type]
            }
        }
    })
}

//self explainitory
function movePlayer () {
    if (!isTransitioning || transTo === 0) {
        player.x += player.xVel
        player.y += player.yVel
        if (player.x < 15) {
            player.xVel = 0
            player.x = 15
        }
        if (player.x > 585) {
            player.xVel = 0
            player.x = 585
        }
        if (player.y < 15) {
            player.yVel = 0
            player.y = 15
        }
        if (player.y > 585) {
            player.yVel = 0
            player.y = 585
        }
    }
}

function moveEnemies () {
    if (!isTransitioning) {
        enemies.forEach(enemy => {
            if (enemy.state === "move0A") {
                enemy.rangeFloor = 200
                enemy.rangeCeiling = 300
            } else if (enemy.state === "move0B") {
                enemy.rangeFloor = 125
                enemy.rangeCeiling = 225
            } else if (enemy.state === "move0C") {
                enemy.rangeFloor = 275
                enemy.rangeCeiling = 375
            }
            if (enemy.state === "move1A") {
                enemy.rangeFloor = 100
                enemy.rangeCeiling = 200
            } else if (enemy.state === "move1B") {
                enemy.rangeFloor = 50
                enemy.rangeCeiling = 150
            } else if (enemy.state === "move1C") {
                enemy.rangeFloor = 150
                enemy.rangeCeiling = 250
            }
            if (enemy.state === "move2A") {
                enemy.rangeFloor = 400
                enemy.rangeCeiling = 500
            } else if (enemy.state === "move2B") {
                enemy.rangeFloor = 350
                enemy.rangeCeiling = 450
            } else if (enemy.state === "move2C") {
                enemy.rangeFloor = 475
                enemy.rangeCeiling = 575
            }
            if (enemy.state === "move3A") {
                enemy.rangeFloor = 100
                enemy.rangeCeiling = 125
            } else if (enemy.state === "move3B") {
                enemy.rangeFloor = 125
                enemy.rangeCeiling = 150
            } else if (enemy.state === "move3C") {
                enemy.rangeFloor = 150
                enemy.rangeCeiling = 175
            }
            if (enemy.state === "move5") {
                enemy.rangeFloor = 100
                enemy.rangeCeiling = 150
            }
            if (enemy.state === "move6A") {
                enemy.rangeFloor = 150
                enemy.rangeCeiling = 250
            } else if (enemy.state === "move6B") {
                enemy.rangeFloor = 250
                enemy.rangeCeiling = 350
            } else if (enemy.state === "move6C") {
                enemy.rangeFloor = 450
                enemy.rangeCeiling = 550
            }
            if (enemy.state === "move7A") {
                enemy.rangeFloor = 250
                enemy.rangeCeiling = 350
            } else if (enemy.state === "move7B") {
                enemy.rangeFloor = 350
                enemy.rangeCeiling = 450
            } else if (enemy.state === "move7C") {
                enemy.rangeFloor = 450
                enemy.rangeCeiling = 550
            }
            //moves enemy closer if player leaves ideal range
            if (calcDist(enemy.x, enemy.y, player.x, player.y) > enemy.rangeCeiling) {
                if (enemy.x < player.x) {
                    enemy.x += enemySpeed[enemy.type]
                }
                if (enemy.x > player.x) {
                    enemy.x -= enemySpeed[enemy.type]
                }
                if (enemy.y < player.y) {
                    enemy.y += enemySpeed[enemy.type]
                }
                if (enemy.y > player.y) {
                    enemy.y -= enemySpeed[enemy.type]
                }
            }
            // moves enemy back if player comes too close
            if (calcDist(enemy.x, enemy.y, player.x, player.y) < enemy.rangeFloor) {
                if (enemy.x < player.x && enemy.x > 50) {
                    enemy.x -= enemySpeed[enemy.type]
                }
                if (enemy.x > player.x && enemy.x < 550) {
                    enemy.x += enemySpeed[enemy.type]
                }
                if (enemy.y < player.y && enemy.y > 50) {
                    enemy.y -= enemySpeed[enemy.type]
                }
                if (enemy.y > player.y && enemy.y < 550) {
                    enemy.y += enemySpeed[enemy.type]
                }
            }
        })
    }
}

function moveBullets () {
    bullets.forEach(bullet => {
        if (bullet.affil === "foe" && bullet.type === 6) {
            bullet.x += bulletSpeed*Math.cos(bullet.ang)/2
            bullet.y += bulletSpeed*Math.sin(bullet.ang)/2
        } else if (bullet.affil === "friend" && bullet.type === 4) {
            bullet.x += bulletSpeed*Math.cos(bullet.ang)/1.25
            bullet.y += bulletSpeed*Math.sin(bullet.ang)/1.25
        } else {
            bullet.x += bulletSpeed*Math.cos(bullet.ang)
            bullet.y += bulletSpeed*Math.sin(bullet.ang)
        }
    })
}

function playerRegen () {
    if (player.health > 0 && gameRunning && player.health < 100) {
        player.regenTime --
        if (player.regenTime <= 0) {
            player.health ++
            player.regenTime = 100
        }
    }
}

function collideBullets () {
    bullets.forEach(bullet => {
        if (bullet.stat === "live") {
            enemies.forEach(enemy => {
                if (bullet.affil === "friend" && enemy.stat === "alive" && calcDist(bullet.x, bullet.y, enemy.x, enemy.y) <= 23) {
                    bullet.stat = "dead"
                    enemy.health -= playerBulletDamage[bullet.type]
                    rumble += 0.5
                }
            })
            if (bullet.affil === "foe" && calcDist(bullet.x, bullet.y, player.x, player.y) <= 23) {
                bullet.stat = "dead"
                rumble += 0.5
                if (player.iFrames < 1) {
                    player.health -= enemyBulletDamage[bullet.type]
                    player.iFrames = 40
                    rumble += 0.5
                    if (player.health < 0) {
                        player.health = 0
                    }
                }
            }
        }
    })
}

function passBulletTimer () {
    player.bulletTimer --
    if (!isTransitioning) {
        enemies.forEach(enemy => {
            enemy.bulletTimer --
        })
    }
}

function passPlayerIFrames () {
    player.iFrames --
}

function passRumble () {
    rumble -= 0.1
    if (rumble < 0) {
        rumble = 0
    }
    if (rumble > 3) {
        rumble = 3
    }
}

function checkNextWave () {
    if (gameLevel === 0) {
        if (level0Trans[waveNum-1] === undefined) {
            if (enemies.length <= 0) {
                defeated[gameLevel] = true
                isTransitioning = true
                transTo = 0
            }
        } else if(level0Trans[waveNum-1].type === "all") {
            if (enemies.length <= level0Trans[waveNum-1].num) {
                waveNum ++
                spawnWave(waveNum, gameLevel)
            }
        }  else {
            if (eTypeCount[level0Trans[waveNum-1].type] <= level0Trans[waveNum-1].num) {
                waveNum ++
                spawnWave(waveNum, gameLevel)
            }
        }
    } else if (gameLevel === 1) {
        if (level1Trans[waveNum-1] === undefined) {
            if (enemies.length <= 0) {
                console.log("All enemies of level defeated.")
            }
        } else if(level1Trans[waveNum-1].type === "all") {
            if (enemies.length <= level1Trans[waveNum-1].num) {
                waveNum ++
                spawnWave(waveNum, gameLevel)
            }
        }  else {
            if (eTypeCount[level1Trans[waveNum-1].type] <= level1Trans[waveNum-1].num) {
                waveNum ++
                spawnWave(waveNum, gameLevel)
            }
        }
    } else if (gameLevel === 2) {
        if (level2Trans[waveNum-1] === undefined) {
            if (enemies.length <= 0) {
                console.log("All enemies of level defeated.")
            }
        } else if(level2Trans[waveNum-1].type === "all") {
            if (enemies.length <= level2Trans[waveNum-1].num) {
                waveNum ++
                spawnWave(waveNum, gameLevel)
            }
        }  else {
            if (eTypeCount[level2Trans[waveNum-1].type] <= level2Trans[waveNum-1].num) {
                waveNum ++
                spawnWave(waveNum, gameLevel)
            }
        }
    } else if (gameLevel === 3) {
    } else if (gameLevel === 4) {
    } else if (gameLevel === 5) {
    }
    updateETypeCount()
}

function checkPlayerHealth () {
    if (player.health <= 0) {
        gameRunning = false
        gameState = 2
        if (waveNum > highScore) {
            highScore = waveNum
        }
    }
}

function checkEnemyHealth () {
    enemies.forEach(enemy => {
        if (enemy.health <= 0) {
            enemy.stat = "dead"
        }
    })
}

function updateETypeCount () {
    eTypeCount.forEach((count, eType) => {
        counter = 0
        enemies.forEach(enemy => {
            if (enemy.type === eType) {
                counter ++
            }
        })
        eTypeCount[eType] = counter
    })
}

function restart () {
    player.x = 300
    player.y = 300
    player.xVel = 0
    player.yVel = 0
    player.health = 100
    player.bulletTimer = 0
    player.iFrames = 0
    player.regenTime = 100
    waveNum = 1
    enemies = []
    bullets = []
    gameState = 0
    gameRunning = false
}

//Makes canvas and is useful for debugging
function setup () {
    createCanvas(600, 600)
    
}

//Runs repeatedly, most important stuff happens here
function draw () {
    background(255-Math.round(Math.random()*((100-player.health)/33)), 255-Math.round(Math.random()*((100-player.health)/33)), 255-Math.round(Math.random()*((100-player.health)/33)))
    
    if (gameRunning) {
        translate((2 * Math.random() * rumble) - rumble, (2 * Math.random() * rumble) - rumble)
        passRumble()
    }

    drawPowerups()
    drawBullets()
    drawEnemies()
    drawPlayer()

    drawUI()
    drawMenu()

    enemiesThink()

    driftText()

    if (gameRunning === true) {
        accPlayer()

        movePlayer()
        moveEnemies()
        moveBullets()

        playerShoot()
        enemiesShoot()

        playerRegen()

        collideBullets()


        passBulletTimer()
        passPlayerIFrames()

        checkNextWave()
    }

    transitionScene()

    checkBulletBounds()

    checkPlayerHealth()
    checkEnemyHealth()

    updateETypeCount()

    trimBullets()
    trimEnemies()
    trimPowerups()
}

function keyTyped () {
    if (keyCode === 32) {
        if (gameRunning === false && gameState === 1) {
            gameRunning = true
            gameState = 1
        } else if (gameState === 2) {
            transTo = 0
            isTransitioning = true
        } else {
            gameRunning = false
        }
    }
}

//called when player clicks, spawns a bullet
function playerShoot () {
    if (player.bulletTimer < 1 && gameRunning && mouseIsPressed && !isTransitioning) {
        spawnBullet(player.x, player.y, calcAngle(player.x, player.y, mouseX, mouseY), "friend", player.gunType)
        if (player.gunType === 3) {
            spawnBullet(player.x, player.y, calcAngle(player.x, player.y, mouseX, mouseY) + Math.PI/10, "friend", player.gunType)
            spawnBullet(player.x, player.y, calcAngle(player.x, player.y, mouseX, mouseY) - Math.PI/10, "friend", player.gunType)
        }
        if (player.gunType === 4) {
            rumble += 3
        }
        player.bulletTimer = playerReload[player.gunType]
    }
}