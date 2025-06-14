import { auth } from "@/common/lib/auth";


export async function GET() {
  const schema = await auth.api.generateOpenAPISchema();
  return Response.json(schema);
}
