

//self explainitory
let gameRunning = false
let gameState = 0

let menuRoom = 0

let tutorialStage = 0
let tutorialTimer = 0

//settings
//integer
let volume = 5
//string:None/Low/Regular[default]
let rumbleFX = "Regular"
//string:Moody/Dark/Regular[default]
let brightness = "Regular"
//string:Disabled/Enabled[default]
let flashing = "Enabled"

//0-main, 1-level select, 2-directions, 3-options
let gameLevel = 0

//string
//options: campaign/level
let playType = undefined

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
//player guns: 0:default, 1:machine gun 2:sniper, 3:shotgun, 4:heavy cannon 
let playerReload = [30, 5, 55, 35, 60]
let playerBulletDamage = [30, 5, 50, 20, 80]

// enemy types: 0:regular, 1:speedster, 2:sniper, 3:shotgunner, 4:elite, 5:tank, 6:bomber, 7:gunner
let enemySpeed = [3, 6, 2, 3, 3, 2, 3, 1]
let enemyReload = [55, 35, 80, 60, 55, 65, 100, 80]
let enemyHealth = [30, 20, 40, 60, 80, 100, 40, 55]
let enemyBulletDamage = [20, 15, 35, 20, 20, 10, 40, 10]
let enemyPowChance = [{health:0.1, speed:0.1, gun:0.05}, {health:0.1, speed:0.2, gun:0.1}, {health:0.15, speed:0.15, gun:0.1}, {health:0.2, speed:0.1, gun:0.1}, {health:0.2, speed:0.2, gun:0.15}, {health:0.3, speed:0.05, gun:0.1}, {health:0.15, speed:0.05, gun:0.2}, {health:0.15, speed:0.1, gun:0.2}]

//visual variables
let rumble = 0

let textShift = 0
let textDrift = 0.5

let isTransitioning = false
let bright = 0
let brightChange = 2
let transTo = undefined
let menuTo = undefined
let slowTrans = false

let healGlow = 0

//Counts how many waves have been sent on player, used for difficulty and score
let waveNum = 1

let highScore = 0

//stores all data on the player
//postion(x, y), velocity(x, y), health, gun type, reload timer, and invulnerability frames
let player = {x:300, y:300, xVel:0, yVel:0, health:100, gunType:0, bulletTimer:0, iFrames: 0, regenTime: 100, speedBoost: 0, speedTimer: 0}

//enemies contains the positions, states, bullet timers, health, statuses, and types of all enemies
//Format: {x:number, y:number, state:unique by enemy, bulletTimer:number, health:number, stat:alive/dead, type:number, threat: number}
let enemies = []

//counts the number of each type of enemy
let eTypeCount = []

//powers contain the given powerups on the battle field
//format: {x:number, y:number, lifetime:number, type:string(health, speed, gun), gun(gun powerups only):number}
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
        enemies = enemies.filter((enemy, num) => {
            if (enemy.stat === "alive") {
                return true
            } else {
                chancePowerup(num)
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
            if (gameRunning) {
                power.lifetime ++
            }
            if (power.lifetime <= 250) {
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
}

function spawnPowerup (xPos, yPos, pType, gun) {
    if (pType === "gun") {
        powers.push({x:xPos, y:yPos, lifetime:0, type:pType, gun:gun})
    } else {
        powers.push({x:xPos, y:yPos, lifetime:0, type:pType})
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
                noStroke()
                if (enemy.bulletTimer <= 15 && flashing === "Enabled") {
                    fill(255, 255, 255, 50 * (enemy.bulletTimer % 5))
                    ellipse(enemy.x, enemy.y, 25, 25)
                }
                if (enemy.type === 4) {
                    fill (0, 0, 0, 100)
                    ellipse(enemy.x, enemy.y, 30, 30)
                }
                if (enemy.health < enemyHealth[enemy.type]) {
                    /*
                    fill(0, 0, 0)
                    rect(enemy.x - 10, enemy.y - 16, 20, 2)
                    */
                    fill(255, 0, 0)
                    rect(enemy.x - 10, enemy.y - 16, 20, 2)
                    fill(35, 194, 45)
                    rect(enemy.x - 10, enemy.y - 16, (enemy.health/enemyHealth[enemy.type]) * 20, 2)
                }
            }
        })
    }
}

function drawPowerups () {
    powers.forEach(power => {
        noStroke()
        fill(50, 107, 168, 255 - power.lifetime)
        if (power.type === "health") {
            fill(50, 168, 82, 255 - power.lifetime)
        }
        if (power.type === "speed") {
            fill(30, 211, 247, 255 - power.lifetime)
        }
        if (power.type === "gun") {
            fill(184, 2, 2, 255 - power.lifetime)
        }
        ellipse(power.x, power.y, 15, 15)
        if (power.type === "health") {
            fill(0, 0, 0, 255 - power.lifetime)
            textSize(15)
            textAlign(CENTER, CENTER)
            text("+", power.x, power.y + 1)
        }
        if (power.type === "speed") {
            fill(0, 0, 0, 255 - power.lifetime)
            beginShape();
            vertex(power.x + 2.75, power.y - 5);
            vertex(power.x - 3.5, power.y + 1.5);
            vertex(power.x - 1.25, power.y + 1.5);
            vertex(power.x - 2.75, power.y + 5);
            vertex(power.x + 2.75, power.y)
            vertex(power.x, power.y)
            endShape(CLOSE);
        }
        if (power.type === "gun") {
            fill(0, 0, 0, 255 - power.lifetime)
            ellipse(power.x, power.y, 9, 9)
            fill(184, 2, 2, 255 - power.lifetime)
            ellipse(power.x, power.y, 7, 7)
            textSize(20)
            textAlign(CENTER, CENTER)
            text("+", power.x, power.y + 1)
            fill(0, 0, 0, 255 - power.lifetime)
            textSize(19)
            text("+", power.x, power.y + 1)
            fill(184, 2, 2, 255 - power.lifetime)
            ellipse(power.x, power.y, 4, 4)
        }
    })
}

//draws bullets
function drawBullets () {
    if (bullets.length >= 1) {
        noStroke()
        bullets.forEach(bullet => {
            if (bullet.stat === "live") {
                if (bullet.affil === "friend") {
                    if (bullet.type === 2) {
                        for(let i = 0;i < 150;i ++) {
                            fill(7, 172, 232, 5)
                            ellipse(bullet.x - (Math.cos(bullet.ang) * i / 4), bullet.y - (Math.sin(bullet.ang) * i / 4), 12 - (i / 15), 12 - (i / 15))
                        }
                    }
                    fill(35, 194, 45)
                } else {
                    if (bullet.type === 2) {
                        for(let i = 0;i < 150;i ++) {
                            fill(147, 20, 201, 5)
                            ellipse(bullet.x - (Math.cos(bullet.ang) * i / 4), bullet.y - (Math.sin(bullet.ang) * i / 4), 12 - (i / 15), 12 - (i / 15))
                        }
                    }
                    fill(227, 127, 14)
                    if (bullet.type === 1) {
                        fill(8, 150, 12)
                    } else if (bullet.type === 2) {
                        fill(186, 11, 11)
                    } else if (bullet.type === 3) {
                        fill(199, 187, 14)
                    } else if (bullet.type === 5) {
                        fill(120, 7, 109)
                    } else if (bullet.type === 6) {
                        fill(4, 255, 0)
                    } else if (bullet.type === 7) {
                        fill(0, 0, 0)
                    }
                }
                ellipse(bullet.x, bullet.y, 10, 10)
                if (bullet.type === 4) {
                    fill(0, 0, 0, 50)
                    ellipse(bullet.x, bullet.y, 12, 12)
                }
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
    if (player.health > 0) {
        rect(300 - (player.health + ((100 - player.regenTime) / 100)) * 2, 25, (player.health + ((100 - player.regenTime) / 100))*4, 15)
        ellipse(300.5 - (player.health + ((100 - player.regenTime) / 100)) * 2, 32.5, 10, 15)
        ellipse(299.5 + (player.health + ((100 - player.regenTime) / 100)) * 2, 32.5, 10, 15)
    }
    if (player.iFrames > 0) {
        fill(255, 0, 0, 2*player.iFrames)
        rect(0, 0, 600, 600)
    }
    if (player.speedTimer > 0) {
        fill(30, 211, 247, .5*player.speedTimer)
        rect(0, 0, 600, 600)
    }
    if (healGlow > 0) {
        fill(35, 194, 45, healGlow)
        rect(0, 0, 600, 600)
    }
    if (gameState === 0) {
        fill(150, 150, 150, 100)
        rect(0, 0, 600, 600)
        fill(0, 0, 0)
        textAlign(CENTER, CENTER)
        textSize(40)
        text("Press Space to Start", 300, 150)
    } else {
        if (gameRunning === false) {
            if (gameState === 1) {
                fill(150, 150, 150, 100)
                rect(0, 0, 600, 600)
                fill(150, 150, 150, 100)
                rect(0, 0, 600, 600)
                fill(0, 0, 0)
                rect(100, 200, 400, 5)
                fill(0, 0, 0)
                textAlign(CENTER, CENTER)
                textSize(40)
                text("Game Paused", 300, 150)
                if (mouseX >= 150 && mouseX <= 450 && mouseY >= 200 && mouseY <= 275) {
                    fill(255, 255, 255, 10)
                    for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 250);i < 100;i += 2) {
                        ellipse(300, 250, 1.5*i, 0.75*i)
                    }
                }
                if (mouseX >= 150 && mouseX <= 450 && mouseY >= 275 && mouseY <= 325) {
                    fill(255, 255, 255, 10)
                    for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 300);i < 100;i += 2) {
                        ellipse(300, 300, 2*i, 0.75*i)
                    }
                }
                if (mouseX >= 150 && mouseX <= 450 && mouseY >= 325 && mouseY <= 400) {
                    fill(255, 255, 255, 10)
                    for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 350);i < 100;i += 2) {
                        ellipse(300, 350, 2*i, 0.75*i)
                    }
                }
                fill(0, 0, 0)
                textSize(30)
                text("Resume", 300, 250)
                text("Restart Level", 300, 300)
                text("Quit to Menu", 300, 350)
            } else {
                fill(150, 150, 150, 100)
                rect(0, 0, 600, 600)
                fill(0, 0, 0)
                rect(100, 250, 400, 5)
                textAlign(CENTER, CENTER)
                textSize(50)
                text("You Died", 300, 200)
                textSize(40)
                if (mouseX >= 150 && mouseX <= 450 && mouseY >= 250 && mouseY <= 325) {
                    fill(255, 255, 255, 10)
                    for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 300);i < 100;i += 2) {
                        ellipse(300, 300, 2.5*i, 0.75*i)
                    }
                }
                if (mouseX >= 50 && mouseX <= 550 && mouseY >= 325 && mouseY <= 400) {
                    fill(255, 255, 255, 10)
                    for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 300);i < 100;i += 2) {
                        ellipse(300, 350, 3*i, 0.75*i)
                    }
                }
                fill(0, 0, 0)
                text("Play Again", 300, 300)
                text("Return to Menu", 300, 350)
            }
        }
    }
}

function drawMenu () {
    if (gameState === 0) {
        if (menuRoom === 0) {
            background(140, 140, 140)
            noStroke()
            fill(0, 0, 0)
            rect(0, 0, 600, 5)
            rect(0, 0, 5, 600)
            rect(0, 595, 600, 5)
            rect(595, 0, 5, 600)
            textAlign(CENTER, CENTER)
            textSize(50)
            fill(0, 0, 0)
            text("Dot Dead 2", 300, 100 + textShift)
            textSize(15)
            text("Daniel L. Hensler", 300, 140 + textShift)
            if (mouseX >= 150 && mouseX <= 450 && mouseY >= 175 && mouseY <= 275 && !isTransitioning) {
                fill(255, 255, 255, 5)
                for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 225);i < 100;i += 2) {
                    ellipse(300, 225, 3.5*i, 0.75*i)
                }
            }
            if (mouseX >= 175 && mouseX <= 425 && mouseY >= 250 && mouseY <= 350 && !isTransitioning) {
                fill(255, 255, 255, 5)
                for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 300);i < 100;i += 2) {
                    ellipse(300, 300, 2.5*i, 0.75*i)
                }
            }
            if (mouseX >= 200 && mouseX <= 400 && mouseY >= 325 && mouseY <= 425 && !isTransitioning) {
                fill(255, 255, 255, 5)
                for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 375);i < 100;i += 2) {
                    ellipse(300, 375, 2*i, 0.75*i)
                }
            }
            if (mouseX >= 225 && mouseX <= 375 && mouseY >= 400 && mouseY <= 500 && !isTransitioning) {
                fill(255, 255, 255, 5)
                for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 450);i < 100;i += 2) {
                    ellipse(300, 450, 1.8*i, 0.75*i)
                }
            }
            fill(0, 0, 0)
            textAlign(CENTER, CENTER)
            textSize(40)
            text("Campaign Mode", 300, 225)
            text("Level Select", 300, 300)
            text("Directions", 300, 375)
            text("Settings", 300, 450)
        } else if (menuRoom === 1) {
            background(140, 140, 140)
            noStroke()
            fill(0, 0, 0)
            rect(0, 0, 600, 5)
            rect(0, 0, 5, 600)
            rect(0, 595, 600, 5)
            rect(595, 0, 5, 600)
            textAlign(CENTER, CENTER)
            textSize(50)
            fill(0, 0, 0)
            text("Level Select", 300, 100 + textShift)
            if (mouseX >= 200 && mouseX <= 400 && mouseY >= 150 && mouseY <= 200 && !isTransitioning) {
                fill(255, 255, 255, 5)
                for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 175);i < 100;i += 2) {
                    ellipse(300, 175, 2*i, 0.5*i)
                }
            }
            fill(0, 0, 0)
            textSize(20)
            text("Back to Main Menu", 300, 175)
            strokeWeight(5)
            stroke(0, 0, 0)
            fill(67, 219, 11)
            if (calcDist(mouseX, mouseY, 300, 300) <= 37 && !isTransitioning) {
                stroke(255, 255, 255)
                fill(186, 15, 15)
            }
            ellipse(300, 300, 75, 75)
            strokeWeight(3)
            fill(251, 255, 0)
            stroke(0, 0, 0)
            if (calcDist(mouseX, mouseY, 300, 300) <= 37 && !isTransitioning) {
                stroke(255, 255, 255)
                fill(0, 0, 0)
            }
            triangle(285, 285, 285, 315, 325, 300)
            fill(67, 219, 11)
            stroke(0, 0, 0)
            if (mouseX >= 200 && mouseX <= 225 && mouseY >= 285 && mouseY <= 315 && !isTransitioning) {
                stroke(255, 255, 255)
                fill(0, 0, 0)
            }
            triangle(225, 285, 225, 315, 200, 300)
            fill(67, 219, 11)
            stroke(0, 0, 0)
            if (mouseX >= 375 && mouseX <= 400 && mouseY >= 285 && mouseY <= 315 && !isTransitioning) {
                stroke(255, 255, 255)
                fill(0, 0, 0)
            }
            triangle(375, 285, 375, 315, 400, 300)
            fill(0, 0, 0)
            noStroke()
            textSize(40)
            text(`Level ${gameLevel}`, 300, 400 - textShift/2)
        } else if (menuRoom === 2) {
            background(200, 200, 200)
            noStroke()
            fill(0, 0, 0)
            rect(0, 0, 600, 5)
            rect(0, 0, 5, 600)
            rect(0, 595, 600, 5)
            rect(595, 0, 5, 600)
            textAlign(CENTER, CENTER)
            textSize(50)
            fill(0, 0, 0)
            text("How to play", 300, 100+textShift)
            textSize(25)
            fill(173, 129, 5)
            let tutorialMessage = "Hello."
            if (tutorialStage === 0) {
                if (tutorialTimer >= 1000) {
                    tutorialMessage = "Umm, please move along now, it's not difficult..."
                } else if (tutorialTimer >= 500) {
                    tutorialMessage = "Now, please attempt to move using either the WASD keys or the Arrow keys."
                } else if (tutorialTimer >= 250) {
                    tutorialMessage = "It is good that you have come to learn..."
                }
            } else if (tutorialStage === 1) {
                if (tutorialTimer >= 500) {
                    tutorialMessage = "Now please attempt to shoot by clicking, you aim where your mouse is."
                } else if (tutorialTimer >= 250) {
                    tutorialMessage = "Now moving is useful, but it is nowhere near enough to survive."
                } else if (tutorialTimer >= 0) {
                    tutorialMessage = "Very good..."
                } else if (tutorialTimer >= -250) {
                    tutorialMessage = "Ah, very eager I see..."
                }
            } else if (tutorialStage === 2) {
                if (tutorialTimer >= 750) {
                    tutorialMessage = "I will be watching with great interest..."
                    transTo = 0
                    menuTo = 0
                    brightChange = 1
                    slowTrans = true
                    isTransitioning = true
                } else if (tutorialTimer >= 500) {
                    tutorialMessage = "Go out, prove your worth, defeat your enemies."
                } else if (tutorialTimer >= 250) {
                    tutorialMessage = "Now I suppose you are ready..."
                } else if (tutorialTimer >= 0) {
                    tutorialMessage = "Excellent..."
                } else if (tutorialTimer >= -250) {
                    tutorialMessage = "I see you're excited..."
                } else if (tutorialTimer >= -500) {
                    tutorialMessage = "My, that was quick..."
                }
            } else {
                tutorialMessage = "I have no clue how you got here.  Don't be afraid, I'll send you back."
                if (tutorialTimer >= 250) {
                    transTo = 0
                    menuTo = 0
                    isTransitioning = true
                }
            }
            text(tutorialMessage, 50, 175 - textShift/2, 500)
            drawBullets()
            drawEnemies()
            drawPlayer()
            passTutorial()
        } else if (menuRoom === 3) {
            background(140, 140, 140)
            noStroke()
            fill(0, 0, 0)
            rect(0, 0, 600, 5)
            rect(0, 0, 5, 600)
            rect(0, 595, 600, 5)
            rect(595, 0, 5, 600)
            textAlign(CENTER, CENTER)
            textSize(50)
            fill(0, 0, 0)
            text("Settings", 300, 100)
            rect(100, 150, 400, 5)
            textSize(25)
            textAlign(LEFT, CENTER)
            text("Volume", 125, 175)
            text("Rumble FX", 125, 200)
            text("Brightness", 125, 225)
            text("Flashing", 125, 250)
            if (mouseX >= 400 && mouseX <= 450 && mouseY >= 155 && mouseY <= 195 && !isTransitioning) {
                fill(255, 255, 255, 5)
                for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 175);i < 100;i += 2) {
                    ellipse(425, 175, 0.25*i, 0.35*i)
                }
            }
            if (mouseX >= 400 && mouseX <= 450 && mouseY >= 180 && mouseY <= 220 && !isTransitioning) {
                fill(255, 255, 255, 5)
                for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 200);i < 100;i += 2) {
                    ellipse(425, 200, 1.2*i, 0.35*i)
                }
            }
            if (mouseX >= 400 && mouseX <= 450 && mouseY >= 205 && mouseY <= 245 && !isTransitioning) {
                fill(255, 255, 255, 5)
                for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 225);i < 100;i += 2) {
                    ellipse(425, 225, 1.2*i, 0.35*i)
                }
            }
            if (mouseX >= 400 && mouseX <= 450 && mouseY >= 230 && mouseY <= 270 && !isTransitioning) {
                fill(255, 255, 255, 5)
                for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 250);i < 100;i += 2) {
                    ellipse(425, 250, 1.2*i, 0.35*i)
                }
            }
            fill(0, 0, 0)
            textAlign(CENTER, CENTER)
            text(volume, 425, 175)
            text(rumbleFX, 425, 200)
            text(brightness, 425, 225)
            text(flashing, 425, 250)
            if (mouseX >= 250 && mouseX <= 350 && mouseY >= 275 && mouseY <= 325 && !isTransitioning) {
                fill(255, 255, 255, 5)
                for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 300);i < 100;i += 2) {
                    ellipse(300, 300, 3*i, 0.55*i)
                }
            }
            if (mouseX >= 250 && mouseX <= 350 && mouseY >= 325 && mouseY <= 375 && !isTransitioning) {
                fill(255, 255, 255, 5)
                for(let i = 0 + calcDist(mouseX, mouseY, mouseX, 350);i < 100;i += 2) {
                    ellipse(300, 350, 1*i, 0.55*i)
                }
            }
            fill(0, 0, 0)
            textSize(35)
            textAlign(CENTER, CENTER)
            text("Reset Defaults", 300, 300)
            text("Back", 300, 350)
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
            if (slowTrans) {
                brightChange = -1
            }
            if (transTo === 1) {
                restart()
                gameState = 1
                gameRunning = true
                changeDelay = 25
                spawnWave(waveNum, gameLevel)
                transTo = undefined
            }
            if (transTo === 0) {
                restart()
                transTo = undefined
                gameRunning = false
            }
            if (menuTo === 0) {
                menuRoom = 0
                menuTo = undefined
            }
            if (menuTo === 1) {
                menuRoom = 1
                menuTo = undefined
            }
            if (menuTo === 2) {
                menuRoom = 2
                menuTo = undefined
                gameRunning = true
            }
            if (menuTo === 3) {
                menuRoom = 3
                menuTo = undefined
            }
        }
        if (bright <= 0 && brightChange < 0) {
            bright = 0
            brightChange = 2
            slowTrans = false
            isTransitioning = false
        }
    }
}

function accPlayer () {
    //governs UP and W keys
    if (player.yVel > -playerSpeed - player.speedBoost && keyIsDown(87)) {
        player.yVel -= playerSpeed/5
    } else if (player.yVel > -playerSpeed - player.speedBoost && keyIsDown(38)) {
        player.yVel -= playerSpeed/5
    }
    //governs LEFT and A keys
    if (player.xVel > -playerSpeed - player.speedBoost && keyIsDown(65)) {
        player.xVel -= playerSpeed/5
    } else if (player.xVel > -playerSpeed - player.speedBoost && keyIsDown(37)) {
        player.xVel -= playerSpeed/5
    }
    //governs DOWN and S keys
    if (player.yVel < playerSpeed + player.speedBoost && keyIsDown(83)) {
        player.yVel += playerSpeed/5
    } else if (player.yVel < playerSpeed + player.speedBoost && keyIsDown(40)) {
        player.yVel += playerSpeed/5
    }
    //governs RIGHT and D keys
    if (player.xVel < playerSpeed + player.speedBoost && keyIsDown(68)) {
        player.xVel += playerSpeed/5
    } else if (player.xVel < playerSpeed + player.speedBoost && keyIsDown(39)) {
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

function chancePowerup (eNum) {
    let chance = Math.random()
    let gun = Math.round(Math.random()*(playerReload.length-1))
    if (chance <= enemyPowChance[enemies[eNum].type].health) {
        spawnPowerup(enemies[eNum].x, enemies[eNum].y, "health", undefined)
    } else if (chance <= enemyPowChance[enemies[eNum].type].health + enemyPowChance[enemies[eNum].type].speed) {
        spawnPowerup(enemies[eNum].x, enemies[eNum].y, "speed", undefined)
    } else if (chance <= enemyPowChance[enemies[eNum].type].health + enemyPowChance[enemies[eNum].type].speed + enemyPowChance[enemies[eNum].type].gun) {
        spawnPowerup(enemies[eNum].x, enemies[eNum].y, "gun", gun)
    }
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
        } else if (bullet.affil === "foe" && bullet.type === 2) {
            bullet.x += bulletSpeed*Math.cos(bullet.ang)*1.2
            bullet.y += bulletSpeed*Math.sin(bullet.ang)*1.2
        } else if (bullet.affil === "friend" && bullet.type === 2) {
            bullet.x += bulletSpeed*Math.cos(bullet.ang)*1.5
            bullet.y += bulletSpeed*Math.sin(bullet.ang)*1.5
        } else if (bullet.affil === "friend" && bullet.type === 4) {
            bullet.x += bulletSpeed*Math.cos(bullet.ang)/1.25
            bullet.y += bulletSpeed*Math.sin(bullet.ang)/1.25
        } else {
            bullet.x += bulletSpeed*Math.cos(bullet.ang)
            bullet.y += bulletSpeed*Math.sin(bullet.ang)
        }
    })
}

function driftPowUps () {
    powers.forEach(power => {
        if (calcDist(power.x, power.y, player.x, player.y) <= 100) {
            power.x += Math.cos(calcAngle(power.x, power.y, player.x, player.y)) * 1
            power.y += Math.sin(calcAngle(power.x, power.y, player.x, player.y)) * 1
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

function collidePowerups () {
    powers.forEach(power => {
        if(calcDist(power.x, power.y, player.x, player.y) <= 20) {
            if (power.type === "health") {
                healGlow = 100
                if (player.health >= 70) {
                    player.health = 100
                } else {
                    player.health += 30
                }
            }
            if (power.type === "speed") {
                player.speedBoost = 3
                player.speedTimer = 150
            }
            if (power.type === "gun") {
                player.gunType = power.gun
            }
            power.lifetime = 9999999
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

function passPowEffects () {
    if (player.speedTimer > 0) {
        player.speedTimer --
    }
    if (healGlow > 0) {
        healGlow --
    }
    if (player.speedTimer <= 0) {
        player.speedTimer = 0
        player.speedBoost = 0
    }
}

function passTutorial () {
    tutorialTimer ++
    if (keyIsDown && (keyCode === 38 || keyCode === 37 || keyCode === 40 || keyCode === 39 || keyCode === 87 || keyCode === 65 || keyCode === 83 || keyCode === 68) && tutorialStage === 0) {
        tutorialStage = 1
        if (tutorialTimer >= 500) {
            tutorialTimer = 0
        } else {
            tutorialTimer = -250
        }
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

function drawBrightness () {
    noStroke()
    if (brightness === "Dark") {
        fill(0, 0, 0, 50)
        rect(0, 0, 600, 600)
    }
    if (brightness === "Moody") {
        fill(0, 0, 0, 100)
        rect(0, 0, 600, 600)
    }
}

function restart () {
    player = {x:300, y:300, xVel:0, yVel:0, health:100, gunType:0, bulletTimer:0, iFrames: 0, regenTime: 100, speedBoost: 0, speedTimer: 0}
    waveNum = 1
    enemies = []
    bullets = []
    gameState = 0
    gameRunning = false
    tutorialTimer = 0
    tutorialStage = 0
}

//Makes canvas and is useful for debugging
function setup () {
    createCanvas(600, 600)
}

//Runs repeatedly, most important stuff happens here
function draw () {

    if (flashing === "Enabled") {
        background(255-Math.round(Math.random()*((100-player.health)/20)), 255-Math.round(Math.random()*((100-player.health)/20)), 255-Math.round(Math.random()*((100-player.health)/20)))
    } else {
        background(255, 255, 255)
    }
    
    if (gameRunning) {
        if (rumbleFX === "Regular") {
            translate((2 * Math.random() * rumble) - rumble, (2 * Math.random() * rumble) - rumble)
        } else if (rumbleFX === "Low") {
            translate((Math.random() * rumble) - rumble/2, (Math.random() * rumble) - rumble/2)
        }
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

        driftPowUps()

        playerShoot()
        enemiesShoot()

        playerRegen()

        collideBullets()
        collidePowerups()

        passBulletTimer()
        passPlayerIFrames()
        passPowEffects()

        if (gameState === 1) {
            checkNextWave()
        }
    }

    transitionScene()

    checkBulletBounds()

    checkPlayerHealth()
    checkEnemyHealth()

    updateETypeCount()

    trimBullets()
    trimEnemies()
    trimPowerups()

    drawBrightness()
}

function keyTyped () {
    if (keyCode === 32 && gameState === 1) {
        gameRunning = false
    }
    if (keyCode === 75 && gameState === 1) {
        player.health = 0
        player.iFrames = 50
        console.log("Player killed.")
    }
    if (keyCode === 49 && gameState === 1) {
        player.gunType = 1
    }
    if (keyCode === 50 && gameState === 1) {
        player.gunType = 2
    }
    if (keyCode === 51 && gameState === 1) {
        player.gunType = 3
    }
    if (keyCode === 52 && gameState === 1) {
        player.gunType = 4
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
        if (player.gunType === 1) {
            rumble -= 0.3
        }
        player.bulletTimer = playerReload[player.gunType]
    }
}

function mouseClicked () {
    if (gameState === 0) {
        if (menuRoom === 0) {
            if (mouseX >= 175 && mouseX <= 425 && mouseY >= 275 && mouseY <= 325 && !isTransitioning) {
                transTo = 0
                menuTo = 1
                isTransitioning = true
            }
            if (mouseX >= 200 && mouseX <= 400 && mouseY >= 350 && mouseY <= 400 && !isTransitioning) {
                transTo = 0
                menuTo = 2
                isTransitioning = true
            }
            if (mouseX >= 200 && mouseX <= 400 && mouseY >= 425 && mouseY <= 475 && !isTransitioning) {
                transTo = 0
                menuTo = 3
                isTransitioning = true
            }
        } else if (menuRoom === 1) {
            if (calcDist(mouseX, mouseY, 300, 300) <= 37 && !isTransitioning) {
                isTransitioning = true
                transTo = 1
            }
            if (mouseX >= 200 && mouseX <= 400 && mouseY >= 160 && mouseY <= 190 && !isTransitioning) {
                isTransitioning = true
                menuTo = 0
                transTo = 0
            }
            if (mouseX >= 200 && mouseX <= 225 && mouseY >= 285 && mouseY <= 315 && !isTransitioning) {
                if (gameLevel === 1) {
                    gameLevel = 5
                } else {
                    gameLevel --
                }
            }
            if (mouseX >= 375 && mouseX <= 400 && mouseY >= 285 && mouseY <= 315 && !isTransitioning) {
                if (gameLevel === 5) {
                    gameLevel = 1
                } else {
                    gameLevel ++
                }
            }
        } else if (menuRoom === 2) {
            if (tutorialStage === 1) {
                tutorialStage = 2
                if (tutorialTimer >= 500) {
                    tutorialTimer = 0
                } else if (tutorialTimer < 0)  {
                    tutorialTimer = -500
                } else {
                    tutorialTimer = -250
                }
            }
        } else if (menuRoom === 3) {
            if (mouseX >= 250 && mouseX <= 350 && mouseY >= 325 && mouseY <= 375 && !isTransitioning) {
                transTo = 0
                menuTo = 0
                isTransitioning = true
            }
            if (mouseX >= 250 && mouseX <= 350 && mouseY >= 275 && mouseY <= 325 && !isTransitioning) {
                volume = 5
                rumbleFX = "Regular"
                brightness = "Regular"
                flashing = "Enabled"
            }
            if (mouseX >= 400 && mouseX <= 450 && mouseY >= 155 && mouseY <= 180) {
                if (volume < 10) {
                    volume ++
                } else {
                    volume = 0
                }
            }
            if (mouseX >= 400 && mouseX <= 450 && mouseY >= 195 && mouseY <= 205) {
                if (rumbleFX === "Regular") {
                    rumbleFX = "None"
                } else if (rumbleFX === "None") {
                    rumbleFX = "Low"
                } else if (rumbleFX === "Low") {
                    rumbleFX = "Regular"
                }
            }
            if (mouseX >= 400 && mouseX <= 450 && mouseY >= 220 && mouseY <= 230) {
                if (brightness === "Regular") {
                    brightness = "Moody"
                } else if (brightness === "Moody") {
                    brightness = "Dark"
                } else if (brightness === "Dark") {
                    brightness = "Regular"
                }
            }
            if (mouseX >= 400 && mouseX <= 450 && mouseY >= 245 && mouseY <= 270) {
                if (flashing === "Enabled") {
                    flashing = "Disabled"
                } else if (flashing === "Disabled") {
                    flashing = "Enabled"
                }
            }
        }
    } else if (gameState === 1) {
        if (!gameRunning) {
            if (mouseX >= 230 && mouseX <= 470 && mouseY >= 230 && mouseY <= 370) {
                gameRunning = true
            }
            if (mouseX >= 200 && mouseX <= 400 && mouseY >= 280 && mouseY <= 320) {
                transTo = 1
                isTransitioning = true
            }
            if (mouseX >= 200 && mouseX <= 400 && mouseY >= 330 && mouseY <= 370) {
                transTo = 0
                menuTo = 0
                isTransitioning = true
            }
        }
    } else if (gameState === 2) {
        if (mouseX >= 150 && mouseX <= 450 && mouseY >= 280 && mouseY <= 320) {
            transTo = 1
            isTransitioning = true
        }
        if (mouseX >= 150 && mouseX <= 450 && mouseY >= 330 && mouseY <= 370) {
            transTo = 0
            isTransitioning = true
        }
    }
}