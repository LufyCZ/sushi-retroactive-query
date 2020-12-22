import { program } from 'commander';

import vestedSushiOnchain from './scripts/vestedSushiOnchain';
import vestedSushiSubgraph from './scripts/vestedSushiSubgraph';

const fs = require('fs');

program
    .requiredOption('-s, --startBlock <number>')
    .requiredOption('-e, --endBlock <number>')
    .option('--chain')
    .option('--limit <bigint>')
    .option('--fee <bigint>')

    program.parse(process.argv);

const options = {
    startBlock: Number(program.startBlock),
    endBlock: Number(program.endBlock),
    limit: program.limit ? BigInt(program.limit) : 0n,
    fee: program.fee ? BigInt(program.fee) : 0n,
};

const source: string = program.chain ? 'onchain' : 'subgraph';

async function main() {
    let distribution = source === 'onchain' ? await vestedSushiOnchain(options) : await vestedSushiSubgraph(options);

    const filename = './output/' + source + '-' + options.startBlock + '-' + options.endBlock + '.json';
    fs.writeFileSync(filename, JSON.stringify(distribution, null, 2));

    process.exit();
}

main();