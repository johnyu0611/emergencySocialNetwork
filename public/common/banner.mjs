import { BANNER_AUTOCLOSE_MILLIS } from "./constants.mjs";
import { sleep } from "./utils.mjs";

export class Banner {
  #$banner;

  constructor($banner) {
    this.#$banner = $banner;
  }

  reset() {
    this.#$banner.hide();
    this.#resetVariant();
    this.#$banner.text("");
  }

  #resetVariant() {
    this.#$banner.removeClass();
    this.#$banner.addClass("alert");
  }

  async #showMessage(string, millis) {
    this.#$banner.text(string);
    this.#$banner.show();

    if (!millis) {
      return;
    }
    await sleep(millis);
    this.reset();
  }

  async showInfoMessage(string, millis = BANNER_AUTOCLOSE_MILLIS) {
    this.#resetVariant();
    this.#$banner.addClass("alert-info");
    await this.#showMessage(string, millis);
  }

  async showWarningMessage(string, millis = BANNER_AUTOCLOSE_MILLIS) {
    this.#resetVariant();
    this.#$banner.addClass("alert-warning");
    await this.#showMessage(string, millis);
  }

  async showErrorMessage(string, millis = BANNER_AUTOCLOSE_MILLIS) {
    this.#resetVariant();
    this.#$banner.addClass("alert-danger");
    await this.#showMessage(string, millis);
  }

  async showSuccessMessage(string, millis = BANNER_AUTOCLOSE_MILLIS) {
    this.#resetVariant();
    this.#$banner.addClass("alert-success");
    await this.#showMessage(string, millis);
  }

  async showError(e, millis = BANNER_AUTOCLOSE_MILLIS) {
    if (e instanceof Error) {
      await this.showErrorMessage(e.message, millis);
    } else {
      await this.showErrorMessage(toString(e), millis);
    }
  }
}
