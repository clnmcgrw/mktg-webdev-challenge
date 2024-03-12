import rivetQuery from '@hashicorp/platform-cms'
import { GetStaticPropsResult } from 'next'
import { PersonRecord, DepartmentRecord } from 'types'
import BaseLayout from 'layouts/base'
import Search from 'components/search'
import Filters from 'components/filters'
import Results from 'components/results'
import style from './style.module.css'
import query from './query.graphql'

interface Props {
	allPeople: PersonRecord[]
	allDepartments: DepartmentRecord[]
}

export default function PeoplePage({
	allPeople,
	allDepartments,
}: Props): React.ReactElement {
	return (
		<main className="g-grid-container" role="main">
			<section className={style.search}>
				<Search />
			</section>
			<section className={style.layout}>
				<div className={style.filters}>
					<Filters allDepartments={allDepartments} />
				</div>
				<div className={style.results}>
					<Results people={allPeople} />
				</div>
			</section>
		</main>
	)
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
	const data = await rivetQuery({ query })
	return { props: data }
}

PeoplePage.layout = BaseLayout
