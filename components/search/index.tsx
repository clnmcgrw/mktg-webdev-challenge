import { useSearchContext } from 'components/hooks'
import style from './style.module.css'

const IconSearch = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="11" cy="11" r="8" />
		<line x1="21" y1="21" x2="16.65" y2="16.65" />
	</svg>
)

const SearchBar = () => {
	const { inputValue, searchCallback, avatarsFilter, checkboxHandler } =
		useSearchContext()
	return (
		<div className={style.search}>
			<h1 className="g-type-display-1">HashiCorp Humans</h1>
			<p className="g-type-body">Find a HashiCorp human</p>
			<form className={style.searchForm}>
				<div className={style.searchInput}>
					<label htmlFor="search-input" className="sr-only">
						Search people by name
					</label>
					<input
						type="text"
						id="search-input"
						placeholder="Search people by name"
						pattern="[a-zA-Z0-9\s]+"
						value={inputValue}
						onChange={searchCallback}
					/>
					<IconSearch />
				</div>
				<div className={style.checkbox}>
					<label htmlFor="no-avatar-filter">
						<input
							id="no-avatar-filter"
							type="checkbox"
							checked={avatarsFilter}
							onChange={checkboxHandler}
						/>
						<span className="g-type-body-small">
							Hide people missing a profile image
						</span>
					</label>
				</div>
			</form>
		</div>
	)
}

export default SearchBar
