const configurations = {
    port: 5000,
    graphQLHostname: "sample-api",
    graphQLPort: 5000,
    graphQLEndpoint: "graphql",
    authRequired: true,
    authUser: "mouselight",
    authPassword: "auth_secret" // always override this, but in the event env is not set, don't leave completely open
};

function loadConfiguration() {
    const config = Object.assign({}, configurations);

    config.port = process.env.SAMPLE_CLIENT_PORT || config.port;
    config.graphQLHostname = process.env.SAMPLE_API_HOST || process.env.CORE_SERVICES_HOST || config.graphQLHostname;
    config.graphQLPort = process.env.SAMPLE_API_PORT || config.graphQLPort;
    config.authRequired = process.env.SAMPLE_AUTH_REQUIRED !== "false";
    config.authUser = process.env.SAMPLE_AUTH_USER || config.authUser;
    config.authPassword = process.env.SAMPLE_AUTH_PASS || config.authPassword;

    return config;
}

export const ServiceOptions = loadConfiguration();
