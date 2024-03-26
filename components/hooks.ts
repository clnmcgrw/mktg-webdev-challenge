import { useEffect, useContext } from 'react'
import { SearchContext } from './search-provider'
import { SearchProviderValues } from 'types'

// use SearchProviderValues in a component
export const useSearchContext = (): SearchProviderValues =>
	useContext(SearchContext)

// bind to keypress, pass the event.key value you want to check against
export const useKeyPress = (
	key: string,
	handler: (e: globalThis.KeyboardEvent) => void
) => {
	useEffect(() => {
		const onKeyPress = (e: globalThis.KeyboardEvent) => {
			if (e.key === key) {
				handler(e)
			}
		}
		document.addEventListener('keydown', onKeyPress)
		return () => {
			document.removeEventListener('keydown', onKeyPress)
		}
	}, [handler, key])
}
