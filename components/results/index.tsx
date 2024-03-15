import { PersonRecord } from 'types'
import Image from 'next/image'
import { useSearchContext } from 'components/hooks'
import style from './style.module.css'

const EmptyResults = ({ message }: { message: string }) => (
	<div className={style.noResults}>
		<p>{message}</p>
	</div>
)

const ResultsGrid = () => {
	const { people } = useSearchContext()

	return (
		<div>
			{people.length ? (
				<ul className={style.grid}>
					{people.map((person: PersonRecord, index: number) => (
						<li key={person.id} className={style.gridItem}>
							<figure className={style.avatar}>
								{!person.avatar ? (
									<Image
										src="/avatar-fallback.png"
										alt=""
										width={213}
										height={220}
										priority={index <= 6}
									/>
								) : (
									<Image
										src={person.avatar.url}
										alt={person.avatar.alt || `Picture of ${person.name}`}
										width={person.avatar.width}
										height={person.avatar.height}
										priority={index <= 6} // prioritize 'above-the-fold' images
									/>
								)}
							</figure>
							<h4>{person.name}</h4>
							<p>{person.title}</p>
							<p>{person.department.name}</p>
						</li>
					))}
				</ul>
			) : (
				<EmptyResults message="No Results Found" />
			)}
		</div>
	)
}

export default ResultsGrid
