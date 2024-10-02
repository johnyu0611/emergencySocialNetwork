import { bannedUsernameSet } from "./common/banned-username-set.mjs";
import { Banner } from "./common/banner.mjs";
import { KEY_TOKEN } from "./common/constants.mjs";
import { FormValidator } from "./common/form-validator.mjs";
import { createUser } from "./lib/create-user.mjs";
import { login } from "./lib/login.mjs";

const banner = new Banner($("#banner"));
const $form = $("#form");
const formValidator = new FormValidator($form);
const $inputUsername = $("#input-username");
const $inputPassword = $("#input-password");
const modalConfirmJoin = new bootstrap.Modal($("#modal-confirm-join"));
const modalWelcome = new bootstrap.Modal($("#modal-welcome"));

formValidator.setValidator($inputUsername, (field) => {
  const username = field.val().trim();

  if (username.length < 3) {
    return "Username should be at least 3 characters long";
  }
  if (bannedUsernameSet.has(username.toLowerCase())) {
    return "Username should not be a banned name";
  }
});

formValidator.setValidator($inputPassword, (field) => {
  const password = field.val();

  if (password.length < 4) {
    return "Password should be at least 4 characters long";
  }
});

async function onSubmit(event) {
  event.preventDefault();

  if (!formValidator.validate()) {
    return;
  }

  const username = $inputUsername.val();
  const password = $inputPassword.val();
  const payload = { username, password };
  try {
    const { token } = await login(payload);
    localStorage.setItem(KEY_TOKEN, token);
    location.href = "directory.html";
  } catch (error) {
    if (error.status === 404) {
      modalConfirmJoin.show();
      return;
    }
    banner.showError(error);
    console.error(error);
  }
}

async function onConfirmJoin(event) {
  event.preventDefault();

  try {
    const username = $inputUsername.val();
    const password = $inputPassword.val();

    const payload = { username, password };
    const { token } = await createUser(payload);
    $form[0].reset();

    modalConfirmJoin.hide();
    modalWelcome.show();
    localStorage.setItem(KEY_TOKEN, token);
  } catch (error) {
    void banner.showError(error);
    console.error(error);
  }
}

function onConfirmWelcome(event) {
  event.preventDefault();
  modalWelcome.hide();
  location.href = "directory.html";
}

function onUsernameInputChange() {
  $inputUsername.val(
    $inputUsername
      .val()
      .replace(/[^a-z0-9]/gu, "")
      .substring(0, 32)
  );
}

function onPasswordInputChange() {
  $inputPassword.val(
    $inputPassword
      .val()
      .replace(/[^ -~]/gu, "")
      .substring(0, 64)
  );
}

$(document).ready(() => {
  $form.on("submit", onSubmit);
  $("#modal-confirm-join-btn-confirm").on("click", onConfirmJoin);
  $("#modal-welcome-btn-confirm").on("click", onConfirmWelcome);
  $inputUsername.on("input", onUsernameInputChange);
  $inputPassword.on("input", onPasswordInputChange);
});
