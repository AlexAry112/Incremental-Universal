var gameData = {
  particles: 0,
  particlesPerClick: 1,
  particlesPerClickCost: 10,
  particlesPerClickLevel: 1,
  update: "0.0.1",
  lastTick: Date.now(),
  type: "scientific"
};

function fullUpdate() {
  document.getElementById("particlesObtained").innerHTML = format(gameData.particles, gameData.type) + " Particles";
  document.getElementById("perClickUpgrade").innerHTML = "Upgrade Particle Generation (Currently Level " 
      + gameData.particlesPerClickLevel + ") Cost: " + format(gameData.particlesPerClickCost, gameData.type) + " Particles";
  document.getElementById("notationButton").innerHTML = gameData.type
}

function update(id, content) {
  document.getElementById(id).innerHTML = content;
}

var savegame = JSON.parse(localStorage.getItem("SaveData"));
if (savegame !== null) {
    gameData = Object.assign({}, gameData, savegame);
    fullUpdate()
}

function getParticle() {
  gameData.particles += gameData.particlesPerClick
  update("particlesObtained", format(gameData.particles, gameData.type) + " Particles")
}

function changeNotation() {
  if (gameData.type == "scientific") {gameData.type = "engineering"} else if (gameData.type == "engineering") {gameData.type = "scientific"}
  fullUpdate()
}

function buyParticlesPerClick() {
  if (gameData.particles >= gameData.particlesPerClickCost) {
    gameData.particles -= gameData.particlesPerClickCost
    gameData.particlesPerClickCost *= 2
    gameData.particlesPerClick += 1
    gameData.particlesPerClickLevel += 1
    fullUpdate()
  }
}

var mainGameLoop = window.setInterval(function() {
  diff = Date.now() - gameData.lastTick;
  gameData.lastTick = Date.now()
  gameData.particles += gameData.particlesPerClick * (diff / 1000)
  update("particlesObtained", format(gameData.particles, gameData.type) + " Particles")
}, 1000)

function format(number, type) {
	let exponent = Math.floor(Math.log10(number))
	let mantissa = number / Math.pow(10, exponent)
	if (exponent < 3) return number.toFixed(1)
	if (type == "scientific") return mantissa.toFixed(2) + "e" + exponent
	if (type == "engineering") return (Math.pow(10, exponent % 3) * mantissa).toFixed(2) + "e" + (Math.floor(exponent / 3) * 3)
}

function tab(tab) {
  document.getElementById("MainMenu").style.display = "none"
  document.getElementById("Settings").style.display = "none"
  if (tab == "Settings") {
    document.getElementById(tab).style.display = "flex"
  } else {
    document.getElementById(tab).style.display = "inline-block"
  }
}
tab("MainMenu")

var saveGameLoop = window.setInterval(function() {
  localStorage.setItem("SaveData", JSON.stringify(gameData))
  console.log("Saved")
}, 15000)

if (typeof savegame.particles !== "undefined") gameData.particles = savegame.particles;
if (typeof savegame.particlesPerClick !== "undefined") gameData.particlesPerClick = savegame.particlesPerClick;
if (typeof savegame.particlesPerClickCost !== "undefined") gameData.particlesPerClickCost = savegame.particlesPerClickCost;
if (typeof savegame.particlesPerClickLevel !== "undefined") gameData.particlesPerClickLevel = savegame.particlesPerClickLevel;
if (typeof savegame.update !== "undefined") gameData.update = savegame.update;
if (typeof savegame.lastTick !== "undefined") gameData.lastTick = savegame.lastTick;
if (typeof savegame.type !== "undefined") gameData.type = savegame.type;