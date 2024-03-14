import type { NextApiResponse } from 'next'
import { PersonRecord, ApiRequest } from 'types'
import * as path from 'path'
import * as sqlite3 from 'sqlite3'

type ApiResponseData = {
	data: PersonRecord[]
}

type SqlRow = {
	id: string
	name: string
	title: string
	avatar: string
	department: string
}

const sql = {
	all: `SELECT * FROM people`,
	// yikes, this could be more readable eh
	search: (name: string, departments: string[], avatar: string) => {
		let stmt = `SELECT * FROM people WHERE name LIKE '%${name}%'`
		if (avatar === 'true') {
			stmt += ` AND avatar != 'null'`
		}
		if (departments.length) {
			stmt += ` AND`
			departments.forEach((department: string, index: number) => {
				if (index === 0) {
					stmt += ` (`
				}
				stmt += ` department LIKE '%"id":"${department}"%'`
				if (index < departments.length - 1) {
					stmt += ` OR`
				}
				if (index + 1 === departments.length) {
					stmt += ` )`
				}
			})
		}
		return stmt
	},
}

export default async function handler(
	req: ApiRequest,
	res: NextApiResponse<ApiResponseData>
) {
	// relative to nextjs build folder (there's prob a better way)
	const dbPath = path.resolve(__dirname, '../../../../db/people.db')

	const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY)

	const { name, department, avatar } = req.query

	const departments = department
		.split(',')
		.filter((dept: string) => dept.length)

	const queryRows = () => {
		let data: PersonRecord[] = []
		return new Promise(
			(
				resolve: (data: PersonRecord[]) => void,
				reject: (err: Error) => void
			) => {
				db.all(
					sql.search(name, departments, avatar),
					(err: Error, rows: SqlRow[]) => {
						if (err) {
							reject(err)
							return
						}
						data = rows.map((row: SqlRow) => ({
							...row,
							avatar: JSON.parse(row.avatar),
							department: JSON.parse(row.department),
						}))
						resolve(data)
					}
				)
			}
		)
	}

	const data = await queryRows()
	res.status(200).json({ data })
}
