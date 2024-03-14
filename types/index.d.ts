import { NextApiRequest } from 'next'
import { NextRouter } from 'next/router'

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
	openIds: string[]
	toggleMenu: (id: string) => void
	allDepartments: DepartmentRecord[]
	setFocusedId: Dispatch<SetStateAction<string>>
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
	error: boolean
}

export type SearchParams = {
	name?: string
	department?: string
	avatar?: string
}

// there's something better, union type for Next query params exists for a reason!
export type RouterWithQueryParams = Exclude<NextRouter, 'query'> & {
	query: SearchParams
}
export type ApiRequest = Exclude<NextApiRequest, 'query'> & {
	query: SearchParams
}
