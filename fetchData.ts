import { program } from 'commander';

import vestedSushiOnchain from './scripts/vestedSushiOnchain';
import vestedSushiSubgraph from './scripts/vestedSushiSubgraph';

const fs = require('fs');

program
    .requiredOption('-s, --startBlock <number>')
    .requiredOption('-e, --endBlock <number>')
    .option('--chain')
    .option('--upperLimit <bigint>')
    .option('--lowerLimit <bigint>')
    .option('--fee <bigint>')

    program.parse(process.argv);

const options = {
    startBlock: Number(program.startBlock),
    endBlock: Number(program.endBlock),
    upperLimit: program.upperLimit ? BigInt(program.upperLimit) * BigInt(1e18) : 0n,
    lowerLimit: program.lowerLimit ? BigInt(program.lowerLimit) * BigInt(1e18) : 0n,
    fee: program.fee ? BigInt(program.fee) : 0n,
};

const source: string = program.chain ? 'onchain' : 'subgraph';

async function main() {
    let distribution = source === 'onchain' ? await vestedSushiOnchain(options) : await vestedSushiSubgraph(options);
    console.log(distribution.length)
    const filename = './output/' + source + '-' + options.startBlock + '-' + options.endBlock + '.json';
    fs.writeFileSync(filename, JSON.stringify(distribution, null, 2));

    process.exit();
}

main();