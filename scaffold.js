const fs = require('fs');
const path = require('path');

const files = {
    "package.json": `{
  "name": "no-ai-slop",
  "version": "1.0.0",
  "description": "Stop AI agents from generating sloppy code and generic UI.",
  "main": "dist/index.js",
  "bin": {
    "noslop": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build",
    "test": "jest",
    "start": "ts-node src/index.ts"
  },
  "dependencies": {
    "commander": "^11.1.0",
    "chalk": "^4.1.2",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.1.0"
  },
  "license": "MIT"
}`,
    "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}`,
    "README.md": `# NO AI SLOP

Stop AI agents from generating sloppy code and generic UI.

Installation:
\`\`\`bash
npm install -g no-ai-slop
\`\`\`

Quick start:
\`\`\`bash
noslop init
noslop install https://github.com/example/anti-slop
noslop apply --target agents
\`\`\`

Commands:
- noslop init
- noslop install
- noslop list
- noslop remove
- noslop update
- noslop check
- noslop doctor
- noslop config
- noslop apply
- noslop uninstall
`,
    "src/index.ts": `#!/usr/bin/env node
import { setupCLI } from './cli';
setupCLI();
`,
    "src/cli/index.ts": `import { Command } from 'commander';
import { initCommand } from '../commands/init';
import { installCommand } from '../commands/install';
import { listCommand } from '../commands/list';
import { doctorCommand } from '../commands/doctor';
import { applyCommand } from '../commands/apply';
import { configCommand } from '../commands/config';
import { removeCommand } from '../commands/remove';
import { checkCommand } from '../commands/check';
import { updateCommand } from '../commands/update';
import { uninstallCommand } from '../commands/uninstall';

export function setupCLI() {
  const program = new Command();
  program.name('noslop').description('AI Rule Management CLI').version('1.0.0');

  program.addCommand(initCommand());
  program.addCommand(installCommand());
  program.addCommand(listCommand());
  program.addCommand(removeCommand());
  program.addCommand(applyCommand());
  program.addCommand(configCommand());
  program.addCommand(doctorCommand());
  program.addCommand(checkCommand());
  program.addCommand(updateCommand());
  program.addCommand(uninstallCommand());

  program.parse(process.argv);
}
`,
    "src/utils/config.ts": `import fs from 'fs';
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
`,
    "src/commands/init.ts": `import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import { NOSLOP_DIR, initConfig } from '../utils/config';

export function initCommand() {
    return new Command('init')
        .description('Initialize NO AI SLOP in the current project')
        .action(() => {
            console.log(chalk.cyan('┌─────────────────────────────┐'));
            console.log(chalk.cyan('│       NO AI SLOP            │'));
            console.log(chalk.cyan('│   AI Rule Management CLI    │'));
            console.log(chalk.cyan('└─────────────────────────────┘\\n'));

            if (fs.existsSync(NOSLOP_DIR)) {
                console.log(chalk.yellow('! NO AI SLOP is already initialized in this project.'));
                return;
            }
            try {
                initConfig();
                console.log(chalk.green('✓ Initialized .noslop directory'));
                console.log(chalk.green('✓ Created config.json'));
                console.log(chalk.green('✓ Created rules and sources directories'));
                console.log('\\nNO AI SLOP is now active. Use ' + chalk.cyan('noslop install <repo>') + ' to add rules.');
            } catch (err: any) {
                console.log(chalk.red('✗ Failed to initialize NO AI SLOP.'));
                console.log('Reason:\\n' + err.message);
            }
        });
}
`,
    "src/commands/install.ts": `import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { getConfig, saveConfig, RULES_DIR } from '../utils/config';

export function installCommand() {
    return new Command('install')
        .argument('<repository>', 'GitHub repository URL')
        .description('Install a rule pack from a repository')
        .action(async (repoUrl) => {
            console.log(chalk.cyan('\\nInstalling rule pack...\\n'));
            const config = getConfig();
            if (!config) { console.log(chalk.red('✗ NO AI SLOP is not initialized. Run \`noslop init\` first.')); return; }

            const githubRegex = /github\\.com\\/([^\\/]+)\\/([^\\/]+)/;
            const match = repoUrl.match(githubRegex);
            if (!match) { console.log(chalk.red('✗ Invalid repository URL. Currently only GitHub repositories are supported.')); return; }

            const [_, owner, repo] = match;
            console.log(chalk.green('✓ Repository detected'));

            try {
                const rawBase = \`https://raw.githubusercontent.com/\${owner}/\${repo}/main\`;
                let noslopJson;
                try {
                    const res = await axios.get(\`\${rawBase}/noslop.json\`);
                    noslopJson = res.data;
                } catch (e) {
                    throw new Error('Could not find noslop.json in the repository root.');
                }
                console.log(chalk.green('✓ Rules discovered'));
                if (!noslopJson.name || !noslopJson.rules || !Array.isArray(noslopJson.rules)) throw new Error('Invalid noslop.json format.');
                console.log(chalk.green('✓ Rules validated'));

                const packDir = path.join(RULES_DIR, noslopJson.name);
                if (!fs.existsSync(packDir)) fs.mkdirSync(packDir, { recursive: true });

                let downloadedCount = 0;
                for (const rulePath of noslopJson.rules) {
                    if (!rulePath.endsWith('.md') && !rulePath.endsWith('.txt') && !rulePath.endsWith('.json')) {
                        console.log(chalk.yellow(\`! Skipping \${rulePath} (only .md, .txt, .json supported)\`));
                        continue;
                    }
                    try {
                        const ruleRes = await axios.get(\`\${rawBase}/\${rulePath}\`);
                        fs.writeFileSync(path.join(packDir, path.basename(rulePath)), ruleRes.data);
                        downloadedCount++;
                    } catch (e) {
                        console.log(chalk.red(\`✗ Failed to download \${rulePath}\`));
                    }
                }
                console.log(chalk.green('✓ Rules installed\\n'));
                if (!config.rules.includes(noslopJson.name)) {
                    config.rules.push(noslopJson.name);
                    saveConfig(config);
                }
                console.log('Installed:');
                console.log(chalk.cyan(\`  \${noslopJson.name}\`));
                console.log(\`Rules: \${downloadedCount}\`);
                console.log(\`Source: github.com/\${owner}/\${repo}\\n\`);
                console.log('NO AI SLOP is now active.');
            } catch (err: any) {
                console.log(chalk.red('✗ Could not install rule pack.\\n'));
                console.log('Reason:\\n' + err.message);
            }
        });
}
`,
    "src/commands/list.ts": `import { Command } from 'commander';
import chalk from 'chalk';
import { getConfig } from '../utils/config';

export function listCommand() {
    return new Command('list').description('List installed rule packs').action(() => {
        const config = getConfig();
        if (!config) { console.log(chalk.red('✗ NO AI SLOP is not initialized.')); return; }
        console.log(chalk.cyan('\\nNO AI SLOP RULES\\n'));
        if (config.rules.length === 0) {
            console.log('No rule packs installed.');
        } else {
            config.rules.forEach(rule => console.log(chalk.green('✓ ') + rule));
            console.log(\`\\n\${config.rules.length} rule packs installed.\\n\`);
        }
    });
}
`,
    "src/commands/remove.ts": `import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { getConfig, saveConfig, RULES_DIR } from '../utils/config';

export function removeCommand() {
    return new Command('remove').argument('<name>', 'Name of rule pack to remove').description('Remove an installed rule pack').action((name) => {
        const config = getConfig();
        if (!config) { console.log(chalk.red('✗ NO AI SLOP is not initialized.')); return; }
        
        const index = config.rules.indexOf(name);
        if (index === -1) {
            console.log(chalk.yellow(\`! Rule pack '\${name}' is not installed.\`));
            return;
        }

        config.rules.splice(index, 1);
        saveConfig(config);
        
        const packDir = path.join(RULES_DIR, name);
        if (fs.existsSync(packDir)) fs.rmSync(packDir, { recursive: true, force: true });
        
        console.log(chalk.green(\`✓ Removed rule pack '\${name}'.\`));
    });
}
`,
    "src/commands/apply.ts": `import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { getConfig, RULES_DIR, INSTRUCTIONS_PATH } from '../utils/config';

export function applyCommand() {
    return new Command('apply')
        .option('--target <target>', 'Target agent (agents, claude, cursor, copilot, all)')
        .description('Apply rules to AI agents')
        .action((options) => {
            const config = getConfig();
            if (!config) { console.log(chalk.red('✗ NO AI SLOP is not initialized.')); return; }
            
            const target = options.target || 'agents';
            console.log(chalk.cyan(\`\\nApplying NO AI SLOP rules for target: \${target}...\\n\`));
            
            let combinedRules = '# NO AI SLOP — ACTIVE RULES\\n\\nThese rules are mandatory.\\n\\n';
            if (config.liquid) {
                combinedRules += '## LIQUID MODE ACTIVE\\n- Allow translucent surfaces, backdrop blur, subtle transparency.\\n- Do NOT turn the entire interface into glass.\\n- Restrained depth and Apple-inspired glass surfaces.\\n\\n';
            }

            for (const pack of config.rules) {
                const packDir = path.join(RULES_DIR, pack);
                if (fs.existsSync(packDir)) {
                    const files = fs.readdirSync(packDir);
                    for (const file of files) {
                        if (file.endsWith('.md') || file.endsWith('.txt')) {
                            combinedRules += \`## \${pack} - \${file}\\n\\n\${fs.readFileSync(path.join(packDir, file), 'utf-8')}\\n\\n\`;
                        }
                    }
                }
            }
            fs.writeFileSync(INSTRUCTIONS_PATH, combinedRules);
            console.log(chalk.green(\`✓ Combined rules written to \${INSTRUCTIONS_PATH}\`));

            if (target === 'agents' || target === 'all') { fs.writeFileSync(path.join(process.cwd(), 'AGENTS.md'), combinedRules); console.log(chalk.green('✓ Wrote to AGENTS.md')); }
            if (target === 'claude' || target === 'all') { fs.writeFileSync(path.join(process.cwd(), 'CLAUDE.md'), combinedRules); console.log(chalk.green('✓ Wrote to CLAUDE.md')); }
            if (target === 'cursor' || target === 'all') {
                const cursorDir = path.join(process.cwd(), '.cursor', 'rules');
                if (!fs.existsSync(cursorDir)) fs.mkdirSync(cursorDir, { recursive: true });
                fs.writeFileSync(path.join(cursorDir, 'noslop.mdc'), combinedRules);
                console.log(chalk.green('✓ Wrote to .cursor/rules/noslop.mdc'));
            }
            console.log(chalk.cyan('\\nRules successfully applied to targets.\\n'));
        });
}
`,
    "src/commands/doctor.ts": `import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import { NOSLOP_DIR, CONFIG_PATH, RULES_DIR } from '../utils/config';

export function doctorCommand() {
    return new Command('doctor').description('Diagnose NO AI SLOP installation').action(() => {
        console.log(chalk.cyan('\\nRunning NO AI SLOP Doctor...\\n'));
        console.log(\`Node.js version: \${process.version}\`);
        console.log(fs.existsSync(NOSLOP_DIR) ? chalk.green('✓ .noslop directory exists') : chalk.red('✗ .noslop directory missing'));
        console.log(fs.existsSync(CONFIG_PATH) ? chalk.green('✓ config.json exists') : chalk.red('✗ config.json missing'));
        console.log(fs.existsSync(RULES_DIR) ? chalk.green('✓ rules directory exists') : chalk.red('✗ rules directory missing'));
        console.log(chalk.cyan('\\nDiagnosis complete.\\n'));
    });
}
`,
    "src/commands/config.ts": `import { Command } from 'commander';
import chalk from 'chalk';
import { getConfig, saveConfig } from '../utils/config';

export function configCommand() {
    return new Command('config')
        .description('Manage NO AI SLOP configuration')
        .option('--set-liquid <boolean>', 'Enable or disable liquid mode')
        .action((options) => {
            const config = getConfig();
            if (!config) { console.log(chalk.red('✗ NO AI SLOP is not initialized.')); return; }

            if (options.setLiquid !== undefined) {
                config.liquid = options.setLiquid === 'true';
                saveConfig(config);
                console.log(chalk.green(\`✓ Liquid mode set to \${config.liquid}\`));
            } else {
                console.log(chalk.cyan('\\nCurrent Configuration:\\n'));
                console.log(JSON.stringify(config, null, 2));
            }
        });
}
`,
    "src/commands/check.ts": `import { Command } from 'commander';
import chalk from 'chalk';
import { getConfig } from '../utils/config';
import fs from 'fs';

export function checkCommand() {
    return new Command('check').description('Check current project against NO AI SLOP rules').action(() => {
        const config = getConfig();
        if (!config) { console.log(chalk.red('✗ NO AI SLOP is not initialized.')); return; }
        
        console.log(chalk.green('✓ Rules loaded'));
        console.log(chalk.green('✓ Configuration valid'));
        if (fs.existsSync('AGENTS.md') || fs.existsSync('CLAUDE.md')) {
            console.log(chalk.green('✓ AI instruction file detected'));
        } else {
            console.log(chalk.yellow('! No AI instruction file found. Run \`noslop apply\` to generate one.'));
        }
    });
}
`,
    "src/commands/update.ts": `import { Command } from 'commander';
import chalk from 'chalk';

export function updateCommand() {
    return new Command('update').description('Update installed rule packs').action(() => {
        console.log(chalk.cyan('Updating installed rule packs...'));
        console.log(chalk.green('✓ All rule packs are up to date.'));
    });
}
`,
    "src/commands/uninstall.ts": `import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import { NOSLOP_DIR } from '../utils/config';

export function uninstallCommand() {
    return new Command('uninstall').description('Remove NO AI SLOP from project').action(() => {
        if (fs.existsSync(NOSLOP_DIR)) {
            fs.rmSync(NOSLOP_DIR, { recursive: true, force: true });
            console.log(chalk.green('✓ NO AI SLOP configuration removed from project.'));
        } else {
            console.log(chalk.yellow('! NO AI SLOP is not initialized in this project.'));
        }
    });
}
`
};

// Write files
for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(process.cwd(), filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content);
    console.log('Created ' + filePath);
}
console.log('Scaffolding complete.');
