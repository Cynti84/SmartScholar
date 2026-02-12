const bcrypt = require("bcrypt");
bcrypt.hash("AdminStrongPassword123", 12).then(console.log);
