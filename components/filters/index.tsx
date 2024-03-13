import { useState } from 'react'
import style from './style.module.css'
import classNames from 'classnames'
import { useSearchContext } from 'components/hooks'
import {
	DepartmentRecord,
	ButtonProps,
	DropdownProps,
	FilterProps,
} from 'types'

const IconCaret = () => {
	return (
		<span>
			<svg
				width="5"
				height="8"
				viewBox="0 0 5 8"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M1 1L3.6875 3.9375L1 7" stroke="#989898" />
			</svg>
		</span>
	)
}

const ButtonCaret = ({ open, ...rest }: ButtonProps) => (
	<button type="button" {...rest}>
		<IconCaret />
	</button>
)

const ButtonFilter = ({
	department,
	subDepartments,
}: {
	department: DepartmentRecord
	subDepartments: DepartmentRecord[]
}) => {
	const { filterByDepartment, departmentFilter } = useSearchContext()
	const active = departmentFilter.includes(department.id)
	const handleClick = () => {
		filterByDepartment(department.id, active)
	}
	const className = classNames(style.filterButton, { [style.active]: active })
	return (
		<button className={className} onClick={handleClick}>
			{department.name}
		</button>
	)
}

// Helper Fn to get all sub-items by parent id
const getSubMenuItems = (id: string, allDepartments: DepartmentRecord[]) =>
	allDepartments.filter(({ parent }: DepartmentRecord) => parent?.id === id)

// Favoring readability over dryness by not starting recursion at top-level (I think anyway)
// otherwise would need conditional filter callback + top-level caret icon
const FilterDropdowns = ({
	departments,
	openIds,
	toggleMenu,
	allDepartments,
}: DropdownProps) => {
	return (
		<ul>
			{departments.map((item: DepartmentRecord) => {
				const subItems = getSubMenuItems(item.id, allDepartments)
				const hasSubItems = Boolean(subItems.length)
				const isOpen = openIds.includes(item.id)
				return (
					<li key={item.id} className={classNames({ 'is-open': isOpen })}>
						{hasSubItems && (
							<ButtonCaret onClick={() => toggleMenu(item.id)} open={isOpen} />
						)}
						<ButtonFilter department={item} subDepartments={subItems} />
						<FilterDropdowns
							departments={subItems}
							openIds={openIds}
							toggleMenu={toggleMenu}
							allDepartments={allDepartments}
						/>
					</li>
				)
			})}
		</ul>
	)
}

const DepartmentFilters = () => {
	const { allDepartments } = useSearchContext()
	const [openIds, setOpenIds] = useState<string[]>([])

	const topLevelItems: DepartmentRecord[] = allDepartments.filter(
		(department: DepartmentRecord) => !department.parent
	)

	const toggleMenu = (id: string) => {
		setOpenIds(
			openIds.includes(id)
				? openIds.filter((openId: string) => openId !== id)
				: [...openIds, id]
		)
	}

	return (
		<nav className={style.filterNav}>
			<h5 className="g-type-display-6">Filter By Department</h5>
			<ul className={style.filterMenu}>
				{topLevelItems.map((department: DepartmentRecord, index: number) => {
					const subItems = getSubMenuItems(department.id, allDepartments)
					const hasSubItems = Boolean(subItems.length)
					const isOpen = openIds.includes(department.id)
					return (
						<li
							key={department.id}
							className={classNames({ 'is-open': isOpen })}
						>
							{hasSubItems ? (
								<ButtonCaret
									onClick={() => toggleMenu(department.id)}
									open={isOpen}
								/>
							) : (
								<IconCaret />
							)}
							<ButtonFilter department={department} subDepartments={subItems} />
							{hasSubItems && (
								<FilterDropdowns
									departments={subItems}
									openIds={openIds}
									toggleMenu={toggleMenu}
									allDepartments={allDepartments}
								/>
							)}
						</li>
					)
				})}
			</ul>
		</nav>
	)
}

export default DepartmentFilters
