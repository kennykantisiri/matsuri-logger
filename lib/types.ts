export type Item = {
    id: string,
    name: string;
    modifiers: Modifier[];
}

export type Modifier = {
    id: string;
    name: string;
    value_prefix: string;
    calculate: Calculate;
}

export type Calculate = {
    type: "ticket" | "dollar"
    calculate: (num: number) => number
}