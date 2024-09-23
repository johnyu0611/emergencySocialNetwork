/*
 * This loader enables proper behavior of ESM alias in Node.js environment.
 */
import { register } from "module";
import { pathToFileURL } from "url";

register("esm-module-alias/loader", pathToFileURL("./"));
