const configurations: any = {
    port: 5000,
    graphQLEndpoint: "/graphQL",
    graphQLHostname: "sample-api",
    graphQLPort: 5000
};

export const Configuration = LoadConfiguration();

function LoadConfiguration() {
    const config = Object.assign({}, configurations);

    config.port = process.env.SAMPLE_CLIENT_PORT || config.port;
    config.graphQLHostname = process.env.SAMPLE_API_HOST || config.graphQLHostname;
    config.graphQLPort = process.env.SAMPLE_API_PORT || config.graphQLPort;

    return config;
}
