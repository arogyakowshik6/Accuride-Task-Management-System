import { GraphQLClient, gql } from "graphql-request";
import { Todo, TodoInput } from "@/types";

{/*
  User accounts, stored in Hygraph's "AppUser" model not "User",
  which is Hygraph's own built-in type for Studio team members.
 
  Fields: name, email, passwordHash
  Query: appUser / appUsers
  Mutations: createAppUser / updateAppUser / deleteAppUser / publishAppUser
 
  Only ever called with an already-hashed password see lib/users.ts.
 */}
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in .env.local see .env.local.example. ` +
        `This app stores TODOs in Hygraph only; there is no local fallback.`
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

interface HygraphTodo {
  id: string;
  title: string;
  description?: string;
  duedate: string;
  completed: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

function toTodo(t: HygraphTodo): Todo {
  return {
    id: t.id,
    userId: t.ownerId,
    title: t.title,
    description: t.description,
    dueDate: t.duedate,
    completed: t.completed,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export async function hygraphListTodos(userId: string): Promise<Todo[]> {
  const query = gql`
    query TodosByOwner($ownerId: String!) {
      toDos(where: { ownerId: $ownerId }, orderBy: duedate_ASC) {
        id
        title
        description
        duedate
        completed
        ownerId
        createdAt
        updatedAt
      }
    }
  `;
  const data = await client().request<{ toDos: HygraphTodo[] }>(query, {
    ownerId: userId,
  });
  return data.toDos.map(toTodo);
}

export async function hygraphCreateTodo(
  userId: string,
  input: TodoInput
): Promise<Todo> {
  const mutation = gql`
    mutation CreateToDo(
      $title: String!
      $description: String
      $duedate: Date!
      $ownerId: String!
    ) {
      createToDo(
        data: {
          title: $title
          description: $description
          duedate: $duedate
          ownerId: $ownerId
          completed: false
        }
      ) {
        id
        title
        description
        duedate
        completed
        ownerId
        createdAt
        updatedAt
      }
    }
  `;
  const data = await client().request<{ createToDo: HygraphTodo }>(
    mutation,
    {
      title: input.title,
      description: input.description,
      duedate: input.dueDate,
      ownerId: userId,
    }
  );
  await hygraphPublish(data.createToDo.id);
  return toTodo(data.createToDo);
}

export async function hygraphUpdateTodo(
  id: string,
  input: Partial<TodoInput>
): Promise<Todo> {
  const mutation = gql`
    mutation UpdateToDo(
      $id: ID!
      $title: String
      $description: String
      $duedate: Date
      $completed: Boolean
    ) {
      updateToDo(
        where: { id: $id }
        data: {
          title: $title
          description: $description
          duedate: $duedate
          completed: $completed
        }
      ) {
        id
        title
        description
        duedate
        completed
        ownerId
        createdAt
        updatedAt
      }
    }
  `;
  const data = await client().request<{ updateToDo: HygraphTodo }>(
    mutation,
    {
      id,
      title: input.title,
      description: input.description,
      duedate: input.dueDate,
      completed: input.completed,
    }
  );
  await hygraphPublish(id);
  return toTodo(data.updateToDo);
}

export async function hygraphDeleteTodo(id: string): Promise<void> {
  const mutation = gql`
    mutation DeleteToDo($id: ID!) {
      deleteToDo(where: { id: $id }) {
        id
      }
    }
  `;
  await client().request(mutation, { id });
}

async function hygraphPublish(id: string): Promise<void> {
  const mutation = gql`
    mutation PublishToDo($id: ID!) {
      publishToDo(where: { id: $id }, to: PUBLISHED) {
        id
      }
    }
  `;
  await client().request(mutation, { id });
}
