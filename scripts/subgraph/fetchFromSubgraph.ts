import masterchef from "./queries";

type Pools = {id: number, allocPoint: bigint, lastRewardBlock: number, accSushiPerShare: bigint, slpBalance: bigint, sushiHarvested: bigint}[];
type Users = {poolId: number, address: string, amount: bigint, rewardDebt: bigint, sushiHarvested: bigint}[];

export async function fetchTotalAllocPoint(startBlock: number, endBlock: number) {
    const totalAllocPointBeginning: bigint = BigInt((await masterchef.info(startBlock)).totalAllocPoint);
    const totalAllocPointEnd: bigint = BigInt((await masterchef.info(endBlock)).totalAllocPoint);

    return [totalAllocPointBeginning, totalAllocPointEnd];
}

export async function fetchUsers(startBlock: number, endBlock: number) {
    const usersBeginning: Users = await masterchef.users(startBlock);
    const usersEnd: Users = await masterchef.users(endBlock);

    return [usersBeginning, usersEnd];
}

export async function fetchPools(startBlock: number, endBlock: number) {
    const poolsBeginning: Pools = await masterchef.pools(startBlock);
    const poolsEnd: Pools = await masterchef.pools(endBlock);

    return [poolsBeginning, poolsEnd];
}

