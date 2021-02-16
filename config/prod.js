const cleardb = { host : process.env.CLEARDB_HOST , user : process.env.CLEARDB_USER , password : process.env.CLEARDB_PASSWORD , schema : process.env.CLEARDB_SCHEMA }

module.exports = {cleardb}