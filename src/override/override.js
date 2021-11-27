// Base Code by Daniel Eden, on chrome store & github as Lucid
// Complete Redesign & custom remake by Alfie Ranstead
// If you want to make your own redesign go to https://github.com/Lucid-Toys/chrome-lucid and git clone it, then go Wild!
// alternatively you can git clone my code and do to it as you please

// Define global funcs
function updateStore(storeKey, data) {
  let obj = {};
  obj[storeKey] = JSON.stringify(data);
  chrome.storage.sync.set(obj);
}

function readStore(storeKey, cb) {
  chrome.storage.sync.get(storeKey, (result) => {
    let d = null;

    if (result[storeKey]) d = JSON.parse(result[storeKey]);

    // Make sure we got an object back, run callback
    if (typeof d === "object") cb(d);
  });
}

// Set up constants
const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const key = "rhugtkeldibnridrlerlgcrrdvneevit";

// Set up the store for our data
// We want to track the notepad's contents and whether or not the human's current
// location is in darkness.
let defaultData = {
  notepadContent: "",
};

// >= v0.0.3 uses an object to store notepad content
// >= v1.1.2 uses chrome sync to store notepad content
// provide a fallback for older versions
readStore(key, (d) => {
  let data;

  // Check if we got data from the chrome sync storage, if so, no fallback is needed
  if (d) {
    data = d;
  } else {
    // Get the local storage
    local = localStorage.getItem(key);

    // Check if we got local storage data
    if (local) {
      // Try parsing the local storage data as JSON.
      // If it succeeds, we had an object in local storage
      try {
        data = JSON.parse(local);
        updateStore(key, local);
      } catch (e) {
        // If it fails to parse, we had the notepad content in local storage
        data = defaultData;
        data.notepadContent = localStorage.getItem(key);
        updateStore(key, data);
      }

      // Delete the local storage
      localStorage.removeItem(key);
    }

    // If we couldn't get data from anywhere, set to default data
    if (!data) {
      data = defaultData;
    }
  }

  start(data);
});

function listenerUpdate() {
  readStore(key, (d) => {
    document.querySelector(".notepad").innerHTML = d.notepadContent;
  });
}

function start(data) {
  // Greet the human
  let now = new Date();

  let dayEnd = now.getDate() % 10;
  let dayFollow =
    dayEnd === 1 ? "st" : dayEnd === 2 ? "nd" : dayEnd === 3 ? "rd" : "th";

  let timeString = `${weekdays[now.getDay()]} ${now.getDate()}${dayFollow} ${
    months[now.getMonth()]
  }`;

  let g = document.querySelector(".greeting");
  g.innerHTML = `${timeString}`;

  // Set up the notepad
  let notepad = document.querySelector(".notepad");
  notepad.innerHTML = data["notepadContent"];

  notepad.addEventListener("input", (e) => {
    if (notepad !== document.activeElement || !windowIsActive) return;

    let obj = Object.assign(data, {
      notepadContent: notepad.value,
    });

    updateStore(key, obj);
  });

  // Allow updating content between tabs
  let windowIsActive;

  let storeListener = setInterval(listenerUpdate, 1000);

  window.onfocus = function () {
    windowIsActive = true;
  };

  window.onblur = function () {
    windowIsActive = false;
    if (storeListener) {
      clearInterval(storeListener);
    }
    storeListener = setInterval(listenerUpdate, 1000);
  };

  notepad.addEventListener("blur", (e) => {
    if (storeListener) {
      clearInterval(storeListener);
    }
    storeListener = setInterval(listenerUpdate, 1000);
  });

  notepad.addEventListener("focus", (e) => {
    if (storeListener) {
      clearInterval(storeListener);
    }
  });

  window.addEventListener("mousewheel", scrollCapture);

  // start looping the time update code
  TimeUpdate();

  function scrollCapture(e) {
    if (e.target !== notepad) notepad.scrollTop += e.deltaY;
  }
}

async function TimeUpdate() {
  let t = document.getElementById("clock");
  let TimeRunning = true;

  while (TimeRunning) {
    let now = new Date();
    t.innerHTML = `${makeTwoDigit(now.getHours())}:${makeTwoDigit(
      now.getMinutes()
    )}:${makeTwoDigit(now.getSeconds())}`;
    await sleep(1000);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeTwoDigit(num) {
  let base = "";
  let result = num < 10 ? base.concat("0", num) : num;

  return result;
}
