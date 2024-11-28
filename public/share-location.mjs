import { Banner } from "./common/banner.mjs";
import { KEY_TOKEN } from "./common/constants.mjs";
import {
  ENDPOINT_SOCKET_IO,
  NAMESPACE_SOCKET_IO_LOCATION_SHARING,
  NAMESPACE_SOCKET_IO_SYSTEM
} from "./lib/endpoints.mjs";
import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";
import {
  calculateDistance,
  getJWTPayload,
  parseQueryParameters,
  setQueryParameters,
  sleep
} from "./common/utils.mjs";
import { Marker } from "./common/map-marker.mjs";
import {
  addUserToSession,
  createLocationSharingSession,
  deleteLocationSharingSession,
  getAllUsersInSession,
  getUserLastSeenTimestamp,
  getUserLocation,
  getUserLocationSharingSession,
  getUserResourceRequest,
  getUserResourceResponse,
  getUserRole,
  setUserLastSeenTimestamp,
  setUserLocation,
  setUserResourceRequest,
  setUserResourceResponse
} from "./lib/location-sharing.mjs";
import {
  chip,
  infoContent,
  infoHeader,
  pinElement
} from "./component/share-location-components.mjs";
import {
  getLocation,
  handleGeolocationPositionError
} from "./common/geolocation.mjs";

class Participant {
  #map;
  #referenceParticipant;
  #username;

  #marker;
  #isInitiator = false;
  #isParticipantCurrentViewer;
  #sessionId;
  #watchId;
  #watchUpdateInfoWindow;
  #lastSeen;
  #resourceList;

  constructor(map, referenceParticipant, username, location) {
    this.#map = map;
    this.#referenceParticipant = referenceParticipant;
    this.#username = username;

    const { latitude, longitude } = location;
    this.#marker = new Marker(map, username, { lat: latitude, lng: longitude });
    this.#isParticipantCurrentViewer = this.#referenceParticipant === null;

    this.#marker.infoHeader = infoHeader(this.#username)[0];
    this.#updateInfoContent();
    this.#marker.content = pinElement(this.#username)[0];

    if (this.#isParticipantCurrentViewer) {
      this.#marker.show();
    }
  }

  show() {
    this.#marker.show();
  }

  hide() {
    this.#marker.hide();
  }

  onSessionStart(sessionId, isInitiator) {
    this.#isInitiator = isInitiator;
    this.#marker.content = pinElement(this.#username, isInitiator)[0];

    this.#watch();
    this.#sessionId = sessionId;
  }

  onSessionStop() {
    this.#isInitiator = undefined;
    this.#marker.content = pinElement(this.#username)[0];

    this.#unwatch();
    this.#sessionId = undefined;
  }

  get location() {
    return {
      longitude: this.#marker.position.lng,
      latitude: this.#marker.position.lat
    };
  }

  set location({ longitude, latitude }) {
    this.#marker.position = {
      lng: longitude,
      lat: latitude
    };
    this.#updateInfoContent();
  }

  get lastSeen() {
    return this.#lastSeen;
  }

  set lastSeen(lastSeen) {
    this.#lastSeen = lastSeen;
    this.#updateInfoContent();
  }

  get distance() {
    if (this.#referenceParticipant) {
      return calculateDistance(
        this.location,
        this.#referenceParticipant.location
      );
    }
    return 0;
  }

  get resourceList() {
    return this.#resourceList;
  }

  set resourceList(resourceList) {
    this.#resourceList = resourceList;
    this.#updateInfoContent();
  }

  get username() {
    return this.#username;
  }

  get isCurrentViewer() {
    return this.#isParticipantCurrentViewer;
  }

  #updateInfoContent() {
    this.#marker.infoContent = infoContent(
      this.#isInitiator,
      this.#lastSeen,
      this.distance,
      this.#resourceList
    )[0];
  }

  #watch() {
    this.#watchUpdateInfoWindow = setInterval(() => {
      this.#updateInfoContent();
    }, 1000);

    if (this.#isParticipantCurrentViewer) {
      this.#watchId = navigator.geolocation.watchPosition(
        async (location) => {
          await this.#reportLocation(location.coords);
          await this.#reportLastSeen(Date.now());
        },
        (error) => {
          void banner.showError(handleGeolocationPositionError(error));
        },
        geolocationOptions
      );
    }
  }

  #unwatch() {
    clearInterval(this.#watchUpdateInfoWindow);

    if (this.#isParticipantCurrentViewer) {
      return navigator.geolocation.clearWatch(this.#watchId);
    }
  }

  async #reportLocation(location) {
    if (!this.#sessionId || !this.#isParticipantCurrentViewer) {
      return;
    }

    const token = localStorage.getItem(KEY_TOKEN);
    await setUserLocation({
      token,
      sessionId: this.#sessionId,
      username: this.#username,
      location
    });
  }

  async #reportLastSeen(lastSeen) {
    if (!this.#sessionId || !this.#isParticipantCurrentViewer) {
      return;
    }

    const token = localStorage.getItem(KEY_TOKEN);
    await setUserLastSeenTimestamp({
      token,
      sessionId: this.#sessionId,
      username: this.#username,
      lastSeen
    });
  }
}

class StartStopButton {
  #$button;
  #isStarted;
  #onStart;
  #onStop;

  constructor($button) {
    this.#$button = $button;
    this.#isStarted = false;
    this.#$button.on("click", this.click.bind(this));
  }

  set onStart(onStart) {
    this.#onStart = onStart;
  }

  set onStop(onStop) {
    this.#onStop = onStop;
  }

  async click(event) {
    if (this.#isStarted) {
      this.#disable();
      if (await this.#onStop(event)) {
        this.isStarted = false;
      }
      await sleep(2000);
      this.#enable();
      return;
    }

    this.#disable();
    if (await this.#onStart(event)) {
      this.isStarted = true;
    }
    await sleep(2000);
    this.#enable();
  }

  get isStarted() {
    return this.#isStarted;
  }

  set isStarted(value) {
    if (value) {
      this.#showStopButton();
      this.#isStarted = true;
      return;
    }
    this.#showStartButton();
    this.#isStarted = false;
  }

  #showStopButton() {
    this.#$button.attr("class", "btn btn-danger");
    this.#$button.find("svg").attr("data-icon", "stop");
    this.#$button.find("span").text("Stop");
  }

  #showStartButton() {
    this.#$button.attr("class", "btn btn-primary");
    this.#$button.find("svg").attr("data-icon", "location-arrow");
    this.#$button.find("span").text("Start");
  }

  #disable() {
    this.#$button.prop("disabled", true);
  }

  #enable() {
    this.#$button.prop("disabled", false);
  }
}

const banner = new Banner($("#banner"));
const $modalAnnouncementContainer = $("#modal-announcement-container");
const $buttonStartStopSharing = $("#button-sharing");
const $buttonEditResource = $("#button-edit-resource");
const buttonStartStopSharing = new StartStopButton($buttonStartStopSharing);
const $mapContainer = $("#map-container");
const modalEditResourceRequest = new bootstrap.Modal(
  $("#modal-edit-resource-request")
);
const modalEditResourceResponse = new bootstrap.Modal(
  $("#modal-edit-resource-response")
);
const $inputResourceRequestAddItem = $("#input-item");
const $buttonResourceRequestAddItem = $("#button-add-item");
const $divRequestResourceList = $("#request-resource-list");
const $buttonResourceRequestSave = $("#button-save-resource-request");
const $divResponseResourceList = $("#response-resource-list");
const $buttonResourceResponseSave = $("#button-save-resource-response");

const map = new google.maps.Map($mapContainer[0], {
  mapId: "f77065689691f3c6"
});
const participantMap = new Map();
const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000
};

function onSystemConnectError(socket) {
  return async function (error) {
    console.error(error);
    // From https://socket.io/docs/v4/client-socket-instance/#connect_error
    if (socket.active) {
      // Temporary failure, the socket will automatically try to reconnect
      void banner.showWarningMessage(
        "Cannot establish connection to server, retrying..."
      );
    } else {
      // The connection was denied by the server
      // In that case, `socket.connect()` must be manually called in order to reconnect
      void banner.showErrorMessage(
        "Server rejected the connection, please log in again"
      );
    }
  };
}

function onSystemMaintenance(...channels) {
  return async function () {
    channels.forEach((channel) => {
      channel.disconnect();
    });
    await banner.showWarningMessage(
      "System is in maintenance. Jumping to home page..."
    );
    location.href = "index.html";
  };
}

function onNewAnnouncement(announcementModal, $viewButton) {
  $viewButton.on("click", function (event) {
    event.preventDefault();
    location.href = `chat.html?roomId=${ANNOUCEMENT_SPACE_ID}`;
  });

  return async function () {
    await banner.showWarningMessage(
      "New Annoucement available. Action needed..."
    );
    announcementModal.show();
  };
}

function onNewParticipant(context) {
  return function ({ username, role, location }) {
    const { sessionId, referenceParticipant } = context;

    const participant = new Participant(
      map,
      referenceParticipant,
      username,
      location
    );
    participantMap.set(username, participant);
    participant.onSessionStart(sessionId, role === "initiator");
    participant.show();
  };
}

function onUpdate() {
  return function (message) {
    const { username } = message;
    const participant = participantMap.get(username);

    if (message.location) {
      participant.location = message.location;
    }
    if (message.lastSeen) {
      participant.lastSeen = message.lastSeen;
    }
    if (message.resourceRequest) {
      participant.resourceList = message.resourceRequest;
    }
    if (message.resourceResponse) {
      participant.resourceList = message.resourceResponse;
    }
  };
}

async function onSessionDeleted() {
  await banner.showWarningMessage(
    "Initiator has closed the sharing session. Jumping to directory..."
  );
  location.href = "directory.html";
}

function onSharingStarted(context) {
  return async function (event) {
    event && event.preventDefault();

    let {
      token,
      referenceParticipantRole,
      referenceParticipant,
      referenceParticipantUsername,
      sessionId
    } = context;
    if (sessionId === "undefined") {
      const { id } = await createLocationSharingSession({
        token,
        location: referenceParticipant.location
      });
      sessionId = id;
    }

    referenceParticipant.onSessionStart(
      sessionId,
      referenceParticipantRole === "initiator"
    );
    referenceParticipant.lastSeen = (
      await getUserLastSeenTimestamp({
        token,
        sessionId,
        username: referenceParticipantUsername
      })
    ).lastSeen;
    if (referenceParticipantRole === "initiator") {
      referenceParticipant.resourceList = (
        await getUserResourceRequest({
          token,
          sessionId,
          username: referenceParticipantUsername
        })
      ).resourceRequest;
    } else {
      referenceParticipant.resourceList = (
        await getUserResourceResponse({
          token,
          sessionId,
          username: referenceParticipantUsername
        })
      ).resourceResponse;
    }

    const { users } = await getAllUsersInSession({ token, sessionId });
    for (const { username, role, location } of users) {
      if (username === referenceParticipantUsername) {
        continue;
      }
      const participant = new Participant(
        map,
        referenceParticipant,
        username,
        location
      );
      participantMap.set(username, participant);
      participant.onSessionStart(sessionId, role === "initiator");
      participant.location = (
        await getUserLocation({ token, sessionId, username })
      ).location;
      participant.lastSeen = (
        await getUserLastSeenTimestamp({ token, sessionId, username })
      ).lastSeen;
      if (role === "initiator") {
        participant.resourceList = (
          await getUserResourceRequest({ token, sessionId, username })
        ).resourceRequest;
      } else {
        participant.resourceList = (
          await getUserResourceResponse({ token, sessionId, username })
        ).resourceResponse;
      }
      participant.show();
    }

    context.sessionId = sessionId;
    context.socket = initLocationSharingSocket(
      token,
      sessionId,
      onNewParticipant(context),
      onUpdate(context),
      onSessionDeleted
    );

    buttonStartStopSharing.isStarted = true;
    $buttonEditResource.removeClass("disabled");
    return true;
  };
}

function onSharingStopped(context) {
  return async function (event) {
    event && event.preventDefault();

    $buttonEditResource.addClass("disabled");
    context.socket.disconnect();

    const {
      token,
      sessionId,
      referenceParticipantUsername,
      referenceParticipant,
      referenceParticipantRole
    } = context;
    referenceParticipant.onSessionStop();

    const { users } = await getAllUsersInSession({ token, sessionId });
    users.forEach(({ username }) => {
      if (username === referenceParticipantUsername) {
        return;
      }
      const participant = participantMap.get(username);
      participant.onSessionStop(sessionId);
      participant.hide();
      participantMap.delete(username);
    });

    if (referenceParticipantRole === "initiator") {
      await deleteLocationSharingSession({ token, sessionId });
    }

    context.sessionId = "undefined";
    buttonStartStopSharing.isStarted = false;
    return true;
  };
}

function onEditResourceRequestModalOpen(context) {
  return async function () {
    const {
      token,
      sessionId,
      referenceParticipantUsername: username
    } = context;
    const { resourceRequest } = await getUserResourceRequest({
      token,
      sessionId,
      username
    });
    for (const item of resourceRequest) {
      $divRequestResourceList.append(
        chip(item, true, (chip) => {
          chip.remove();
        })
      );
    }
    modalEditResourceRequest.show();
  };
}

function onEditResourceResponseModalOpen(context) {
  return async function () {
    const {
      token,
      sessionId,
      referenceParticipantUsername: username
    } = context;
    const { users } = await getAllUsersInSession({ token, sessionId });
    let initiatorUsername;
    for (const user of users) {
      if (user.role === "initiator") {
        initiatorUsername = user.username;
        break;
      }
    }

    if (!initiatorUsername) {
      return;
    }

    const { resourceRequest } = await getUserResourceRequest({
      token,
      sessionId,
      username: initiatorUsername
    });
    const { resourceResponse } = await getUserResourceResponse({
      token,
      sessionId,
      username
    });

    for (const item of resourceRequest) {
      $divResponseResourceList.append(
        chip(item, resourceResponse.includes(item), (chip) => {
          if (chip.hasClass("active")) {
            chip.removeClass("active");
          } else {
            chip.addClass("active");
          }
        })
      );
    }

    modalEditResourceResponse.show();
  };
}

function onSaveResourceRequest(context) {
  return async function () {
    const {
      token,
      sessionId,
      referenceParticipantUsername: username
    } = context;
    const items = $divRequestResourceList
      .children()
      .toArray()
      .map((e) => e.innerText);
    await setUserResourceRequest({
      token,
      sessionId,
      username,
      resourceRequest: items
    });
    modalEditResourceRequest.hide();
    $divRequestResourceList.empty();
  };
}

function onSaveResourceResponse(context) {
  return async function () {
    const {
      token,
      sessionId,
      referenceParticipantUsername: username
    } = context;
    const items = $divResponseResourceList
      .children(".active")
      .toArray()
      .map((e) => e.innerText);
    await setUserResourceResponse({
      token,
      sessionId,
      username,
      resourceResponse: items
    });
    modalEditResourceResponse.hide();
    $divResponseResourceList.empty();
  };
}

function setInterface(context) {
  const { referenceParticipantRole } = context;

  if (referenceParticipantRole === "initiator") {
    $buttonEditResource.find("span").text("Edit Resource Request");
    $buttonEditResource.click(onEditResourceRequestModalOpen(context));
  } else {
    $buttonEditResource.find("span").text("Edit Resource Response");
    $buttonEditResource.click(onEditResourceResponseModalOpen(context));
    $buttonStartStopSharing.hide();
  }

  buttonStartStopSharing.onStart = onSharingStarted(context);
  buttonStartStopSharing.onStop = onSharingStopped(context);
}

function initLocationSharingSocket(
  token,
  sessionId,
  onNewParticipant,
  onUpdate,
  onSessionDeleted
) {
  const socketLocationSharing = io(NAMESPACE_SOCKET_IO_LOCATION_SHARING, {
    path: ENDPOINT_SOCKET_IO,
    auth: {
      token: token
    },
    query: {
      sessionId
    },
    forceNew: true
  });

  socketLocationSharing.on("new_participant", onNewParticipant);
  socketLocationSharing.on("update", onUpdate);
  socketLocationSharing.on("session_deleted", onSessionDeleted);

  return socketLocationSharing;
}

async function initMap(token) {
  void banner.showInfoMessage("Please wait for the map to load...");
  const location = await getLocation(geolocationOptions);
  const { longitude, latitude } = location;
  map.setCenter({ lng: longitude, lat: latitude });
  map.setZoom(20);

  const { username } = getJWTPayload(token);
  const participant = new Participant(map, null, username, location);
  participantMap.set(username, participant);
}

$(document).ready(async () => {
  $modalAnnouncementContainer.html(
    await (await fetch("component/modal-announcement.html")).text()
  );
  const modalAnnouncement = new bootstrap.Modal(
    $modalAnnouncementContainer.find("#modal-announcement")
  );
  const $viewButton = $modalAnnouncementContainer.find("#viewButton");

  $buttonResourceRequestAddItem.click(() => {
    const item = $inputResourceRequestAddItem.val().trim();
    if (!item) {
      void banner.showErrorMessage("Item cannot be blank");
      return;
    }
    if (item.length > 16) {
      void banner.showErrorMessage(
        "Item name too long. Maximum 16 characters."
      );
      return;
    }
    if (
      $divRequestResourceList
        .children()
        .toArray()
        .some((e) => e.innerText === item)
    ) {
      void banner.showErrorMessage("Item already in the list");
      return;
    }
    $divRequestResourceList.append(
      chip(item, true, (chip) => {
        chip.remove();
      })
    );
    $inputResourceRequestAddItem.val("");
  });

  try {
    const token = localStorage.getItem(KEY_TOKEN);
    await initMap(token);

    const { username } = getJWTPayload(token);
    const referenceParticipant = participantMap.get(username);

    let sessionId;
    let role = "initiator";

    const { joinSession } = parseQueryParameters(location.href);
    if (joinSession) {
      role = "responder";
      sessionId = joinSession;
      await addUserToSession({
        token,
        sessionId,
        location: referenceParticipant.location
      });
      setQueryParameters({});
    } else {
      sessionId = (
        await getUserLocationSharingSession({
          token,
          username
        })
      ).id;

      if (sessionId !== "undefined") {
        const { role: r } = await getUserRole({ token, sessionId, username });
        role = r;
      }
    }

    const context = {
      token,
      sessionId,
      referenceParticipantUsername: username,
      referenceParticipant,
      referenceParticipantRole: role,
      socket: null
    };
    setInterface(context);

    $buttonStartStopSharing.removeClass("disabled");

    $buttonResourceResponseSave.click(onSaveResourceResponse(context));
    $buttonResourceRequestSave.click(onSaveResourceRequest(context));

    if (sessionId !== "undefined") {
      await onSharingStarted(context)();
    }
  } catch (error) {
    void banner.showError(error);
  }

  const socketSystem = io(NAMESPACE_SOCKET_IO_SYSTEM, {
    path: ENDPOINT_SOCKET_IO,
    auth: {
      token: localStorage.getItem(KEY_TOKEN)
    }
  });

  socketSystem.on("connect", () => {});
  socketSystem.on("connect_error", onSystemConnectError(socketSystem));
  socketSystem.on("system_maintenance", onSystemMaintenance(socketSystem));
  socketSystem.on(
    "new_announcement",
    onNewAnnouncement(modalAnnouncement, $viewButton)
  );
});
