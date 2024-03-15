import { DepartmentRecord, SearchParams } from 'types'

// get all child department objects
const getChildDepartments = (id: string, allDepartments: DepartmentRecord[]) =>
	allDepartments.filter(({ parent }: DepartmentRecord) => parent?.id === id)

const getChildDepartmentIds = (
	id: string,
	allDepartments: DepartmentRecord[]
) =>
	getChildDepartments(id, allDepartments).map(({ id }: DepartmentRecord) => id)

// get all child departments recursively
export const getAllChildDepartments = (
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

export const searchPeople = async ({
	name,
	department,
	avatar,
}: SearchParams) => {
	const departmentValue = department.join(',')
	const response = await fetch(
		`/api/search?name=${name.trim()}&department=${departmentValue}&avatar=${avatar}`
	)
	const json = await response.json()
	return json.data
}

// Helper Fn to get info needed for dropdown by dept id
export const getDropdownDetails = (
	id: string,
	openIds: string[],
	allDepartments: DepartmentRecord[]
) => {
	const subItems = getChildDepartments(id, allDepartments)
	const hasSubItems = Boolean(subItems.length)
	const isOpen = openIds.includes(id)
	const dropdownId = `dropdown-${id}`
	return { subItems, hasSubItems, isOpen, dropdownId }
}
