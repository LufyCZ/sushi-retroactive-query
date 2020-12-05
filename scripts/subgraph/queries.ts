import pageResults from 'graph-results-pager';

const graphAPIEndpoints = {
	masterchef: 'https://api.thegraph.com/subgraphs/name/sushiswap/master-chef',
	blocklytics: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks'
};

export default {
	pageResults,
    graphAPIEndpoints,
    info(block_number: number) {
        let mainnet_address = "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd"
        return pageResults({
            api: graphAPIEndpoints.masterchef,
            query: {
                entity: 'masterChefs',
                selection: {
                    where: {
                        id: `\\"${mainnet_address}\\"`,
                    }, 
                    block: {number: block_number},
                },
                properties: [
                'totalAllocPoint',
                ],
            },
        })
            .then(([{ totalAllocPoint }]) =>
                ({
                    totalAllocPoint: Number(totalAllocPoint),
                })
            )
            .catch(err => console.log(err));
    },

    pools(block_number: number) {
        return pageResults({
            api: graphAPIEndpoints.masterchef,
            query: {
                entity: 'pools',
                selection: {
                    orderBy: 'block',
                    orderDirection: 'asc',
                    block: {number: block_number}
                },
                properties: [
                    'id',
                'allocPoint',
                'lastRewardBlock',
                'accSushiPerShare',
                'slpBalance',
                'sushiHarvested',
                ],
            },
        }) 
            .then(results =>
                results.map(({ id, allocPoint, lastRewardBlock, accSushiPerShare, slpBalance, sushiHarvested }) => ({
                    id: Number(id),
                    allocPoint: BigInt(allocPoint),
                    lastRewardBlock: Number(lastRewardBlock),
                    accSushiPerShare: BigInt(accSushiPerShare),
                    slpBalance: BigInt(Math.floor(slpBalance * 1e18)),
                    sushiHarvested: BigInt(sushiHarvested * 1e18),
                    })),
            )
            .catch((err, results) => console.log(err, results));
    },
    
    users(block_number: number) {
        return pageResults({
            api: graphAPIEndpoints.masterchef,
            query: {
                entity: 'users',
                selection: {
                    orderBy: 'block',
                    orderDirection: 'asc',
                    block: {number: block_number}
                },
                properties: [
                'id',
                'address',
                'amount',
                'rewardDebt',
                'sushiHarvested',
                ],
            },
        })
            .then(results =>
                results.map(({ id, address, amount, rewardDebt, sushiHarvested }) => ({
                    id: String(id),
                    address: String(address),
                    amount: BigInt(amount),
                    rewardDebt: BigInt(rewardDebt),
                    sushiHarvested: BigInt(Math.floor(sushiHarvested * 1e18)),
                })),
            )
            .catch(err => console.log(err));
    },
}