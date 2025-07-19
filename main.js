var gameData = {
  particles: 0,
  particlesPerClick: 1,
  particlesPerClickCost: 10,
  particlesPerClickLevel: 1,
  update: "0.0.1"
};



var savegame = JSON.parse(localStorage.getItem("SaveData"));
if (savegame !== null) {
    gameData = Object.assign({}, gameData, savegame);
    if (typeof savegame.particles !== "undefined") gameData.particles = savegame.particles;
    if (typeof savegame.particlesPerClick !== "undefined") gameData.particlesPerClick = savegame.particlesPerClick;
    if (typeof savegame.particlesPerClickCost !== "undefined") gameData.particlesPerClickCost = savegame.particlesPerClickCost;
    if (typeof savegame.particlesPerClickLevel !== "undefined") gameData.particlesPerClickLevel = savegame.particlesPerClickLevel;
    if (typeof savegame.update !== "undefined") gameData.update = savegame.update;
  updateUI();
}

function getParticle() {
  gameData.particles += gameData.particlesPerClick
  updateUI()
}

function buyParticlesPerClick() {
  if (gameData.particles >= gameData.particlesPerClickCost) {
    gameData.particles -= gameData.particlesPerClickCost
    gameData.particlesPerClickCost *= 2
    gameData.particlesPerClick += 1
    gameData.particlesPerClickLevel += 1
    updateUI()
  }
}

function updateUI() {
  document.getElementById("particlesObtained").innerHTML =
    gameData.particles + " Particles";
  document.getElementById("perClickUpgrade").innerHTML =
    "Upgrade Pickaxe (Currently Level " +
    gameData.particlesPerClickLevel +
    ") Cost: " +
    gameData.particlesPerClickCost +
    " Particles";

}function updateUI() {
  document.getElementById("particlesObtained").innerHTML =
    gameData.particles + " Particles";
  document.getElementById("perClickUpgrade").innerHTML =
    "Upgrade Pickaxe (Currently Level " +
    gameData.particlesPerClickLevel +
    ") Cost: " +
    gameData.particlesPerClickCost +
    " Particles";
}

var mainGameLoop = window.setInterval(function() {
  getParticle()
}, 1000)

var saveGameLoop = window.setInterval(function() {
  localStorage.setItem("SaveData", JSON.stringify(gameData))
  console.log("Saved")
}, 15000)