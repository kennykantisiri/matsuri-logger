"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabaseClient";
import { ViewableData } from "@/lib/types";
import { useEffect, useState } from "react"


export default function UndoDialog() {

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [data, setData] = useState<ViewableData[]>([]);
    const supabase = createClient();

    const handleDelete = async (log_id: string) => {
        const confirmed = confirm("Undo this action?")
        if (!confirmed) return

        setDeletingId(log_id)

        const { error } = await supabase
            .from("booth_logs")
            .delete()
            .eq("id", log_id)

        if (error) {
            console.error(error)
            return
        }

        setDeletingId(null)

        setData(prev => prev.filter(row => row.log_id !== log_id))
    }

    useEffect(() => {
        if (!open) return;

        const fetchData = async () => {
            setLoading(true)
            // No need to check for user, since RLS blocks from seeing other people's day
            const { data, error } = await supabase
                .from("booth_logs")
                .select("id, item:booth_items(item_name), modifier_id, modifier_value_change")
                .order("timestamp", { ascending: false }) // newest first
                .limit(10)

            console.log(data)

            if (data) {
                const structuredViewableData: ViewableData[] = data.map(data => {
                    return {
                        log_id: data.id,
                        item_name: (data.item as any).item_name,
                        modifier_id: data.modifier_id,
                        change: data.modifier_value_change
                    }
                })

                setData(structuredViewableData)
            }
            
            setLoading(false);

            if (error) console.error(error)
        }

        fetchData()
      }, [open])

      
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Past Actions</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Past Actions</DialogTitle>
                    <DialogDescription>View last ten actions and undo them if necessary.</DialogDescription>
                </DialogHeader>
                {!loading 
                ? (<>
                    <div className="max-h-[30vh] overflow-y-auto pr-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Item</TableHead>
                                    <TableHead>Modifier</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map(data => (
                                    <TableRow key={data.log_id}>
                                        <TableCell>{data.item_name}</TableCell>
                                        <TableCell>{data.modifier_id}</TableCell>
                                        <TableCell>{data.change}</TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                onClick={() => handleDelete(data.log_id)}
                                                size="xs" 
                                                disabled={deletingId === data.log_id}
                                                variant="destructive"
                                            >
                                                Undo
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </>) 
                : (<>Loading...</>)}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}