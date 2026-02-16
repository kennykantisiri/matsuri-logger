"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Item } from "@/lib/types";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

type Props = {
    item: Item;
}

export default function ItemCard( { item } : Props) {

    const [value, setValue] = useState(0);
    const [currentModifier, setModifier] = useState(item.modifiers[0].name);
    const handleLog = () => {   
        toast.success(`Successfully logged ${value} portions`, {
            position: "top-center",
            theme: "light"
        });
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
                            <TabsTrigger value={modifier.id}>{modifier.name}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <div className="flex w-full pt-10 pb-5 items-center justify-center">
                    <Button onClick={() => setValue(value + 1)} disabled={value >= 30} variant="secondary" className="mx-4 w-20 justify-center">
                        +
                    </Button>
                    <div className="flex w-40 flex-col items-center">
                        <h1 className="text-8xl font-bold">{value}</h1>
                        <p>{item.modifiers.find(mod => mod.name == currentModifier)?.value_prefix}</p>
                    </div>
                    <Button onClick={() => setValue(value - 1)} disabled={value == 0} variant="secondary" className="mx-4 w-20 justify-center">
                        -
                    </Button>
                </div>
                <p className="w-full font-mono text-center text-sm pb-3">Eqivulency: ${value * (item.modifiers.find(mod => mod.name == currentModifier)?.calculate.multiply_by || 0)}</p>

            </CardContent>
            <CardFooter className="px-0">
                <Button onClick={handleLog} className="w-full min-h-15" variant="success">
                    Log
                </Button>
                <ToastContainer />
            </CardFooter>
        </Card>
    )
}