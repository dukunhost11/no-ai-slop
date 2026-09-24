import { Command } from 'commander';
import chalk from 'chalk';
import { getConfig } from '../utils/config';

export function listCommand() {
    return new Command('list').description('List installed rule packs').action(() => {
        const config = getConfig();
        if (!config) { console.log(chalk.red('✗ NO AI SLOP is not initialized.')); return; }
        console.log(chalk.cyan('\nNO AI SLOP RULES\n'));
        if (config.rules.length === 0) {
            console.log('No rule packs installed.');
        } else {
            config.rules.forEach(rule => console.log(chalk.green('✓ ') + rule));
            console.log(`\n${config.rules.length} rule packs installed.\n`);
        }
    });
}
