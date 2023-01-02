import { redirect } from '@sveltejs/kit'; 
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (({ cookies, url }) => {
  console.log("cookie", url.searchParams.get("access_token"))
  if (url.searchParams.get("access_token")) {
    console.log(url.searchParams.get("access_token"))
    cookies.set("access_token", url.searchParams.get("access_token") ?? "")
    return {
      access_token: url.searchParams.get("access_token"),
      auth: true,
    }
  }
  if (cookies.get("access_token")) {
    return {
      access_token: cookies.get("access_token"),
      auth: true,
    }
  }
  return {
    access_token: "",
    auth: false,
  }
});
