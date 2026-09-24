import { Command } from 'commander';
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
            console.log(chalk.cyan('└─────────────────────────────┘\n'));

            if (fs.existsSync(NOSLOP_DIR)) {
                console.log(chalk.yellow('! NO AI SLOP is already initialized in this project.'));
                return;
            }
            try {
                initConfig();
                console.log(chalk.green('✓ Initialized .noslop directory'));
                console.log(chalk.green('✓ Created config.json'));
                console.log(chalk.green('✓ Created rules and sources directories'));
                console.log('\nNO AI SLOP is now active. Use ' + chalk.cyan('noslop install <repo>') + ' to add rules.');
            } catch (err: any) {
                console.log(chalk.red('✗ Failed to initialize NO AI SLOP.'));
                console.log('Reason:\n' + err.message);
            }
        });
}
