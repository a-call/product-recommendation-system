export type AppConfig = {
  databaseUrl: string;
  redisUrl?: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  port: number;
  nodeEnv: string;
};

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(): AppConfig {
  const redisUrl = process.env.REDIS_URL;
  return {
    databaseUrl: required("DATABASE_URL"),
    ...(redisUrl ? { redisUrl } : {}),
    jwtSecret: required("JWT_SECRET", "development-only-change-me"),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    port: Number(process.env.PORT ?? 4000),
    nodeEnv: process.env.NODE_ENV ?? "development"
  };
}
