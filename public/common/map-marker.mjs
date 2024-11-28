const { AdvancedMarkerElement, PinElement } =
  await google.maps.importLibrary("marker");

export class Marker {
  #map;
  #id;

  #marker;

  #infoWindow = new google.maps.InfoWindow({});

  #infoHeader;
  #infoContent;
  #infoWindowOnClickHandler;

  constructor(
    map,
    id,
    position,
    infoHeader = undefined,
    infoContent = undefined,
    content = undefined
  ) {
    this.#map = map;
    this.#id = id;

    this.#marker = new AdvancedMarkerElement({
      gmpClickable: true
    });
    this.position = position;
    this.infoHeader = infoHeader;
    this.infoContent = infoContent;
    this.content = content;
  }

  get position() {
    return this.#marker.position;
  }

  set position(position) {
    this.#marker.position = position;
  }

  #updateInfoWindow() {
    this.#infoWindow.setHeaderContent(this.#infoHeader);
    this.#infoWindow.setContent(this.#infoContent);

    if (this.#infoWindowOnClickHandler) {
      this.#marker.removeEventListener(
        "gmp-click",
        this.#infoWindowOnClickHandler
      );
    }
    this.#infoWindowOnClickHandler = () =>
      this.#infoWindow.open(this.#map, this.#marker);
    this.#marker.addEventListener("gmp-click", this.#infoWindowOnClickHandler);
  }

  get infoHeader() {
    return this.#infoHeader;
  }

  set infoHeader(infoHeader) {
    if (!infoHeader) {
      return;
    }
    this.#infoHeader = infoHeader;
    this.#updateInfoWindow();
  }

  get infoContent() {
    return this.#infoContent;
  }

  set infoContent(infoContent) {
    if (!infoContent) {
      return;
    }
    this.#infoContent = infoContent;
    this.#updateInfoWindow();
  }

  get content() {
    return this.#marker.content;
  }

  set content(content) {
    if (!content) {
      return;
    }

    if (content instanceof PinElement) {
      content = content.element;
    }
    this.#marker.content = content;
  }

  show() {
    this.#marker.setMap(this.#map);
  }

  hide() {
    this.#marker.setMap(null);
  }
}
