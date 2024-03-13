export interface DepartmentRecord {
	id: string
	name?: string
	children?: DepartmentRecord[]
	parent?: DepartmentRecord
}

type Avatar = {
	url: string
	alt: string
	width: number
	height: number
} | null

export interface PersonRecord {
	id: string
	name?: string
	title?: string
	avatar?: Avatar
	department?: DepartmentRecord
}

export interface PeoplePageProps {
	allPeople: PersonRecord[]
	allDepartments: DepartmentRecord[]
}

export type ButtonProps = Omit<
	React.ComponentProps<'button'> & { open: boolean },
	'type'
>

export type FilterProps = {
	allDepartments: DepartmentRecord[]
}

export type DropdownProps = {
	departments: DepartmentRecord[]
	openIds: string[]
	toggleMenu: (id: string) => void
	allDepartments: DepartmentRecord[]
}

export type ResultsProps = {
	people: PersonRecord[]
}

export interface SearchProviderProps extends PeoplePageProps {
	children: React.ReactElement
}

export type SearchProviderValues = {
	inputValue: string
	searchCallback: () => void
	departmentFilter: string | null
	filterByDepartment: (id: string, active: boolean) => void
	avatarsFilter: boolean
	checkboxHandler: (e: React.ChangeEvent<HTMLInputElement>) => void
	people: PersonRecord[]
	allDepartments: DepartmentRecord[]
	error: boolean
}

export type SearchParams = {
	name?: string
	department?: string
	avatar?: string
}

// there's something better, union type for query params exists for a reason!
type ApiRequest = Exclude<NextApiRequest, 'query'> & { query: SearchParams }
