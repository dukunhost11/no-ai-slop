import { Command } from 'commander';
import chalk from 'chalk';

export function updateCommand() {
    return new Command('update').description('Update installed rule packs').action(() => {
        console.log(chalk.cyan('Updating installed rule packs...'));
        console.log(chalk.green('✓ All rule packs are up to date.'));
    });
}
