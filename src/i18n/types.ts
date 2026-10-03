export const LOCALES = ['es', 'en'] as const
export type Locale = (typeof LOCALES)[number]
