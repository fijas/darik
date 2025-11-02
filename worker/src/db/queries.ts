// SQL query helpers for D1 database

export class DBQueries {
  constructor(private db: D1Database) {}

  // Example query helper
  async getUser(userId: string) {
    return await this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(userId)
      .first();
  }

  // Add more query helpers as needed
}
