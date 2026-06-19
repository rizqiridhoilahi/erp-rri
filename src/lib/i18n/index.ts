import { id } from './locales/id'
import { en } from './locales/en'

const dictionaries = { id, en } as const

export type Locale = keyof typeof dictionaries

export function getDictionary(locale: string) {
  return dictionaries[locale as Locale] ?? dictionaries.id
}

export { type Dictionary } from './locales/id'
