import type { NextApiRequest, NextApiResponse } from 'next'
import { PersonRecord } from 'types'
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
	all: `SELECT id, name, title, avatar, department FROM people`,
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ApiResponseData>
) {
	// relative to nextjs build folder (there's prob a better way)
	const dbPath = path.resolve(__dirname, '../../../../db/people.db')

	const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY)

	// todo: update sql query to search by name / department
	// const { name, department } = req.query
	const queryRows = () => {
		let data: PersonRecord[] = []
		return new Promise(
			(
				resolve: (data: PersonRecord[]) => void,
				reject: (err: Error) => void
			) => {
				db.all(sql.all, (err: Error, rows: SqlRow[]) => {
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
				})
			}
		)
	}

	// // const { name, department } = req.query
	// console.log('getting rows...');

	const data = await queryRows()
	res.status(200).json({ data })
}
