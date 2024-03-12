import { useState } from 'react'
import style from './style.module.css'
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

const ButtonCaret = (props: ButtonProps) => (
	<button type="button" {...props}>
		<IconCaret />
	</button>
)

// Helper Fn to get all sub-items by parent id
const getSubMenuItems = (id: string, allDepartments: DepartmentRecord[]) =>
	allDepartments.filter(({ parent }: DepartmentRecord) => parent?.id === id)

// Favoring readability over dryness by not starting recursion at top-level (I think anyway)
// otherwise would need conditional filter callback + top-level caret icon
const FilterDropdowns = ({ deptId, allDepartments }: DropdownProps) => {
	const [openId, setOpenId] = useState<string | null>(null)
	const subMenuItems = getSubMenuItems(deptId, allDepartments)

	return subMenuItems.length ? (
		<ul>
			{subMenuItems.map((item: DepartmentRecord) => {
				const hasSubItems = getSubMenuItems(item.id, allDepartments).length
				const isOpen = openId === item.id
				return (
					<li key={item.id} className={isOpen ? 'is-open' : ''}>
						{Boolean(hasSubItems) && (
							<ButtonCaret
								onClick={() => setOpenId(isOpen ? null : item.id)}
								open={openId === item.id}
							/>
						)}
						<button>{item.name}</button>
						<FilterDropdowns deptId={item.id} allDepartments={allDepartments} />
					</li>
				)
			})}
		</ul>
	) : null
}

const DepartmentFilters = ({ allDepartments }: FilterProps) => {
	const [openId, setOpenId] = useState<string | null>(null)

	const topLevelItems: DepartmentRecord[] = allDepartments.filter(
		(department: DepartmentRecord) => !department.parent
	)

	return (
		<nav className={style.filterNav}>
			<h5 className="g-type-display-6">Filter By Department</h5>
			<ul className={style.filterMenu}>
				{topLevelItems.map((department: DepartmentRecord, index: number) => {
					const subItems = getSubMenuItems(department.id, allDepartments)
					const isOpen = openId === department.id
					const openMenu = () => {
						setOpenId(openId === department.id ? null : department.id)
					}
					return (
						<li key={department.id} className={isOpen ? 'is-open' : ''}>
							{subItems.length ? (
								<ButtonCaret onClick={openMenu} open={isOpen} />
							) : (
								<IconCaret />
							)}
							<button>{department.name}</button>
							{Boolean(subItems.length) && (
								<FilterDropdowns
									deptId={department.id}
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
