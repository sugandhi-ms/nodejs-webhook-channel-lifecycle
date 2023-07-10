// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Relative path to the subscription database
const dbFile = './helpers/subscriptions.sqlite3';

module.exports = {
  /**
   * Creates and initializes the subscription database if it does not
   * already exist
   */
  ensureDatabase: () => {
    const dbExists = fs.existsSync(dbFile);
    const db = new sqlite3.Database(dbFile);
    const createSubscriptionStatement =
      'CREATE TABLE Subscription (' +
      'SubscriptionId TEXT NOT NULL, ' +
      'UserAccountId TEXT NOT NULL' +
      ')';

    db.serialize(() => {
      if (!dbExists) {
        db.run(createSubscriptionStatement, (error) => {
          if (error) throw error;
        });
      }
    });

    db.close();
  },
  /**
   * Gets a single subscription by ID
   * @param  {string} subscriptionId - The ID of the subscription to get
   * @returns {object} The subscription
   */
  getSubscription: async (subscriptionId) => {
    const db = new sqlite3.Database(dbFile);
    const selectStatement =
      'SELECT ' +
      'SubscriptionId as subscriptionId, ' +
      'UserAccountId as userAccountId ' +
      'FROM Subscription ' +
      'WHERE SubscriptionId = $subscriptionId';

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(
          selectStatement,
          {
            $subscriptionId: subscriptionId,
          },
          (err, row) => {
            if (err) {
              reject(`Database error: ${err.message}`);
            } else {
              resolve(row);
            }
          },
        );
      });
    });
  },
  /**
   * Gets all subscriptions for a user account
   * @param  {string} userAccountId - The user account ID
   * @returns {Array} An array of subscriptions for the user
   */
  getSubscriptionsByUserAccountId: async (userAccountId) => {
    const db = new sqlite3.Database(dbFile);
    const selectStatement =
      'SELECT ' +
      'SubscriptionId as subscriptionId, ' +
      'UserAccountId as userAccountId ' +
      'FROM Subscription ' +
      'WHERE UserAccountId = $userAccountId';

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(
          selectStatement,
          {
            $userAccountId: userAccountId,
          },
          (err, rows) => {
            if (err) {
              reject(`Database error: ${err.message}`);
            } else {
              resolve(rows);
            }
          },
        );
      });
    });
  },
  /**
   * Adds a subscription to the database
   * @param  {string} subscriptionId - The subscription ID
   * @param  {string} userAccountId - The user account ID (use 'APP-ONLY' for subscriptions owned by the app)
   */
  addSubscription: async (subscriptionId, userAccountId) => {
    const db = new sqlite3.Database(dbFile);
    const insertStatement =
      'INSERT INTO Subscription ' +
      '(SubscriptionId, UserAccountId) ' +
      'VALUES ($subscriptionId, $userAccountId)';

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(
          insertStatement,
          {
            $subscriptionId: subscriptionId,
            $userAccountId: userAccountId,
          },
          (err) => {
            if (err) {
              reject(`Database error: ${err.message}`);
            } else {
              resolve(true);
            }
          },
        );
      });
    });
  },
  /**
   * Deletes a subscription from the database
   * @param  {string} subscriptionId - The ID of the subscription to delete
   */
  deleteSubscription: async (subscriptionId) => {
    const db = new sqlite3.Database(dbFile);
    const deleteStatement =
      'DELETE FROM Subscription WHERE ' + 'SubscriptionId = $subscriptionId';

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(
          deleteStatement,
          {
            $subscriptionId: subscriptionId,
          },
          (err) => {
            if (err) {
              reject(`Database error: ${err.message}`);
            } else {
              resolve(true);
            }
          },
        );
      });
    });
  },
};
