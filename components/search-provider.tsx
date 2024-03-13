import { useState, useRef, useEffect, createContext } from 'react'
import { useRouter, NextRouter } from 'next/router'
import {
	SearchProviderProps,
	SearchProviderValues,
	PersonRecord,
	DepartmentRecord,
	SearchParams,
} from 'types'

export const SearchContext = createContext<SearchProviderValues>(null)

type RouterWithQueryParams = Exclude<NextRouter, 'query'> & {
	query: SearchParams
}
const SearchProvider = ({
	allPeople = [],
	allDepartments = [],
	children,
}: SearchProviderProps) => {
	const { query, replace }: RouterWithQueryParams = useRouter()
	const [inputValue, setInputValue] = useState('')
	const [departmentFilter, setDepartmentFilter] = useState<string[]>([])
	const [avatarsFilter, setAvatarsFilter] = useState(false)
	const [people, setPeople] = useState<PersonRecord[]>(allPeople)
	const [error, setError] = useState<boolean>(false)

	const timeoutRef = useRef(null)

	const searchPeople = async (
		name: string,
		department: string[],
		avatar: boolean
	) => {
		console.log('searching...')
		const departmentValue = department.join(',')
		const response = await fetch(
			`/api/search?name=${name}&department=${departmentValue}&avatar=${avatar}`
		)
		const json = await response.json()
		console.log('search complete: ', `${json.data.length} results`)
		setPeople(json.data)
	}

	const searchCallback = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value)
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}
		const searchTerm = e.target.value.trim()
		// return early if it's just new spaces
		if (searchTerm === inputValue.trim()) {
			return
		}
		// debounce, maybe an AbortController would be better than setting timeout
		timeoutRef.current = setTimeout(async () => {
			try {
				await searchPeople(searchTerm, departmentFilter, avatarsFilter)
				const params: SearchParams = { ...query, name: searchTerm }
				replace({ query: params }, '', { scroll: false })
			} catch (e: unknown) {
				setError(true)
			}
		}, 333)
	}

	const filterByDepartment = async (departmentId: string, active: boolean) => {
		// must fix - deep nested child depts not active
		const getSubDepartments = (id: string) => {
			const directChildren = allDepartments
				.filter(({ parent }: DepartmentRecord) => parent?.id === id)
				.map((child: DepartmentRecord) => child.id)
			// if (directChildren.length) {
			//   return getSubDepartments()
			// }
			return directChildren
		}
		const subDepartments = getSubDepartments(departmentId)
		console.log('sub depts: ', subDepartments)

		// TODO - fix this (rn clicking a child while parent is active clears everything)
		const departmentIds: string[] = active
			? []
			: [...departmentFilter, ...subDepartments, departmentId]
		setDepartmentFilter(departmentIds)

		const searchTerm = inputValue.trim()
		try {
			await searchPeople(searchTerm, departmentIds, avatarsFilter)
			const params: SearchParams = {
				...query,
				department: departmentIds.join(','),
			}
			replace({ query: params }, '', { scroll: false })
		} catch (e: unknown) {
			setError(true)
		}
	}

	const checkboxHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAvatarsFilter(e.target.checked)
		const params: SearchParams = {
			...query,
			avatar: e.target.checked ? 'true' : 'false',
		}
		replace({ query: params }, '', { scroll: false })
	}

	useEffect(() => {
		if (query.name || query.department || query.avatar) {
			const name = query.name ?? ''
			const department = query?.department?.split(',') || []
			const avatar = query.avatar === 'true'
			setInputValue(name)
			setDepartmentFilter(department)
			setAvatarsFilter(avatar)
			;(async () => {
				try {
					await searchPeople(name, department, avatar)
				} catch (e: unknown) {
					setError(true)
				}
			})()
		}
	}, [query])

	const providerValue = {
		inputValue,
		searchCallback,
		departmentFilter,
		filterByDepartment,
		avatarsFilter,
		checkboxHandler,
		people,
		allDepartments,
		error,
	}

	return (
		<SearchContext.Provider value={providerValue}>
			{children}
		</SearchContext.Provider>
	)
}

export default SearchProvider
