import { readFileSync, promises, existsSync, writeFileSync } from "fs";
import {
  getDir,
  logIntro,
  sleep,
} from "./utils/index.js";
import consoleStamp from "console-stamp";
import axios from "axios";
import chalk from "chalk";

const config = JSON.parse(readFileSync(getDir("config.json"), "utf8"));

const main = async () => {


  const execute = async () => {

  };

  execute();
};

logIntro();
consoleStamp(console, {
  format: ":date(yyyy/mm/dd HH:MM:ss)",
});
main();
