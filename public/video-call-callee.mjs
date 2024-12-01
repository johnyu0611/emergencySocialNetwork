import {
  KEY_TOKEN,
  ANNOUCEMENT_SPACE_ID,
  PUBLIC_CHATROOM_ID
} from "./common/constants.mjs";
import { sleep } from "./common/utils.mjs";
import {
  ENDPOINT_SOCKET_IO,
  NAMESPACE_SOCKET_IO_SYSTEM
} from "./lib/endpoints.mjs";
import { getEmergencyContact } from "./lib/get-emergency-contact.mjs";
import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";
import { Banner } from "./common/banner.mjs";
import { postEmergencyHistory } from "./lib/post-emergency-history.mjs";
import { getEmergencyHistory } from "./lib/get-emergency-history.mjs";
import { getJWTPayload } from "./common/utils.mjs";

const token = localStorage.getItem(KEY_TOKEN);
const res = await getEmergencyContact({ token });
const userName = res.curr;
const emergencyContact = res.username;

const banner = new Banner($("#banner"));
const $inputBox = $("#input-box");
const $buttonPost = $("#button-post");

const $historyContainer = $("#history-container");
// const annoucementModal = new bootstrap.Modal($("#modal-announcement"));

function messageBox(username, timestampMillis, message) {
  const time = new Date(timestampMillis).toLocaleString();
  const box = $(`
        <div class="message-box">
            <div class="metadata">
                <div class="user">
                  <span class="username"></span>
                </div>
                <div class="time"></div>
            </div>
            <div class="message"></div>
        </div>
    `);
  // To eliminate XSS
  box.find("div.user").find("span.username").text(username);
  //box.find("div.user").find("span.status").text(` (${status})`);
  box.find("div.time").text(time);
  box.find("div.message").text(message);
  return box;
}

async function populateEmergencyHistory() {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }

  try {
    const { history } = await getEmergencyHistory({ who: "other", token });
    $historyContainer.append(
      history.map((e) => messageBox(e.sender, e.timestamp, e.content, e.status))
    );
    $historyContainer.scrollTop($historyContainer.prop("scrollHeight"));
  } catch (error) {
    console.error(error);
  }
}

// Initialize the socket connection using JWT token for authentication
const socket = io(NAMESPACE_SOCKET_IO_SYSTEM, {
  path: ENDPOINT_SOCKET_IO,
  auth: {
    token
  }
});

const localVideoEl = document.querySelector("#local-video");
const remoteVideoEl = document.querySelector("#remote-video");

let localStream; //a var to hold the local video stream
let remoteStream; //a var to hold the remote video stream
let peerConnection; //the peerConnection that the two clients use to talk
let didIOffer = false;

let peerConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"]
    }
  ]
};

function createOfferEls(offers, socket) {
  //make green answer button for this new offer
  const answerEl = document.querySelector("#answer");
  offers.forEach((o) => {
    // console.log(o);
    const newOfferEl = document.createElement("div");
    newOfferEl.innerHTML = `<button class="btn btn-primary mb-2 w-100">Answer ${o.offererUserName}</button>`;
    newOfferEl.addEventListener("click", () => {
      newOfferEl.style.display = "none";
      answerOffer(o);
      populateEmergencyHistory();
    });
    answerEl.appendChild(newOfferEl);
  });
}

//when a client initiates a call
const call = async (e) => {
  document.querySelector("#call").style.display = "none";

  await fetchUserMedia();

  //peerConnection is all set with our STUN servers sent over
  await createPeerConnection();

  //create offer time!
  try {
    console.log("Creating offer...");
    const offer = await peerConnection.createOffer();
    console.log(offer);
    peerConnection.setLocalDescription(offer);
    didIOffer = true;
    socket.emit("newOffer", { offer, emergencyContact }); //send offer to signalingServer
  } catch (err) {
    console.log(err);
  }
};

const answerOffer = async (offerObj) => {
  await fetchUserMedia();
  await createPeerConnection(offerObj);
  const answer = await peerConnection.createAnswer({});
  await peerConnection.setLocalDescription(answer);
  console.log(offerObj);
  console.log(answer);
  // console.log(peerConnection.signalingState) //should be have-local-pranswer because CLIENT2 has set its local desc to it's answer (but it won't be)
  offerObj.answer = answer;
  const offerIceCandidates = await socket.emitWithAck("newAnswer", offerObj);
  offerIceCandidates.forEach((c) => {
    peerConnection.addIceCandidate(c);
    // console.log("======Added Ice Candidate======")
  });
  // console.log(offerIceCandidates)
};

const addAnswer = async (offerObj) => {
  await peerConnection.setRemoteDescription(offerObj.answer);
  // console.log(peerConnection.signalingState)
};

const fetchUserMedia = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localVideoEl.srcObject = stream;
      localStream = stream;
      resolve();
    } catch (err) {
      console.log(err);
      reject();
    }
  });
};

const createPeerConnection = (offerObj) => {
  return new Promise(async (resolve, reject) => {
    peerConnection = await new RTCPeerConnection(peerConfiguration);
    remoteStream = new MediaStream();
    remoteVideoEl.srcObject = remoteStream;

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.addEventListener("signalingstatechange", (event) => {
      // console.log(event);
      // console.log(peerConnection.signalingState)
    });

    peerConnection.addEventListener("icecandidate", (e) => {
      // console.log('........Ice candidate found!......')
      // console.log(e)
      if (e.candidate) {
        socket.emit("sendIceCandidateToSignalingServer", {
          iceCandidate: e.candidate,
          iceUserName: userName,
          didIOffer
        });
      }
    });

    peerConnection.addEventListener("track", (e) => {
      // console.log("Got a track from the other peer!! How excting")
      // console.log(e)
      e.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track, remoteStream);
        console.log("Here's an exciting moment... fingers cross");
      });
    });

    if (offerObj) {
      // console.log(peerConnection.signalingState) //should be stable because no setDesc has been run yet
      await peerConnection.setRemoteDescription(offerObj.offer);
      // console.log(peerConnection.signalingState) //should be have-remote-offer, because client2 has setRemoteDesc on the offer
    }
    resolve();
  });
};

const addNewIceCandidate = (iceCandidate) => {
  peerConnection.addIceCandidate(iceCandidate);
  // console.log("======Added Ice Candidate======")
};

const saveEmergencyHistory = async () => {
  try {
    banner.reset();
    $buttonPost.prop("disabled", true);

    const token = localStorage.getItem(KEY_TOKEN);

    const message = $inputBox.val();
    if (!message || message.length === 0) {
      throw new Error("Please input a message");
    }

    await postEmergencyHistory({ content: message, token });
    $inputBox.val("");
  } catch (e) {
    void banner.showError(e);
    console.error(e);
  } finally {
    $buttonPost.prop("disabled", false);
  }
};

function onNewAnnouncement() {
  return function () {
    alert("New Annoucement available");
    // location.href = `chat.html?roomId=${ANNOUCEMENT_SPACE_ID}`;
    // annoucementModal.show();
  };
}

function onSystemMaintenance() {
  return function () {
    alert("System is in maintenance. Jumping to home page...");
    location.href = "index.html";
  };
}

function onUserLogout() {
  return async function (socketIOMessage) {
    console.log("here");
    const token = localStorage.getItem(KEY_TOKEN);
    const { citizenId } = socketIOMessage;
    const { userId } = getJWTPayload(token);

    if (citizenId === userId) {
      alert("You are set to inactive account");
      location.href = "index.html";
    }
  };
}

document.querySelector("#call").addEventListener("click", call);

document.querySelector("#hangup").addEventListener("click", (e) => {
  location.href = "directory.html";
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
});

document
  .querySelector("#button-post")
  .addEventListener("click", async (e) => saveEmergencyHistory());

//on connection get all available offers and call createOfferEls
socket.on("availableOffers", (offers) => {
  // console.log(offers)
  createOfferEls(offers, socket);
});

//someone just made a new offer and we're already here - call createOfferEls
socket.on("newOfferAwaiting", ({ offers, emergencyContact }) => {
  createOfferEls(offers, socket);
});

socket.on("answerResponse", (offerObj) => {
  // console.log(offerObj)
  addAnswer(offerObj);
});

socket.on("receivedIceCandidateFromServer", (iceCandidate) => {
  addNewIceCandidate(iceCandidate);
  // console.log(iceCandidate)
});

socket.on("new_emergency_history", (e) => {
  $historyContainer.empty();
  populateEmergencyHistory();
});

socket.on("system_maintenance", onSystemMaintenance(socket));
socket.on("user_logout", onUserLogout(socket));

socket.on("new_announcement", onNewAnnouncement());
