export type Item = {
    id: string,
    name: string;
    booth_id: string;
    modifiers: Modifier[];
}

export type Modifier = {
    id: string;
    name: string;
    value_prefix: string;
    calculate: Calculate;
}

export type Calculate = {
    type: "dollar" | "ticket"
    multiply_by: any;
}