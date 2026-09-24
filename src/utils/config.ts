import fs from 'fs';
import path from 'path';

export const NOSLOP_DIR = path.join(process.cwd(), '.noslop');
export const CONFIG_PATH = path.join(NOSLOP_DIR, 'config.json');
export const RULES_DIR = path.join(NOSLOP_DIR, 'rules');
export const SOURCES_DIR = path.join(NOSLOP_DIR, 'sources');
export const INSTRUCTIONS_PATH = path.join(NOSLOP_DIR, 'INSTRUCTIONS.md');

export interface NoslopConfig {
    version: number;
    enabled: boolean;
    rules: string[];
    targets: string[];
    liquid: boolean;
}

export function getConfig(): NoslopConfig | null {
    if (!fs.existsSync(CONFIG_PATH)) return null;
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

export function saveConfig(config: NoslopConfig) {
    if (!fs.existsSync(NOSLOP_DIR)) fs.mkdirSync(NOSLOP_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function initConfig() {
    const defaultConfig: NoslopConfig = { version: 1, enabled: true, rules: [], targets: ['agents'], liquid: false };
    saveConfig(defaultConfig);
    if (!fs.existsSync(RULES_DIR)) fs.mkdirSync(RULES_DIR, { recursive: true });
    if (!fs.existsSync(SOURCES_DIR)) fs.mkdirSync(SOURCES_DIR, { recursive: true });
}
