const Web3 = require('web3');
const fs = require('fs');
var _ = require('lodash');

let web3 = new Web3(process.env.NODE);

const masterchef = "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd";
const masterchefCreated = 10736242; // masterchef deployed

const depositTopic = "0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15"

export async function fetchAddresses(endBlock: number) {
    let logs = await getAllLogs(endBlock);

    logs.forEach((event, index, array) => {
        let address = "0x" + event.topics[1].slice(26);
        let poolId = Number(event.topics[2]);

        array[index] = { address, poolId }
    })
    
    logs = _.uniqWith(logs, _.isEqual);

    const filename = './output/addresses-' + endBlock + '.json';
    fs.writeFileSync(filename, JSON.stringify(logs, null, 2));

    return logs;
}

async function getAllLogs(endBlock: number) {
    let logs: any = [];
    for(let i = masterchefCreated; i < endBlock; i += 2500) {
        let end = (i + 2500) > endBlock ? endBlock : i+2500;

        logs = logs.concat(await web3.eth.getPastLogs({
            fromBlock: i,
            toBlock: end,
            address: masterchef,
            topics: [
                depositTopic
            ]
        }))
    }
    return logs;
}