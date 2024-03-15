import { useState, useRef, useEffect, createContext } from 'react'
import { useRouter, NextRouter } from 'next/router'
import { getAllChildDepartments, searchPeople } from './utils'
import {
	SearchProviderProps,
	SearchProviderValues,
	PersonRecord,
	SearchParams,
} from 'types'

export const SearchContext = createContext<SearchProviderValues | null>(null)

const SearchProvider = ({
	allPeople = [],
	allDepartments = [],
	children,
}: SearchProviderProps) => {
	const { replace }: NextRouter = useRouter()
	const [inputValue, setInputValue] = useState('')
	const [departmentFilter, setDepartmentFilter] = useState<string[]>([])
	const [avatarsFilter, setAvatarsFilter] = useState(false)
	const [people, setPeople] = useState<PersonRecord[]>(allPeople)
	const [error, setError] = useState<boolean>(false)

	const timeoutRef = useRef(null)

	// TODO - clean up so empty params aren't present in url
	const updateSearchParams = ({ name, department, avatar }: SearchParams) => {
		const query = { name, department: department.join(','), avatar }
		replace({ query }, undefined, { scroll: false })
	}

	// search input handler
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
			const searchValues = {
				name: searchTerm,
				department: departmentFilter,
				avatar: avatarsFilter,
			}
			try {
				const results = await searchPeople(searchValues)
				setPeople(results)
				updateSearchParams(searchValues)
			} catch (e: unknown) {
				setError(true)
			}
		}, 333)
	}

	// filter by dept id (allows multi-active if all in same top-level parent dept)
	const filterByDepartment = async (departmentId: string, active: boolean) => {
		const subDepts = getAllChildDepartments(departmentId, allDepartments)
		let departmentIds = [...subDepts, departmentId]
		if (active) {
			departmentIds = departmentFilter.filter(
				(id: string) => !departmentIds.includes(id)
			)
		}
		setDepartmentFilter(departmentIds)
		const searchValues = {
			name: inputValue,
			department: departmentIds,
			avatar: avatarsFilter,
		}
		try {
			const results = await searchPeople(searchValues)
			setPeople(results)
			updateSearchParams(searchValues)
		} catch (e: unknown) {
			setError(true)
		}
	}

	// avatar checkbox handler
	const checkboxHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
		setAvatarsFilter(e.target.checked)
		const searchValues = {
			name: inputValue,
			department: departmentFilter,
			avatar: e.target.checked,
		}
		try {
			const results = await searchPeople(searchValues)
			setPeople(results)
			updateSearchParams(searchValues)
		} catch (e: unknown) {
			setError(true)
		}
	}

	// maybe better to not try to use router.query here
	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const name = params.get('name') ?? ''
		const deptParam = params.get('department')
		const department = deptParam ? deptParam.split(',') : []
		const avatar = params.get('avatar') === 'true'

		if (name || department.length || avatar) {
			;(async () => {
				try {
					const results = await searchPeople({ name, department, avatar })
					setPeople(results)
					setInputValue(name)
					setDepartmentFilter(department)
					setAvatarsFilter(avatar)
				} catch (e: unknown) {
					setError(true)
				}
			})()
		}
	}, [])

	const providerValue: SearchProviderValues = {
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
