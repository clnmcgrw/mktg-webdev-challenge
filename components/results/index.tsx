import { PersonRecord, ResultsProps } from 'types'
import Image from 'next/image'
import style from './style.module.css'

const ResultsGrid = ({ people }: ResultsProps) => {
	return (
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
					<h4 className="g-type-body-strong">{person.name}</h4>
					<p className="g-type-body-small">{person.title}</p>
					<p className="g-type-body-small">{person.department.name}</p>
				</li>
			))}
		</ul>
	)
}

export default ResultsGrid
