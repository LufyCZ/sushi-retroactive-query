import { program } from 'commander';

import vestedSushiOnchain from './scripts/vestedSushiOnchain';
import vestedSushiSubgraph from './scripts/vestedSushiSubgraph';

const fs = require('fs');

program
    .requiredOption('-s, --startBlock <number>')
    .requiredOption('-e, --endBlock <number>')
    .option('--chain')

    program.parse(process.argv);

const startBlock: number = Number(program.startBlock);
const endBlock: number = Number(program.endBlock);

const source: string = String(program.chain) ? 'onchain' : 'subgraph';

async function main() {
    let distribution = source === 'onchain' ? vestedSushiOnchain(startBlock, endBlock) : vestedSushiSubgraph(startBlock, endBlock);

    const filename = './output/vestedSushi/' + source + '-' + startBlock + '-' + endBlock + '.json';
    fs.writeFileSync(filename, JSON.stringify(distribution, null, 2));

    process.exit();
}

main();