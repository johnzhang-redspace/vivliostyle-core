/**
 * Copyright 2015 Trim-marks Inc.
 * Copyright 2019 Vivliostyle Foundation
 *
 * Vivliostyle.js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Vivliostyle.js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Vivliostyle.js.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @fileoverview Profile - Utility for profiling
 */
import * as Logging from "./logging";

/**
 * Performance profiler measuring execution time of the script.
 */
export class Profiler {
  timestamps: { [key: string]: { [key: string]: number } } = {};
  private registerTiming: (p1: string, p2: string, p3?: number) => any;
  registerStartTiming: (name: string, timestamp?: number) => any;
  registerEndTiming: (name: string, timestamp?: number) => any;

  constructor(public readonly performanceInstance: Performance) {
    this.registerTiming = noop;

    // hack to export (non-prototype) methods
    this["registerStartTiming"] = this.registerStartTiming = noop;
    this["registerEndTiming"] = this.registerEndTiming = noop;
  }

  /**
   * Registers start timing of some event, even if profile is disabled.
   * @param name Name of event
   * @param timestamp Used as the actual timestamp of the event if specified,
   *     instead of "now"
   */
  forceRegisterStartTiming(name: string, timestamp?: number) {
    registerTiming.call(this, name, "start", timestamp);
  }

  /**
   * Registers end timing of some event, even if profile is disabled.
   * @param name Name of event
   * @param timestamp Used as the actual timestamp of the event if specified,
   *     instead of "now"
   */
  forceRegisterEndTiming(name: string, timestamp?: number) {
    registerTiming.call(this, name, "end", timestamp);
  }

  /**
   * Log registered timings (start/end/duration).
   * All values are printed in ms unit.
   */
  printTimings() {
    const timestamps = this.timestamps;
    let st = "";
    Object.keys(timestamps).forEach((name) => {
      const stamps = timestamps[name];
      const l = stamps.length;
      for (let i = 0; i < l; i++) {
        const t = stamps[i];
        st += name;
        if (l > 1) {
          st += `(${i})`;
        }
        st += ` => start: ${t["start"]}, end: ${t["end"]}, duration: ${
          t["end"] - t["start"]
        }\n`;
      }
    });
    Logging.logger.info(st);
  }

  /**
   * Disable profiling.
   */
  disable() {
    this.registerTiming = noop;

    // hack to export (non-prototype) methods
    this["registerStartTiming"] = this.registerStartTiming = noop;
    this["registerEndTiming"] = this.registerEndTiming = noop;
  }

  /**
   * Enable profiling.
   */
  enable() {
    this.registerTiming = registerTiming;

    // hack to export (non-prototype) methods
    this[
      "registerStartTiming"
    ] = this.registerStartTiming = registerStartTiming;
    this["registerEndTiming"] = this.registerEndTiming = registerEndTiming;
  }

  /**
   * Returns if profiling is enabled or not.
   */
  isEnabled(): boolean {
    return this.registerStartTiming === registerStartTiming;
  }
}

function noop(): void {}

/**
 * Registers start/end timing of some event.
 * @this {Profile.Profiler}
 * @param name Name of event
 * @param startEnd Either of "start" or "end"
 * @param timestamp Used as the actual timestamp of the event if specified,
 *     instead of "now"
 */
function registerTiming(
  name: string,
  startEnd: string,
  timestamp?: number,
): void {
  if (!timestamp) {
    timestamp = this.performanceInstance.now();
  }
  let timestamps = this.timestamps[name];
  if (!timestamps) {
    timestamps = this.timestamps[name] = [];
  }
  let t;
  const l = timestamps.length;
  for (let i = l - 1; i >= 0; i--) {
    t = timestamps[i];
    if (t && !t[startEnd]) {
      break;
    }
    t = null;
  }
  if (!t) {
    t = {};
    timestamps.push(t);
  }
  t[startEnd] = timestamp;
}

/**
 * Registers start timing of some event.
 * @this {Profile.Profiler}
 * @param name Name of event
 * @param timestamp Used as the actual timestamp of the event if specified,
 *     instead of "now"
 */
function registerStartTiming(name: string, timestamp?: number): void {
  this.registerTiming(name, "start", timestamp);
}

/**
 * Registers end timing of some event.
 * @this {Profile.Profiler}
 * @param name Name of event
 * @param timestamp Used as the actual timestamp of the event if specified,
 *     instead of "now"
 */
function registerEndTiming(name: string, timestamp?: number): void {
  this.registerTiming(name, "end", timestamp);
}
const fallbackPerformanceInstance = { now: Date.now } as Performance;
const performanceInstance = window && window.performance;
export const profiler = new Profiler(
  performanceInstance || fallbackPerformanceInstance,
);
profiler.forceRegisterStartTiming("load_vivliostyle");

/**
 * Pubilc members of the bundled library.
 */
export const profile = {
  profiler: {
    registerStartTiming: profiler.registerStartTiming,
    registerEndTiming: profiler.registerEndTiming,
    printTimings: profiler.printTimings,
    disable: profiler.disable,
    enable: profiler.enable,
  },
};
