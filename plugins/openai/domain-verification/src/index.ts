const challenge = "n6nMtt7hEQ1WSTd23ZMLJjLrAhAlR-U1AZJHgsU9J_I";

export default {
  fetch(request: Request) {
    const url = new URL(request.url);
    if (url.hostname !== "raven.stellar.org" || url.pathname !== "/.well-known/openai-apps-challenge") {
      return new Response("Not found", { status: 404 });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    return new Response(request.method === "HEAD" ? null : challenge, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
};
