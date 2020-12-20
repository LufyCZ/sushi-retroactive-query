## sushi-retroactive-query

This script is to be used for the calculation of vesting rewards for all users in a specific block range.

## Usage Guide
1. `yarn` to install the required dependencies.
2. `yarn fetchData -s <start_block> -e <end_block>` To run the script with the subgraph as source.

Add `--chain` to the command if you want to use web3 as the source of the data. The API url is pulled from the environmental NODE variable. Keep in mind that this approach takes much longer (hours), compared to the subgraph (minutes).

You will find the output in the output folder, prefixed with your source with the block range at the end.