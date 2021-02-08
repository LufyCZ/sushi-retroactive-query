import { fetchTotalAllocPoint, fetchPools, fetchUsers } from './subgraph/fetchFromSubgraph'

type Options = {startBlock: number, endBlock: number, upperLimit: bigint, lowerLimit: bigint, fee: bigint};

type Pools = {id: number, allocPoint: bigint, lastRewardBlock: number, accSushiPerShare: bigint, slpBalance: bigint, sushiHarvested: bigint}[];

type User = {id:string, address: string, amount: bigint, rewardDebt: bigint, sushiHarvested: bigint};
type Users = {id: string, address: string, amount: bigint, rewardDebt: bigint, sushiHarvested: bigint}[];

type TotalList = {address: string, total: bigint}[];


export default async function vestedSushiSubgraph(options: Options) {
    const [totalAllocPointBeginning, totalAllocPointEnd] = await fetchTotalAllocPoint(options.startBlock, options.endBlock);
    const [poolsBeginning, poolsEnd] = await fetchPools(options.startBlock, options.endBlock);
    const [usersBeginning, usersEnd] = await fetchUsers(options.startBlock, options.endBlock);

    const totalListBeginning = getTotalListPart(options.startBlock, totalAllocPointBeginning, poolsBeginning, usersBeginning);
    const totalListEnd = getTotalListPart(options.endBlock, totalAllocPointEnd, poolsEnd, usersEnd);

    const totalList = getTotalList(totalListBeginning, totalListEnd);

    let i = 0n; 
    getDistribution(totalList, options).forEach(e => {i+= BigInt(Object.values(e)[0])
        if(BigInt(Object.values(e)[0]) < options.lowerLimit) {console.log("wut")}
    } )
    console.log(Number(i) / 1e18, Number((i*BigInt(1e18)) / (41751307685593021162748032n)) / 1e18 * 100 + "%")
    return getDistribution(totalList, options);
}

// Pretty much replicates the function from MasterChef
function pendingSushi(block: number, totalAllocPoint: bigint, pools: Pools, user: User) {
    let poolId = Number(user.id.split("-")[0]);
    let pool = pools.filter((entry) => entry.id === poolId ? true : false)[0]; // There's only going to be one

    let accSushiPerShare = pool.accSushiPerShare;
    if(block > pool.lastRewardBlock && pool.slpBalance !== 0n) {
        let multiplier = block - pool.lastRewardBlock;
        let sushiReward = BigInt(multiplier) * 100n * BigInt(1e18) * pool.allocPoint / totalAllocPoint;
        accSushiPerShare = accSushiPerShare + sushiReward * BigInt(1e12) / pool.slpBalance;
    }

    return user.amount * accSushiPerShare / BigInt(1e12) - user.rewardDebt;
}

function getTotalListPart(block: number, totalAllocPoint: bigint, pools: Pools, users: Users) {
    let list: TotalList = users.map(entry => ({
        address: entry.address,
        total: pendingSushi(block, totalAllocPoint, pools, entry) + entry.sushiHarvested,
    }));

    let output: TotalList = [];
    list.forEach(entry => {
        let flag = false;
        output.forEach(e => {
            if(entry.address === e.address) { e.total += entry.total; flag = true; }
        })
        if(!flag) { output.push(entry) }
    })
    
    return output;
}

function getTotalList(totalListBeginning: TotalList, totalListEnd: TotalList) {
    return totalListEnd
            .map(end => ({
                address: end.address,
                total: end.total - (totalListBeginning.filter(beginning => { return end.address === beginning.address ? true : false })[0]?.total || 0n),
            }))
            .filter(entry => { return entry.total === 0n ? false : true; });
}

function getDistribution(totalList: TotalList, options: Options) {
    let totalVested: bigint = 0n - options.fee;
    totalList.filter(entry => entry.address === "0xe94b5eec1fa96ceecbd33ef5baa8d00e4493f4f3" ? true : entry.address === "0x19b3eb3af5d93b77a5619b047de0eed7115a19e7" ? true : false).forEach((entry) => {totalVested += entry.total});

    let totalFarmed = 0n;
    totalList.filter(entry => entry.address === "0xe94b5eec1fa96ceecbd33ef5baa8d00e4493f4f3" ? false : entry.address === "0x19b3eb3af5d93b77a5619b047de0eed7115a19e7" ? false : true).forEach((entry) => {totalFarmed += entry.total});

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
