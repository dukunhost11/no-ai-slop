import { Command } from 'commander';
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
