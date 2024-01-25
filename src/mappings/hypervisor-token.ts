import { Balance, HypervisorToken } from '../types/schema'
import { ERC20, Transfer } from '../types/Factory/ERC20'
import { ZERO_BI, ONE_BI, ZERO_BD } from './../utils/constants'
import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Hypervisor } from '../types/templates/Hypervisor/Hypervisor'

export function handleTransfer(event: Transfer): void {
  let hypervisorToken = HypervisorToken.load(event.address.toHex())
  let contract = ERC20.bind(event.address)
  let hypervisorContract = Hypervisor.bind(event.address)

  if (hypervisorToken == null) {
    hypervisorToken = new HypervisorToken(event.address.toHex())

    let tokenName = contract.name()
    let tokenSymbol = contract.symbol()
    let pool = hypervisorContract.pool()
    hypervisorToken.pool = pool
    hypervisorToken.name = tokenName
    hypervisorToken.symbol = tokenSymbol
    hypervisorToken.totalSupply = ZERO_BI
    hypervisorToken.save()
  }

  let fromAddress = event.params.from.toHex()
  let toAddress = event.params.to.toHex()
//   let value = event.params.value

  updateBalance(hypervisorToken as HypervisorToken, fromAddress, event.address, event.block.timestamp)
  updateBalance(hypervisorToken as HypervisorToken, toAddress, event.address, event.block.timestamp)

  let totalSupply = hypervisorContract.totalSupply()
  hypervisorToken.totalSupply = totalSupply
  //   if (fromAddress == '0x0000000000000000000000000000000000000000') {
  //     hypervisorToken.totalSupply = hypervisorToken.totalSupply.plus(value)
  //   } else if (toAddress == '0x0000000000000000000000000000000000000000') {
  //     hypervisorToken.totalSupply = hypervisorToken.totalSupply.minus(value)
  //   }

  hypervisorToken.save()
}

function updateBalance(
  hypervisorToken: HypervisorToken,
  address: string,
  contractAddress: Address,
  timestamp: BigInt
): void {
  if (address != '0x0000000000000000000000000000000000000000') {
    let balance = Balance.load(address + '-' + hypervisorToken.id)
    let erc20Contract = ERC20.bind(contractAddress)
    let tmpBalance = erc20Contract.balanceOf(Address.fromString(address))

    if (balance == null) {
      balance = new Balance(address + '-' + hypervisorToken.id)
      balance.hypervisorToken = hypervisorToken.id
      balance.owner = Address.fromString(address)
      balance.amount = tmpBalance
      balance.timestamp = timestamp
    } else {
      balance.amount = tmpBalance
    }

    balance.save()
  }
}
