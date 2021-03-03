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
 * @fileoverview Css - CSS Values and utilities to handle them.
 */
import * as Base from "./base";
import * as Exprs from "./exprs";

export class Visitor {
  /**
   * @return void
   */
  visitValues(values: Val[]): any {
    for (let i = 0; i < values.length; i++) {
      values[i].visit(this);
    }
  }

  visitEmpty(empty: Val): Val {
    throw new Error("E_CSS_EMPTY_NOT_ALLOWED");
  }

  visitSlash(slash: Val): Val {
    throw new Error("E_CSS_SLASH_NOT_ALLOWED");
  }

  visitStr(str: Str): Val {
    throw new Error("E_CSS_STR_NOT_ALLOWED");
  }

  visitIdent(ident: Ident): Val {
    throw new Error("E_CSS_IDENT_NOT_ALLOWED");
  }

  visitNumeric(numeric: Numeric): Val {
    throw new Error("E_CSS_NUMERIC_NOT_ALLOWED");
  }

  visitNum(num: Num): Val {
    throw new Error("E_CSS_NUM_NOT_ALLOWED");
  }

  visitInt(num: Int): Val {
    return this.visitNum(num);
  }

  visitColor(color: Color): Val {
    throw new Error("E_CSS_COLOR_NOT_ALLOWED");
  }

  visitURL(url: URL): Val {
    throw new Error("E_CSS_URL_NOT_ALLOWED");
  }

  visitSpaceList(list: SpaceList): Val {
    throw new Error("E_CSS_LIST_NOT_ALLOWED");
  }

  visitCommaList(list: CommaList): Val {
    throw new Error("E_CSS_COMMA_NOT_ALLOWED");
  }

  visitFunc(func: Func): Val {
    throw new Error("E_CSS_FUNC_NOT_ALLOWED");
  }

  visitExpr(expr: Expr): Val {
    throw new Error("E_CSS_EXPR_NOT_ALLOWED");
  }
}

export class FilterVisitor extends Visitor {
  constructor() {
    super();
  }

  visitValues(values: Val[]): Val[] {
    let arr: Val[] = null;
    for (let i = 0; i < values.length; i++) {
      const before = values[i];
      const after = before.visit(this);
      if (arr) {
        arr[i] = after;
      } else if (before !== after) {
        arr = new Array(values.length);
        for (let k = 0; k < i; k++) {
          arr[k] = values[k];
        }
        arr[i] = after;
      }
    }
    return arr || values;
  }

  /**
   * @override
   */
  visitStr(str: Str): Val {
    return str;
  }

  /**
   * @override
   */
  visitIdent(ident: Ident): Val {
    return ident;
  }

  /**
   * @override
   */
  visitSlash(slash: Val): Val {
    return slash;
  }

  /**
   * @override
   */
  visitNumeric(numeric: Numeric): Val {
    return numeric;
  }

  /**
   * @override
   */
  visitNum(num: Num): Val {
    return num;
  }

  /**
   * @override
   */
  visitInt(num: Int): Val {
    return num;
  }

  /**
   * @override
   */
  visitColor(color: Color): Val {
    return color;
  }

  /**
   * @override
   */
  visitURL(url: URL): Val {
    return url;
  }

  /**
   * @override
   */
  visitSpaceList(list: SpaceList): Val {
    const values = this.visitValues(list.values);
    if (values === list.values) {
      return list;
    }
    return new SpaceList(values);
  }

  /**
   * @override
   */
  visitCommaList(list: CommaList): Val {
    const values = this.visitValues(list.values);
    if (values === list.values) {
      return list;
    }
    return new CommaList(values);
  }

  /**
   * @override
   */
  visitFunc(func: Func): Val {
    const values = this.visitValues(func.values);
    if (values === func.values) {
      return func;
    }
    return new Func(func.name, values);
  }

  /**
   * @override
   */
  visitExpr(expr: Expr): Val {
    return expr;
  }
}

export class Val {
  /**
   * @override
   */
  toString(): string {
    const buf = new Base.StringBuffer();
    this.appendTo(buf, true);
    return buf.toString();
  }

  stringValue(): string {
    const buf = new Base.StringBuffer();
    this.appendTo(buf, false);
    return buf.toString();
  }

  toExpr(scope: Exprs.LexicalScope, ref: Exprs.Val): Exprs.Val {
    throw new Error("F_ABSTRACT");
  }

  appendTo(buf: Base.StringBuffer, toString: boolean): void {
    buf.append("[error]");
  }

  isExpr(): boolean {
    return false;
  }

  isNumeric(): boolean {
    return false;
  }

  isNum(): boolean {
    return false;
  }

  isIdent(): boolean {
    return false;
  }

  isSpaceList(): boolean {
    return false;
  }

  visit(visitor: any): any {
    throw new Error("F_ABSTRACT");
  }
}

export class Empty extends Val {
  private static empty: Empty;

  public static get instance(): Empty {
    if (!this.empty) {
      this.empty = new Empty();
    }
    return this.empty;
  }

  private constructor() {
    super();
  }

  /**
   * @override
   */
  toExpr(scope: Exprs.LexicalScope, ref: Exprs.Val): Exprs.Val {
    return new Exprs.Const(scope, "");
  }

  /**
   * @override
   */
  appendTo(buf: Base.StringBuffer, toString: boolean): void {}

  /**
   * @override
   */
  visit(visitor: any): any {
    return visitor.visitEmpty(this);
  }
}

export const empty: Empty = Empty.instance;

export class Slash extends Val {
  private static slash: Slash;

  public static get instance(): Slash {
    if (!this.slash) {
      this.slash = new Slash();
    }
    return this.slash;
  }

  private constructor() {
    super();
  }

  /**
   * @override
   */
  toExpr(scope: Exprs.LexicalScope, ref: Exprs.Val): Exprs.Val {
    return new Exprs.Const(scope, "/");
  }

  /**
   * @override
   */
  appendTo(buf: Base.StringBuffer, toString: boolean): void {
    buf.append("/");
  }

  /**
   * @override
   */
  visit(visitor: any): any {
    return visitor.visitSlash(this);
  }
}

export const slash: Slash = Slash.instance;

export class Str extends Val {
  constructor(public str: string) {
    super();
  }

  /**
   * @override
   */
  toExpr(scope: Exprs.LexicalScope, ref: Exprs.Val): Exprs.Val {
    return new Exprs.Const(scope, this.str);
  }

  /**
   * @override
   */
  appendTo(buf: Base.StringBuffer, toString: boolean): void {
    if (toString) {
      buf.append('"');
      buf.append(Base.escapeCSSStr(this.str));
      buf.append('"');
    } else {
      buf.append(this.str);
    }
  }

  /**
   * @override
   */
  visit(visitor: any): any {
    return visitor.visitStr(this);
  }
}

const nameTable = {};

export class Ident extends Val {
  constructor(public name: string) {
    super();
    if (nameTable[name]) {
      throw new Error("E_INVALID_CALL");
    }
    nameTable[name] = this;
  }

  /**
   * @override
   */
  toExpr(scope: Exprs.LexicalScope, ref: Exprs.Val): Exprs.Val {
    return new Exprs.Const(scope, this.name);
  }

  /**
   * @override
   */
  appendTo(buf: Base.StringBuffer, toString: boolean): void {
    if (toString) {
      buf.append(Base.escapeCSSIdent(this.name));
    } else {
      buf.append(this.name);
    }
  }

  /**
   * @override
   */
  visit(visitor: any): any {
    return visitor.visitIdent(this);
  }

  /**
   * @override
   */
  isIdent(): boolean {
    return true;
  }
}

export function getName(name: string): Ident {
  let r = nameTable[name];
  if (!r) {
    r = new Ident(name);
  }
  return r;
}

export class Numeric extends Val {
  unit: string;

  constructor(public num: number, unit: string) {
    super();
    this.unit = unit.toLowerCase(); // units are case-insensitive in CSS
  }

  /**
   * @override
   */
  toExpr(scope: Exprs.LexicalScope, ref: Exprs.Val): Exprs.Val {
    if (this.num == 0) {
      return scope.zero;
    }
    if (ref && this.unit == "%") {
      if (this.num == 100) {
        return ref;
      }
      return new Exprs.Multiply(
        scope,
        ref,
        new Exprs.Const(scope, this.num / 100),
      );
    }
    return new Exprs.Numeric(scope, this.num, this.unit);
  }

  /**
   * @override
   */
  appendTo(buf: Base.StringBuffer, toString: boolean): void {
    buf.append(this.num.toString());
    buf.append(this.unit);
  }

  /**
   * @override
   */
  visit(visitor: any): any {
    return visitor.visitNumeric(this);
  }

  /**
   * @override
   */
  isNumeric(): boolean {
    return true;
  }
}

export class Num extends Val {
  constructor(public num: number) {
    super();
  }

  /**
   * @override
   */
  toExpr(scope: Exprs.LexicalScope, ref: Exprs.Val): Exprs.Val {
    if (this.num == 0) {
      return scope.zero;
    }
    if (this.num == 1) {
      return scope.one;
    }
    return new Exprs.Const(scope, this.num);
  }

  /**
   * @override
   */
  appendTo(buf: Base.StringBuffer, toString: boolean): void {
    buf.append(this.num.toString());
  }

  /**
   * @override
   */
  visit(visitor: any): any {
    return visitor.visitNum(this);
  }

  /**
   * @override
   */
  isNum(): boolean {
    return true;
  }
}

export class Int extends Num {
  constructor(num: number) {
    super(num);
  }

  /**
   * @override
   */
  visit(visitor: any): any {
    return visitor.visitInt(this);
  }
}

export class Color extends Val {
  constructor(public rgb: number) {
    super();
  }

  /**
   * @override
   */
  appendTo(buf: Base.StringBuffer, toString: boolean): void {
    buf.append("#");
    const str = this.rgb.toString(16);
    buf.append("000000".substr(str.length));
    buf.append(str);
  }

  /**
   * @override
   */
  visit(visitor: any): any {
    return visitor.visitColor(this);
  }
}

export class URL extends Val {
  constructor(public url: string) {
    super();
  }

  /**
   * @override
   */
  appendTo(buf: Base.StringBuffer, toString: boolean): void {
    buf.append('url("');
    buf.append(Base.escapeCSSStr(this.url));
    buf.append('")');
  }

  /**
   * @override
   */
  visit(visitor: any): any {
    return visitor.visitURL(this);
  }
}

export function appendList(
  buf: Base.StringBuffer,
  values: Val[],
  separator: string,
  toString: boolean,
): void {
  const length = values.length;
  if (length > 0) {
    values[0].appendTo(buf, toString);
    for (let i = 1; i < length; i++) {
      buf.append(separator);
      values[i].appendTo(buf, toString);
    }
  }
}

export class SpaceList extends Val {
  constructor(public values: Val[]) {
    super();
  }

  /**
   * @override
   */
  appendTo(buf: Base.StringBuffer, toString: boolean): void {
    appendList(buf, this.values, " ", toString);
  }

  /**
   * @override
   */
  visit(visitor: any): any {
    return visitor.visitSpaceList(this);
  }

  /**
   * @override
   */
  isSpaceList(): boolean {
    return true;
  }
}

export class CommaList extends Val {
  constructor(public values: Val[]) {
    super();
  }

  /**
   * @override
   */
  appendTo(buf: Base.StringBuffer, toString: boolean): void {
    appendList(buf, this.values, ",", toString);
  }

  /**
   * @override
   */
  visit(visitor: any): any {
    return visitor.visitCommaList(this);
  }
}

export class Func extends Val {
  constructor(public name: string, public values: Val[]) {
    super();
  }

  /**
   * @override
   */
  appendTo(buf: Base.StringBuffer, toString: boolean): void {
    buf.append(Base.escapeCSSIdent(this.name));
    buf.append("(");
    appendList(buf, this.values, ",", toString);
    buf.append(")");
  }

  /**
   * @override
   */
  visit(visitor: any): any {
    return visitor.visitFunc(this);
  }
}

export class Expr extends Val {
  constructor(public expr: Exprs.Val) {
    super();
  }

  /**
   * @override
   */
  toExpr(): Exprs.Val {
    return this.expr;
  }

  /**
   * @override
   */
  appendTo(buf: Base.StringBuffer, toString: boolean): void {
    buf.append("-epubx-expr(");
    this.expr.appendTo(buf, 0);
    buf.append(")");
  }

  /**
   * @override
   */
  visit(visitor: any): any {
    return visitor.visitExpr(this);
  }

  /**
   * @override
   */
  isExpr(): boolean {
    return true;
  }
}

export function toNumber(val: Val, context: Exprs.Context): number {
  if (val) {
    if (val.isNumeric()) {
      const numeric = val as Numeric;
      return context.queryUnitSize(numeric.unit, false) * numeric.num;
    }
    if (val.isNum()) {
      return (val as Num).num;
    }
  }
  return 0;
}

/**
 * Convert numeric value to px
 */
export function convertNumericToPx(val: Val, context: Exprs.Context): Numeric {
  return new Numeric(toNumber(val, context), "px");
}

export const ident: { [key: string]: Ident } = {
  absolute: getName("absolute"),
  all: getName("all"),
  always: getName("always"),
  auto: getName("auto"),
  avoid: getName("avoid"),
  balance: getName("balance"),
  balance_all: getName("balance-all"),
  block: getName("block"),
  block_end: getName("block-end"),
  block_start: getName("block-start"),
  both: getName("both"),
  bottom: getName("bottom"),
  border_box: getName("border-box"),
  break_all: getName("break-all"),
  break_word: getName("break-word"),
  crop: getName("crop"),
  cross: getName("cross"),
  column: getName("column"),
  exclusive: getName("exclusive"),
  _false: getName("false"),
  fixed: getName("fixed"),
  flex: getName("flex"),
  footnote: getName("footnote"),
  footer: getName("footer"),
  header: getName("header"),
  hidden: getName("hidden"),
  horizontal_tb: getName("horizontal-tb"),
  inherit: getName("inherit"),
  inline: getName("inline"),
  inline_block: getName("inline-block"),
  inline_end: getName("inline-end"),
  inline_start: getName("inline-start"),
  landscape: getName("landscape"),
  left: getName("left"),
  line: getName("line"),
  list_item: getName("list-item"),
  ltr: getName("ltr"),
  manual: getName("manual"),
  none: getName("none"),
  normal: getName("normal"),
  oeb_page_foot: getName("oeb-page-foot"),
  oeb_page_head: getName("oeb-page-head"),
  page: getName("page"),
  relative: getName("relative"),
  right: getName("right"),
  same: getName("same"),
  scale: getName("scale"),
  snap_block: getName("snap-block"),
  spread: getName("spread"),
  _static: getName("static"),
  rtl: getName("rtl"),
  table: getName("table"),
  table_caption: getName("table-caption"),
  table_cell: getName("table-cell"),
  table_footer_group: getName("table-footer-group"),
  table_header_group: getName("table-header-group"),
  table_row: getName("table-row"),
  top: getName("top"),
  transparent: getName("transparent"),
  vertical_lr: getName("vertical-lr"),
  vertical_rl: getName("vertical-rl"),
  visible: getName("visible"),
  _true: getName("true"),
};

export const hundredPercent: Numeric = new Numeric(100, "%");

export const fullWidth: Numeric = new Numeric(100, "pvw");

export const fullHeight: Numeric = new Numeric(100, "pvh");

export const numericZero: Numeric = new Numeric(0, "px");

export const processingOrder = {
  "font-size": 1,
  color: 2,
};

/**
 * Function to sort property names in the order they should be processed
 */
export function processingOrderFn(name1: string, name2: string): number {
  const n1 = processingOrder[name1] || Number.MAX_VALUE;
  const n2 = processingOrder[name2] || Number.MAX_VALUE;
  return n1 - n2;
}
