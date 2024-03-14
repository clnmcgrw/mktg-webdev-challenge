import { useState, useRef, useEffect, createContext } from 'react'
import { useRouter } from 'next/router'
import {
	SearchProviderProps,
	SearchProviderValues,
	PersonRecord,
	DepartmentRecord,
	SearchParams,
	RouterWithQueryParams,
} from 'types'

export const SearchContext = createContext<SearchProviderValues | null>(null)

export const getChildDepartments = (
	id: string,
	allDepartments: DepartmentRecord[]
) => allDepartments.filter(({ parent }: DepartmentRecord) => parent?.id === id)

const getChildDepartmentIds = (
	id: string,
	allDepartments: DepartmentRecord[]
) =>
	getChildDepartments(id, allDepartments).map(({ id }: DepartmentRecord) => id)

const getAllChildDepartments = (
	id: string,
	allDepartments: DepartmentRecord[]
) => {
	const childDepartments = []
	const getAllChildren = (deptId: string) => {
		const childIds = getChildDepartmentIds(deptId, allDepartments)
		if (!childIds.length) {
			return
		}
		childIds.forEach((childId: string) => {
			childDepartments.push(childId)
			getAllChildren(childId)
		})
	}
	getAllChildren(id)
	return childDepartments
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
		console.log('searching...', { name, department, avatar })
		const departmentValue = department.join(',')
		const response = await fetch(
			`/api/search?name=${name}&department=${departmentValue}&avatar=${avatar}`
		)
		const json = await response.json()
		console.log('search complete: ', `${json.data.length} results`)
		setPeople(json.data)
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
			try {
				await searchPeople(searchTerm, departmentFilter, avatarsFilter)
				const params: SearchParams = { ...query, name: searchTerm }
				replace({ query: params }, '', { scroll: false })
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

		const searchTerm = inputValue.trim()
		try {
			await searchPeople(searchTerm, departmentIds, avatarsFilter)
			const params: SearchParams = {
				...query,
				department: departmentIds.join(','),
			}
			replace({ query: params }, undefined, { scroll: false })
		} catch (e: unknown) {
			setError(true)
		}
	}

	// avatar checkbox handler
	const checkboxHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAvatarsFilter(e.target.checked)
		const params: SearchParams = {
			...query,
			avatar: e.target.checked ? 'true' : 'false',
		}
		replace({ query: params }, '', { scroll: false })
	}

	// maybe better to not try to use router.query here
	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		if (
			params.has('name') ||
			params.has('department') ||
			params.has('avatar')
		) {
			const name = params.get('name') ?? ''
			const department = params.get('department')?.split(',') || []
			const avatar = params.get('avatar') === 'true'
			;(async () => {
				try {
					await searchPeople(name, department, avatar)
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
