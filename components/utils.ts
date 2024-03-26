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
	departmentFilters: string[],
	allDepartments: DepartmentRecord[]
) => {
	const subItems = getChildDepartments(id, allDepartments)
	const hasSubItems = Boolean(subItems.length)
	const isOpen = openIds.includes(id)
	const dropdownId = `dropdown-${id}`
	const isActive = departmentFilters.includes(id)
	return { subItems, hasSubItems, isOpen, dropdownId, isActive }
}

const getAllParentDepartmentIds = (
	id: string,
	allDepartments: DepartmentRecord[]
): string[] => {
	const parentDepartments = []
	const getAllParents = (deptId: string) => {
		const match = allDepartments.find(
			(dept: DepartmentRecord) => dept.id === deptId
		)
		if (match && match.parent) {
			parentDepartments.push(match.parent.id)
			getAllParents(match.parent.id)
		}
	}
	getAllParents(id)
	return parentDepartments
}

// get all parent ids for a group of active department ids
export const getActiveDepartmentParents = (
	departmentIds: string[],
	allDepartments: DepartmentRecord[]
) => {
	const result = departmentIds.map((id: string) =>
		getAllParentDepartmentIds(id, allDepartments)
	)
	const flattenedAndDeduped = new Set(result.flat())
	return Array.from(flattenedAndDeduped)
}
