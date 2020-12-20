import { fetchAddresses } from './onchain/allAddressesMasterchef'
import { harvestedSushi } from './onchain/harvestedSushi';
import { pendingBalances, pendingVesting } from './onchain/pendingBalances'

const fs = require('fs');

type AddressList = {address: string, poolId: string}[];
type PendingBalanceList = {address: string, pendingBeginning: bigint, pendingEnd: bigint}[];
type HarvestedList = {address: string, harvested: bigint}[];
type TotalList = {address: string, sushi: bigint}[];

export default async function vestedSushiOnchain(startBlock: number, endBlock: number) {
    let addressList: AddressList | undefined = undefined;
    try { 
        const filename = './chain-cache/addresses-' + endBlock + '.json';
        addressList = JSON.parse(fs.readFileSync(filename))
    } catch {}

    let pendingBalanceList: PendingBalanceList | undefined = undefined;
    try {
        const filename = './chain-cache/pending-' + startBlock + '-' + endBlock + '.json';
        pendingBalanceList = JSON.parse(fs.readFileSync(filename));
        pendingBalanceList = pendingBalanceList!.map((entry) => ({
            address: entry.address, 
            pendingBeginning: BigInt(entry.pendingBeginning),
            pendingEnd: BigInt(entry.pendingEnd)
        }))
    } catch {}

    let harvestedList: HarvestedList | undefined = undefined;
    try {
        const filename = './chain-cache/harvested-' + startBlock + '-' + endBlock + '.json';
        harvestedList = JSON.parse(fs.readFileSync(filename));
        harvestedList = harvestedList!.map((entry) => ({
            address: entry.address,
            harvested: BigInt(entry.harvested)
        }))
    } catch {}

    addressList = addressList ? addressList : await fetchAddresses(endBlock); console.log("AddressList Done")
    pendingBalanceList = pendingBalanceList ? pendingBalanceList : await pendingBalances(addressList!, startBlock, endBlock); console.log("PendingBalanceList Done")
    harvestedList = harvestedList ? harvestedList : await harvestedSushi(startBlock, endBlock); console.log("HarvestedList Done")

    let totalList: TotalList = [];
    pendingBalanceList.forEach((pendingEntry) => {
        let flag = false;

        harvestedList!.forEach((harvestedEntry) => {
            if(pendingEntry.address === harvestedEntry.address) {
                let sushiAmount: bigint = harvestedEntry.harvested + pendingEntry.pendingEnd - pendingEntry.pendingBeginning;
                totalList.push({address: pendingEntry.address, sushi: sushiAmount});
                flag = true;
            }
        })

        if(!flag) {
            totalList.push({address: pendingEntry.address, sushi: pendingEntry.pendingEnd - pendingEntry.pendingBeginning})
        }
    })

    let distribution = await calculateDistribution(totalList, startBlock, endBlock);

    return distribution;
}

async function calculateDistribution(list: {address: string, sushi: bigint}[], startBlock: number, endBlock: number) {
    const totalVested = await pendingVesting(startBlock, endBlock);
    let totalFarmed: bigint = BigInt(0);
    list.forEach((entry) => {
        totalFarmed += entry.sushi;
    });

    // Multiplying to increase precision
    const fraction = ((BigInt(1e18) * totalVested) / totalFarmed);
    let output = {};
    
    list.forEach((entry) => {
        output[entry.address] = String((entry.sushi * fraction) / BigInt(1e18))
    });

    return output;
}