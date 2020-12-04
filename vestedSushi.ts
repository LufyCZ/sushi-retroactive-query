import { outputHelp, program } from 'commander';

import { fetchAddresses } from './scripts/allAddressesMasterchef'
import { harvestedSushi } from './scripts/harvestedSushi';
import { pendingBalances, pendingVesting } from './scripts/pendingBalances'

const fs = require('fs');

program
    .requiredOption('-s, --startBlock <number>')
    .requiredOption('-e, --endBlock <number>')

    program.parse(process.argv);

const startBlock: number = Number(program.startBlock);
const endBlock: number = Number(program.endBlock);

let addressList: {address: string, poolId: string}[];
try { 
    const filename = './output/addresses-' + endBlock + '.json';
    addressList = JSON.parse(fs.readFileSync(filename))
 } catch {}

let pendingBalanceList: {address: string, pendingBeginning: bigint, pendingEnd: bigint}[];
try {
    const filename = './output/pending-' + startBlock + '-' + endBlock + '.json';
    pendingBalanceList = JSON.parse(fs.readFileSync(filename));
    pendingBalanceList = pendingBalanceList.map((entry) => ({
        address: entry.address, 
        pendingBeginning: BigInt(entry.pendingBeginning),
        pendingEnd: BigInt(entry.pendingEnd)
    }))
} catch {}

let harvestedList: {address: string, harvested: bigint}[];
try {
    const filename = './output/harvested-' + startBlock + '-' + endBlock + '.json';
    harvestedList = JSON.parse(fs.readFileSync(filename));
    harvestedList = harvestedList.map((entry) => ({
        address: entry.address,
        harvested: BigInt(entry.harvested)
    }))
} catch {}


async function main() {
    addressList = addressList ? addressList : await fetchAddresses(endBlock); console.log("AddressList Done")
    pendingBalanceList = pendingBalanceList ? pendingBalanceList : await pendingBalances(addressList, startBlock, endBlock); console.log("PendingBalanceList Done")
    harvestedList = harvestedList ? harvestedList : await harvestedSushi(startBlock, endBlock); console.log("HarvestedList Done")

    let totalList: {address: string, sushi: bigint}[] = [];
    pendingBalanceList.forEach((pendingBalances) => {
        for(let i in harvestedList) {
            if(pendingBalances.address === harvestedList[i].address) {
                let sushiAmount: bigint = harvestedList[i].harvested + pendingBalances.pendingEnd - pendingBalances.pendingBeginning;
                totalList.push({address: pendingBalances.address, sushi: sushiAmount});
            }
        }
    })

    let distribution = await calculateDistribution(totalList);

    const filename = './output/vestedSushi-' + startBlock + '-' + endBlock + '.json';
    fs.writeFileSync(filename, JSON.stringify(distribution, null, 2));

    process.exit();
}

async function calculateDistribution(list: {address: string, sushi: bigint}[]) {
    let sushiToDistribute = await pendingVesting(startBlock, endBlock);
    let totalSushiFarmed: bigint = BigInt(0);
    list.forEach((entry) => {
        totalSushiFarmed += entry.sushi;
    });

    let fraction = ((BigInt(1000000) * sushiToDistribute) / totalSushiFarmed);

    let output = {};
    
    list.forEach((entry) => {
        output[entry.address] = String((entry.sushi * fraction) / BigInt(1000000))
    });

    return output;
}

main()