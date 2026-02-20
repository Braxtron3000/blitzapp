import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "src",
    "app",
    ".well-known",
    "assetlinks.json",
    "assetlinks.json",
  );

  try {
    const content = await fs.readFile(filePath, "utf8");
    const json = JSON.parse(content);
    return NextResponse.json(json);
  } catch (err) {
    return new NextResponse("Not found " + err, {
      status: 404,
      statusText: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
