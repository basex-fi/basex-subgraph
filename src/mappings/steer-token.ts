import { Balance, SteerBalance, SteerToken } from '../types/schema'
import { ERC20, Transfer } from '../types/Factory/ERC20'
import { ZERO_BI, ONE_BI, ZERO_BD } from '../utils/constants'
import { Address, BigInt } from '@graphprotocol/graph-ts'
// import { Hypervisor } from '../types/templates/Hypervisor/Hypervisor'
import { SteerToken as SteerContract } from '../types/templates/SteerContract/SteerToken'

export function handleTransfer(event: Transfer): void {
  let steerToken = SteerToken.load(event.address.toHex())
  let contract = ERC20.bind(event.address)
  let hypervisorContract = SteerContract.bind(event.address)

  if (steerToken == null) {
    steerToken = new SteerToken(event.address.toHex())

    let tokenName = contract.name()
    let tokenSymbol = contract.symbol()
    let pool = hypervisorContract.pool()
    steerToken.pool = pool
    steerToken.name = tokenName
    steerToken.symbol = tokenSymbol
    steerToken.totalSupply = ZERO_BI
    steerToken.save()
  }

  let fromAddress = event.params.from.toHex()
  let toAddress = event.params.to.toHex()
  //   let value = event.params.value

  updateBalance(steerToken as SteerToken, fromAddress, event.address, event.block.timestamp)
  updateBalance(steerToken as SteerToken, toAddress, event.address, event.block.timestamp)

  let totalSupply = hypervisorContract.totalSupply()
  steerToken.totalSupply = totalSupply

  steerToken.save()
}

function updateBalance(steerToken: SteerToken, address: string, contractAddress: Address, timestamp: BigInt): void {
  if (address != '0x0000000000000000000000000000000000000000') {
    let steerBalance = SteerBalance.load(address + '-' + steerToken.id)
    let erc20Contract = ERC20.bind(contractAddress)
    let tmpBalance = erc20Contract.balanceOf(Address.fromString(address))

    if (steerBalance == null) {
      steerBalance = new SteerBalance(address + '-' + steerToken.id)
      steerBalance.steerToken = steerToken.id
      steerBalance.owner = Address.fromString(address)
      steerBalance.amount = tmpBalance
      steerBalance.timestamp = timestamp
    } else {
      steerBalance.amount = tmpBalance
    }

    steerBalance.save()
  }
}
