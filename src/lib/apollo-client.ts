import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = Cookies.get('admin_token');
  const authHeader = token ? { authorization: `Bearer ${token}` } : {};
  return {
    headers: {
      ...headers,
      ...authHeader,
    }
  }
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            merge(existing, incoming) {
              return incoming;
            }
          },
          orders: {
            merge(existing, incoming) {
              return incoming;
            }
          }
        }
      }
    }
  }),
});
