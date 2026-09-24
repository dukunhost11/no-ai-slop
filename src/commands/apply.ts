import { Command } from 'commander';
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
            console.log(chalk.cyan(`\nApplying NO AI SLOP rules for target: ${target}...\n`));
            
            let combinedRules = '# NO AI SLOP — ACTIVE RULES\n\nThese rules are mandatory.\n\n';
            if (config.liquid) {
                combinedRules += '## LIQUID MODE ACTIVE\n- Allow translucent surfaces, backdrop blur, subtle transparency.\n- Do NOT turn the entire interface into glass.\n- Restrained depth and Apple-inspired glass surfaces.\n\n';
            }

            for (const pack of config.rules) {
                const packDir = path.join(RULES_DIR, pack);
                if (fs.existsSync(packDir)) {
                    const files = fs.readdirSync(packDir);
                    for (const file of files) {
                        if (file.endsWith('.md') || file.endsWith('.txt')) {
                            combinedRules += `## ${pack} - ${file}\n\n${fs.readFileSync(path.join(packDir, file), 'utf-8')}\n\n`;
                        }
                    }
                }
            }
            fs.writeFileSync(INSTRUCTIONS_PATH, combinedRules);
            console.log(chalk.green(`✓ Combined rules written to ${INSTRUCTIONS_PATH}`));

            if (target === 'agents' || target === 'all') { fs.writeFileSync(path.join(process.cwd(), 'AGENTS.md'), combinedRules); console.log(chalk.green('✓ Wrote to AGENTS.md')); }
            if (target === 'claude' || target === 'all') { fs.writeFileSync(path.join(process.cwd(), 'CLAUDE.md'), combinedRules); console.log(chalk.green('✓ Wrote to CLAUDE.md')); }
            if (target === 'cursor' || target === 'all') {
                const cursorDir = path.join(process.cwd(), '.cursor', 'rules');
                if (!fs.existsSync(cursorDir)) fs.mkdirSync(cursorDir, { recursive: true });
                fs.writeFileSync(path.join(cursorDir, 'noslop.mdc'), combinedRules);
                console.log(chalk.green('✓ Wrote to .cursor/rules/noslop.mdc'));
            }
            if (target === 'copilot' || target === 'all') {
                const githubDir = path.join(process.cwd(), '.github');
                if (!fs.existsSync(githubDir)) fs.mkdirSync(githubDir, { recursive: true });
                fs.writeFileSync(path.join(githubDir, 'copilot-instructions.md'), combinedRules);
                console.log(chalk.green('✓ Wrote to .github/copilot-instructions.md'));
            }
            console.log(chalk.cyan('\nRules successfully applied to targets.\n'));
        });
}
