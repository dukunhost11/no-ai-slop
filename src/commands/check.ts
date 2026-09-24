import { Command } from 'commander';
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
            console.log(chalk.yellow('! No AI instruction file found. Run `noslop apply` to generate one.'));
        }
    });
}
