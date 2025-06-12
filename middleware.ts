import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const redirect_route =  request.cookies.get("redirect_route")?.valueOf()

  const url = request.nextUrl.clone()

    if (url.pathname === '/') {
      if(redirect_route){
        url.pathname = `/${redirect_route}`
        return NextResponse.redirect(url)
      }
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

}