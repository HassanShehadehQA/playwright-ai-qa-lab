export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var ${name}. Copy .env.example to .env and set it.`);
  }
  return value;
}

export const env = {
  saucePassword: requireEnv('SAUCE_PASSWORD'),
} as const;
