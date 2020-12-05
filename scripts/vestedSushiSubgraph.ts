import { fetchTotalAllocPoint, fetchPools, fetchUsers } from './subgraph/fetchFromSubgraph'

type Pools = {id: number, allocPoint: bigint, lastRewardBlock: number, accSushiPerShare: bigint, slpBalance: bigint, sushiHarvested: bigint}[];

type User = {id:string, address: string, amount: bigint, rewardDebt: bigint, sushiHarvested: bigint};
type Users = {id: string, address: string, amount: bigint, rewardDebt: bigint, sushiHarvested: bigint}[];

vestedSushiSubgraph(11389155, 11100000)

export default async function vestedSushiSubgraph(startBlock: number, endBlock: number) {
    const [totalAllocPointBeginning, totalAllocPointEnd] = await fetchTotalAllocPoint(startBlock, endBlock);
    const [poolsBeginning, poolsEnd] = await fetchPools(startBlock, endBlock);
    const [usersBeginning, usersEnd] = await fetchUsers(startBlock, endBlock);

    let test = usersBeginning.filter((entry) => {
        if(entry.id === "21-0xad3537445290b89aef571e4f0f9dc77376fb5571") { return true } else { return false}
    })
    console.log(pendingSushi(startBlock, totalAllocPointBeginning, poolsBeginning, test[0]))
    process.exit()
}

function pendingSushi(block: number, totalAllocPoint: bigint, pools: Pools, user: User) {
    let poolId = Number(user.id.split("-")[0]);
    let pool = pools.filter((entry) => entry.id === poolId ? true : false)[0]; // There's only going to be one
    
    let accSushiPerShare = pool.accSushiPerShare;
    if(block > pool.lastRewardBlock) {
        let multiplier = block - pool.lastRewardBlock;
        let sushiReward = BigInt(multiplier) * BigInt(100) * pool.allocPoint / totalAllocPoint;
        accSushiPerShare = accSushiPerShare + sushiReward * BigInt(1e12) / pool.slpBalance;
    }

    return user.amount * accSushiPerShare / BigInt(1e12) - user.rewardDebt;
}