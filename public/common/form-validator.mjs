const isInvalidClassName = "is-invalid";

export class FormValidator {
  #validatorMap;

  constructor() {
    this.#validatorMap = new Map();
  }

  setValidator($field, validator) {
    if (typeof $field !== "object") {
      throw new Error("Field must be a jQuery DOM object");
    }
    if (typeof validator !== "function") {
      throw new Error("Validator should be a function");
    }
    this.#validatorMap.set($field, validator);
  }

  validate() {
    let isValid = true;
    this.#validatorMap.forEach((validator, $field) => {
      const divInvalidFeedback = $field
        .parent()
        .parent()
        .find(".invalid-feedback");
      const message = validator($field);
      if (message) {
        isValid = false;
        $field.addClass(isInvalidClassName);
        divInvalidFeedback.text(message);
        divInvalidFeedback.show();
      } else {
        $field.removeClass(isInvalidClassName);
        divInvalidFeedback.text("");
        divInvalidFeedback.hide();
      }
    });
    return isValid;
  }
}
