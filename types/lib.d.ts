/**
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
 */

// This provides build environment, NODE_ENV is 'production' or not.
// The variable is injected by webpack.
declare var VIVLIOSTYLE_DEBUG: boolean;

interface Element {
  // `setAttribute` seems to allow non-string values.
  // https://github.com/Microsoft/TypeScript/issues/15368
  setAttribute(qualifiedName: string, value: number): void;
  setAttribute(qualifiedName: string, value: boolean): void;
}
