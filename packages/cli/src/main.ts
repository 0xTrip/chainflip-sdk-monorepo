#! /usr/bin/env pnpm tsx
import yargs from 'yargs/yargs';
import { chainflipNetwork, supportedAsset } from '@/shared/enums';
import cliExecuteSwap from './cliExecuteSwap';

const args = yargs(process.argv.slice(2))
  .scriptName('chainflip-cli')
  .usage('$0 <cmd> [args]')
  .command('swap', '', (y) => {
    y.option('src-token', {
      choices: Object.values(supportedAsset.enum),
      // demandOption: true,
      describe: 'The token to swap from',
    })
      .option('dest-token', {
        choices: Object.values(supportedAsset.enum),
        demandOption: true,
        describe: 'The token to swap to',
      })
      .option('chainflip-network', {
        choices: Object.values(chainflipNetwork.enum),
        describe: 'The Chainflip network to execute the swap on',
        default: 'sisyphos',
      })
      .option('amount', {
        type: 'string',
        demandOption: true,
        describe: 'The amount to swap',
      })
      .option('dest-address', {
        type: 'string',
        demandOption: true,
        describe: 'The address to send the swapped tokens to',
      });
  })
  .help()
  .parse();

cliExecuteSwap(args);
