import { createTamagui } from "tamagui";
import { config as defaultConfig } from "@tamagui/config";

// Minimal config, leveraging all defaults from @tamagui/config
export const tamaguiConfig = createTamagui(defaultConfig);
export default tamaguiConfig;

// Infer the config type for module augmentation
export type Conf = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}
