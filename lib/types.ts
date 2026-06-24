export interface Paper {
  id: string
  title: string
  shortTitle: string
  authors: string[]
  firstAuthor: string
  abstract: string
  session: string
  cvfUrl: string
  pdfUrl: string
  accentColor?: string
  highlighted?: boolean
}

export interface BoothData {
  company: string
  team: string
  recruiterName: string
  logo: string
  tagline: string
  description: string
  openRoles: string[]
}

export interface ConferenceData {
  posters: Paper[]
  oral: Paper
  booth: BoothData
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export type InteractionType =
  | { type: 'none' }
  | { type: 'poster'; paperId: string }
  | { type: 'oral'; paperId: string }
  | { type: 'booth' }

export interface Interactable {
  id: string
  label: string
  position: [number, number, number]
  interaction: InteractionType
}
