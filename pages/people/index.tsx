import rivetQuery from '@hashicorp/platform-cms'
import { GetStaticPropsResult } from 'next'
import { PeoplePageProps } from 'types'
import BaseLayout from 'layouts/base'
import SearchProvider from 'components/search-provider'
import Search from 'components/search'
import Filters from 'components/filters'
import Results from 'components/results'
import style from './style.module.css'
import query from './query.graphql'

export default function PeoplePage({
	allPeople,
	allDepartments,
}: PeoplePageProps) {
	return (
		<SearchProvider allPeople={allPeople} allDepartments={allDepartments}>
			<main className="people-page g-grid-container">
				<section className={style.search} role="banner">
					<Search />
				</section>
				<section className={style.layout} role="complementary">
					<div className={style.filters}>
						<Filters />
					</div>
					<div className={style.results} role="region">
						<Results />
					</div>
				</section>
			</main>
		</SearchProvider>
	)
}

export async function getStaticProps(): Promise<
	GetStaticPropsResult<PeoplePageProps>
> {
	const data = await rivetQuery({ query })
	return { props: data }
}

PeoplePage.layout = BaseLayout
