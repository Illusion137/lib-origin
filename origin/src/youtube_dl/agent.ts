import { Cookie, CookieJar, canonicalDomain } from "tough-cookie";
// const { CookieAgent } = require("http-cookie-agent/undici");

const convertSameSite = sameSite => {
  switch (sameSite) {
    case "strict":
      return "strict";
    case "lax":
      return "lax";
    case "no_restriction":
    case "unspecified":
    default:
      return "none";
  }
};

const convertCookie = cookie =>
  cookie instanceof Cookie
    ? cookie
    : new Cookie({
        key: cookie.name,
        value: cookie.value,
        expires: typeof cookie.expirationDate === "number" ? new Date(cookie.expirationDate * 1000) : "Infinity",
        domain: canonicalDomain(cookie.domain),
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: convertSameSite(cookie.sameSite),
        hostOnly: cookie.hostOnly,
      });

const addCookies  = (jar, cookies) => {
  if (!cookies || !Array.isArray(cookies)) {
    throw new Error("cookies must be an array");
  }
  if (!cookies.some(c => c.name === "SOCS")) {
    cookies.push({
      domain: ".youtube.com",
      hostOnly: false,
      httpOnly: false,
      name: "SOCS",
      path: "/",
      sameSite: "lax",
      secure: true,
      session: false,
      value: "CAI",
    });
  }
  for (const cookie of cookies) {
    jar.setCookieSync(convertCookie(cookie), "https://www.youtube.com");
  }
};

export const addCookiesFromString = (jar, cookies) => {
  if (!cookies || typeof cookies !== "string") {
    throw new Error("cookies must be a string");
  }
  addCookies(
    jar,
    cookies
      .split(";")
      .map(c => Cookie.parse(c))
      .filter(Boolean),
  );
};

export const createAgent = (cookies: any[] = [], opts: any = {}) => {
  const options = Object.assign({}, opts);
  if (!options.cookies) {
    const jar = new CookieJar();
    addCookies(jar, cookies);
    options.cookies = { jar };
  }
  return {
    dispatcher: undefined,
    localAddress: options.localAddress,
    jar: options.cookies.jar,
  };
};

export const defaultAgent = createAgent();