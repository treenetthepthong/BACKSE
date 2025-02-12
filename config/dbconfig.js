const sql = require('mssql');

const config = {
  user: 'SA',
<<<<<<< HEAD
  password: 'runranrun123',
=======
  password: '1234',
>>>>>>> 3a77cec5cc387a8f6fc543fa41f6e139bc86b7c4
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
<<<<<<< HEAD
};
=======
};
>>>>>>> 3a77cec5cc387a8f6fc543fa41f6e139bc86b7c4
