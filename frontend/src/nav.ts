export type ScreenId =
  | 'home' | 'expense' | 'bus' | 'myInput' | 'myResult'
  | 'benefits' | 'benefitDetail' | 'places' | 'placeDetail'
  | 'expenseAll' | 'expenseCapture' | 'expenseSettle'

export type Go = (s: ScreenId | 'back') => void
export type ScreenProps = { go: Go }
