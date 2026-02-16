"use server"

import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export async function setInitialName(formData: FormData) {
    const supabase = await createClient();
    const displayName = formData.get("display_name") as string;

    await supabase.auth.updateUser({
        data: { display_name: displayName },
    })
    
    redirect("/");
}