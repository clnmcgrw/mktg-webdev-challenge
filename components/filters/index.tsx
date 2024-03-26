import { useState } from 'react'
import style from './style.module.css'
import classNames from 'classnames'
import { getDropdownDetails } from 'components/utils'
import { useSearchContext, useKeyPress } from 'components/hooks'
import {
	DepartmentRecord,
	ButtonCaretProps,
	DropdownProps,
	ButtonFilterProps,
} from 'types'

const ButtonCaret = ({ open, ...rest }: ButtonCaretProps) => (
	<button className={style.buttonCaret} {...rest} />
)

const ButtonFilter = ({ department, ...rest }: ButtonFilterProps) => {
	const { filterByDepartment, departmentFilter } = useSearchContext()
	const active = departmentFilter.includes(department.id)
	const handleClick = () => {
		filterByDepartment(department.id, active)
	}
	const className = classNames(style.filterButton, { [style.active]: active })
	return (
		<button className={className} onClick={handleClick} {...rest}>
			{department.name}
		</button>
	)
}

// Favoring readability over dryness by not starting recursion at top-level (I think anyway)
// otherwise would need conditional filter callback + top-level caret icon
const FilterDropdowns = ({
	id = '',
	departments,
	setFocusedId,
}: DropdownProps) => {
	const {
		departmentFilter,
		allDepartments,
		openDropdownIds,
		toggleDropdownById,
	} = useSearchContext()
	return (
		<ul id={id}>
			{departments.map((item: DepartmentRecord) => {
				const { subItems, hasSubItems, isOpen, isActive, dropdownId } =
					getDropdownDetails(
						item.id,
						openDropdownIds,
						departmentFilter,
						allDepartments
					)
				return (
					<li
						key={item.id}
						className={classNames(style.listItem, {
							[style.openItem]: isOpen,
							[style.noCaret]: !hasSubItems,
						})}
					>
						{hasSubItems && (
							<ButtonCaret
								onClick={() => toggleDropdownById(item.id)}
								onFocus={() => setFocusedId(item.id)}
								open={isOpen}
								aria-expanded={isOpen}
								aria-controls={dropdownId}
							/>
						)}
						<ButtonFilter department={item} aria-pressed={isActive} />
						{hasSubItems && (
							<FilterDropdowns
								id={dropdownId}
								departments={subItems}
								setFocusedId={setFocusedId}
							/>
						)}
					</li>
				)
			})}
		</ul>
	)
}

const DepartmentFilters = () => {
	const {
		departmentFilter,
		allDepartments,
		openDropdownIds,
		toggleDropdownById,
	} = useSearchContext()
	//const [openIds, setOpenIds] = useState<string[]>([])

	const topLevelItems: DepartmentRecord[] = allDepartments.filter(
		(department: DepartmentRecord) => !department.parent
	)

	// closes any open dropdown w/ esc key when focused on dropdown button
	const [focusedId, setFocusedId] = useState<string | null>(null)
	useKeyPress('Escape', () => {
		if (openDropdownIds.includes(focusedId)) {
			toggleDropdownById(focusedId)
			//setOpenIds(openIds.filter((openId: string) => openId !== focusedId))
		}
	})

	// dropdown button click handler
	// const toggleMenu = (id: string) => {
	// 	setOpenIds(
	// 		openIds.includes(id)
	// 			? openIds.filter((openId: string) => openId !== id)
	// 			: [...openIds, id]
	// 	)
	// }

	return (
		<nav
			className={style.filterNav}
			role="navigation"
			aria-labelledby="filter-nav-title"
		>
			<h5 id="filter-nav-title">Filter By Department</h5>
			<ul className={style.filterMenu}>
				{topLevelItems.map((department: DepartmentRecord, index: number) => {
					const { subItems, hasSubItems, isOpen, isActive, dropdownId } =
						getDropdownDetails(
							department.id,
							openDropdownIds,
							departmentFilter,
							allDepartments
						)
					return (
						<li
							key={department.id}
							className={classNames(style.listItem, {
								[style.openItem]: isOpen,
							})}
						>
							{hasSubItems ? (
								<ButtonCaret
									onClick={() => toggleDropdownById(department.id)}
									onFocus={() => setFocusedId(department.id)}
									open={isOpen}
									aria-expanded={isOpen}
									aria-controls={dropdownId}
								/>
							) : (
								<span className={style.iconCaret} />
							)}
							<ButtonFilter department={department} aria-pressed={isActive} />
							{hasSubItems && (
								<FilterDropdowns
									id={dropdownId}
									departments={subItems}
									setFocusedId={setFocusedId}
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
