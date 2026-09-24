import { Command } from 'commander';
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
