"use server"

import { createClient } from "@/lib/supabaseServer"
import { Item } from "@/lib/types";



// Need this to force conversion, see below when used "as"
type DBModifier = { id: string; name: string; value_prefix: string; weight: number; type: "dollar" | "ticket" };

// Get all items from Supabase -- Using Server Component
// This should only get the users
//
// booth:booths!inner() --> Only get where booth exists (since booths are read only by access_key)
// modifiers:booth_items_modifiers -> search where booth_items and booth_items_modifiers have relation, name array modifiers
// modifier:modifiers --> get where modifiers and booth_items_modifiers have a relationship, name object modifier
export default async function getAllItems(): Promise<Item[]> {  
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('booth_items')
        .select(`
            id,
            item_name,
            booth:booths!inner(
                id
            ),
            modifiers:booth_items_modifiers(
                id,
                multiply,
                modifier:modifiers(
                    id,
                    name,
                    weight,
                    value_prefix,
                    type
                )
            )
        `);

    if (error) {
        console.error(`Error attempting to get all items: ${error}`)
    }


    if (data) {
        const structuredItems: Item[] = data.map(DBItem => {
            return {
              id: DBItem.id,
              name: DBItem.item_name,
              booth_id: (DBItem.booth as unknown as { id: string }).id,
              modifiers: DBItem.modifiers.map(DBModifier => {

                // Not sure why DBModifier.modifier is showing as an array (from Supabase typing), when it's an object..., so forcing conversion
                const modifier = (DBModifier.modifier as unknown) as DBModifier;
                // As any, but can be all, double, more attributes to come. (Every 2 for $5, meaning: double = 2.5 each)
                const multiply = DBModifier.multiply as any;
          
                return {
                    item_modifier_id: DBModifier.id,
                    id: modifier.id,
                    name: modifier.name,
                    value_prefix: modifier.value_prefix,
                    weight: modifier.weight,
                    calculate: {
                        type: modifier.type,
                        multiply_by: multiply
                    }
                }
              }),
            };
        });

        // console.dir(structuredItems, { depth: null })
        return structuredItems;
    }

    return []
}