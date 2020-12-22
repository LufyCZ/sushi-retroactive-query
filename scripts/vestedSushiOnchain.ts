import { fetchAddresses } from './onchain/allAddressesMasterchef'
import { harvestedSushi } from './onchain/harvestedSushi';
import { pendingBalances, pendingVesting } from './onchain/pendingBalances'

const fs = require('fs');

type Options = {startBlock: number, endBlock: number, limit: bigint, fee: bigint};

type AddressList = {address: string, poolId: string}[];
type PendingBalanceList = {address: string, pendingBeginning: bigint, pendingEnd: bigint}[];
type HarvestedList = {address: string, harvested: bigint}[];
type TotalList = {address: string, sushi: bigint}[];

export default async function vestedSushiOnchain(options: Options) {
    let addressList: AddressList | undefined = undefined;
    try { 
        const filename = './chain-cache/addresses-' + options.endBlock + '.json';
        addressList = JSON.parse(fs.readFileSync(filename))
    } catch {}

    let pendingBalanceList: PendingBalanceList | undefined = undefined;
    try {
        const filename = './chain-cache/pending-' + options.startBlock + '-' + options.endBlock + '.json';
        pendingBalanceList = JSON.parse(fs.readFileSync(filename));
        pendingBalanceList = pendingBalanceList!.map((entry) => ({
            address: entry.address, 
            pendingBeginning: BigInt(entry.pendingBeginning),
            pendingEnd: BigInt(entry.pendingEnd)
        }))
    } catch {}

    let harvestedList: HarvestedList | undefined = undefined;
    try {
        const filename = './chain-cache/harvested-' + options.startBlock + '-' + options.endBlock + '.json';
        harvestedList = JSON.parse(fs.readFileSync(filename));
        harvestedList = harvestedList!.map((entry) => ({
            address: entry.address,
            harvested: BigInt(entry.harvested)
        }))
    } catch {}

    addressList = addressList ? addressList : await fetchAddresses(options.endBlock); console.log("AddressList Done")
    pendingBalanceList = pendingBalanceList ? pendingBalanceList : await pendingBalances(addressList!, options.startBlock, options.endBlock); console.log("PendingBalanceList Done")
    harvestedList = harvestedList ? harvestedList : await harvestedSushi(options.startBlock, options.endBlock); console.log("HarvestedList Done")

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

    let distribution = await calculateDistribution(totalList, options);

    return distribution;
}

async function calculateDistribution(totalList: TotalList, options: Options) {
    const totalVested = (await pendingVesting(options.startBlock, options.endBlock)) - options.fee;
    
    let totalFarmed: bigint = 0n;
    totalList.forEach((entry) => {
        totalFarmed += entry.sushi;
    });

    // Multiplying to increase precision
    const fraction = ((BigInt(1e18) * totalVested) / totalFarmed);

    return totalList
            .filter(entry => entry.sushi > options.limit)
            .map(entry => ({
                [entry.address]: String((entry.sushi * fraction) / BigInt(1e18))
            }))
}