import { formatDuration, meterToImperialFormatted } from "../common/utils.mjs";

export function infoHeader(username) {
  const infoHeader = $(`
        <div class="info-header">
            <div class="username"></div>
        </div>
    `);

  // To eliminate XSS
  infoHeader.find("div.username").text(username);

  return infoHeader;
}

export function infoContent(
  isInitiator,
  lastSeenTimestampMillis,
  distanceMeter,
  resourceList
) {
  const infoContent = $(`
        <div class="info-content">
            <div class="last-seen-time">
              <span class="prompt">Last seen: </span>
              <span class="text"></span>
            </div>
            <div class="distance">
              <span class="prompt">Distance: </span>
              <span class="text"></span>
            </div>
            <div class="resource">
              <span class="prompt">${isInitiator ? "Requested" : "Brought"}: </span>
              <span class="text"></span>
            </div>
        </div>
    `);

  // To eliminate XSS
  if (lastSeenTimestampMillis) {
    infoContent
      .find("div.last-seen-time span.text")
      .text(formatDuration(Date.now() - lastSeenTimestampMillis));
  } else {
    infoContent.find("div.last-seen-time span.text").text("Unavailable");
  }

  if (distanceMeter != null) {
    infoContent
      .find("div.distance span.text")
      .text(meterToImperialFormatted(distanceMeter));
  } else {
    infoContent.find("div.distance span.text").text("Unavailable");
  }
  if (resourceList == null) {
    infoContent.find("div.resource span.text").text("Unavailable");
  } else if (resourceList.length === 0) {
    infoContent.find("div.resource span.text").text("");
  } else {
    infoContent
      .find("div.resource span.text")
      .text(
        resourceList.reduce(
          (accumulator, currentValue) => `${accumulator}, ${currentValue}`
        )
      );
  }

  return infoContent;
}

export function pinElement(tag, isInitiator) {
  const pinElement = $(`
        <div class="pin-element">
            <div class="tag"></div>
            <i class="fa-solid fa-location-dot"></i>
        </div>
    `);

  // To eliminate XSS
  pinElement.find("div.tag").text(tag);

  let colorClass = "";
  if (isInitiator === true) {
    colorClass = "color-initiator";
  } else if (isInitiator === false) {
    colorClass = "color-responder";
  }

  pinElement.find("i").addClass(colorClass);

  return pinElement;
}

export function chip(text, isActive, onClick) {
  const chip = $(`<div class="chip ${isActive ? "active" : ""}"></div>`);
  chip.text(text);
  chip.click(() => {
    onClick && onClick(chip);
  });
  return chip;
}
