import { fetchTotalAllocPoint, fetchPools, fetchUsers } from './subgraph/fetchFromSubgraph'
const Web3 = require('web3');

const node = "https://eth-mainnet.alchemyapi.io/v2/POF_8dut72xzyjWIH0O7cUDsCE_Qr6gc"
const masterchefAddress = "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd";

const masterchefAbi = [{"inputs":[{"internalType":"contract SushiToken","name":"_sushi","type":"address"},{"internalType":"address","name":"_devaddr","type":"address"},{"internalType":"uint256","name":"_sushiPerBlock","type":"uint256"},{"internalType":"uint256","name":"_startBlock","type":"uint256"},{"internalType":"uint256","name":"_bonusEndBlock","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EmergencyWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"inputs":[],"name":"BONUS_MULTIPLIER","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_allocPoint","type":"uint256"},{"internalType":"contract IERC20","name":"_lpToken","type":"address"},{"internalType":"bool","name":"_withUpdate","type":"bool"}],"name":"add","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"bonusEndBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_devaddr","type":"address"}],"name":"dev","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"devaddr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"emergencyWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_from","type":"uint256"},{"internalType":"uint256","name":"_to","type":"uint256"}],"name":"getMultiplier","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"massUpdatePools","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"migrate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"migrator","outputs":[{"internalType":"contract IMigratorChef","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"pendingSushi","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poolInfo","outputs":[{"internalType":"contract IERC20","name":"lpToken","type":"address"},{"internalType":"uint256","name":"allocPoint","type":"uint256"},{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"accSushiPerShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"poolLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_allocPoint","type":"uint256"},{"internalType":"bool","name":"_withUpdate","type":"bool"}],"name":"set","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IMigratorChef","name":"_migrator","type":"address"}],"name":"setMigrator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"startBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sushi","outputs":[{"internalType":"contract SushiToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sushiPerBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalAllocPoint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"updatePool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"userInfo","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];

let web3 = new Web3(node);
let masterchef = new web3.eth.Contract(masterchefAbi, masterchefAddress);

type Pools = {id: number, allocPoint: bigint, lastRewardBlock: number, accSushiPerShare: bigint, slpBalance: bigint, sushiHarvested: bigint}[];

type User = {id:string, address: string, amount: bigint, rewardDebt: bigint, sushiHarvested: bigint};
type Users = {id: string, address: string, amount: bigint, rewardDebt: bigint, sushiHarvested: bigint}[];

type TotalList = {address: string, total: bigint}[];



export default async function vestedSushiSubgraph(startBlock: number, endBlock: number) {
    const [totalAllocPointBeginning, totalAllocPointEnd] = await fetchTotalAllocPoint(startBlock, endBlock);
    const [poolsBeginning, poolsEnd] = await fetchPools(startBlock, endBlock);
    const [usersBeginning, usersEnd] = await fetchUsers(startBlock, endBlock);

    const totalListBeginning = getTotalListPart(startBlock, totalAllocPointBeginning, poolsBeginning, usersBeginning);
    const totalListEnd = getTotalListPart(endBlock, totalAllocPointEnd, poolsEnd, usersEnd);

    const totalList = getTotalList(totalListBeginning, totalListEnd);

    // console.log(await masterchef.methods.pendingSushi(4, "0x8867ef1593f6a72dbbb941d4d96b746a4da691b2").call(startBlock));
    // let user = usersBeginning.filter((entry) => entry.address === "0x8867ef1593f6a72dbbb941d4d96b746a4da691b2" ? true : false)[0]
    // console.log(pendingSushi(startBlock, totalAllocPointBeginning, poolsBeginning, user))

    getDistribution(totalList)

    process.exit()
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
    return totalListEnd.map(end => ({
        address: end.address,
        total: end.total - (totalListBeginning.filter(beginning => { return end.address === beginning.address ? true : false })[0]?.total || 0n),
    })).filter(entry => { return entry.total === 0n ? false : true; });
}

function getDistribution(totalList: TotalList) {
    let totalVested: bigint = 0n;
    totalList.filter(entry => entry.address === "0xe94b5eec1fa96ceecbd33ef5baa8d00e4493f4f3" ? true : entry.address === "0x19b3eb3af5d93b77a5619b047de0eed7115a19e7" ? true : false).forEach((entry) => {totalVested += entry.total});

    let totalFarmed = 0n;
    totalList.filter(entry => entry.address === "0xe94b5eec1fa96ceecbd33ef5baa8d00e4493f4f3" ? false : entry.address === "0x19b3eb3af5d93b77a5619b047de0eed7115a19e7" ? false : true).forEach((entry) => {totalFarmed += entry.total});

    // Multiplying to increase precision
    const fraction = (BigInt(1e18) * totalVested) / totalFarmed;
    console.log(totalVested, "vested")
    console.log(totalFarmed, "farmed")
    console.log(fraction, "fraction")
    return totalList
            .filter(entry => entry.address === "0xe94b5eec1fa96ceecbd33ef5baa8d00e4493f4f3" ? false : entry.address === "0x19b3eb3af5d93b77a5619b047de0eed7115a19e7" ? false : true)
            .map(entry => ({
                [entry.address]: String((entry.total * fraction) / BigInt(1e18))
            }));
}











async function test(block, pools: Pools, user: User, totalAllocPoint: bigint) {
    console.log(pools[9]) // fetched from subgraph
    console.log(await masterchef.methods.poolInfo(9).call(block))
}   