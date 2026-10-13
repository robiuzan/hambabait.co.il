/**
 * Keeps client-side navigation working on pages whose address is Hebrew.
 *
 * Next 14's router sends a `Next-Url` request header with every RSC fetch (prefetch and click),
 * set to the current page's path built from the route tree. Our route folders are Hebrew
 * (app/צור-קשר/, app/מדריכים/ …) and the tree keeps them as raw Hebrew, so on any page opened at
 * a Hebrew address that header is e.g. `/צור-קשר`. HTTP header values must be ISO-8859-1, so the
 * browser's fetch() throws before sending anything ("Failed to read the 'headers' property from
 * 'RequestInit': String contains non ISO-8859-1 code point"), Next logs "Failed to fetch RSC
 * payload … Falling back to browser navigation", and every click becomes a full page reload.
 * Source: node_modules/next/dist/client/components/router-reducer/fetch-server-response.js,
 * `headers[NEXT_URL] = nextUrl`. Next 15 and 16 still do the same, so an upgrade alone does
 * not fix it.
 *
 * `Next-Url` only exists for intercepting routes, which a static export cannot have; the host
 * serves the `index.txt` payload and ignores request headers. So when (and only when) the value
 * cannot legally be sent, this drops that one header and lets the request through untouched.
 * Every other fetch on the page — GTM, Web3Forms, /assets/live.js — passes straight through.
 *
 * Inline in <head>: Next looks `fetch` up when it calls it, and its first call is a link
 * prefetch after hydration, long after this has run.
 */
const NEXT_URL_HEADER_FIX = `(function(){var f=window.fetch;if(typeof f!=="function"||f.__nextUrlFix)return;function bad(v){if(typeof v!=="string")return false;for(var i=0;i<v.length;i++)if(v.charCodeAt(i)>255)return true;return false}var g=function(input,init){try{var h=init&&init.headers;if(h&&typeof h==="object"&&!Array.isArray(h)&&!(typeof Headers==="function"&&h instanceof Headers)&&bad(h["Next-Url"])){var c={};for(var k in h)if(k!=="Next-Url")c[k]=h[k];init=Object.assign({},init,{headers:c})}}catch(e){}return f.call(this,input,init)};g.__nextUrlFix=true;window.fetch=g})();`;

export function NextUrlHeaderFix() {
  return (
    <script
      id="next-url-header-fix"
      dangerouslySetInnerHTML={{ __html: NEXT_URL_HEADER_FIX }}
    />
  );
}
