"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChangeNameButtonDialog() {
    const supabase = createClient();
    const router = useRouter();
    const [priorName, setPriorName] = useState("Jane Doe");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const getPriorName = async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser();
      
          setPriorName(user?.user_metadata?.display_name ?? "");
        };
      
        getPriorName();
      }, [open, supabase]);

    const handleNameChange = async (formData: FormData) => {
        setLoading(true);
        const { error } = await supabase.auth.updateUser({
          data: { display_name: formData.get("name") },
        });
        setLoading(false);
        if (!error) {
            setOpen(false);
            router.refresh();
        }
      };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full" variant="secondary">Change Name</Button>
            </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                    <form 
                        className="contents" 
                        onSubmit={async (e) => {
                            e.preventDefault();
                            await handleNameChange(new FormData(e.currentTarget))
                    }}>
                        <DialogHeader>
                            <DialogTitle>Edit Name</DialogTitle>
                            <DialogDescription>Do not change name if changing persons, please sign out, and rescan QR code or use a different device.</DialogDescription>
                        </DialogHeader>
                        <FieldGroup>
                            <Field>
                                <Input id="name-input" name="name" defaultValue={priorName} />
                            </Field>
                        </FieldGroup>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Saving..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
        </Dialog>
    )
}