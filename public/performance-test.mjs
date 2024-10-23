import { Banner } from "./common/banner.mjs";
import {
  KEY_TOKEN,
  PUBLIC_CHATROOM_ID,
  TEST_POST_PORTION,
  TEST_GET_PORTION
} from "./common/constants.mjs";
import { sleep } from "./common/utils.mjs";
import { changeSystemState } from "./lib/change-system-state.mjs";
import {
  ENDPOINT_SOCKET_IO,
  NAMESPACE_SOCKET_IO_SYSTEM
} from "./lib/endpoints.mjs";
import { getMessageDetails } from "./lib/get-message-details.mjs";
import { postMessage } from "./lib/post-message.mjs";
import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";
import { CancelledException } from "./common/errors.mjs";

class StartStopButton {
  #$button;
  #isStarted;
  #onStart;
  #onStop;

  constructor($button, onStart, onStop) {
    this.#$button = $button;
    this.#isStarted = false;
    this.#onStart = onStart;
    this.#onStop = onStop;
    this.#$button.on("click", this.click.bind(this));
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
    this.#$button.find("svg").attr("data-icon", "play");
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
const $inputDuration = $("#input-duration");
const $inputInterval = $("#input-interval");
const buttonStartStop = new StartStopButton(
  $("#button-start-stop"),
  onStart,
  onStop
);
const $output = $("#output");

function print(string) {
  $output.val($output.val() + string + "\n");
}

async function runTests(
  duration,
  interval,
  countLimitHard,
  countLimitSoft,
  callback
) {
  let count = 0;
  const testStartTime = Date.now();

  while (count < countLimitSoft && Date.now() - testStartTime < duration) {
    if (!buttonStartStop.isStarted) {
      throw new CancelledException("Test aborted");
    }
    if (count >= countLimitHard) {
      throw new CancelledException("Maximum count reached");
    }

    const operationStartTime = Date.now();
    await callback();
    const operationEndTime = Date.now();

    const sleepTime = interval - (operationEndTime - operationStartTime);
    if (sleepTime > 0) {
      await sleep(sleepTime);
    }

    count++;
  }

  const testEndTime = Date.now();
  return (count / (testEndTime - testStartTime)) * 1000;
}

async function onStart(event) {
  event || event.preventDefault();
  buttonStartStop.isStarted = true;

  const duration = parseFloat($inputDuration.val()) * 1000;
  const interval = parseFloat($inputInterval.val());

  if (isNaN(duration) || duration <= 0) {
    void banner.showErrorMessage("Duration should be a positive number");
    return false;
  }

  if (isNaN(interval) || interval <= 0) {
    void banner.showErrorMessage("Interval should be a positive number");
    return false;
  }

  void startTest(duration, interval);
  return true;
}

async function startTest(duration, interval) {
  const messageIds = [];
  const token = localStorage.getItem(KEY_TOKEN);

  try {
    print("Switching system state to performance test...");
    await changeSystemState({ state: "performanceTest", token });
    print("Switched system state to performance test");

    print("Running POST performance test");
    const postResult = await runTests(
      TEST_POST_PORTION * duration,
      interval,
      1000,
      Infinity,
      async () => {
        const { id } = await postMessage({
          roomId: PUBLIC_CHATROOM_ID,
          token,
          content: "FSE is so amazing!!!"
        });
        messageIds.push(id);
      }
    );
    print(`Number of POST requests completed per second: ${postResult}`);

    print("Running GET performance test");
    let i = 0;
    const getResult = await runTests(
      TEST_GET_PORTION * duration,
      interval,
      Infinity,
      messageIds.length,
      async () => {
        await getMessageDetails({
          token,
          roomId: PUBLIC_CHATROOM_ID,
          messageId: messageIds[i++]
        });
      }
    );
    print(`Number of GET requests completed per second: ${getResult}`);
  } catch (error) {
    if (error instanceof CancelledException) {
      print(error.message);
    }
    void banner.showError(error);
    console.error(error);
  } finally {
    print("Switching system state to normal...");
    await changeSystemState({ state: "normal", token });
    print("Switched system state to normal");
    print("");

    buttonStartStop.isStarted = false;
  }
}

async function onStop(event) {
  event || event.preventDefault();
  buttonStartStop.isStarted = false;
  return true;
}

async function onSystemConnect() {
  void banner.showSuccessMessage("Connected");
}

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

function onSystemMaintenance() {
  void banner.showWarningMessage("System is in maintenance mode");
}

$(document).ready(() => {
  const socket = io(NAMESPACE_SOCKET_IO_SYSTEM, {
    path: ENDPOINT_SOCKET_IO,
    auth: {
      token: localStorage.getItem(KEY_TOKEN)
    }
  });

  socket.on("connect", onSystemConnect);
  socket.on("connect_error", onSystemConnectError(socket));
  socket.on("system_maintenance", onSystemMaintenance);
});
