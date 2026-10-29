export function GET() { return Response.json({ status: "ok", service: "diversity-pmt" }, { headers: { "Cache-Control": "no-store" } }); }
