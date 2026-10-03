import periodsJson from '../../data/periods.json'
import areasRaw from '../../data/research/c1550/areas.geojson?raw'
import linesRaw from '../../data/research/c1550/lines.geojson?raw'
import candidateJson from '../../data/research/c1550/m10.5-candidate.json'
import researchPresentationsJson from '../../data/research/c1550/entity-presentations.json'
import titleDecisionsJson from '../../data/research/c1550/period-title-decisions.json'
import pointsRaw from '../../data/research/c1550/points.geojson?raw'
import { publicEntityPresentations } from './entityPresentation'
import type { InternalComparisonDataset } from './internalComparisonTypes'
import {
  entityPresentationRegistrySchema,
  periodTitleDecisionRegistrySchema,
} from './entityPresentation'
import {
  M10_5_FEATURE_IDS,
  c1550M10_5CandidateSchema,
  periodFeatureCollectionSchema,
  periodRegistrySchema,
} from './temporalSchema'

const collections = [pointsRaw, linesRaw, areasRaw].map((raw) =>
  periodFeatureCollectionSchema.parse(JSON.parse(raw)),
)
const candidate = c1550M10_5CandidateSchema.parse(candidateJson)
const researchPresentations = entityPresentationRegistrySchema.parse(researchPresentationsJson)
const titleDecisions = periodTitleDecisionRegistrySchema.parse(titleDecisionsJson)
const period = periodRegistrySchema.parse(periodsJson).periods.find(({ id }) => id === 'c1550')

if (!period) throw new Error('No se encuentra la definición del periodo c1550.')

const featuresById = new Map(
  collections.flatMap((collection) => collection.features).map((feature) => [feature.id, feature]),
)
const reviewItemsById = new Map(candidate.items.map((item) => [item.feature_id, item]))

export const internalComparisonDataset: InternalComparisonDataset = {
  milestone: candidate.milestone,
  period,
  reviewStatus: candidate.status,
  reviewUpdatedOn: candidate.updated_on,
  signoffs: candidate.signoffs,
  presentations: [...publicEntityPresentations, ...researchPresentations.presentations],
  titleDecisions: titleDecisions.decisions,
  records: M10_5_FEATURE_IDS.map((featureId) => {
    const feature = featuresById.get(featureId)
    const item = reviewItemsById.get(featureId)
    if (!feature || !item) {
      throw new Error(`El candidato M10.5 no puede cargar la entidad ${featureId}.`)
    }
    return { feature, review: item }
  }),
}
