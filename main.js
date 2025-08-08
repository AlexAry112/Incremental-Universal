
var gameData = {
  particles: 0,
  particlesPerClick: 1,
  particlesPerClickCost: 10,
  particlesPerClickLevel: 0,
  update: "0.0.3",
  lastTick: Date.now(),
  type: "scientific",
  SaveTime: 15,
  automaticParticleSpeed: 1,
  particlesPerSecondCost: 1000,
  particlesPerSecondLevel: 0,
};



function fullUpdate() {
  document.getElementById("particlesObtained").innerHTML = format(gameData.particles, gameData.type) + " Particles";
  document.getElementById("perClickUpgrade").innerHTML = "Upgrade Particle Generation (Currently Level " 
      + gameData.particlesPerClickLevel + ") Cost: " + format(gameData.particlesPerClickCost, gameData.type) + " Particles" + "  Boost: +" + gameData.particlesPerClickLevel;
  document.getElementById("notationButton").innerHTML = gameData.type
  document.getElementById("updateSaveTime").innerHTML = gameData.SaveTime;
  if (gameData.particlesPerSecondLevel +1 <= 9) {
    document.getElementById("perSecondUpgrade").innerHTML = "Upgrade Particle Generation Speed (Currently Level " 
      + gameData.particlesPerSecondLevel + ") Cost: " + format(gameData.particlesPerSecondCost, gameData.type) + " Particles" + "  Boost: -" + gameData.particlesPerSecondLevel/10;
  } else {
    document.getElementById("perSecondUpgrade").innerHTML = "Upgrade Particle Generation Speed (Currently Level MAX" 
 + ") Cost: MAX" + "  Boost: -" + gameData.particlesPerSecondLevel/10;
  }
  
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

function buyParticlesPerSecond() {
  if (gameData.particles >= gameData.particlesPerSecondCost && (gameData.particlesPerSecondLevel + 1) <= 9) {
    gameData.particles -= gameData.particlesPerSecondCost
    gameData.particlesPerSecondCost = Math.pow(gameData.particlesPerSecondCost, 1.1)
    gameData.automaticParticleSpeed -= 0.1
    gameData.particlesPerSecondLevel += 1
    fullUpdate()
  }
}




var mainGameLoop = window.setInterval(function() {
  diff = Date.now() - gameData.lastTick;
  gameData.lastTick = Date.now()
  gameData.particles += gameData.particlesPerClick * ((diff/1000) / gameData.automaticParticleSpeed)
  update("particlesObtained", format(gameData.particles, gameData.type) + " Particles")
}, 2.5)

function format(number, type) {
  if (typeof number !== "number" || isNaN(number) || number === null) return "0";
  if (number !== 0) {
    let exponent = Math.floor(Math.log10(number));
    let mantissa = number / Math.pow(10, exponent);
    if (!isFinite(mantissa)) return "0";
    if (exponent < 3) return number.toFixed(1);
    if (type === "scientific")
      return mantissa.toFixed(2) + "e" + exponent;
    if (type === "engineering") {
      let engExponent = Math.floor(exponent / 3) * 3;
      let engMantissa = number / Math.pow(10, engExponent);
      return engMantissa.toFixed(2) + "e" + engExponent;
    }
  }

  return "0";
}


function updateSliderValue() {
  gameData.SaveTime = document.getElementById("saveTime").value;
  update("updateSaveTime", gameData.SaveTime)
}

function tab(tab) {
  document.getElementById("MainMenu").style.display = "none"
  document.getElementById("Settings").style.display = "none"
  document.getElementById(tab).style.display = "inline-block"
}
tab("MainMenu")

var saveGameLoop = window.setInterval(function() {
  localStorage.setItem("SaveData", JSON.stringify(gameData))
  console.log("Saved")
}, gameData.SaveTime * 500)

if (typeof savegame.particles !== "undefined") gameData.particles = savegame.particles;
if (typeof savegame.particlesPerClick !== "undefined") gameData.particlesPerClick = savegame.particlesPerClick;
if (typeof savegame.particlesPerClickCost !== "undefined") gameData.particlesPerClickCost = savegame.particlesPerClickCost;
if (typeof savegame.particlesPerClickLevel !== "undefined") gameData.particlesPerClickLevel = savegame.particlesPerClickLevel;
if (typeof savegame.update !== "undefined") gameData.update = savegame.update;
if (typeof savegame.lastTick !== "undefined") gameData.lastTick = savegame.lastTick;
if (typeof savegame.type !== "undefined") gameData.type = savegame.type;
if (typeof savegame.SaveTime !== "undefined") gameData.SaveTime = savegame.SaveTime;
if (typeof savegame.automaticParticleSpeed !== "undefined") gameData.automaticParticleSpeed = savegame.automaticParticleSpeed;