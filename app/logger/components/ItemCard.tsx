"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabaseClient";
import { Item } from "@/lib/types";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { boolean } from "zod";

type Props = {
    item: Item;
}

export default function ItemCard( { item } : Props) {

    const sortedOrderedModifiers = [...item.modifiers]
        .sort((a, b) => a.weight - b.weight)

    const [value, setValue] = useState(1);
    const [currentModifierID, setModifierID] = useState(sortedOrderedModifiers[0].id);
    const [buttonTimeout, setButtonTimeout] = useState(false);

    const handleSupabaseLog = async () => {
        const supabase = createClient();;
        const { data: { user } } = await supabase.auth.getUser();
        const currentModifierObject = item.modifiers.find(modifier => modifier.id == currentModifierID);
        const { error } = await supabase.from("booth_logs")
            .insert({
                booth_id: item.booth_id,
                item_id: item.id,
                modifier_item_id: currentModifierObject?.item_modifier_id,
                user_session_id: user?.id,
                modifier_value_change: value,
                total_price: getEquivalency(true)
            });

        if (error) return error;
    }

    const handleLog = async () => {
        if (value === 0) return;

        // Turn off button
        setButtonTimeout(true);

        let error = await handleSupabaseLog();

        if (!error) {
            // Successfully logged
            toast.success(`Successfully logged ${value} ${item.modifiers.find(mod => mod.id == currentModifierID)?.value_prefix}`, {
                position: "top-center",
                theme: "light"
            });

            // Set value back to One
            setValue(1);
            // Set back to initial modifier
            setModifierID(item.modifiers[0].id)

            // Unlock button after 1000 more milliseconds, just to have some type of extra cooldown
            setTimeout(() => setButtonTimeout(false), 1000);
        } else {
            toast.error(`Error, could not log ${error}`, {
                position: "top-center",
                theme: "light"
            });

            console.error(error)

            // No button untimeout -- button remains locked
        }
        
    }

    const addMinusIsDisabled = (type: "minus" | "add"): boolean => {
        const currentModifierObject = item.modifiers.find(mod => mod.id == currentModifierID);

        if (type === "minus") {
            return value == 0;
        }

        else if (type === "add") {
            if (currentModifierObject?.calculate.type === "dollar") {
                return value >= 200;
            } else {
                return value >= 30;
            }
        }

        return true;

    }

    // Goal of this to show the equivalency 
    function getEquivalency(pureNumberOnly = false): string | number {
        const currentModifierObject = item.modifiers.find(mod => mod.id == currentModifierID);
        const multiply = currentModifierObject?.calculate.multiply_by;

        // Calculation Code
        let calculation = 0;
        let remaining = value;

        if (multiply["deals"]) {
            const deals = [...(multiply["deals"]|| [])]
            .sort((a, b) => b.qty - a.qty); // biggest first


            for (const deal of deals) {
                const count = Math.floor(remaining / deal.qty);
                calculation += count * deal.price;
                remaining -= count * deal.qty;
            }
        }

        calculation += remaining * multiply["unit_price"]

        if (pureNumberOnly) return calculation;

        // Text Modifiers
        if (currentModifierObject?.calculate.type === "dollar") {
            return `$${calculation}`
        }

        if (currentModifierObject?.calculate.type === "ticket") {
            return `${calculation} ${currentModifierID} tickets`
        }

        return "Error calculating equivalency";
    } 
      
    return (
        <Card className="border-1 p-5 gap-3 border-gray-300 shadow-xs">
            <CardHeader className="px-0 pt-2">
                <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0 ">
                <Tabs onValueChange={v => setModifierID(v)} value={currentModifierID}>
                    <TabsList className="w-full">
                        {/*Use ordered to ensure that the order is matching the database weights*/}
                        {sortedOrderedModifiers.map(modifier => (
                            <TabsTrigger key={`${modifier.id}-${item.id}`} value={modifier.id}>{modifier.name}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <div className="flex w-full pt-10 pb-5 items-center justify-center">
                    <Button onClick={() => setValue(value - 1)} disabled={addMinusIsDisabled("minus")} variant="symbol" className="mx-10 w-13 h-10 justify-center">
                        -
                    </Button>
                    <div className="flex w-40 flex-col items-center">
                        <h1 className="text-8xl font-bold">{value}</h1>
                        <p>{item.modifiers.find(mod => mod.id == currentModifierID)?.value_prefix}</p>
                    </div>
                    <Button onClick={() => setValue(value + 1)} disabled={addMinusIsDisabled("add")} variant="symbol" className="mx-10 w-13 h-10 justify-center">
                        +
                    </Button>
                </div>
                {item.modifiers.find(mod => mod.id == currentModifierID)?.calculate?.type === "dollar" 
                    ? 
                    <div className="grid grid-cols-4  w-full items-center justify-center gap-3 pb-5">
                        <Button className="flex-1 min-w-0" disabled={value + 5 >= 200} variant="outline" onClick={() => setValue(value + 5)}>Add 5</Button>
                        <Button className="flex-1 min-w-0" disabled={value + 10 >= 200} variant="outline" onClick={() => setValue(value + 10)}>Add 10</Button>
                        <Button className="flex-1 min-w-0" disabled={value + 15 >= 200} variant="outline" onClick={() => setValue(value + 15)}>Add 15</Button>
                        <Button className="flex-1 min-w-0" disabled={value + 20 >= 200} variant="outline" onClick={() => setValue(value + 20)}>Add 20</Button>
                        <Button className="flex-1 min-w-0" variant="outline" onClick={() => setValue(5)}>Set 5</Button>
                        <Button className="flex-1 min-w-0" variant="outline" onClick={() => setValue(10)}>Set 10</Button>
                        <Button className="flex-1 min-w-0" variant="outline" onClick={() => setValue(15)}>Set 15</Button>
                        <Button className="flex-1 min-w-0" variant="outline" onClick={() => setValue(20)}>Set 20</Button>
                    </div>
                    : <></>
                }
                <p className="w-full font-mono text-center text-sm pb-3">Equivalency: {getEquivalency()}</p>

            </CardContent>
            <CardFooter className="px-0">
                <Button disabled={buttonTimeout} onClick={handleLog} className="w-full min-h-15">
                    Log
                </Button>
                <ToastContainer />
            </CardFooter>
        </Card>
    )
}