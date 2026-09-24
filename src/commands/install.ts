import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { getConfig, saveConfig, RULES_DIR } from '../utils/config';

export function installCommand() {
    return new Command('install')
        .argument('<repository>', 'GitHub repository URL')
        .description('Install a rule pack from a repository')
        .action(async (repoUrl) => {
            console.log(chalk.cyan('\nInstalling rule pack...\n'));
            const config = getConfig();
            if (!config) { console.log(chalk.red('✗ NO AI SLOP is not initialized. Run `noslop init` first.')); return; }

            const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)/;
            const match = repoUrl.match(githubRegex);
            if (!match) { console.log(chalk.red('✗ Invalid repository URL. Currently only GitHub repositories are supported.')); return; }

            const [_, owner, repo] = match;
            console.log(chalk.green('✓ Repository detected'));

            try {
                const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/main`;
                let noslopJson;
                try {
                    const res = await axios.get(`${rawBase}/noslop.json`);
                    noslopJson = res.data;
                } catch (e) {
                    throw new Error('Could not find noslop.json in the repository root.');
                }
                console.log(chalk.green('✓ Rules discovered'));
                if (!noslopJson.name || !noslopJson.rules || !Array.isArray(noslopJson.rules)) throw new Error('Invalid noslop.json format.');
                console.log(chalk.green('✓ Rules validated'));

                const packDir = path.join(RULES_DIR, noslopJson.name);
                if (!fs.existsSync(packDir)) fs.mkdirSync(packDir, { recursive: true });

                let downloadedCount = 0;
                for (const rulePath of noslopJson.rules) {
                    if (!rulePath.endsWith('.md') && !rulePath.endsWith('.txt') && !rulePath.endsWith('.json')) {
                        console.log(chalk.yellow(`! Skipping ${rulePath} (only .md, .txt, .json supported)`));
                        continue;
                    }
                    try {
                        const ruleRes = await axios.get(`${rawBase}/${rulePath}`);
                        fs.writeFileSync(path.join(packDir, path.basename(rulePath)), ruleRes.data);
                        downloadedCount++;
                    } catch (e) {
                        console.log(chalk.red(`✗ Failed to download ${rulePath}`));
                    }
                }
                console.log(chalk.green('✓ Rules installed\n'));
                if (!config.rules.includes(noslopJson.name)) {
                    config.rules.push(noslopJson.name);
                    saveConfig(config);
                }
                console.log('Installed:');
                console.log(chalk.cyan(`  ${noslopJson.name}`));
                console.log(`Rules: ${downloadedCount}`);
                console.log(`Source: github.com/${owner}/${repo}\n`);
                console.log('NO AI SLOP is now active.');
            } catch (err: any) {
                console.log(chalk.red('✗ Could not install rule pack.\n'));
                console.log('Reason:\n' + err.message);
            }
        });
}
