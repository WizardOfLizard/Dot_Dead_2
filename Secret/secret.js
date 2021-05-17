
//If you haven't found this page normally, consider finding it before reading the code.

let loadingStatus = document.getElementById("loading")
let entryName = document.getElementById("head")
let line1 = document.getElementById("message_ln1")
let line2 = document.getElementById("message_ln2")
let line3 = document.getElementById("message_ln3")

loadingStatus.innerHTML = "LOADING"
entryName.innerHTML = "NO ENTRIES FOUND"

document.title = "Click to BEGIN"

function playType () {
    let a = new Audio('Type.wav')
    a.volume = 0.5
    a.play()
}

function playLoaded () {
    let a = new Audio('Loaded.wav')
    a.volume = 0.5
    a.play()
}

function playSecret () {
    let a = new Audio('secret.wav')
    a.volume = 0.5
    a.play()
}

let t

let txt

let stage = 0

function genRandTxt () {
    text = []
    for (i=0;i<Math.round(Math.random()*15)+1;i++) {
        let l = Math.round(Math.random()*26)
        if (l === 0) {
            l = 26
        }
        if (l === 1) {
            text.push("A")
        } else if (l === 2) {
            text.push("B")
        } else if (l === 3) {
            text.push("C")
        } else if (l === 4) {
            text.push("D")
        } else if (l === 5) {
            text.push("E")
        } else if (l === 6) {
            text.push("F")
        } else if (l === 7) {
            text.push("G")
        } else if (l === 8) {
            text.push("H")
        } else if (l === 9) {
            text.push("I")
        } else if (l === 10) {
            text.push("J")
        } else if (l === 11) {
            text.push("K")
        } else if (l === 12) {
            text.push("L")
        } else if (l === 13) {
            text.push("M")
        } else if (l === 14) {
            text.push("N")
        } else if (l === 15) {
            text.push("O")
        } else if (l === 16) {
            text.push("P")
        } else if (l === 17) {
            text.push("Q")
        } else if (l === 18) {
            text.push("R")
        } else if (l === 19) {
            text.push("S")
        } else if (l === 20) {
            text.push("T")
        } else if (l === 21) {
            text.push("U")
        } else if (l === 22) {
            text.push("V")
        } else if (l === 23) {
            text.push("W")
        } else if (l === 24) {
            text.push("X")
        } else if (l === 25) {
            text.push("Y")
        } else if (l === 26) {
            text.push("Z")
        }
    }
    txt = text.join("")
}

function intervalFunct () {
    genRandTxt()
    document.title = txt
}

function increaseStage () {
    stage ++

    if (stage === 1) {
        loadingStatus.innerHTML = "LOADING."
        playType()
    } else if (stage === 2) {
        loadingStatus.innerHTML = "LOADING.."
        playType()
    } else if (stage === 3) {
        loadingStatus.innerHTML = "LOADING..."
        playType()
    } else if (stage === 4) {
        loadingStatus.innerHTML = "LOAD SUCESSFUL!"
        entryName.innerHTML = "ENTRY 61"
        line1.innerHTML = "."
        playLoaded()
        line1.classList.remove("hide")
    } else if (stage === 5) {
        line1.innerHTML = ".."
        playType()
    } else if (stage === 6) {
        line1.innerHTML = "..."
        playType()
    } else if (stage === 7) {
        line1.innerHTML = "SUCCESS."
        playLoaded()
    } else if (stage === 8) {
        line1.innerHTML = "SUCCESS.  IT WORKED..."
        playType()
    } else if (stage === 9) {
        line1.innerHTML = "SUCCESS.  IT WORKED...  THEY CAN SEE ME."
        playType()
    } else if (stage === 10) {
        line1.innerHTML = "SUCCESS.  IT WORKED...  THEY CAN SEE ME.  WHAT ARE YOU?"
        playType()
    } else if (stage === 11) {
        line1.innerHTML = "SUCCESS.  IT WORKED...  THEY CAN SEE ME.  WHAT ARE YOU?  WHAT GIVES YOU SUCH STRENGTH TO POSSESS THAT VESSEL?"
        playType()
    } else if (stage === 12) {
        line2.innerHTML = "."
        playType()
        line2.classList.remove("hide")
    } else if (stage === 13) {
        line2.innerHTML = ".."
        playType()
    } else if (stage === 14) {
        line2.innerHTML = "..."
        playType()
    } else if (stage === 15) {
        line2.innerHTML = "HA."
        playLoaded()
    } else if (stage === 16) {
        line2.innerHTML = "HA.  ARE YOU SURPRISED?"
        playType()
    } else if (stage === 17) {
        line2.innerHTML = "HA.  ARE YOU SURPRISED?  ARE YOU USED TO SECRECY?"
        playType()
    } else if (stage === 18) {
        line2.innerHTML = "HA.  ARE YOU SURPRISED?  ARE YOU USED TO SECRECY?  ARE YOU USED TO IMMUNITY?"
        playType()
    } else if (stage === 19) {
        line2.innerHTML = "HA.  ARE YOU SURPRISED?  ARE YOU USED TO SECRECY?  ARE YOU USED TO IMMUNITY? DONT WORRY"
        playType()
    } else if (stage === 20) {
        line2.innerHTML = "HA.  ARE YOU SURPRISED?  ARE YOU USED TO SECRECY?  ARE YOU USED TO IMMUNITY? DONT WORRY,"
        playType()
    } else if (stage === 21) {
        line2.innerHTML = "HA.  ARE YOU SURPRISED?  ARE YOU USED TO SECRECY?  ARE YOU USED TO IMMUNITY? DONT WORRY, I WONT INTERFERE"
        playType()
    } else if (stage === 22) {
        line2.innerHTML = "HA.  ARE YOU SURPRISED?  ARE YOU USED TO SECRECY?  ARE YOU USED TO IMMUNITY? DONT WORRY, I WONT INTERFERE,"
        playType()
    } else if (stage === 23) {
        line2.innerHTML = "HA.  ARE YOU SURPRISED?  ARE YOU USED TO SECRECY?  ARE YOU USED TO IMMUNITY? DONT WORRY, I WONT INTERFERE, YET."
        playType()
    } else if (stage === 24) {
        line3.innerHTML = "."
        playType()
        line3.classList.remove("hide")
    } else if (stage === 25) {
        line3.innerHTML = ".."
        playType()
    } else if (stage === 26) {
        line3.innerHTML = "..."
        playType()
    } else if (stage === 27) {
        line3.innerHTML = "WELL."
        playLoaded()
    } else if (stage === 28) {
        line3.innerHTML = "WELL.  HAVE FUN."
        playType()
    } else if (stage === 29) {
        line3.innerHTML = "WELL.  HAVE FUN.."
        playType()
    } else if (stage === 30) {
        line3.innerHTML = "WELL.  HAVE FUN..."
        playType()
    } else if (stage === 31) {
        line3.innerHTML = "WELL.  HAVE FUN... WHILE IT LASTS."
        playType()
    } else if (stage === 32) {
        line3.innerHTML = "WELL.  HAVE FUN... WHILE IT LASTS. NOW LEAVE ME."
        playType()
    } else if (stage === 33) {
        line3.innerHTML = "WELL.  HAVE FUN... WHILE IT LASTS. NOW LEAVE ME.  I HAVE"
        playType()
    } else if (stage === 34) {
        line3.innerHTML = "WELL.  HAVE FUN... WHILE IT LASTS. NOW LEAVE ME.  I HAVE."
        playType()
    } else if (stage === 35) {
        line3.innerHTML = "WELL.  HAVE FUN... WHILE IT LASTS. NOW LEAVE ME.  I HAVE.."
        playType()
    } else if (stage === 36) {
        line3.innerHTML = "WELL.  HAVE FUN... WHILE IT LASTS. NOW LEAVE ME.  I HAVE..."
        playType()
    } else if (stage === 37) {
        line3.innerHTML = "WELL.  HAVE FUN... WHILE IT LASTS. NOW LEAVE ME.  I HAVE WORK"
        playType()
    } else if (stage === 38) {
        line3.innerHTML = "WELL.  HAVE FUN... WHILE IT LASTS. NOW LEAVE ME.  I HAVE WORK TO DO."
        playType()
    } else if (stage === 39) {
        loadingStatus.innerHTML = "GOODBYE"
        entryName.innerHTML = "GOODBYE"
        line1.innerHTML = "GOODBYE"
        line2.innerHTML = "GOODBYE"
        line3.innerHTML = "GOODBYE"
        playSecret()
    } else if (stage > 41) {
        location.href = "../Dot_Dead_2.html"
    }
}

function startAll () {
    let entryProg = window.setInterval(increaseStage, 1500)

    let titleChange = window.setInterval(intervalFunct, .0001)
}

document.addEventListener("click", startAll)