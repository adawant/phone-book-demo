/**
 * JAVASCRIPT PERSISTENCE API
 */
const sqlLite = require('sqlite3');
const dbPath="carRentDB.sqlite";
//const dbPath="server/carRentDB.sqlite";
const db = new sqlLite.Database(dbPath, err => {
    if (err) {
        console.log("Error opening the db " + err);
        throw err;
    }
});
const GET = (a, b, c) => db.get(a, b, c);
const RUN = (a, b, c) => db.run(a, b, c);
const ALL = (a, b, c) => db.all(a, b, c);

const ensureArray = require("../Utilities").ensureArray;

/**
 * Utility which insert an abstraction level on db and lets build secure queries in more readble way.
 * PARAM_OBJECTS in form of {sqlFieldName: sqlFieldValue}
 */

const extractParamNames = paramObject => Object.entries(paramObject || {}).map(entry => entry[0]);
const extractParamValues = paramObject => Object.entries(paramObject || {}).map(entry => entry[1]);
const questionMarks = paramObject => new Array(Object.entries(paramObject || {}).length).fill("?").join(",");
const buildBaseQuery = (operation, table, paramsObject) =>
    operation + " FROM " + table +
    (paramsObject && Object.entries(paramsObject).length > 0 ? " WHERE " + extractParamNames(paramsObject).map(n => n + "=?").join(" and ") : "");

exports.execute = (dbCall, queryText, params, rowsConsumer) =>
    new Promise((resolve, reject) => {
        dbCall(queryText, ensureArray(params), function (err, row) { //function so that sqlite performs the binding
            if (err)
                reject(err);
            else
                /**
                 * Pass explicitly the sql context so that rowConsumers does not have to be functions since can't perform binding on lambdas
                 */
                rowsConsumer(row, resolve, reject, this);

        })
    });

exports.get = (selectQuery, simpleParamsArray) => exports.execute(ALL, selectQuery, simpleParamsArray, (rows, resolve) => resolve(rows));

exports.find = (table, paramsObject) => {
    const query = buildBaseQuery("SELECT *", table, paramsObject);
    return exports.execute(GET, query, extractParamValues(paramsObject),
        (row, resolve) => resolve(row||{}));
}


exports.delete = (table, paramsObject) => {
    const query = buildBaseQuery("DELETE", table, paramsObject);
    return exports.execute(RUN, query, extractParamValues(paramsObject), (rows, resolve) => resolve({}));
}

exports.update = (table, toSearchObject, toSetParams) => {
    const query = "UPDATE " + table + " SET " +
        extractParamNames(toSetParams).map(param => param + "=?").join(",") +
        " WHERE " +
        extractParamNames(toSearchObject).map(param => param + "=?").join(",");
    return exports.execute(RUN, query, [...extractParamValues(toSetParams), ...extractParamValues(toSearchObject)],
        (rows, resolve, reject, sqlContext) => {
            if (sqlContext.changes < 0)
                reject("Error updating " + toSearchObject);
            else resolve({});
        });
}

exports.all = (table, paramsObject,) => {
    const query = buildBaseQuery("SELECT *", table, paramsObject);
    return exports.execute(ALL, query, extractParamValues(paramsObject),
        (rows, resolve) =>resolve(rows));
}

exports.distinct = (table, distinctEntries, paramsObject) => {
    const query = buildBaseQuery("SELECT " + (distinctEntries ? ensureArray(distinctEntries).map(entry => "DISTINCT " + entry).join(",") : "DISTINCT *"), table, paramsObject);
    return exports.execute(ALL, query, extractParamValues(extractParamValues()), (rows, resolve) => resolve(rows));
}

exports.save = async (table, toInsertParams) => {
    const paramNames = extractParamNames(toInsertParams).join(",");
    const params = extractParamValues(toInsertParams);
    const queryText = "INSERT INTO " + table + " (" + paramNames + ") VALUES (" + questionMarks(toInsertParams) + ")";
    return exports.execute(RUN, queryText, params, (rows, resolve, reject, sqlContext) => {
        if (!sqlContext.lastID)
            reject("Error saving " + params + " with query " + queryText);
        else resolve(sqlContext.lastID);
    })
}

exports.count = (table, paramsObject) => {
    const query = buildBaseQuery("SELECT COUNT(*)", table, paramsObject);
    return exports.execute(GET, query, extractParamValues(paramsObject), (rows, resolve) => resolve(rows["COUNT(*)"]));
}

exports.exists = async (table, paramsObject) => (await exports.count(table, paramsObject)) !== 0;

exports.empty = async () => ({});

