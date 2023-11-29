let fs = require('fs').promises;

(async () => {

    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'development') {
        await fs.copyFile("./webpack/dev/constants.js", "./public/js/constants.js");
        console.log("Deployed for development");
    }
    else {
        await fs.copyFile("./webpack/prod/constants.js", "./public/js/constants.js");
        console.log("Deployed for production");
    }
})();
