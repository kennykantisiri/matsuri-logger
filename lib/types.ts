export type Item = {
    id: string,
    name: string;
    booth_id: string;
    modifiers: Modifier[];
}

export type Modifier = {
    item_modifier_id: string;
    id: string;
    name: string;
    weight: number;
    value_prefix: string;
    calculate: Calculate;
}

export type Calculate = {
    type: "dollar" | "ticket"
    multiply_by: any;
}

export type ViewableData = {
    log_id: string;
    item_name: string;
    modifier_id: string;
    change: number;
}