import { useContext } from 'react'
import { SearchContext } from './search-provider'

export const useSearchContext = () => useContext(SearchContext)
