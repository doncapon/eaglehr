import type { Config } from "tailwindcss";

// eslint-disable-next-line @typescript-eslint/no-require-imports -- Tailwind presets are conventionally CJS
const basePreset = require("@eaglehr/config/tailwind/preset");

const config: Config = {
  presets: [basePreset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
};

export default config;
