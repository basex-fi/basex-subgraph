import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Hypervisor as HypervisorContract } from '../types/templates/Hypervisor/Hypervisor'
import { Hypervisor } from '../types/schema'
import { Pool as PoolTemplate } from '../types/templates'
import { ZERO_BI, ONE_BI, ZERO_BD } from './../utils/constants'

export function getOrCreateHypervisor(
  hypervisorAddress: Address,
  timestamp: BigInt = ZERO_BI,
  blockNumber: BigInt = ZERO_BI
): Hypervisor {
  let hypervisorId = hypervisorAddress.toHex()
  let hypervisor = Hypervisor.load(hypervisorId)

  if (hypervisor == null) {
    let hypervisorContract = HypervisorContract.bind(hypervisorAddress)

    // Creating pool also creates tokens
    let poolAddress = hypervisorContract.pool()

    hypervisor = new Hypervisor(hypervisorId)
    // let token0 = Token.load(hypervisorContract.token0().toI32())
    // let token1 = Token.load(hypervisorContract.token1().toI32())
    // let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals)
    // let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals)

    // let amountUSD = amount0
    //   .times(token0.derivedETH.times(bundle.ethPriceUSD))
    //   .plus(amount1.times(token1.derivedETH.times(bundle.ethPriceUSD)))
    hypervisor.symbol = hypervisorContract.symbol()
    hypervisor.created = timestamp.toI32()
    hypervisor.timestamp = timestamp
    hypervisor.save()

    PoolTemplate.create(poolAddress)
  }

  return hypervisor as Hypervisor
}
