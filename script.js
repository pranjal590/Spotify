let currentSong = new Audio();
let songs;
let currfolder;
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = ""; // Clear the existing list items

  for (const song of songs) {
    
    // Create a list item for each song...........................................
    songUL.innerHTML =  songUL.innerHTML +
      `    <li>
       
      <img  class="invert" src="img/music.svg" alt="">
<div class="info">
<div> ${song.replaceAll("%20", " ")}</div>
<div>Pranjal</div></div>
<div class="playnow">
    <span>Play Now</span>
    <img class="invert" src="play.svg" alt="">
    </div>
    </li>`;
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
    playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// function for the display the albums...............................................
async function displayAlbums() {
  console.log("displaying albums");
  let a = await fetch(`http://127.0.0.1:3000/songs2/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs2") && !e.href.includes("htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];
      //  Get the  metadata of the folder..............................................................

      let a = await fetch(`http://127.0.0.1:3000/songs2/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg   width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path   d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"/>
                            </svg>
                        </div>
                            <img src="/songs2/${folder}/cover.jpg" alt=" Song.jpg" >
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
           </div>`;
    }
  }
  // Load the playlist whenever card is clicked.........................................................
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");
      songs = await getSongs(`songs2/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  await getSongs("songs2/ncs");
  playMusic(songs[0], true);

  // await displayAlbums()

  //display all the albums of the songs.............................
  await displayAlbums();

  // for play or pause and change svg from  play to pause and pause to play..........
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // listen for timeupdate event............................
  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // target a seekbar.........................
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    if (!isNaN(currentSong.duration) && currentSong.duration > 0) {
      currentSong.currentTime = (currentSong.duration * percent) / 100;
    }
  });

  // add event listener to hamburger menu.............................
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // add event listener to close menu......................................
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  // add event listener in previous and next...............  // for play the previous song ........

  previous.addEventListener("click", () => {
    console.log(currentSong);

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // for play the next song from click .............
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // add an event to volume control by volume Tag..............
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("setting volume to", e.target.value, "/100");
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  // Add event listner to mute the track.....................................
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace(
        "volume.svg",
        "volume-mute-02-stroke-rounded.svg"
      );
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace(
        "volume-mute-02-stroke-rounded.svg",
        "volume.svg"
      );
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
