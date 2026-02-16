"use server"

import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import NameForm from "./components/NameForm";
import { setInitialName } from "./actions/setInitialName";
import LoggerContainer from "./logger/LoggerContainer";

export default async function Home() {

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/not-found');

  const displayName = user.user_metadata?.display_name;
  
  return (
    <>
      {/* Check if display name exists */}
      {displayName 
        ? 
          <>
            <LoggerContainer />
          </>
        :
          <div className="flex w-screen min-h-screen items-center justify-center font-[Inter]">
            <div id="name-container" className="w-100">
              <NameForm action={setInitialName}/>
            </div>
          </div>
      }     
    </>
  );
}
