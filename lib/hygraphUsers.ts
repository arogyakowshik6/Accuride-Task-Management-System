import { GraphQLClient, gql } from "graphql-request";
import { User } from "@/types";

{/*
 User accounts, stored in Hygraph's "AppUser" model ,
 
 Fields: name, email, passwordHash
 Query: appUser / appUsers
 Mutations: createAppUser / updateAppUser / deleteAppUser / publishAppUser
 
 Only ever called with an already-hashed password see lib/users.ts.
 */}
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in .env.local see .env.local.example.`
    );
  }
  return value;
}

function client(): GraphQLClient {
  return new GraphQLClient(requireEnv("HYGRAPH_ENDPOINT"), {
    headers: {
      authorization: `Bearer ${requireEnv("HYGRAPH_TOKEN")}`,
    },
  });
}

interface HygraphAppUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

function toUser(u: HygraphAppUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    passwordHash: u.passwordHash,
  };
}

export async function hygraphGetUserByEmail(
  email: string
): Promise<User | undefined> {
  const query = gql`
    query UserByEmail($email: String!) {
      appUsers(where: { email: $email }) {
        id
        name
        email
        passwordHash
      }
    }
  `;
  const data = await client().request<{ appUsers: HygraphAppUser[] }>(
    query,
    { email }
  );
  const found = data.appUsers[0];
  return found ? toUser(found) : undefined;
}

export async function hygraphGetUserById(
  id: string
): Promise<User | undefined> {
  const query = gql`
    query UserById($id: ID!) {
      appUser(where: { id: $id }) {
        id
        name
        email
        passwordHash
      }
    }
  `;
  const data = await client().request<{ appUser: HygraphAppUser | null }>(
    query,
    { id }
  );
  return data.appUser ? toUser(data.appUser) : undefined;
}

export async function hygraphCreateUser(
  name: string,
  email: string,
  passwordHash: string
): Promise<User> {
  const mutation = gql`
    mutation CreateAppUser(
      $name: String!
      $email: String!
      $passwordHash: String!
    ) {
      createAppUser(
        data: { name: $name, email: $email, passwordHash: $passwordHash }
      ) {
        id
        name
        email
        passwordHash
      }
    }
  `;
  const data = await client().request<{ createAppUser: HygraphAppUser }>(
    mutation,
    { name, email, passwordHash }
  );
  await hygraphPublishUser(data.createAppUser.id);
  return toUser(data.createAppUser);
}

async function hygraphPublishUser(id: string): Promise<void> {
  const mutation = gql`
    mutation PublishAppUser($id: ID!) {
      publishAppUser(where: { id: $id }, to: PUBLISHED) {
        id
      }
    }
  `;
  await client().request(mutation, { id });
}
