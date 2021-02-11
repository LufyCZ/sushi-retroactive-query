import pageResults from 'graph-results-pager';

const graphAPIEndpoints = {
	masterchef: 'https://api.thegraph.com/subgraphs/name/lufycz/masterchef-vesting',

    //masterchef: 'https://api.thegraph.com/subgraphs/name/sushiswap/master-chef',
	blocklytics: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks'
};

type Users = {
    poolId: number, 
    address: string, 
    amount: bigint, 
    rewardDebt: bigint, 
    sushiHarvested: bigint
}[];

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
    
    async users(block_number: number) {
        let start_block = 0;
        let end_block = block_number;
        let result: Users = [];

        const cutoffs = [11789337];
        for(let i = cutoffs.length-1; i >= 0; i--) {
            if(end_block > cutoffs[i]) {
                end_block = cutoffs[i]
                result = [...result, ...await fetch(start_block, end_block)]
                start_block = end_block;
            }
        }

        result = [...result, ...await fetch(start_block, block_number)]

        return result;

        async function fetch(start_block, end_block) {
            return pageResults({
                api: graphAPIEndpoints.masterchef,
                query: {
                    entity: 'users',
                    selection: {
                        orderBy: 'block',
                        orderDirection: 'asc',
                        block: {number: block_number},
                        where: {
                            block_gt: start_block ? start_block : undefined,
                            block_lte: end_block
                        }
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
                        poolId: Number(id.split("-")[0]),
                        address: String(address),
                        amount: BigInt(amount),
                        rewardDebt: BigInt(rewardDebt),
                        sushiHarvested: BigInt(Math.floor(sushiHarvested * 1e18)),
                    })),
                )
                .catch(err => console.log(err));
        }
    },
}
