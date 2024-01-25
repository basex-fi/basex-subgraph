/* eslint-disable prefer-const */
import { Address } from '@graphprotocol/graph-ts'
import { HypeAdded } from '../types/HypeRegistry/HypeRegistry'
import { Hypervisor as HypervisorTemplate } from '../types/templates'
import { getOrCreateHypervisor } from '../utils/hypervisor'

//Hypervisors that were created with invalid parameters and should not be indexed
let INVALID_HYPERVISORS: Array<Address> = [
  Address.fromString('0xce721b5dc9624548188b5451bb95989a7927080a'), // CRV
  Address.fromString('0x0e9e16f6291ba2aaaf41ccffdf19d32ab3691d15'), // MATIC
  Address.fromString('0x95b801f9bf7c49b383e36924c2ce176be3027d66'), // Incorrect TCR
  Address.fromString('0x8172b894639f51e58f76baee0c24eac574e52528') // Another TCR one
]

export function handleHypeAdded(event: HypeAdded): void {
  if (INVALID_HYPERVISORS.includes(event.params.hype)) return

  let hypervisor = getOrCreateHypervisor(event.params.hype, event.block.timestamp)
  hypervisor.save()

  HypervisorTemplate.create(event.params.hype)
}
