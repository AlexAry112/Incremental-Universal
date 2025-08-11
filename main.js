// ---------- Utilities ----------
function $id(id) { return document.getElementById(id); }
function safeSet(id, content) {
  const el = $id(id);
  if (el) el.innerHTML = content;
}
function ensureDecimal(v, fallback = 0) {
  if (v instanceof Decimal) return v;
  if (typeof v === "string" || typeof v === "number") {
    try { return new Decimal(v); } catch { return new Decimal(fallback); }
  }
  return new Decimal(fallback);
}

// ---------- Default game data (Decimals where needed) ----------
var gameData = {
  particles: new Decimal(0),
  particlesPerClick: new Decimal(1),
  particlesPerClickCost: new Decimal(10),
  particlesPerClickLevel: 0,
  update: "0.0.45",
  lastTick: Date.now(),
  type: "scientific",
  SaveTime: 15,
  automaticParticleSpeed: new Decimal(1),
  particlesPerSecondCost: new Decimal(1000),
  particlesPerSecondLevel: 0,
  decentralizations: new Decimal(0),
  decentralizationCost: new Decimal(100000),
  _lastSaveTimestamp: Date.now(),
  
};

function format(numInput, type) {
  let num = ensureDecimal(numInput);
  if (num.eq(0)) return "0";
  if (num.lt(1000)) {
    return Number(num.toNumber()).toFixed(1);
  }

  let exponent = num.log10().floor();
  let mantissa = num.div(Decimal.pow(10, exponent));
  if (type === "scientific") {
    return mantissa.toFixed(2) + "e" + exponent.toString();
  } else if (type === "engineering") {
    let engExp = exponent.div(3).floor().times(3);
    let engMant = num.div(Decimal.pow(10, engExp));
    return engMant.toFixed(2) + "e" + engExp.toString();
  } else {
    return mantissa.toFixed(2) + "e" + exponent.toString();
  }
}

// ---------- UI Update ----------
function fullUpdate() {
  safeSet(
    "particlesObtained",
    format(gameData.particles, gameData.type) + " Particles"
  );

  safeSet(
    "perClickUpgrade",
    "Upgrade Particle Generation (Currently Level " +
      gameData.particlesPerClickLevel +
      ") Cost: " +
      format(gameData.particlesPerClickCost, gameData.type) +
      " Particles  Boost: +" +
      gameData.particlesPerClickLevel
  );

  safeSet("notationButton", gameData.type);

  safeSet("updateSaveTime", gameData.SaveTime);

  if (gameData.particlesPerSecondLevel + 1 <= 9) {
    safeSet(
      "perSecondUpgrade",
      "Upgrade Particle Generation Speed (Currently Level " +
        gameData.particlesPerSecondLevel +
        ") Cost: " +
        format(gameData.particlesPerSecondCost, gameData.type) +
        " Particles  Boost: -" +
        (gameData.particlesPerSecondLevel / 10)
    );
  } else {
    safeSet(
      "perSecondUpgrade",
      "Upgrade Particle Generation Speed (Currently Level 9) Cost: MAX  Boost: -" +
        (gameData.particlesPerSecondLevel / 10)
    );
  }

  safeSet(
    "decentralizationText",
    "(" +
      gameData.decentralizations +
      " decentralizations) Cost: " +
      format(gameData.decentralizationCost, gameData.type) +
      " Particles     Boost x" +
      Math.round(Decimal.pow(2, gameData.decentralizations))
  );

  const saveEl = $id("saveTime");
  if (saveEl) saveEl.value = gameData.SaveTime;
}


function update(id, content) {
  safeSet(id, content);
}

// ---------- Save / Load (Decimal-safe) ----------
function buildSaveObject() {
  return {
    particles: gameData.particles.toString(),
    particlesPerClick: gameData.particlesPerClick.toString(),
    particlesPerClickCost: gameData.particlesPerClickCost.toString(),
    particlesPerClickLevel: gameData.particlesPerClickLevel,
    update: gameData.update,
    lastTick: gameData.lastTick,
    type: gameData.type,
    SaveTime: gameData.SaveTime,
    automaticParticleSpeed: gameData.automaticParticleSpeed.toString(),
    particlesPerSecondCost: gameData.particlesPerSecondCost.toString(),
    particlesPerSecondLevel: gameData.particlesPerSecondLevel,
    decentralizations: gameData.decentralizations.toString(),
    decentralizationCost: gameData.decentralizationCost.toString(),
    _lastSaveTimestamp: Date.now()
  };
}

function saveGame() {
  try {
    localStorage.setItem("SaveData", JSON.stringify(buildSaveObject()));
    gameData._lastSaveTimestamp = Date.now();
  } catch (e) {
    console.error("Save failed:", e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem("SaveData");
    if (!raw) { fullUpdate(); return; }
    const save = JSON.parse(raw);

    if (typeof save.particles !== "undefined") gameData.particles = ensureDecimal(save.particles, 0);
    if (typeof save.particlesPerClick !== "undefined") gameData.particlesPerClick = ensureDecimal(save.particlesPerClick, 1);
    if (typeof save.particlesPerClickCost !== "undefined") gameData.particlesPerClickCost = ensureDecimal(save.particlesPerClickCost, 10);
    if (typeof save.particlesPerClickLevel !== "undefined") gameData.particlesPerClickLevel = save.particlesPerClickLevel;
    if (typeof save.update !== "undefined") gameData.update = save.update;
    if (typeof save.lastTick !== "undefined") gameData.lastTick = save.lastTick;
    if (typeof save.type !== "undefined") gameData.type = save.type;
    if (typeof save.SaveTime !== "undefined") gameData.SaveTime = save.SaveTime;
    if (typeof save.automaticParticleSpeed !== "undefined") gameData.automaticParticleSpeed = ensureDecimal(save.automaticParticleSpeed, 1);
    if (typeof save.particlesPerSecondCost !== "undefined") gameData.particlesPerSecondCost = ensureDecimal(save.particlesPerSecondCost, 1000);
    if (typeof save.particlesPerSecondLevel !== "undefined") gameData.particlesPerSecondLevel = save.particlesPerSecondLevel;
    if (typeof save.decentralizations !== "undefined") gameData.decentralizations = ensureDecimal(save.decentralizations, 0);
    if (typeof save.decentralizationCost !== "undefined") gameData.decentralizationCost = ensureDecimal(save.decentralizationCost, 100000);

    const now = Date.now();
    let diff = now - (save.lastTick || now);
    const MAX_OFFLINE = 24 * 60 * 60 * 1000;
    if (diff > 0) {
      if (diff > MAX_OFFLINE) diff = MAX_OFFLINE;
      const seconds = new Decimal(diff / 1000);
      const prodPerSecond = gameData.particlesPerClick.div(gameData.automaticParticleSpeed);
      gameData.particles = gameData.particles.plus(prodPerSecond.times(seconds));
    }

    fullUpdate();
  } catch (e) {
    console.error("Load failed:", e);
    fullUpdate();
  }
}

// ---------- Game functions ----------
function getParticle() {
  gameData.particles = gameData.particles.plus(getTotalparticlesPerClick());
  update("particlesObtained", format(gameData.particles, gameData.type) + " Particles");
}

function getTotalparticlesPerClick() {
  let decNum = 0;
  try { decNum = gameData.decentralizations.toNumber(); } catch { decNum = Number(gameData.decentralizations); }
  return gameData.particlesPerClick.times(Decimal.pow(2, decNum));
}

function changeNotation() {
  if (gameData.type === "scientific") gameData.type = "engineering";
  else gameData.type = "scientific";
  fullUpdate();
}

function buyParticlesPerClick() {
  if (gameData.particles.gte(gameData.particlesPerClickCost)) {
    gameData.particles = gameData.particles.minus(gameData.particlesPerClickCost);
    gameData.particlesPerClickCost = gameData.particlesPerClickCost.times(2);
    gameData.particlesPerClick = gameData.particlesPerClick.plus(1);
    gameData.particlesPerClickLevel += 1;
    fullUpdate();
  }
}

function buyParticlesPerSecond() {
  if (gameData.particles.gte(gameData.particlesPerSecondCost) && (gameData.particlesPerSecondLevel + 1) <= 9) {
    gameData.particles = gameData.particles.minus(gameData.particlesPerSecondCost);
    gameData.particlesPerSecondCost = gameData.particlesPerSecondCost.pow(1.1);
    gameData.automaticParticleSpeed = gameData.automaticParticleSpeed.minus(0.1);
    gameData.particlesPerSecondLevel += 1;
    fullUpdate();
  }
}

function decentralization() {
  if (gameData.particles.gte(gameData.decentralizationCost)) {
    gameData.particles = new Decimal(0);
    gameData.decentralizationCost = gameData.decentralizationCost.times(
      Decimal.pow(10, gameData.decentralizations)
    );
    gameData.decentralizations = gameData.decentralizations.plus(1);
    gameData.particles= new Decimal(0);
    gameData.particlesPerClick= new Decimal(1);
    gameData.particlesPerClickCost= new Decimal(10);
    gameData.particlesPerClickLevel= 0;
    gameData.automaticParticleSpeed= new Decimal(1);
    gameData.particlesPerSecondCost= new Decimal(1000);
    gameData.particlesPerSecondLevel= 0;
    fullUpdate();
  }
}

// ---------- Game loop ----------
var lastTick = Date.now();
function tickLoop() {
  const now = Date.now();
  let diffMs = now - (gameData.lastTick || now);
  const MAX_DIFF_MS = 60 * 60 * 1000;
  if (diffMs < 0) diffMs = 0;
  if (diffMs > MAX_DIFF_MS) diffMs = MAX_DIFF_MS;

  gameData.lastTick = now;

  const seconds = new Decimal(diffMs / 1000);
  const gain = getTotalparticlesPerClick().times(seconds).div(gameData.automaticParticleSpeed);
  gameData.particles = gameData.particles.plus(gain);

  update("particlesObtained", format(gameData.particles, gameData.type) + " Particles");
}

var mainGameLoop = setInterval(tickLoop, 50);

// ---------- Auto-save (robust, no interval reset) ----------
function autosaveWatcher() {
  const now = Date.now();
  if ((now - gameData._lastSaveTimestamp) / 1000 >= gameData.SaveTime) {
    saveGame();
  }
}
var autosaveLoop = setInterval(autosaveWatcher, 1000);

// ---------- Slider and tabs ----------
function updateSliderValue() {
  const el = $id("saveTime");
  if (!el) return;
  const v = parseInt(el.value);
  if (!isNaN(v) && v > 0) {
    gameData.SaveTime = v;
    update("updateSaveTime", gameData.SaveTime);
  }
}

function tab(tabName) {
  const tabs = ["MainMenu", "Settings", tabName];
  tabs.forEach(t => {
    const el = $id(t);
    if (el) el.style.display = "none";
  });
  const show = $id(tabName);
  if (show) show.style.display = "inline-block";
}

document.addEventListener("DOMContentLoaded", function () {
  loadGame();
  tab("MainMenu");
  const s = $id("saveTime");
  if (s) s.addEventListener("input", updateSliderValue);
  fullUpdate();
});

window.saveGame = saveGame;
window.loadGame = loadGame;
window.getParticle = getParticle;
window.buyParticlesPerClick = buyParticlesPerClick;
window.buyParticlesPerSecond = buyParticlesPerSecond;
window.changeNotation = changeNotation;
