import type {
  IncrementsRepository,
  CLIENT_INCREMENT,
  SERVER_INCREMENT,
} from "../sync/protocol";

// CFDO: add senderId, possibly roomId as well
export class DurableIncrementsRepository implements IncrementsRepository {
  constructor(private storage: DurableObjectStorage) {
    // #region DEV ONLY
    // this.storage.sql.exec(`DROP TABLE IF EXISTS increments;`);
    // #endregion

    this.storage.sql.exec(`CREATE TABLE IF NOT EXISTS increments(
			id			TEXT PRIMARY KEY,
			payload		TEXT NOT NULL,
			version		INTEGER NOT NULL DEFAULT 1,
			createdAt	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		);`);
  }

  public saveAll = (increments: Array<CLIENT_INCREMENT>) => {
    return this.storage.transactionSync(() => {
      const prevVersion = this.getLastVersion();
      const nextVersion = prevVersion + increments.length;

      // CFDO: in theory payload could contain array of increments, if we would need to optimize writes
      for (const [index, increment] of increments.entries()) {
        const version = prevVersion + index + 1;
        // unique id ensures that we don't acknowledge the same increment twice
        this.storage.sql.exec(
          `INSERT INTO increments (id, payload, version) VALUES (?, ?, ?);`,
          increment.id,
          JSON.stringify(increment),
          version,
        );
      }

      // sanity check
      if (nextVersion !== this.getLastVersion()) {
        throw new Error(
          `Expected last acknowledged version to be "${nextVersion}", but it is "${this.getLastVersion()}!"`,
        );
      }

      return this.getSinceVersion(prevVersion);
    });
  };

  public getSinceVersion = (version: number): Array<SERVER_INCREMENT> => {
    return this.storage.sql
      .exec<SERVER_INCREMENT>(
        `SELECT id, payload, version FROM increments WHERE version > (?) ORDER BY version ASC;`,
        version,
      )
      .toArray();
  };

  public getLastVersion = (): number => {
    const result = this.storage.sql
      .exec(`SELECT MAX(version) FROM increments;`)
      .one();

    return result ? Number(result["MAX(version)"]) : 0;
  };
}
