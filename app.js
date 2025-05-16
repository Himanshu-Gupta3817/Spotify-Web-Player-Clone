// console.log("Let\'s write JavaScript");

//Global variables
let currentSong = new Audio();
let songs;
let currFolder;

//Function to convert duration of music from seconds to min:sec format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


//Function to fetch songs from folder
async function getSongs(folder) {

    //folder location is stored
    currFolder = folder;

    //Fetching details from folder
    let a = await fetch(`/${folder}/`);

    // Getting only text of music details in form of table
    let response = await a.text();
    // console.log(response);

    //Displaying music list in library by creating new element div
    let div = document.createElement("div");
    div.innerHTML = response;

    //Getting songs anchor properties
    let as = div.getElementsByTagName("a");
    // console.log(as);

    //Putting songs ulr properties in songsArray

    songs = [];
    //Getting songs index
    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        //Selecting songs url in array
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    //Showing all the songs in the library list
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
     
                    <img class="invert" src="Images/music.svg" alt="music">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="Images/playM.svg" alt="play">
                    </div>       
        </li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

//Playing current song only
const playMusic = (track, pause = false) => {
    // let audio = new Audio("/Songs/" + track);
    currentSong.src = `/${currFolder}/` + track;

    //Changing play svg to pause svg while song is playing
    if (!pause) {
        currentSong.play();
        play.src = "Images/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

//Function for displaying albums in card container
async function displayAlbums() {
    let a = await fetch(`/Songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/Songs") && !e.href.includes(".htaccess")) {
            let folder = (e.href.split("/").slice(-2)[0]);
            //Get the metadata of the folder
            let a = await fetch(`/Songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                <div class="play">
                <img src="Images/playM.svg" alt="play">
                </div>
                <img src="/Songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
        }
    }

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {

            //target keyword attack the element which is clicked
            //currentTarget attack the element on which event listener is added
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })
}

async function main() {
    // Get the list of all the songs
    await getSongs("Songs/ncs");
    playMusic(songs[0], true);

    // Display all the albums on the page
    displayAlbums();

    //Attach an event listener to play, next and previous button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "Images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "Images/play.svg";
        }
    })

    //Listener for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
        // console.log(percent);
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".sideBar").style.left = "0";
    })

    //Add an event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".sideBar").style.left = "-130%";
    })

    //Add an event listener to previous song
    previous.addEventListener("click", () => {
        console.log("Previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })

    //Add an event listener to next song
    next.addEventListener("click", () => {
        console.log("Next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("Images/mute.svg", "Images/volume.svg");
        }
    })

    //Add eventlistener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("Images/volume.svg")) {
            e.target.src = e.target.src.replace("Images/volume.svg", "Images/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            //Strings are immutable
            e.target.src = e.target.src.replace("Images/mute.svg", "Images/volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

    //Function to change Pause to Play when song ends
    currentSong.addEventListener("ended", () => {
        document.querySelector("#play").src = document.querySelector("#play").src.replace("Images/pause.svg", "Images/play.svg");
    })
}

// Calling main function
main();
