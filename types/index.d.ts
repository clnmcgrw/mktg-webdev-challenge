import { ComponentProps } from 'react'

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
	ComponentProps<'button'> & { open: boolean },
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
