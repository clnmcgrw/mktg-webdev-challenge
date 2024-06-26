import { NextApiRequest } from 'next'

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
	name: string
	title: string
	avatar: Avatar
	department: DepartmentRecord
}

export interface PeoplePageProps {
	allPeople: PersonRecord[]
	allDepartments: DepartmentRecord[]
}

export type ButtonCaretProps = Omit<
	React.ComponentProps<'button'> & {
		open: boolean
	},
	'type' | 'className'
>

export type ButtonFilterProps = Omit<
	ButtonCaretProps & { department: DepartmentRecord },
	'open' | 'focusedId' | 'setFocusedId'
>

export type DropdownProps = {
	id: string
	departments: DepartmentRecord[]
	setFocusedId: React.Dispatch<React.SetStateAction<string>>
}

export interface SearchProviderProps extends PeoplePageProps {
	children: React.ReactElement
}

export type SearchProviderValues = {
	inputValue: string
	searchCallback: (e: React.ChangeEvent<HTMLInputElement>) => void
	departmentFilter: string[]
	filterByDepartment: (id: string, active: boolean) => void
	avatarsFilter: boolean
	checkboxHandler: (e: React.ChangeEvent<HTMLInputElement>) => void
	people: PersonRecord[]
	allDepartments: DepartmentRecord[]
	openDropdownIds: string[]
	toggleDropdownById: (id: string) => void
	error: boolean
}

export type SearchParams = {
	name: string
	department: string[]
	avatar: boolean
}

// probably should have not excluded like this, and treated department param as array
type SearchParamStrings = {
	name?: string
	department?: string
	avatar?: string
}
export type ApiRequest = Exclude<NextApiRequest, 'query'> & {
	query: SearchParamStrings
}
