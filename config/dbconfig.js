const sql = require('mssql');

const config = {
  user: 'SA',

  password: 'runranrun123',


  server: 'localhost', 
  database: 'SEPROJECT',
  options: {
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: true     // เพิ่มตัวเลือกนี้เพื่อข้ามการตรวจสอบใบรับรอง SSL
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => console.log('Database Connection Failed! Bad Config: ', err));

module.exports = {
  sql, poolPromise

};



