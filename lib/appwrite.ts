import { Account, Client, Databases } from 'appwrite';

export const APPWRITE = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'abc123def456',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '69eb6ad30022f3d2899f',
  todosCollectionId: process.env.NEXT_PUBLIC_APPWRITE_TODOS_COLLECTION_ID || '69eb6b130022ad37945a',
  wallCollectionId: process.env.NEXT_PUBLIC_APPWRITE_WALL_COLLECTION_ID || '69eb6cb400352496ceb4'
};

export const client = new Client()
  .setEndpoint(APPWRITE.endpoint)
  .setProject(APPWRITE.projectId);

export const account = new Account(client);
export const databases = new Databases(client);

export type AppwriteUser = {
  $id: string;
  email: string;
  name: string;
};

export type TodoDoc = {
  $id: string;
  $createdAt: string;
  title: string;
  done: boolean;
  userId: string;
};

export type WallDoc = {
  $id: string;
  $createdAt: string;
  message: string;
  author: string;
};

export function isConfigured(): boolean {
  return Boolean(
    APPWRITE.projectId &&
      APPWRITE.databaseId &&
      APPWRITE.todosCollectionId &&
      APPWRITE.wallCollectionId
  );
}
