/**
 * Clear Logs Utility
 * Clears the terminal and displays a clean slate for new logs
 */

const chalk = require('chalk');

// Clear terminal
console.clear();

// Display clean slate message
console.log('\n' + '-'.repeat(50));
console.log(`${chalk.green('✓')} ${chalk.bold('Logs cleared')}`);
console.log(`${chalk.green('✓')} ${chalk.white('Terminal ready for new logs')}`);
console.log('-'.repeat(50) + '\n');

console.log(chalk.yellow('Waiting for new activity...') + '\n'); 