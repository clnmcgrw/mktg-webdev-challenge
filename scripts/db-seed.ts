import * as path from 'path'
import { PersonRecord } from '../types'
import * as sqlite3 from 'sqlite3'
import fetch from 'node-fetch'
import config from '../next.config'

const db = new sqlite3.Database(
	path.resolve(__dirname, '../db/people.db'),
	sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
	(error: Error) => {
		if (error) {
			console.error(error)
			return
		}
		console.log(`Connected to the people DB...`)
	}
)

const query = `
  query {
    allPeople(first: 100, orderBy: name_ASC) {
      id
      name
      title
      avatar {
        url
        alt
        width
        height
      }
      department {
        id
        name
      }
    }
  }`

const fetchPeople = () =>
	fetch('https://graphql.datocms.com/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${config.env.HASHI_DATO_TOKEN}`,
		},
		body: JSON.stringify({ query }),
	}).then((response: fetch.Response) => response.json())

const sql = {
	drop: `DROP TABLE IF EXISTS people`,
	create: `CREATE TABLE people(id TEXT PRIMARY KEY, name TEXT, title TEXT, avatar TEXT, department TEXT)`,
	insert: `INSERT INTO people(id, name, title, avatar, department) VALUES(?, ?, ?, ?, ?)`,
}

// todo - better types
type DatoData = {
	allPeople: PersonRecord[]
	type?: string
}
type DatoResponse = {
	data: DatoData
}

fetchPeople().then(({ data }: DatoResponse) => {
	if (data.type === 'api_error') {
		throw new Error('Problem fetching data')
	}

	db.serialize(() => {
		db.run(sql.drop)
		db.run(sql.create)

		//db methods need to run in top-level scope of serialize callback
		for (let i = 0; i < data.allPeople.length; i++) {
			const person = data.allPeople[i]
			const values = [
				person.id,
				person.name,
				person.title,
				JSON.stringify(person.avatar),
				JSON.stringify(person.department),
			]
			db.run(sql.insert, values, function (err: Error) {
				console.log(`Row ${this.lastID} inserted`)
			})
		}

		db.close(() => {
			console.log('All done!')
		})
	})
})
