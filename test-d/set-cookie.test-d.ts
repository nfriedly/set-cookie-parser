import { expectType, expectError } from "tsd";
import setCookieParser, {
  parseSetCookie,
  parse,
  parseString,
  splitCookiesString,
  Cookie,
  CookieMap,
  Options,
} from "../lib/set-cookie.js";

// --- parseSetCookie: return type overloads ---

// Default returns Cookie[]
expectType<Cookie[]>(parseSetCookie("foo=bar"));

// map: true returns CookieMap
expectType<CookieMap>(parseSetCookie("foo=bar", { map: true }));

// map: false returns Cookie[]
expectType<Cookie[]>(parseSetCookie("foo=bar", { map: false }));

// --- parseSetCookie: input types ---

// String input
parseSetCookie("foo=bar");

// Array input
parseSetCookie(["foo=bar", "baz=qux"]);

// Readonly array input
parseSetCookie(["foo=bar"] as readonly string[]);

// Object with headers.getSetCookie (fetch Response-like)
parseSetCookie({ headers: { getSetCookie: () => ["foo=bar"] } });

// Object with headers["set-cookie"] (Node.js IncomingMessage-like)
parseSetCookie({ headers: { "set-cookie": ["foo=bar"] } });

// --- Options ---

// split option accepts boolean or "auto"
parseSetCookie("foo=bar", { split: true });
parseSetCookie("foo=bar", { split: false });
parseSetCookie("foo=bar", { split: "auto" });

// decodeValues option
parseSetCookie("foo=bar", { decodeValues: false });

// silent option
parseSetCookie("foo=bar", { silent: true });

// --- Cookie properties ---

const cookies = parseSetCookie("foo=bar");
const cookie = cookies[0];

expectType<string>(cookie.name);
expectType<string>(cookie.value);
expectType<string | undefined>(cookie.path);
expectType<Date | undefined>(cookie.expires);
expectType<number | undefined>(cookie.maxAge);
expectType<string | undefined>(cookie.domain);
expectType<boolean | undefined>(cookie.secure);
expectType<boolean | undefined>(cookie.httpOnly);
expectType<string | undefined>(cookie.sameSite);
expectType<boolean | undefined>(cookie.partitioned);

// --- parseString ---

const single = parseString("foo=bar");
expectType<Cookie | null>(single);

// --- splitCookiesString ---

const parts = splitCookiesString("foo=bar, baz=qux");
expectType<string[]>(parts);

// Accepts undefined
splitCookiesString(undefined);

// Accepts array (passthrough)
splitCookiesString(["foo=bar"]);

// --- parse (deprecated alias) ---

expectType<Cookie[]>(parse("foo=bar"));
expectType<CookieMap>(parse("foo=bar", { map: true }));

// --- Default export ---

expectType<Cookie[]>(setCookieParser("foo=bar"));
expectType<CookieMap>(setCookieParser("foo=bar", { map: true }));
setCookieParser.parseSetCookie("foo=bar");
setCookieParser.parse("foo=bar");
setCookieParser.parseString("foo=bar");
setCookieParser.splitCookiesString("foo=bar");
