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
export declare class Visitor {
    /**
     * @return void
     */
    visitValues(values: Val[]): any;
    visitEmpty(empty: Val): Val;
    visitSlash(slash: Val): Val;
    visitStr(str: Str): Val;
    visitIdent(ident: Ident): Val;
    visitNumeric(numeric: Numeric): Val;
    visitNum(num: Num): Val;
    visitInt(num: Int): Val;
    visitColor(color: Color): Val;
    visitURL(url: URL): Val;
    visitSpaceList(list: SpaceList): Val;
    visitCommaList(list: CommaList): Val;
    visitFunc(func: Func): Val;
    visitExpr(expr: Expr): Val;
}
export declare class FilterVisitor extends Visitor {
    constructor();
    visitValues(values: Val[]): Val[];
    /**
     * @override
     */
    visitStr(str: Str): Val;
    /**
     * @override
     */
    visitIdent(ident: Ident): Val;
    /**
     * @override
     */
    visitSlash(slash: Val): Val;
    /**
     * @override
     */
    visitNumeric(numeric: Numeric): Val;
    /**
     * @override
     */
    visitNum(num: Num): Val;
    /**
     * @override
     */
    visitInt(num: Int): Val;
    /**
     * @override
     */
    visitColor(color: Color): Val;
    /**
     * @override
     */
    visitURL(url: URL): Val;
    /**
     * @override
     */
    visitSpaceList(list: SpaceList): Val;
    /**
     * @override
     */
    visitCommaList(list: CommaList): Val;
    /**
     * @override
     */
    visitFunc(func: Func): Val;
    /**
     * @override
     */
    visitExpr(expr: Expr): Val;
}
export declare class Val {
    /**
     * @override
     */
    toString(): string;
    stringValue(): string;
    toExpr(scope: Exprs.LexicalScope, ref: Exprs.Val): Exprs.Val;
    appendTo(buf: Base.StringBuffer, toString: boolean): void;
    isExpr(): boolean;
    isNumeric(): boolean;
    isNum(): boolean;
    isIdent(): boolean;
    isSpaceList(): boolean;
    visit(visitor: any): any;
}
export declare class Empty extends Val {
    private static empty;
    static get instance(): Empty;
    private constructor();
    /**
     * @override
     */
    toExpr(scope: Exprs.LexicalScope, ref: Exprs.Val): Exprs.Val;
    /**
     * @override
     */
    appendTo(buf: Base.StringBuffer, toString: boolean): void;
    /**
     * @override
     */
    visit(visitor: any): any;
}
export declare const empty: Empty;
export declare class Slash extends Val {
    private static slash;
    static get instance(): Slash;
    private constructor();
    /**
     * @override
     */
    toExpr(scope: Exprs.LexicalScope, ref: Exprs.Val): Exprs.Val;
    /**
     * @override
     */
    appendTo(buf: Base.StringBuffer, toString: boolean): void;
    /**
     * @override
     */
    visit(visitor: any): any;
}
export declare const slash: Slash;
export declare class Str extends Val {
    str: string;
    constructor(str: string);
    /**
     * @override
     */
    toExpr(scope: Exprs.LexicalScope, ref: Exprs.Val): Exprs.Val;
    /**
     * @override
     */
    appendTo(buf: Base.StringBuffer, toString: boolean): void;
    /**
     * @override
     */
    visit(visitor: any): any;
}
export declare class Ident extends Val {
    name: string;
    constructor(name: string);
    /**
     * @override
     */
    toExpr(scope: Exprs.LexicalScope, ref: Exprs.Val): Exprs.Val;
    /**
     * @override
     */
    appendTo(buf: Base.StringBuffer, toString: boolean): void;
    /**
     * @override
     */
    visit(visitor: any): any;
    /**
     * @override
     */
    isIdent(): boolean;
}
export declare function getName(name: string): Ident;
export declare class Numeric extends Val {
    num: number;
    unit: string;
    constructor(num: number, unit: string);
    /**
     * @override
     */
    toExpr(scope: Exprs.LexicalScope, ref: Exprs.Val): Exprs.Val;
    /**
     * @override
     */
    appendTo(buf: Base.StringBuffer, toString: boolean): void;
    /**
     * @override
     */
    visit(visitor: any): any;
    /**
     * @override
     */
    isNumeric(): boolean;
}
export declare class Num extends Val {
    num: number;
    constructor(num: number);
    /**
     * @override
     */
    toExpr(scope: Exprs.LexicalScope, ref: Exprs.Val): Exprs.Val;
    /**
     * @override
     */
    appendTo(buf: Base.StringBuffer, toString: boolean): void;
    /**
     * @override
     */
    visit(visitor: any): any;
    /**
     * @override
     */
    isNum(): boolean;
}
export declare class Int extends Num {
    constructor(num: number);
    /**
     * @override
     */
    visit(visitor: any): any;
}
export declare class Color extends Val {
    rgb: number;
    constructor(rgb: number);
    /**
     * @override
     */
    appendTo(buf: Base.StringBuffer, toString: boolean): void;
    /**
     * @override
     */
    visit(visitor: any): any;
}
export declare class URL extends Val {
    url: string;
    constructor(url: string);
    /**
     * @override
     */
    appendTo(buf: Base.StringBuffer, toString: boolean): void;
    /**
     * @override
     */
    visit(visitor: any): any;
}
export declare function appendList(buf: Base.StringBuffer, values: Val[], separator: string, toString: boolean): void;
export declare class SpaceList extends Val {
    values: Val[];
    constructor(values: Val[]);
    /**
     * @override
     */
    appendTo(buf: Base.StringBuffer, toString: boolean): void;
    /**
     * @override
     */
    visit(visitor: any): any;
    /**
     * @override
     */
    isSpaceList(): boolean;
}
export declare class CommaList extends Val {
    values: Val[];
    constructor(values: Val[]);
    /**
     * @override
     */
    appendTo(buf: Base.StringBuffer, toString: boolean): void;
    /**
     * @override
     */
    visit(visitor: any): any;
}
export declare class Func extends Val {
    name: string;
    values: Val[];
    constructor(name: string, values: Val[]);
    /**
     * @override
     */
    appendTo(buf: Base.StringBuffer, toString: boolean): void;
    /**
     * @override
     */
    visit(visitor: any): any;
}
export declare class Expr extends Val {
    expr: Exprs.Val;
    constructor(expr: Exprs.Val);
    /**
     * @override
     */
    toExpr(): Exprs.Val;
    /**
     * @override
     */
    appendTo(buf: Base.StringBuffer, toString: boolean): void;
    /**
     * @override
     */
    visit(visitor: any): any;
    /**
     * @override
     */
    isExpr(): boolean;
}
export declare function toNumber(val: Val, context: Exprs.Context): number;
/**
 * Convert numeric value to px
 */
export declare function convertNumericToPx(val: Val, context: Exprs.Context): Numeric;
export declare const ident: {
    [key: string]: Ident;
};
export declare const hundredPercent: Numeric;
export declare const fullWidth: Numeric;
export declare const fullHeight: Numeric;
export declare const numericZero: Numeric;
export declare const processingOrder: {
    "font-size": number;
    color: number;
};
/**
 * Function to sort property names in the order they should be processed
 */
export declare function processingOrderFn(name1: string, name2: string): number;
