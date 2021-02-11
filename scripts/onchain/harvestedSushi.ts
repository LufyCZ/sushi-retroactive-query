const Web3 = require('web3');
const fs = require('fs');
var _ = require('lodash');

let web3 = new Web3(/*process.env.NODE*/);

const sushiToken = "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2";

const masterchefTopic = "0x000000000000000000000000c2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd";
const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

type HarvestedList = {address: string, harvested: bigint}[];

export async function harvestedSushi(startBlock: number, endBlock: number) {
    let harvestedList: HarvestedList = parseLogs(await getAllLogs(startBlock, endBlock));

    let output: {address: string, harvested: string}[] = harvestedList.map((entry) => ({
        address: entry.address,
        harvested: String(entry.harvested),
    }));

    const filename = './chain-cache/harvested-' + startBlock + '-' + endBlock + '.json';
    fs.writeFileSync(filename, JSON.stringify(output, null, 2));

    return harvestedList;
}

async function getAllLogs(startBlock: number, endBlock: number) {
    let logs = [];
    let step = 2500;

    for(let start = startBlock; start < endBlock; start += step) {
        let end = (start + step) > endBlock ? endBlock : start + step;

        logs = logs.concat(await web3.eth.getPastLogs({
            fromBlock: start,
            toBlock: end,
            address: sushiToken,
            topics: [
                transferTopic,
                masterchefTopic,
            ]
        }))
    }
    return logs;
}

function parseLogs(logs) {
    logs = logs.map((entry) => ({
        address: "0x" + entry.topics[2].slice(26),
        harvested: BigInt(entry.data),
    }))

    let output: any = [];

    for(let i in logs) {
        let flag = false;

        for(let j in output) {
            if(logs[i].address === output[j].address) {
                output[j].harvested += logs[i].harvested;
                flag = true;
                break;
            }
        }

        if(!flag && logs[i].address !== "0x19B3Eb3Af5D93b77a5619b047De0EED7115A19e7".toLowerCase() && logs[i].address !== "0xe94B5EEC1fA96CEecbD33EF5Baa8d00E4493F4f3".toLowerCase()) { output.push({address: logs[i].address, harvested: logs[i].harvested }) }
    }

    return output;
}