import { useState, useRef, useEffect, createContext } from 'react'
import { useRouter, NextRouter } from 'next/router'
import {
	searchPeople,
	getAllChildDepartments,
	getActiveDepartmentParents,
} from './utils'
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
	const [openDropdownIds, setOpenDropdownIds] = useState([])
	const [error, setError] = useState<boolean>(false)

	const timeoutRef = useRef(null)

	// updates search params in a way that will not include falsy values
	const updateSearchParams = (searchParams: SearchParams) => {
		const query = Object.keys(searchParams).reduce(
			(result: object, key: string) => {
				const paramValue = searchParams[key]
				if (paramValue) {
					result[key] =
						Array.isArray(paramValue) && paramValue.length
							? paramValue.join(',')
							: paramValue
				}
				return result
			},
			{}
		)
		// forgot shallow in earlier commits, so this was suuuper slow + caused input lag
		replace({ query }, undefined, { scroll: false, shallow: true })
	}

	// dropdown button click handler
	const toggleDropdownById = (id: string) => {
		setOpenDropdownIds((dropdownIds: string[]) =>
			dropdownIds.includes(id)
				? dropdownIds.filter((openId: string) => openId !== id)
				: [...dropdownIds, id]
		)
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

	// this allows deep-linking to search results, gets all necessary url params on page load and performs a search
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

					// opens any active department dropdown
					if (department.length) {
						const dropdownParentIds = getActiveDepartmentParents(
							department,
							allDepartments
						)
						setOpenDropdownIds(dropdownParentIds)
					}
				} catch (e: unknown) {
					setError(true)
				}
			})()
		}
		// this value won't change, even if it did we wouldn't want to re-execute
		// maybe better to ignore exhaustive deps rule?
	}, [allDepartments])

	const providerValue: SearchProviderValues = {
		inputValue,
		searchCallback,
		departmentFilter,
		filterByDepartment,
		avatarsFilter,
		checkboxHandler,
		people,
		allDepartments,
		openDropdownIds,
		toggleDropdownById,
		error,
	}

	return (
		<SearchContext.Provider value={providerValue}>
			{children}
		</SearchContext.Provider>
	)
}

export default SearchProvider
