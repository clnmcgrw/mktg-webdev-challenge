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
		aria-hidden="true"
	>
		<circle cx="11" cy="11" r="8" />
		<line x1="21" y1="21" x2="16.65" y2="16.65" />
	</svg>
)

const searchInputPlaceholder = 'Search people by name'

const SearchBar = () => {
	const { inputValue, searchCallback, avatarsFilter, checkboxHandler } =
		useSearchContext()

	const preventSubmit = (e: React.SyntheticEvent) => {
		e.preventDefault()
	}
	return (
		<div className={style.search}>
			<h1>HashiCorp Humans</h1>
			<p>Find a HashiCorp human</p>
			<search>
				<form
					className={style.searchForm}
					role="search"
					onSubmit={preventSubmit}
				>
					<fieldset className={style.searchInput}>
						<label htmlFor="search-input" className="sr-only">
							{searchInputPlaceholder}
						</label>
						<input
							type="search"
							id="search-input"
							placeholder={searchInputPlaceholder}
							value={inputValue}
							onChange={searchCallback}
							aria-controls="people-results-list" /* the ul in results/index */
						/>
						<IconSearch />
					</fieldset>
					<fieldset className={style.checkbox}>
						<input
							id="no-avatar-filter"
							type="checkbox"
							checked={avatarsFilter}
							onChange={checkboxHandler}
						/>
						<label htmlFor="no-avatar-filter">
							Hide people missing a profile image
						</label>
					</fieldset>
				</form>
			</search>
		</div>
	)
}

export default SearchBar
