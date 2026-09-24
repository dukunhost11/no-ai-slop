import { Command } from 'commander';
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
            console.log(chalk.yellow(`! Rule pack '${name}' is not installed.`));
            return;
        }

        config.rules.splice(index, 1);
        saveConfig(config);
        
        const packDir = path.join(RULES_DIR, name);
        if (fs.existsSync(packDir)) fs.rmSync(packDir, { recursive: true, force: true });
        
        console.log(chalk.green(`✓ Removed rule pack '${name}'.`));
    });
}
