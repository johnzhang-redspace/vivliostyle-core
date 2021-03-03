/**
 * Copyright 2013 Google, Inc.
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
 * @fileoverview Cfi - Support for EPUB Canonical Fragment Identifiers.
 */
import * as Base from "./base";

export type Position = {
  node: Node;
  offset: number;
  after: boolean;
  sideBias: string | null;
  ref: Fragment;
};

export function getId(node: Node): string | null {
  if (node.nodeType == 1) {
    const idtxt = (node as Element).getAttribute("id");
    if (idtxt) {
      return idtxt;
    }
  }
  return null;
}

export function escapeChar(ch: string): string {
  return `^${ch}`;
}

export function escape(str: string): string {
  return str.replace(/[\[\]\(\),=;^]/g, escapeChar);
}

export function unescapeChar(str: string): string {
  return str.substr(1);
}

export function unescape(str: string): string {
  if (!str) {
    return str;
  }
  return str.replace(/\^[\[\]\(\),=;^]/g, unescapeChar);
}

export function parseExtVal(extstr: string): string | string[] {
  const result = [];
  do {
    const r = extstr.match(/^(\^,|[^,])*/);
    const p = unescape(r[0]);
    extstr = extstr.substr(r[0].length + 1);
    if (!extstr && !result.length) {
      return p;
    }
    result.push(p);
  } while (extstr);
  return result;
}

export function parseExt(extstr: string): { [key: string]: string | string[] } {
  const ext = {};
  while (extstr) {
    const r = extstr.match(/^;([^;=]+)=(([^;]|\^;)*)/);
    if (!r) {
      return ext;
    }
    ext[r[1]] = parseExtVal(r[2]);
    extstr = extstr.substr(r[0].length);
  }
  return ext;
}

export interface Step {
  appendTo(sb: Base.StringBuffer): void;

  applyTo(pos: Position): boolean;
}

export class RefStep implements Step {
  appendTo(sb: Base.StringBuffer) {
    sb.append("!");
  }

  /**
   * @override
   */
  applyTo(pos: Position): boolean {
    return false;
  }
}

export class ChildStep implements Step {
  constructor(
    public readonly index: number,
    public readonly id: string | null,
    public readonly sideBias: string | null,
  ) {}

  /**
   * @override
   */
  appendTo(sb: Base.StringBuffer): void {
    sb.append("/");
    sb.append(this.index.toString());
    if (this.id || this.sideBias) {
      sb.append("[");
      if (this.id) {
        sb.append(this.id);
      }
      if (this.sideBias) {
        sb.append(";s=");
        sb.append(this.sideBias);
      }
      sb.append("]");
    }
  }

  /**
   * @override
   */
  applyTo(pos: Position): boolean {
    if (pos.node.nodeType != 1) {
      throw new Error("E_CFI_NOT_ELEMENT");
    }
    const elem = pos.node as Element;
    const childElements = elem.children;
    const childElementCount = childElements.length;
    let child: Node;
    const childIndex = Math.floor(this.index / 2) - 1;
    if (childIndex < 0 || childElementCount == 0) {
      child = elem.firstChild;
      pos.node = child || elem;
    } else {
      child = childElements[Math.min(childIndex, childElementCount - 1)];
      if (this.index & 1) {
        const next = child.nextSibling;
        if (!next || next.nodeType == 1) {
          pos.after = true;
        } else {
          child = next;
        }
      }
      pos.node = child;
    }
    if (this.id && (pos.after || this.id != getId(pos.node))) {
      throw new Error("E_CFI_ID_MISMATCH");
    }
    pos.sideBias = this.sideBias;
    return true;
  }
}

export class OffsetStep implements Step {
  constructor(
    public readonly offset: number,
    public readonly textBefore: string | null,
    public readonly textAfter: string | null,
    public readonly sideBias: string | null,
  ) {}

  applyTo(pos: Position): boolean {
    if (this.offset > 0 && !pos.after) {
      let offset = this.offset;
      let node = pos.node;
      while (true) {
        const nodeType = node.nodeType;
        if (nodeType == 1) {
          break;
        }
        const next = node.nextSibling;
        if (3 <= nodeType && nodeType <= 5) {
          const textLength = node.textContent.length;
          if (offset <= textLength) {
            break;
          }
          if (!next) {
            offset = textLength;
            break;
          }
          offset -= textLength;
        }
        if (!next) {
          offset = 0;
          break;
        }
        node = next;
      }
      pos.node = node;
      pos.offset = offset;
    }
    pos.sideBias = this.sideBias;
    return true;
  }

  /**
   * @override
   */
  appendTo(sb: Base.StringBuffer): void {
    sb.append(":");
    sb.append(this.offset.toString());
    if (this.textBefore || this.textAfter || this.sideBias) {
      sb.append("[");
      if (this.textBefore || this.textAfter) {
        if (this.textBefore) {
          sb.append(escape(this.textBefore));
        }
        sb.append(",");
        if (this.textAfter) {
          sb.append(escape(this.textAfter));
        }
      }
      if (this.sideBias) {
        sb.append(";s=");
        sb.append(this.sideBias);
      }
      sb.append("]");
    }
  }
}

export class Fragment {
  steps: Step[] = null;

  fromString(fragstr: string): void {
    let r = fragstr.match(/^#?epubcfi\((.*)\)$/);
    if (!r) {
      throw new Error("E_CFI_NOT_CFI");
    }
    const str = decodeURIComponent(r[1]);
    let i = 0;
    const steps = [];
    while (true) {
      let ext: {
        [key: string]: string | string[];
      };
      switch (str.charAt(i)) {
        case "/": {
          i++;
          r = str
            .substr(i)
            .match(/^(0|[1-9][0-9]*)(\[(.*?)(;([^\]]|\^\])*)?\])?/);
          if (!r) {
            throw new Error("E_CFI_NUMBER_EXPECTED");
          }
          i += r[0].length;
          const index = parseInt(r[1], 10);
          const id = r[3];
          ext = parseExt(r[4]);
          steps.push(new ChildStep(index, id, Base.asString(ext["s"])));
          break;
        }
        case ":": {
          i++;
          r = str
            .substr(i)
            .match(
              /^(0|[1-9][0-9]*)(\[((([^\];,]|\^[\];,])*)(,(([^\];,]|\^[\];,])*))?)(;([^]]|\^\])*)?\])?/,
            );
          if (!r) {
            throw new Error("E_CFI_NUMBER_EXPECTED");
          }
          i += r[0].length;
          const offset = parseInt(r[1], 10);
          let textBefore = r[4];
          if (textBefore) {
            textBefore = unescape(textBefore);
          }
          let textAfter = r[7];
          if (textAfter) {
            textAfter = unescape(textAfter);
          }
          ext = parseExt(r[10]);
          steps.push(
            new OffsetStep(
              offset,
              textBefore,
              textAfter,
              Base.asString(ext["s"]),
            ),
          );
          break;
        }
        case "!":
          i++;
          steps.push(new RefStep());
          break;
        case "~":
        case "@":

        // Time/space terminus; only useful for highlights/selections which are
        // not yet supported, skip for now. fall through
        case "":
          this.steps = steps;
          return;
        default:
          throw new Error("E_CFI_PARSE_ERROR");
      }
    }
  }

  navigate(doc: Document): Position {
    const pos = {
      node: doc.documentElement,
      offset: 0,
      after: false,
      sideBias: null,
      ref: null,
    };
    for (let i = 0; i < this.steps.length; i++) {
      if (!this.steps[i].applyTo(pos)) {
        pos.ref = new Fragment();
        pos.ref.steps = this.steps.slice(i + 1);
        break;
      }
    }
    return pos;
  }

  trim(text: string, after: boolean): string {
    return text
      .replace(/\s+/g, " ")
      .match(
        after
          ? /^[ -\uD7FF\uE000-\uFFFF]{0,8}/
          : /[ -\uD7FF\uE000-\uFFFF]{0,8}$/,
      )[0]
      .replace(/^\s/, "")
      .replace(/\s$/, "");
  }

  /**
   * Initialize from a node and an offset.
   */
  prependPathFromNode(
    node: Node,
    offset: number,
    after: boolean,
    sideBias: string | null,
  ) {
    const steps = [];
    let parent = node.parentNode;
    let textBefore = "";
    let textAfter = "";
    while (node) {
      switch (node.nodeType) {
        case 3: // Text nodes
        case 4:
        case 5: {
          const text = node.textContent;
          const textLength = text.length;
          if (after) {
            offset += textLength;
            if (!textBefore) {
              textBefore = text;
            }
          } else {
            if (offset > textLength) {
              offset = textLength;
            }
            after = true;
            textBefore = text.substr(0, offset);
            textAfter = text.substr(offset);
          }
          node = node.previousSibling;
          continue;
        }
        case 8: // Comment Node
          node = node.previousSibling;
          continue;
      }
      break;
    }
    if (offset > 0 || textBefore || textAfter) {
      textBefore = this.trim(textBefore, false);
      textAfter = this.trim(textAfter, true);
      steps.push(new OffsetStep(offset, textBefore, textAfter, sideBias));
      sideBias = null;
    }
    while (parent) {
      if (!parent || parent.nodeType == 9) {
        break;
      }
      const id = after ? null : getId(node);
      let index = after ? 1 : 0;
      while (node) {
        if (node.nodeType == 1) {
          index += 2;
        }
        node = node.previousSibling;
      }
      steps.push(new ChildStep(index, id, sideBias));
      sideBias = null;
      node = parent;
      parent = parent.parentNode;
      after = false;
    }
    steps.reverse();
    if (this.steps) {
      steps.push(new RefStep());
      this.steps = steps.concat(this.steps);
    } else {
      this.steps = steps;
    }
  }

  toString(): string {
    if (!this.steps) {
      return "";
    }
    const sb = new Base.StringBuffer();
    sb.append("epubcfi(");
    for (let i = 0; i < this.steps.length; i++) {
      this.steps[i].appendTo(sb);
    }
    sb.append(")");
    return sb.toString().replace(/%/g, "%25");
  }
}
