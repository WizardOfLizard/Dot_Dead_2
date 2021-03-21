

let infoEl = document.getElementById("info")

let infoTextEl = document.getElementById("infoText")

let infoDisplay = false

function infoClicked() {
    if (infoDisplay === false) {
        infoDisplay = true
        infoTextEl.classList.remove("remove")
        infoEl.innerHTML = "Hide this information and other boring stuff!"
    } else {
        infoDisplay = false
        infoTextEl.classList.add("remove")
        infoEl.innerHTML = "Information and other boring stuff!"
    }
}

infoEl.addEventListener("click", infoClicked)