/**
 * A symbol which does not have all
 * the information which is needed
 * in the interface
 */
export interface RawSymbol {
    global?: boolean;
    name: string;
    address?: number;
    line: number;
    filename: string;
}

export interface SymbolTable extends Array<RawSymbol> {
    [index: number]: RawSymbol;
}
