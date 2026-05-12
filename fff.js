const bcrypt = require('bcryptjs');

(async () => {
    const hash = await bcrypt.hash("123456789", 10);
    console.log("HASH:", hash);
})();