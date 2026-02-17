"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabaseClient";
import { Item } from "@/lib/types";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

type Props = {
    item: Item;
}

export default function ItemCard( { item } : Props) {

    const [value, setValue] = useState(0);
    const [currentModifier, setModifier] = useState(item.modifiers[0].id);
    const [buttonTimeout, setButtonTimeout] = useState(false);

    const handleSupabaseLog = async () => {
        const supabase = createClient();;
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from("booth_logs")
            .insert({
                booth_id: item.booth_id,
                item_id: item.id,
                modifier_id: currentModifier,
                user_session_id: user?.id,
                modifier_value_change: value
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
            toast.success(`Successfully logged ${value} portions`, {
                position: "top-center",
                theme: "light"
            });

            // Set value back to Zero
            setValue(0);
            // Set back to initial modifier
            setModifier(item.modifiers[0].id)

            // Unlock button after 1000 more milliseconds, just to have some type of extra cooldown
            setTimeout(() => setButtonTimeout(false), 1000);
        } else {
            toast.error(`Error, could not log ${error}`, {
                position: "top-center",
                theme: "light"
            });

            // No button untimeout -- button remains locked
        }
        
    }

    function getEquivalency(): string {
        const currentModifierObject = item.modifiers.find(mod => mod.id == currentModifier);
        const multiply = currentModifierObject?.calculate.multiply_by;
        let calculation = 0;
        // Always do double first, takes priority
        if (multiply["double"] !== undefined) {
            
        } else if (multiply["all"]) {
            calculation = multiply["all"] * value
        }

        if (currentModifierObject?.calculate.type === "dollar") {
            return `$${calculation}`
        }

        if (currentModifierObject?.calculate.type === "ticket") {
            return `${calculation} ${currentModifier} tickets`
        }

        return "Error calcuating equivalency";
    } 
      
    return (
        <Card className="border-1 p-5 gap-3 border-gray-300 shadow-xs">
            <CardHeader className="px-0 pt-2">
                <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0 ">
                <Tabs onValueChange={v => setModifier(v)} value={currentModifier}>
                    <TabsList className="w-full">
                        {item.modifiers.map(modifier => (
                            <TabsTrigger key={`${modifier.id}-${item.id}`} value={modifier.id}>{modifier.name}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <div className="flex w-full pt-10 pb-5 items-center justify-center">
                    <Button onClick={() => setValue(value + 1)} disabled={value >= 30} variant="secondary" className="mx-4 w-20 justify-center">
                        +
                    </Button>
                    <div className="flex w-40 flex-col items-center">
                        <h1 className="text-8xl font-bold">{value}</h1>
                        <p>{item.modifiers.find(mod => mod.id == currentModifier)?.value_prefix}</p>
                    </div>
                    <Button onClick={() => setValue(value - 1)} disabled={value == 0} variant="secondary" className="mx-4 w-20 justify-center">
                        -
                    </Button>
                </div>
                {item.modifiers.find(mod => mod.id == currentModifier)?.calculate?.type === "dollar" 
                    ? 
                    <div className="flex w-full items-center justify-center gap-3 pb-5">
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
                <Button disabled={buttonTimeout} onClick={handleLog} className="w-full min-h-15" variant="success">
                    Log
                </Button>
                <ToastContainer />
            </CardFooter>
        </Card>
    )
}