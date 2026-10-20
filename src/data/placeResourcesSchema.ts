import { z } from 'zod'
import { featureIdSchema } from './schema'

const text = z.object({ es: z.string().trim().min(1), en: z.string().trim().min(1) })
const httpsUrl = z.url().refine((value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}, 'Use an HTTPS URL without credentials.')
const review = z.object({
  status: z.enum(['pending', 'reviewed']),
  reviewer: z.string().trim().min(1).nullable(),
  note: text,
}).superRefine((value, ctx) => {
  if (value.status === 'reviewed' && !value.reviewer) {
    ctx.addIssue({ code: 'custom', message: 'A reviewed asset needs an accountable reviewer.' })
  }
})

export const placeImageSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  kind: z.enum(['historical_depiction', 'present_day_photograph', 'interpretive_reconstruction']),
  // Only small, self-hosted raster images; never remote URLs or active SVG content.
  path: z.string().regex(/^media\/[a-z0-9-]+\/[a-z0-9-]+\.(?:jpg|jpeg|png|webp)$/),
  width: z.number().int().positive().max(1600),
  height: z.number().int().positive().max(1600),
  bytes: z.number().int().positive().max(200_000),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  title: text,
  author: z.string().trim().min(1),
  represented_date: text,
  source_url: httpsUrl,
  rights: z.object({
    status: z.literal('verified'),
    label: z.string().trim().min(1),
    url: httpsUrl,
    evidence_url: httpsUrl,
    attribution: z.string().trim().min(1),
    changes: text,
  }),
  caption: text,
  alt: text,
  location_note: text,
  uncertainty: text,
  review,
  components: z.array(z.object({
    label: text,
    confidence: z.enum(['secure', 'probable', 'approximate', 'artistic_inference']),
    explanation: text,
    source_refs: z.array(z.string().min(1)).min(1),
  })),
}).superRefine((asset, ctx) => {
  if (asset.kind === 'interpretive_reconstruction'
    && (asset.review.status !== 'reviewed' || asset.components.length === 0)) {
    ctx.addIssue({ code: 'custom', message: 'Reconstructions require review and component-level evidence.' })
  }
})

const reading = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  kind: z.enum(['institutional', 'wikipedia', 'other']),
  links: z.object({
    es: z.object({ title: z.string().trim().min(1), url: httpsUrl }).optional(),
    en: z.object({ title: z.string().trim().min(1), url: httpsUrl }).optional(),
  }).refine((links) => links.es || links.en, 'At least one verified locale link is required.'),
})

export const placeResourcesSchema = z.object({
  entity_id: featureIdSchema,
  context: z.object({ note: text, source_refs: z.array(z.string().min(1)).min(1) }).optional(),
  images: z.array(placeImageSchema).max(2),
  further_reading: z.array(reading).max(5),
}).superRefine((value, ctx) => {
  if (value.images.reduce((sum, image) => sum + image.bytes, 0) > 300_000) {
    ctx.addIssue({ code: 'custom', message: 'Keep the total place image budget within 300 kB.' })
  }
  for (const items of [value.images, value.further_reading]) {
    if (new Set(items.map(({ id }) => id)).size !== items.length) {
      ctx.addIssue({ code: 'custom', message: 'Resource IDs must be unique within a place.' })
    }
  }
})

export const placeResourcesRegistrySchema = z.object({
  schema_version: z.literal(1),
  places: z.array(placeResourcesSchema),
}).superRefine((registry, ctx) => {
  if (new Set(registry.places.map(({ entity_id }) => entity_id)).size !== registry.places.length) {
    ctx.addIssue({ code: 'custom', message: 'Duplicate place resources.' })
  }
})

export type PlaceResources = z.infer<typeof placeResourcesSchema>
export type PlaceImage = z.infer<typeof placeImageSchema>
