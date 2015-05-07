const fs = require('fs');
fs.writeFile('target.txt', 'and now for something completely different...', function(err) {
    if (err) {
        throw err;
    }
    console.log("File saved!");
});

//will write to target.txt or create it if it doesn't exist.
