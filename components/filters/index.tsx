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

const IconCaret = ({ className = '' }: { className?: string }) => {
	return (
		<span className={className}>
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

const ButtonCaret = ({ open, ...rest }: ButtonCaretProps) => (
	<button type="button" className={style.buttonCaret} {...rest}>
		<IconCaret />
	</button>
)

const ButtonFilter = ({ department, ...rest }: ButtonFilterProps) => {
	const { filterByDepartment, departmentFilter } = useSearchContext()
	const active = departmentFilter.includes(department.id)
	const handleClick = () => {
		filterByDepartment(department.id, active)
	}
	const className = classNames(style.filterButton, { [style.active]: active })
	return (
		<button type="button" className={className} onClick={handleClick} {...rest}>
			{department.name}
		</button>
	)
}

// Favoring readability over dryness by not starting recursion at top-level (I think anyway)
// otherwise would need conditional filter callback + top-level caret icon
const FilterDropdowns = ({
	id = '',
	departments,
	openIds,
	toggleMenu,
	allDepartments,
	setFocusedId,
}: DropdownProps) => {
	return (
		<ul id={id}>
			{departments.map((item: DepartmentRecord) => {
				const { subItems, hasSubItems, isOpen, dropdownId } =
					getDropdownDetails(item.id, openIds, allDepartments)
				return (
					<li
						key={item.id}
						className={classNames(style.filterListitem, { 'is-open': isOpen })}
					>
						{hasSubItems && (
							<ButtonCaret
								onClick={() => toggleMenu(item.id)}
								onFocus={() => setFocusedId(item.id)}
								open={isOpen}
								aria-expanded={isOpen}
								aria-controls={dropdownId}
							/>
						)}
						<ButtonFilter department={item} />
						{hasSubItems && (
							<FilterDropdowns
								id={dropdownId}
								departments={subItems}
								openIds={openIds}
								toggleMenu={toggleMenu}
								allDepartments={allDepartments}
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
	const { allDepartments } = useSearchContext()
	const [openIds, setOpenIds] = useState<string[]>([])

	const topLevelItems: DepartmentRecord[] = allDepartments.filter(
		(department: DepartmentRecord) => !department.parent
	)

	// closes any open dropdown w/ esc key when focused on dropdown button
	const [focusedId, setFocusedId] = useState<string | null>(null)
	useKeyPress('Escape', () => {
		if (openIds.includes(focusedId)) {
			setOpenIds(openIds.filter((openId: string) => openId !== focusedId))
		}
	})

	// dropdown button click handler
	const toggleMenu = (id: string) => {
		setOpenIds(
			openIds.includes(id)
				? openIds.filter((openId: string) => openId !== id)
				: [...openIds, id]
		)
	}

	return (
		<nav className={style.filterNav} aria-label="HashiCorp Departments">
			<h5>Filter By Department</h5>
			<ul className={style.filterMenu}>
				{topLevelItems.map((department: DepartmentRecord, index: number) => {
					const { subItems, hasSubItems, isOpen, dropdownId } =
						getDropdownDetails(department.id, openIds, allDepartments)
					return (
						<li
							key={department.id}
							className={classNames(style.filterListitem, {
								'is-open': isOpen,
							})}
						>
							{hasSubItems ? (
								<ButtonCaret
									onClick={() => toggleMenu(department.id)}
									onFocus={() => setFocusedId(department.id)}
									open={isOpen}
									aria-expanded={isOpen}
									aria-controls={dropdownId}
								/>
							) : (
								<IconCaret className={style.iconCaret} />
							)}
							<ButtonFilter department={department} />
							{hasSubItems && (
								<FilterDropdowns
									id={dropdownId}
									departments={subItems}
									openIds={openIds}
									toggleMenu={toggleMenu}
									allDepartments={allDepartments}
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
