window.addEventListener("load", function () {

  const model = {
    purrs:          0,    
    totalPurrs:     0,     
    clickValue:     1,    
    totalClicks:    0,     
    totalUpgrades:  0,     
    distinctOwned:  new Set(),  

    /* Auto-petter */
    autoInterval:   null,   
    autoSpeed:      0,     
    AUTO_SPEEDS:    [0, 2000, 750],  

    /* Combo */
    comboLevel:     1,      
    comboTimer:     null,   
    COMBO_RESET_MS: 2000,   

    /* Per-upgrade data */
    upgradeCounts: {
      ear_scratch:    0,
      chin_rub:       0,
      belly_rub:      0,
      full_massage:   0,
      robo_mk1:       0,
      robo_mk2:       0,
    },
    upgradePrices: {
      ear_scratch:    10,
      chin_rub:       50,
      belly_rub:      180,
      full_massage:   600,
      robo_mk1:       120,
      robo_mk2:       400,
    },
  };


  const UPGRADES = [
    {
      id:          "ear_scratch",
      icon:        "👂",
      name:        "Ear Scratch",
      baseDesc:    "+1 Purr / click",
      priceGrowth: 1.50,
      maxBuys:     Infinity,
      onBuy(m)     { m.clickValue += 1; },
      getDesc()    { return "+1 Purr/click  (owned: " + model.upgradeCounts.ear_scratch + ")"; },
    },
    {
      id:          "chin_rub",
      icon:        "🐱",
      name:        "Chin Rub",
      baseDesc:    "+3 Purrs / click",
      priceGrowth: 1.55,
      maxBuys:     Infinity,
      onBuy(m)     { m.clickValue += 3; },
      getDesc()    { return "+3 Purrs/click  (owned: " + model.upgradeCounts.chin_rub + ")"; },
    },
    {
      id:          "belly_rub",
      icon:        "🐾",
      name:        "Belly Rub",
      baseDesc:    "+8 Purrs / click",
      priceGrowth: 1.62,
      maxBuys:     Infinity,
      onBuy(m)     { m.clickValue += 8; },
      getDesc()    { return "+8 Purrs/click  (owned: " + model.upgradeCounts.belly_rub + ")"; },
    },
    {
      id:          "full_massage",
      icon:        "💆",
      name:        "Full-Body Massage",
      baseDesc:    "+25 Purrs / click",
      priceGrowth: 1.70,
      maxBuys:     Infinity,
      onBuy(m)     { m.clickValue += 25; },
      getDesc()    { return "+25 Purrs/click  (owned: " + model.upgradeCounts.full_massage + ")"; },
    },
    {
      id:          "robo_mk1",
      icon:        "🤖",
      name:        "Robo-Petter Mk I",
      baseDesc:    "Auto-pet every 2 s",
      priceGrowth: 2.5,
      maxBuys:     1,
      onBuy(m) {
        if (m.autoInterval !== null) { clearInterval(m.autoInterval); }
        m.autoSpeed    = 1;
        m.autoInterval = setInterval(autoPet, m.AUTO_SPEEDS[1]);
      },
      getDesc() {
        return model.upgradeCounts.robo_mk1 === 0
          ? "Starts auto-petting every 2 s"
          : "Active — pets every 2 s";
      },
    },
    {
      id:          "robo_mk2",
      icon:        "⚡",
      name:        "Robo-Petter Mk II",
      baseDesc:    "Upgrade to 0.75 s auto-pet",
      priceGrowth: 3.0,
      maxBuys:     1,
      onBuy(m) {
        if (m.autoInterval !== null) { clearInterval(m.autoInterval); }
        m.autoSpeed    = 2;
        m.autoInterval = setInterval(autoPet, m.AUTO_SPEEDS[2]);
      },
      getDesc() {
        return model.upgradeCounts.robo_mk2 === 0
          ? "Upgrade robo to 0.75 s (requires Mk I)"
          : "Active — pets every 0.75 s 🚀";
      },
    },
  ];


  const ACHIEVEMENTS = [
    {
      id:       "first_touch",
      icon:     "🐾",
      name:     "First Touch",
      tip:      "Pet the cat for the very first time.",
      unlocked: false,
      check(m)  { return m.totalClicks >= 1; },
    },
    {
      id:       "warm_paws",
      icon:     "💕",
      name:     "Warm Paws",
      tip:      "Reach 100 total Purrs.",
      unlocked: false,
      check(m)  { return m.totalPurrs >= 100; },
    },
    {
      id:       "upgrade_addict",
      icon:     "⚡",
      name:     "Upgrade Addict",
      tip:      "Buy your very first upgrade.",
      unlocked: false,
      check(m)  { return m.totalUpgrades >= 1; },
    },
    {
      id:       "combo_master",
      icon:     "🔥",
      name:     "Combo Master",
      tip:      "Hit a ×5 combo multiplier.",
      unlocked: false,
      check(m)  { return m.comboLevel >= 5; },
    },
    {
      id:       "robot_butler",
      icon:     "🤖",
      name:     "Robot Butler",
      tip:      "Activate the Robo-Petter.",
      unlocked: false,
      check(m)  { return m.autoSpeed >= 1; },
    },
    {
      id:       "purr_millionaire",
      icon:     "🌟",
      name:     "Purr Millionaire",
      tip:      "Earn 1,000 total Purrs.",
      unlocked: false,
      check(m)  { return m.totalPurrs >= 1000; },
    },
    {
      id:       "cat_kingdom",
      icon:     "👑",
      name:     "Cat Kingdom",
      tip:      "Earn 5,000 total Purrs.",
      unlocked: false,
      check(m)  { return m.totalPurrs >= 5000; },
    },
    {
      id:       "turbo_mode",
      icon:     "🚀",
      name:     "Turbo Mode",
      tip:      "Upgrade to Robo-Petter Mk II.",
      unlocked: false,
      check(m)  { return m.autoSpeed >= 2; },
    },
    {
      id:       "collector",
      icon:     "🎯",
      name:     "Collector",
      tip:      "Own 3 different upgrade types.",
      unlocked: false,
      check(m)  { return m.distinctOwned.size >= 3; },
    },
    {
      id:       "legendary",
      icon:     "💎",
      name:     "Legendary Petter",
      tip:      "Earn 20,000 total Purrs.",
      unlocked: false,
      check(m)  { return m.totalPurrs >= 20000; },
    },
  ];

  /* Milestones for progress bar */
  const MILESTONES = [100, 500, 1000, 2500, 5000, 10000, 20000, 50000, 100000];

  /* Cat emoji states */
  const CAT_NEUTRAL  = "😺";
  const CAT_HAPPY    = "😸";
  const CAT_LOVE     = "😻";
  const CAT_SLEEP    = "😴";
  const CAT_WOW      = "🤩";
  const catBtn          = document.getElementById("cat-btn");
  const catEmoji        = document.getElementById("cat-emoji");
  const glowRing        = document.getElementById("glow-ring");
  const comboBadge      = document.getElementById("combo-badge");
  const comboText       = document.getElementById("combo-text");
  const clickValDisplay = document.getElementById("click-val-display");
  const autoRateDisplay = document.getElementById("auto-rate-display");
  const comboValDisplay = document.getElementById("combo-val-display");
  const headerPurr      = document.getElementById("header-purr");
  const purrTotal       = document.getElementById("purr-total");
  const progFill        = document.getElementById("prog-fill");
  const progGlow        = document.getElementById("prog-glow");
  const msLabel         = document.getElementById("ms-label");
  const statUpgrades    = document.getElementById("stat-upgrades");
  const statAchievements= document.getElementById("stat-achievements");
  const statClicks      = document.getElementById("stat-clicks");
  const moodFill        = document.getElementById("mood-fill");
  const moodEmoji       = document.getElementById("mood-emoji");
  const shopList        = document.getElementById("shop-list");
  const achieveGrid     = document.getElementById("achieve-grid");
  const toast           = document.getElementById("toast");
  const toastIcon       = document.getElementById("toast-icon");
  const toastMsg        = document.getElementById("toast-msg");
  const helpBtn         = document.getElementById("help-btn");
  const helpModal       = document.getElementById("help-modal");
  const closeHelp       = document.getElementById("close-help");
  const pawLayer        = document.getElementById("paw-layer");

  let toastTimer        = null;


  (function spawnBgPaws() {
    var SYMBOLS = ["🐾", "🐾", "🐱", "✨"];
    for (var i = 0; i < 14; i++) {
      var el = document.createElement("div");
      el.className = "bg-paw";
      el.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      el.style.left = (Math.random() * 100) + "vw";
      var dur = 18 + Math.random() * 22;
      var delay = -(Math.random() * dur);
      el.style.animationDuration = dur + "s";
      el.style.animationDelay = delay + "s";
      el.style.fontSize = (0.8 + Math.random() * 1.2) + "rem";
      pawLayer.appendChild(el);
    }
  })();


  function initShop() {
    shopList.innerHTML = "";
    UPGRADES.forEach(function (upg) {
      var card = document.createElement("div");
      card.className = "upg-card upg-locked";
      card.dataset.id = upg.id;
      card.innerHTML =
        '<div class="upg-icon">' + upg.icon + '</div>' +
        '<div class="upg-info">' +
          '<div class="upg-name">' + upg.name + '</div>' +
          '<div class="upg-desc" id="ud-' + upg.id + '">' + upg.getDesc() + '</div>' +
        '</div>' +
        '<div class="upg-right">' +
          '<div class="upg-price" id="up-' + upg.id + '">' + fmt(model.upgradePrices[upg.id]) + ' Purrs</div>' +
          '<span class="upg-price-lbl">Cost</span>' +
        '</div>' +
        '<div class="upg-count" id="uc-' + upg.id + '">0</div>';

      card.addEventListener("click", function () { buyUpgrade(upg); });
      shopList.appendChild(card);
    });
  }

  function initAchievements() {
    achieveGrid.innerHTML = "";
    ACHIEVEMENTS.forEach(function (a) {
      var badge = document.createElement("div");
      badge.className = "achv-badge locked";
      badge.id = "achv-" + a.id;
      badge.title = a.tip;
      badge.innerHTML =
        '<div class="achv-icon">' + a.icon + '</div>' +
        '<div class="achv-name">' + a.name + '</div>';
      achieveGrid.appendChild(badge);
    });
  }



  /* Manual click */
  function handleCatClick(e) {
    model.totalClicks++;

    /* Combo update */
    if (model.comboTimer !== null) { clearTimeout(model.comboTimer); }
    if (model.comboLevel < model.MAX_COMBO) { model.comboLevel++; }
    model.comboTimer = setTimeout(resetCombo, model.COMBO_RESET_MS);

    var earned = model.clickValue * model.comboLevel;
    addPurrs(earned);

    /* Show happy kitty; resets 5-s timer on every click */
    showHappyKitty();

    /* Bounce animation on button */
    catBtn.classList.remove("pet-anim");
    void catBtn.offsetWidth;
    catBtn.classList.add("pet-anim");

    /* Glow ring excitement */
    glowRing.classList.toggle("excited", model.comboLevel >= 3);

    /* Floating number */
    spawnFloat(e.clientX, e.clientY, "+" + earned);

    updateView();
    checkAchievements();
  }

  /* Auto-pet tick */
  function autoPet() {
    var earned = model.clickValue;
    addPurrs(earned);
    showHappyKitty();
    updateView();
    checkAchievements();
  }

  /* Reset combo */
  function resetCombo() {
    model.comboLevel = 1;
    model.comboTimer = null;
    updateView();
  }

  /* Add purrs to model */
  function addPurrs(amount) {
    model.purrs      += amount;
    model.totalPurrs += amount;
  }

  /* Buy upgrade */
  function buyUpgrade(upg) {
    var price = model.upgradePrices[upg.id];
    var count = model.upgradeCounts[upg.id];

    if (count >= upg.maxBuys) { return; }
    if (model.purrs < price)  { return; }

    /* Deduct cost */
    model.purrs -= price;

    /* Increment counts */
    model.upgradeCounts[upg.id]++;
    model.totalUpgrades++;
    model.distinctOwned.add(upg.id);

    /* Effect */
    upg.onBuy(model);

    /* Escalate price */
    model.upgradePrices[upg.id] = Math.ceil(price * upg.priceGrowth);

    /* Shimmer on card */
    var card = shopList.querySelector('[data-id="' + upg.id + '"]');
    if (card) {
      card.classList.add("just-bought");
      card.addEventListener("animationend", function removeShimmer() {
        card.classList.remove("just-bought");
        card.removeEventListener("animationend", removeShimmer);
      });
    }

    updateView();
    checkAchievements();
  }


  function checkAchievements() {
    ACHIEVEMENTS.forEach(function (a) {
      if (a.unlocked) { return; }
      if (a.check(model)) {
        a.unlocked = true;
        var badge = document.getElementById("achv-" + a.id);
        if (badge) {
          badge.classList.remove("locked");
          badge.classList.add("unlocked");
        }
        showToast(a.icon, "Achievement unlocked: " + a.name + "!");
      }
    });
  }


  function showToast(icon, msg) {
    toastIcon.textContent = icon;
    toastMsg.textContent  = msg;
    toast.classList.remove("hidden");
    /* force reflow to restart transition */
    void toast.offsetWidth;
    toast.classList.add("show");

    if (toastTimer) { clearTimeout(toastTimer); }
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () { toast.classList.add("hidden"); }, 500);
    }, 3200);
  }

  function updateView() {
    /* Header purr count */
    headerPurr.textContent = fmt(model.purrs);
    purrTotal.textContent  = fmt(model.purrs);

    /* Cat stat bar */
    clickValDisplay.textContent = model.clickValue;
    comboValDisplay.textContent = "×" + model.comboLevel;

    var autoLabels = ["Off", "2 s", "0.75 s"];
    autoRateDisplay.textContent = autoLabels[model.autoSpeed];

    /* Combo badge */
    if (model.comboLevel >= 2) {
      comboBadge.classList.remove("hidden");
      comboText.textContent = "×" + model.comboLevel;
    } else {
      comboBadge.classList.add("hidden");
    }

    /* Milestone progress bar */
    var prev = getPrevMilestone();
    var next = getNextMilestone();
    if (next === null) {
      progFill.style.width = "100%";
      progGlow.style.width = "100%";
      msLabel.textContent  = "Max reached! 🎉";
    } else {
      var range = next - prev;
      var pct   = Math.min(100, Math.floor(((model.totalPurrs - prev) / range) * 100));
      progFill.style.width = pct + "%";
      progGlow.style.width = pct + "%";
      msLabel.textContent  = fmt(next) + " Purrs";
    }

    /* Stats pills */
    statUpgrades.textContent    = model.totalUpgrades;
    statAchievements.textContent = ACHIEVEMENTS.filter(function (a) { return a.unlocked; }).length;
    statClicks.textContent      = fmt(model.totalClicks);

    /* Cat mood (based on click value on a log scale) */
    var moodPct  = Math.min(100, Math.floor(Math.log2(model.clickValue + 1) / Math.log2(101) * 100));
    moodFill.style.width = moodPct + "%";
    var moodColors = [
      [0,  "#ffb3d9", "🤍"],
      [20, "#ff85bc", "🩷"],
      [40, "#ff4d9e", "💕"],
      [60, "#d580ff", "💖"],
      [80, "#ff2d78", "💗"],
    ];
    var moodEntry = moodColors[0];
    moodColors.forEach(function (mc) { if (moodPct >= mc[0]) { moodEntry = mc; } });
    moodFill.style.background = moodEntry[1];
    moodEmoji.textContent = moodEntry[2];

    /* Upgrade shop cards */
    UPGRADES.forEach(function (upg) {
      var card   = shopList.querySelector('[data-id="' + upg.id + '"]');
      if (!card)  { return; }
      var count  = model.upgradeCounts[upg.id];
      var price  = model.upgradePrices[upg.id];
      var maxed  = count >= upg.maxBuys;
      var afford = !maxed && model.purrs >= price;

      document.getElementById("ud-" + upg.id).textContent = upg.getDesc();
      document.getElementById("uc-" + upg.id).textContent = count;

      var priceEl = document.getElementById("up-" + upg.id);
      priceEl.textContent = maxed ? "Maxed Out" : fmt(price) + " Purrs";

      /* Disable Mk II if Mk I not owned */
      var locked = false;
      if (upg.id === "robo_mk2" && model.upgradeCounts.robo_mk1 === 0) { locked = true; }

      card.classList.remove("upg-locked", "upg-afford", "upg-maxed");
      if (maxed)       { card.classList.add("upg-maxed"); }
      else if (locked) { card.classList.add("upg-locked"); }
      else if (afford) { card.classList.add("upg-afford"); }
      else             { card.classList.add("upg-locked"); }
    });
  }


  /* Format large numbers */
  function fmt(n) {
    if (n >= 1e9)  { return (n / 1e9).toFixed(1) + "B"; }
    if (n >= 1e6)  { return (n / 1e6).toFixed(1) + "M"; }
    if (n >= 10000){ return (n / 1e3).toFixed(1) + "K"; }
    return String(n);
  }

  /* Milestone helpers */
  function getNextMilestone() {
    for (var i = 0; i < MILESTONES.length; i++) {
      if (model.totalPurrs < MILESTONES[i]) { return MILESTONES[i]; }
    }
    return null;
  }
  function getPrevMilestone() {
    var prev = 0;
    for (var i = 0; i < MILESTONES.length; i++) {
      if (model.totalPurrs < MILESTONES[i]) { return prev; }
      prev = MILESTONES[i];
    }
    return prev;
  }

  var kittyImg        = document.getElementById("kitty-img");
  var kittyHappyTimer = null;
  var HAPPY_DURATION  = 5000;  

  var KITTY_SLEEP = "img/sleepyKitty.jpg";
  var KITTY_HAPPY = "img/happyKitty.jpg";


  function showHappyKitty() {
    if (!kittyImg) { return; }
    kittyImg.src = KITTY_HAPPY;
    if (kittyHappyTimer) { clearTimeout(kittyHappyTimer); }
    kittyHappyTimer = setTimeout(function () {
      kittyImg.src = KITTY_SLEEP;
      kittyHappyTimer = null;
    }, HAPPY_DURATION);
  }


  function spawnFloat(cx, cy, text) {
    var el = document.createElement("div");
    el.className   = "float-num";
    el.textContent = text;
    var randX = (Math.random() - 0.5) * 50;
    el.style.left  = (cx + randX) + "px";
    el.style.top   = (cy - 20) + "px";
    document.body.appendChild(el);
    el.addEventListener("animationend", function () { el.remove(); });
  }

  catBtn.addEventListener("click", handleCatClick);

  helpBtn.addEventListener("click", function () {
    helpModal.classList.remove("hidden");
  });
  closeHelp.addEventListener("click", function () {
    helpModal.classList.add("hidden");
  });
  helpModal.addEventListener("click", function (e) {
    if (e.target === helpModal) { helpModal.classList.add("hidden"); }
  });


  initShop();
  initAchievements();
  updateView();

});
