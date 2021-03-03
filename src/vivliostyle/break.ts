/**
 * Copyright 2016 Trim-marks Inc.
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
 * @fileoverview Break - Control fragmentation.
 */
import * as Css from "./css";
import * as Plugin from "./plugin";

/**
 * Convert old page-break-* properties to break-* properties with appropriate
 * values as specified by CSS Fragmentation module:
 * https://drafts.csswg.org/css-break/#page-break-properties
 */
export function convertPageBreakAliases(original: {
  name: string;
  value: Css.Val;
  important: boolean;
}): { name: string; value: Css.Val; important: boolean } {
  const name = original["name"];
  const value = original["value"];
  switch (name) {
    case "page-break-before":
    case "page-break-after":
    case "page-break-inside":
      return {
        name: name.replace(/^page-/, ""),
        value: value === Css.ident.always ? Css.ident.page : value,
        important: original["important"],
      };
    default:
      return original;
  }
}

export const forcedBreakValues: { [key: string]: boolean | null } = {
  page: true,
  left: true,
  right: true,
  recto: true,
  verso: true,
  column: true,
  region: true,
};

/**
 * Returns if the value is one of the forced break values.
 * @param value The break value to be judged. Treats null as 'auto'.
 */
export function isForcedBreakValue(value: string | null): boolean {
  return !!forcedBreakValues[value];
}

export const spreadBreakValues: { [key: string]: boolean | null } = {
  left: true,
  right: true,
  recto: true,
  verso: true,
};

/**
 * Returns if the value is one of left/right/recto/verso values.
 * @param value The break value to be judged. Treats null as 'auto'.
 */
export function isSpreadBreakValue(value: string | null): boolean {
  return !!spreadBreakValues[value];
}

export const avoidBreakValues: { [key: string]: boolean | null } = {
  avoid: true,
  "avoid-page": true,
  "avoid-column": true,
  "avoid-region": true,
};

/**
 * Returns if the value is one of the avoid break values.
 * @param value The break value to be judged. Treats null as 'auto'.
 */
export function isAvoidBreakValue(value: string | null): boolean {
  return !!avoidBreakValues[value];
}

/**
 * Resolves the effective break value given two break values at a single break
 * point. The order of the arguments are relevant, since a value specified on
 * the latter element takes precedence over one on the former. A forced break
 * value is chosen if present. Otherwise, an avoid break value is chosen if
 * present. See CSS Fragmentation Module for the rule:
 *  https://drafts.csswg.org/css-break/#forced-breaks
 *  https://drafts.csswg.org/css-break/#unforced-breaks
 * Note that though the spec requires to honor multiple break values at a single
 * break point, the current implementation choose one of them and discard the
 * others.
 * @param first The break value specified on the former element. null means
 *     'auto' (not specified)
 * @param second The break value specified on the latter element. null means
 *     'auto' (not specified)
 */
export function resolveEffectiveBreakValue(
  first: string | null,
  second: string | null,
): string | null {
  if (!first) {
    return second;
  } else if (!second) {
    return first;
  } else if (isSpreadBreakValue(second)) {
    return second;
  } else if (isSpreadBreakValue(first)) {
    return first;
  } else {
    const firstIsForcedBreakValue = isForcedBreakValue(first);
    const secondIsForcedBreakValue = isForcedBreakValue(second);
    if (firstIsForcedBreakValue && secondIsForcedBreakValue) {
      switch (second) {
        case "column":
          // "column" is the weakest value
          return first;
        case "region":
          // "region" is stronger than "column" but weaker than page
          // values
          return first === "column" ? second : first;
        default:
          // page values are strongest
          return second;
      }
    } else if (secondIsForcedBreakValue) {
      return second;
    } else if (firstIsForcedBreakValue) {
      return first;
    } else if (isAvoidBreakValue(second)) {
      return second;
    } else if (isAvoidBreakValue(first)) {
      return first;
    } else {
      return second;
    }
  }
}

export function breakValueToStartSideValue(breakValue: string | null): string {
  switch (breakValue) {
    case "left":
    case "right":
    case "recto":
    case "verso":
      return breakValue;
    default:
      return "any";
  }
}

export function startSideValueToBreakValue(
  startSideValue: string,
): string | null {
  switch (startSideValue) {
    case "left":
    case "right":
    case "recto":
    case "verso":
      return startSideValue;
    default:
      return null;
  }
}

Plugin.registerHook("SIMPLE_PROPERTY", convertPageBreakAliases);
