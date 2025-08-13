import { ChainId } from '@newdex/sdk-core'

import Env from './public-env.json'

export const FACTORY_ADDRESS = Env.V3_FACTORY_ADDRESS
export const FACTORY_DEPLOYER_ADDRESS = Env.V3_FACTORY_DEPLOYER_ADDRESS

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

// @deprecated please use poolInitCodeHash(chainId: ChainId)
export const POOL_INIT_CODE_HASH = '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54'

export function poolInitCodeHash(chainId?: ChainId): string {
  switch (chainId) {
    case ChainId.ZKSYNC:
      return '0x010013f177ea1fcbc4520f9a3ca7cd2d1d77959e05aa66484027cb38e712aeed'
    case ChainId.CUSTOM:
      return Env.V3_POOL_INIT_CODE_HASH
    default:
      return Env.V3_POOL_INIT_CODE_HASH
  }
}

/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export enum FeeAmount {
  LOWEST = 100,
  LOW = 250,
  MEDIUM = 500,
  HIGH = 3000,
  HIGHEST = 10000,
  SUPER_HIGH = 20000,
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
  [FeeAmount.LOWEST]: 1,
  [FeeAmount.LOW]: 5,
  [FeeAmount.MEDIUM]: 10,
  [FeeAmount.HIGH]: 50,
  [FeeAmount.HIGHEST]: 100,
  [FeeAmount.SUPER_HIGH]: 200,
}
