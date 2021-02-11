import { isJSDocCallbackTag } from 'typescript';
import { fetchTotalAllocPoint, fetchPools, fetchUsers } from './subgraph/fetchFromSubgraph'

type Options = {
    startBlock: number, 
    endBlock: number, 
    upperLimit: bigint, 
    lowerLimit: bigint, 
    fee: bigint,
    distribute: bigint | undefined,
    poolId: number | undefined
};

type Pools = {
    id: number, 
    allocPoint: bigint, 
    lastRewardBlock: number, 
    accSushiPerShare: bigint, 
    slpBalance: bigint, 
    sushiHarvested: bigint
}[];    

type User = {
    address: string, 
    poolId: number,
    amount: bigint, 
    rewardDebt: bigint, 
    sushiHarvested: bigint

};

type TotalList = {
    address: string,
    poolId: number,
    total: bigint
}[];

export default async function vestedSushiSubgraph(options: Options) {
    const [totalAllocPointBeginning, totalAllocPointEnd] = await fetchTotalAllocPoint(options.startBlock, options.endBlock);
    const [poolsBeginning, poolsEnd] = await fetchPools(options.startBlock, options.endBlock);
    const [usersBeginning, usersEnd] = await fetchUsers(options.startBlock, options.endBlock);

    const totalListBeginning = getTotalListPart(options.startBlock, totalAllocPointBeginning, poolsBeginning, usersBeginning, options);
    const totalListEnd = getTotalListPart(options.endBlock, totalAllocPointEnd, poolsEnd, usersEnd, options);

    const totalList = getTotalList(totalListBeginning, totalListEnd);

    let i = 0n; 
    getDistribution(totalList, options).forEach(e => {i+= BigInt(Object.values(e)[0])})
    return getDistribution(totalList, options);
}

// Pretty much replicates the function from MasterChef
function pendingSushi(block: number, totalAllocPoint: bigint, pools: Pools, user: User) {
    let poolId = user.poolId;
    let pool = pools.filter((entry) => entry.id === poolId ? true : false)[0]; // There's only going to be one

    let accSushiPerShare = pool.accSushiPerShare;
    if(block > pool.lastRewardBlock && pool.slpBalance !== 0n) {
        let multiplier = block - pool.lastRewardBlock;
        let sushiReward = BigInt(multiplier) * 100n * BigInt(1e18) * pool.allocPoint / totalAllocPoint;
        accSushiPerShare = accSushiPerShare + sushiReward * BigInt(1e12) / pool.slpBalance;
    }

    return user.amount * accSushiPerShare / BigInt(1e12) - user.rewardDebt;
}

function getTotalListPart(block: number, totalAllocPoint: bigint, pools: Pools, users: User[], options: Options) {
    let list: TotalList = users.map(entry => ({
        address: entry.address,
        poolId: entry.poolId,
        total: pendingSushi(block, totalAllocPoint, pools, entry) + entry.sushiHarvested,
    }));

    let output: TotalList = [];
    list.forEach(entry => {
        let flag = false;
        output.forEach(e => {
            if(entry.address === e.address) {
                if(options.poolId ? options.poolId === entry.poolId : true) {
                    e.total += entry.total; flag = true;
                }
            }
        })
        if(!flag) {
            if(options.poolId ? options.poolId === entry.poolId : true) {
                output.push(entry) 
            }
        }
    })
    
    return output;
}

function getTotalList(totalListBeginning: TotalList, totalListEnd: TotalList) {
    return totalListEnd
            .map(end => ({
                address: end.address,
                poolId: end.poolId,
                total: end.total - (totalListBeginning.filter(beginning => { return end.address === beginning.address ? true : false })[0]?.total || 0n),
            }))
            .filter(entry => { return entry.total === 0n ? false : true; });
}

function getDistribution(totalList: TotalList, options: Options) {
    let totalVested: bigint = 0n - options.fee;
    totalVested = !options.distribute ? 
        totalList
            .filter(entry => entry.address === "0xe94b5eec1fa96ceecbd33ef5baa8d00e4493f4f3" ? true : entry.address === "0x19b3eb3af5d93b77a5619b047de0eed7115a19e7" ? true : false)
            .reduce((a, b) => a + b.total, 0n) :
        options.distribute;

    let totalFarmed = totalList
        .filter(entry => entry.address === "0xe94b5eec1fa96ceecbd33ef5baa8d00e4493f4f3" ? false : entry.address === "0x19b3eb3af5d93b77a5619b047de0eed7115a19e7" ? false : true)
        .reduce((a, b) => a + b.total, 0n);

    // Multiplying to increase precision
    const fraction = (BigInt(1e18) * totalVested) / totalFarmed;

    console.log(totalVested, "Total vested");
    console.log(totalFarmed, "Total farmed");
    console.log(fraction, "Fraction");

    return totalList
            .filter(entry => entry.address === "0xe94b5eec1fa96ceecbd33ef5baa8d00e4493f4f3" ? false : entry.address === "0x19b3eb3af5d93b77a5619b047de0eed7115a19e7" ? false : true)
            .filter(entry => (entry.total > options.lowerLimit && (options.upperLimit !== 0n ? entry.total < options.upperLimit : true)))
            .map(entry => ({
                [entry.address]: String((entry.total * fraction) / BigInt(1e18))
            }));
}
