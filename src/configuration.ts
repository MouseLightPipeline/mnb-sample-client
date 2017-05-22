const configurations: any = {
    development: {
        host: "localhost",
        port: 9673,
        graphQLEndpoint: "/graphQL",
        graphQLHostname: "localhost",
        graphQLPort: 9671
    },
    test: {
        host: "sample-client-test",
        port: 9673,
        graphQLEndpoint: "/graphQL",
        graphQLHostname: "sample-api-test",
        graphQLPort: 9671
    },
    production: {
        host: "sample-client-test",
        port: 9673,
        graphQLEndpoint: "/graphQL",
        graphQLHostname: "sample-api-test",
        graphQLPort: 9671
    }
};

export const Configuration = LoadConfiguration();

function LoadConfiguration() {
    let env = process.env.NODE_ENV || "development";

    let config = configurations[env];

    config.port = process.env.SWC_CLIENT_PORT || config.port;
    config.graphQLHostname = process.env.SWC_API_HOST || config.graphQLHostname;
    config.graphQLPort = process.env.SWC_API_PORT || config.graphQLPort;

    return config;
}
