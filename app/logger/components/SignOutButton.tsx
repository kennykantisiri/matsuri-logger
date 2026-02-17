"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/"); // navigate after logout
  };

  return (
    <Button variant="destructive" onClick={handleSignOut}>
      Log Out
    </Button>
  );
}
