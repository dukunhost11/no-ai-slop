import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import { NOSLOP_DIR, CONFIG_PATH, RULES_DIR } from '../utils/config';

export function doctorCommand() {
    return new Command('doctor').description('Diagnose NO AI SLOP installation').action(() => {
        console.log(chalk.cyan('\nRunning NO AI SLOP Doctor...\n'));
        console.log(`Node.js version: ${process.version}`);
        console.log(fs.existsSync(NOSLOP_DIR) ? chalk.green('✓ .noslop directory exists') : chalk.red('✗ .noslop directory missing'));
        console.log(fs.existsSync(CONFIG_PATH) ? chalk.green('✓ config.json exists') : chalk.red('✗ config.json missing'));
        console.log(fs.existsSync(RULES_DIR) ? chalk.green('✓ rules directory exists') : chalk.red('✗ rules directory missing'));
        console.log(chalk.cyan('\nDiagnosis complete.\n'));
    });
}
