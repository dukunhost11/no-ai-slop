import { Command } from 'commander';
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
                console.log(chalk.green(`✓ Liquid mode set to ${config.liquid}`));
            } else {
                console.log(chalk.cyan('\nCurrent Configuration:\n'));
                console.log(JSON.stringify(config, null, 2));
            }
        });
}
