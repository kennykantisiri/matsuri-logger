import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './supabaseServer';

async function checkBoothExists(key: string) {
  const supabase = await createClient()
  const res = await fetch("https://kdokmewkxdoqohblgqgf.supabase.co/functions/v1/clever-processor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });

  const { valid: boothExists } = await res.json();

  // Then if booth is a thing
  if (boothExists) {
    const { error } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          access_key: key
        }
      }
    })

    if (error) console.error(error)

    return true;
  }

  return false;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })
  const key = request.nextUrl.searchParams.get('key');
  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )
  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // New Redirect following Supabase instructions to set Cookies when doing new responses. And also remove the search param from the response!!
  const url = request.nextUrl.clone()
  url.search = '';
  let response = NextResponse.redirect(new URL('/', url));
  supabaseResponse.cookies.getAll().forEach(({ name, value }) => response.cookies.set(name, value))

  // IF provided KEY aka (scan QR code) AND no user logged in...
  if (key) {


    if (!user) {
      // Check if the booth exists... (don't just sign in for no reason!)
      if (await checkBoothExists(key)) {
        // Update cookies
        supabaseResponse.cookies.getAll().forEach(({ name, value }) => response.cookies.set(name, value))
        
        return response;
      }
    }

    else {
      console.log(key)
      // TODO: Need to make sure that access_key metadata is still valid each time! (what if access_key changes, log user out), each time! Also need to do if key is different...
      if (key === user.user_metadata?.access_key) {
        return response;
      } else {
        if (await checkBoothExists(key)) {
          // Update cookies
          
          supabaseResponse.cookies.getAll().forEach(({ name, value }) => response.cookies.set(name, value))
        }
        
        return response
        
      }
    }
  }
  
  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!
  return supabaseResponse
}