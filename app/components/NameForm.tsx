"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function NameForm({ action }: { action: (formData: FormData) => void}) {
    return (
        <form action={action}>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Please enter your name...</CardTitle>
                    <CardDescription>If you were not given explicit access to this system, please exit. Welcome to the Matsuri Logger. Please enter your <b>full identifiable name</b> for record keeping.</CardDescription>
                </CardHeader>
                <CardContent>
                        <Field>
                            <Input 
                                name="display_name" 
                                id="display_name" 
                                placeholder="Jane Doe"
                                required
                                minLength={2}
                                maxLength={50}
                                pattern="[A-Za-zÀ-ÿ'-. ]+"
                                title="Please enter a valid full name"  />
                        </Field>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">
                        Submit
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}