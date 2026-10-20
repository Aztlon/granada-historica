import registry from '../../data/place-resources.json'
import { placeResourcesRegistrySchema } from './placeResourcesSchema'

export const placeResources = placeResourcesRegistrySchema.parse(registry).places
export const placeResourcesById = new Map(placeResources.map((place) => [place.entity_id, place]))
