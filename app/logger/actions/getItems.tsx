"use server"

import { createClient } from "@/lib/supabaseServer"
import { Item } from "@/lib/types";

const supabase = await createClient();

// Need this to force conversion, see below when used "as"
type DBModifier = { id: string; name: string; value_prefix: string; attributes: any };

// Get all items from Supabase -- Using Server Component
// This should only get the users
//
// booth:booths!inner() --> Only get where booth exists (since booths are read only by access_key)
// modifiers:booth_items_modifiers -> search where booth_items and booth_items_modifiers have relation, name array modifiers
// modifier:modifiers --> get where modifiers and booth_items_modifiers have a relationship, name object modifier
export default async function getAllItems(): Promise<Item[]> {
    let items = [];
    
    const { data, error } = await supabase
        .from('booth_items')
        .select(`
            id,
            item_name,
            booth:booths!inner(),
            modifiers:booth_items_modifiers(
                modifier:modifiers(
                    id,
                    name,
                    value_prefix,
                    attributes
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
              modifiers: DBItem.modifiers.map(DBModifier => {

                // Not sure why DBModifier.modifier is showing as an array (from Supabase typing), when it's an object..., so forcing conversion
                const modifier = (DBModifier.modifier as unknown) as DBModifier;
          
                return {
                    id: modifier.id,
                    name: modifier.name,
                    value_prefix: modifier.value_prefix,
                    calculate: {
                        type: modifier.attributes.calculate.type,
                        multiply_by: modifier.attributes.calculate.multiply_by
                    }
                }
              }),
            };
        });

        return structuredItems;
    }

    return []
}