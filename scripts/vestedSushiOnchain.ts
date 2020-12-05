import { fetchAddresses } from './onchain/allAddressesMasterchef'
import { harvestedSushi } from './onchain/harvestedSushi';
import { pendingBalances, pendingVesting } from './onchain/pendingBalances'

const fs = require('fs');

type AddressList = {address: string, poolId: string}[];
type PendingBalanceList = {address: string, pendingBeginning: bigint, pendingEnd: bigint}[];
type HarvestedList = {address: string, harvested: bigint}[];

export default async function vestedSushiOnchain(startBlock: number, endBlock: number) {
    let [addressList, pendingBalanceList, harvestedList] = loadCached(startBlock, endBlock);

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

    let distribution = await calculateDistribution(totalList, startBlock, endBlock);

    return distribution;
}

async function calculateDistribution(list: {address: string, sushi: bigint}[], startBlock: number, endBlock: number) {
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

function loadCached(startBlock: number, endBlock: number) {
    let addressList: AddressList | undefined = undefined;
    try { 
        const filename = './output/addresses-' + endBlock + '.json';
        addressList = JSON.parse(fs.readFileSync(filename))
    } catch {}

    let pendingBalanceList: PendingBalanceList | undefined = undefined;
    try {
        const filename = './output/pending-' + startBlock + '-' + endBlock + '.json';
        pendingBalanceList = JSON.parse(fs.readFileSync(filename));
        pendingBalanceList = pendingBalanceList!.map((entry) => ({
            address: entry.address, 
            pendingBeginning: BigInt(entry.pendingBeginning),
            pendingEnd: BigInt(entry.pendingEnd)
        }))
    } catch {}

    let harvestedList: HarvestedList | undefined = undefined;
    try {
        const filename = './output/harvested-' + startBlock + '-' + endBlock + '.json';
        harvestedList = JSON.parse(fs.readFileSync(filename));
        harvestedList = harvestedList!.map((entry) => ({
            address: entry.address,
            harvested: BigInt(entry.harvested)
        }))
    } catch {}

    return [addressList, pendingBalanceList, harvestedList];
}