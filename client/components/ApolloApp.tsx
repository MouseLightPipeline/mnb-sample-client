import * as React from "react";
import {ApolloClient} from "apollo-client";
import {InMemoryCache} from "apollo-cache-inmemory";
import {createUploadLink} from "apollo-upload-client";
import {ApolloProvider} from "react-apollo";

import {App} from "./App";

const ApolloClientInstance = new ApolloClient({
    link: createUploadLink({uri: "/graphql"}),
    cache: new InMemoryCache(),
});

export const ApolloApp = () => (
    <ApolloProvider client={ApolloClientInstance}>
        <App/>
    </ApolloProvider>
);
