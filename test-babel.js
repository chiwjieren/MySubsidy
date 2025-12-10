try {
    const configFn = require('./babel.config.js');
    const api = { cache: () => true };
    const config = configFn(api);
    console.log("Babel config Loaded Successfully");
    console.log(JSON.stringify(config, null, 2));
} catch (e) {
    console.error("Error loading babel config:", e);
}
