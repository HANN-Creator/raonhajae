export type ScreenId =
  | 'home' | 'expense' | 'bus' | 'myInput' | 'myResult'
  | 'benefits' | 'benefitDetail' | 'places' | 'placeDetail'
  | 'expenseAll' | 'expenseCapture' | 'expenseEdit' | 'expenseSettle' | 'map' | 'login' | 'signup' | 'walk' | 'courseStory' | 'townView'

/** `id` is only used by screens that need one (expenseEdit). */
export type Go = (s: ScreenId | 'back', id?: string) => void
export type ScreenProps = { go: Go }
export type Entry = { screen: ScreenId; id?: string }

// Hash paths from the frontend spec (§3).
export const PATHS: Record<ScreenId, string> = {
  home: 'home', myInput: 'course', myResult: 'course-result', bus: 'bus',
  expense: 'expenses', expenseAll: 'expenses-all', expenseCapture: 'expense-new', expenseEdit: 'expense-edit',
  expenseSettle: 'settlement', benefits: 'benefits', benefitDetail: 'benefit-detail',
  places: 'places', placeDetail: 'place-detail', map: 'map', login: 'login', signup: 'signup',
  walk: 'walk', courseStory: 'course-story', townView: 'town-view',
}
// Where "back" goes when the page was opened directly (no history in the app).
export const PARENT: Partial<Record<ScreenId, ScreenId>> = {
  myResult: 'myInput', bus: 'myResult', expenseAll: 'expense', expenseCapture: 'expenseAll',
  expenseEdit: 'expenseAll', expenseSettle: 'expense', benefitDetail: 'benefits', placeDetail: 'places', map: 'places',
}

export const toHash = ({ screen, id }: Entry) => `#/${PATHS[screen]}${id ? `/${encodeURIComponent(id)}` : ''}`

export function parseHash(hash: string): Entry {
  const [path, id] = hash.replace(/^#\/?/, '').split('/')
  const screen = (Object.keys(PATHS) as ScreenId[]).find(s => PATHS[s] === path)
    // old hashes (#expense, #myInput …) still open the same screen
    ?? (Object.hasOwn(PATHS, path) ? path as ScreenId : 'home')
  if (screen === 'expenseEdit' && !id) return { screen: 'expenseAll' }
  return id ? { screen, id: decodeURIComponent(id) } : { screen }
}
