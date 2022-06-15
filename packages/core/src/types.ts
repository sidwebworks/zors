/**
 * Type guards
 */

import { Command } from "./command";

export const isCommand = (c: any): c is Command => typeof c.name === "string";

export const isCommandPath = (c: any): c is string => typeof c === "string";
