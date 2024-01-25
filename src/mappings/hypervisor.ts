import { Bundle, Deposit, Hypervisor, Token, Withdraw } from '../types/schema'
import { Deposit as DepositEvent, Withdraw as WithdrawEvent } from '../types/templates/Hypervisor/Hypervisor'
import { Hypervisor as HypervisorContract } from '../types/templates/Hypervisor/Hypervisor'
import { convertTokenToDecimal } from '../utils'

export function handleDeposit(event: DepositEvent): void {
  let bundle = Bundle.load('1')

  let hypervisorId = event.address.toHex()

  let hypervisor = Hypervisor.load(hypervisorId) as Hypervisor
  let contract = HypervisorContract.bind(event.address)
  let token0Address = contract.token0()
  let token1Address = contract.token1()

  let token0 = Token.load(token0Address.toHexString())
  let token1 = Token.load(token1Address.toHexString())

  if (!token0 || !token1 || !bundle) return
  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals)
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals)

  let amountUSD = amount0
    .times(token0.derivedETH.times(bundle.ethPriceUSD))
    .plus(amount1.times(token1.derivedETH.times(bundle.ethPriceUSD)))

  let deposit = new Deposit(event.transaction.hash.toHexString())
  deposit.amount0 = amount0
  deposit.amount1 = amount1
  deposit.owner = event.params.sender
  deposit.hypervisor = hypervisor.id
  deposit.amountUSD = amountUSD

  deposit.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
  let bundle = Bundle.load('1')

  let hypervisorId = event.address.toHex()

  let hypervisor = Hypervisor.load(hypervisorId) as Hypervisor
  let contract = HypervisorContract.bind(event.address)
  let token0Address = contract.token0()
  let token1Address = contract.token1()

  let token0 = Token.load(token0Address.toHexString())
  let token1 = Token.load(token1Address.toHexString())

  if (!token0 || !token1 || !bundle) return
  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals)
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals)

  let amountUSD = amount0
    .times(token0.derivedETH.times(bundle.ethPriceUSD))
    .plus(amount1.times(token1.derivedETH.times(bundle.ethPriceUSD)))
    
  let withdraw = new Withdraw(event.transaction.hash.toHexString())
  withdraw.amount0 = amount0
  withdraw.amount1 = amount1
  withdraw.owner = event.params.sender
  withdraw.hypervisor = hypervisor.id
  withdraw.amountUSD = amountUSD

  withdraw.save()
}
