import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

export async function GET() {
  try {
    // Check connection
    const ping = await redis.ping();

    // Write test data
    await redis.set("test:key", "Redis is working!");

    // Read test data
    const value = await redis.get("test:key");

    return NextResponse.json({
      success: true,
      ping,
      value,
      message: "Upstash Redis is working!",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}