const Web3 = require('web3');
const fs = require('fs');

let web3 = new Web3(process.env.ARCHIVE_NODE);

const masterchefAddress = "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd";
const masterchefAbi = [{"inputs":[{"internalType":"contract SushiToken","name":"_sushi","type":"address"},{"internalType":"address","name":"_devaddr","type":"address"},{"internalType":"uint256","name":"_sushiPerBlock","type":"uint256"},{"internalType":"uint256","name":"_startBlock","type":"uint256"},{"internalType":"uint256","name":"_bonusEndBlock","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EmergencyWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"inputs":[],"name":"BONUS_MULTIPLIER","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_allocPoint","type":"uint256"},{"internalType":"contract IERC20","name":"_lpToken","type":"address"},{"internalType":"bool","name":"_withUpdate","type":"bool"}],"name":"add","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"bonusEndBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_devaddr","type":"address"}],"name":"dev","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"devaddr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"emergencyWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_from","type":"uint256"},{"internalType":"uint256","name":"_to","type":"uint256"}],"name":"getMultiplier","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"massUpdatePools","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"migrate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"migrator","outputs":[{"internalType":"contract IMigratorChef","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"pendingSushi","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poolInfo","outputs":[{"internalType":"contract IERC20","name":"lpToken","type":"address"},{"internalType":"uint256","name":"allocPoint","type":"uint256"},{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"accSushiPerShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"poolLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_allocPoint","type":"uint256"},{"internalType":"bool","name":"_withUpdate","type":"bool"}],"name":"set","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IMigratorChef","name":"_migrator","type":"address"}],"name":"setMigrator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"startBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sushi","outputs":[{"internalType":"contract SushiToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sushiPerBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalAllocPoint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"updatePool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"userInfo","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];

const masterchef = new web3.eth.Contract(masterchefAbi, masterchefAddress);

async function pendingBalance(address: string, poolId: number, startBlock: number, endBlock: number, poolLengthStart: number, poolLengthEnd: number) {
    let pendingBeginning = poolId < poolLengthStart ? BigInt(await masterchef.methods.pendingSushi(poolId, address).call(startBlock)) : BigInt(0);
    let pendingEnd = poolId < poolLengthEnd ? BigInt(await masterchef.methods.pendingSushi(poolId, address).call(endBlock)) : BigInt(0);

    return [pendingBeginning, pendingEnd];
}

export async function pendingBalances(addresses: {address: string, poolId: string}[], startBlock: number, endBlock: number) {
    let output: any = [];

    // To avoid asking for a pending balance on a yet non-existing pool
    const poolLengthStart = Number(await masterchef.methods.poolLength().call(startBlock));
    const poolLengthEnd = Number(await masterchef.methods.poolLength().call(endBlock));

    for(let i in addresses) {
        const [pendingBeginning, pendingEnd] = await pendingBalance(addresses[i].address, Number(addresses[i].poolId), startBlock, endBlock, poolLengthStart, poolLengthEnd);

        let flag = false;
        for(let j in output) {
            if(addresses[i].address === output[j].address) {
                output[j].pendingBeginning += pendingBeginning;
                output[j].pendingEnd += pendingEnd;
                flag = true;
                break;
            }
        }

        if(!flag) { output.push({address: addresses[i].address, pendingBeginning, pendingEnd}); }
    };
    
    output = output.map((entry) => ({
        address: entry.address,
        pendingBeginning: String(entry.pendingBeginning),
        pendingEnd: String(entry.pendingEnd)
    }));

    const filename = './output/pending-' + startBlock + '-' + endBlock + '.json';
    fs.writeFileSync(filename, JSON.stringify(output, null, 2));

    return output;
}

// 29 is the vesting pool id, the address is the multisig who owns the DUMMY token in the pool
export async function pendingVesting(startBlock: number, endBlock: number) {
    let vestedBeginning = BigInt(await masterchef.methods.pendingSushi(29, "0xe94B5EEC1fA96CEecbD33EF5Baa8d00E4493F4f3").call(startBlock))
    let vestedEnd = BigInt(await masterchef.methods.pendingSushi(29, "0xe94B5EEC1fA96CEecbD33EF5Baa8d00E4493F4f3").call(endBlock))
    
    return vestedEnd - vestedBeginning;
}