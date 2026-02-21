"use server"

import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import NameForm from "./components/NameForm";
import { setInitialName } from "./actions/setInitialName";
import LoggerContainer from "./logger/LoggerContainer";
import NotFound from "./not-found";

export default async function Home() {

  const supabase = await createClient();
  let displayName = null;
  const { data: { user } } = await supabase.auth.getUser();

  if (user) displayName = user?.user_metadata?.display_name;
  
  return (
    <>
      {/* Check if display name exists */}
      {displayName 
        ? 
          <div className="flex justify-center min-h-dvh">
            <div className="w-full lg:w-1/3">
              <LoggerContainer />
            </div>
          </div>
      
        :
          user 
          ? (<div className="flex w-screen min-h-screen items-center justify-center font-[Inter]">
              <div id="name-container" className="w-xs sm:w-md">
                <NameForm action={setInitialName}/>
              </div>
            </div>)
          : (<NotFound />)
      }     
    </>
  );
}
