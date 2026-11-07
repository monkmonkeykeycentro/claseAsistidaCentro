import * as firestore from 'firebase/firestore';
import { useMongoDB } from '../config/dataBackend';
import { createMongoTransport } from './mongoTransport';

// Keep existing service contracts during the migration. The Mongo transport implements
// the subset of document operations this application uses; no SDK internals are read.
let tokenProvider: () => Promise<string | undefined> = async () => undefined;
export function setDatabaseTokenProvider(provider: typeof tokenProvider) { tokenProvider = provider; }
const mongo = createMongoTransport(() => tokenProvider());
export const doc = (useMongoDB ? mongo.doc : firestore.doc) as typeof firestore.doc;
export const collection = (useMongoDB ? mongo.collection : firestore.collection) as typeof firestore.collection;
export const where = (useMongoDB ? mongo.where : firestore.where) as typeof firestore.where;
export const orderBy = (useMongoDB ? mongo.orderBy : firestore.orderBy) as typeof firestore.orderBy;
export const query = (useMongoDB ? mongo.query : firestore.query) as typeof firestore.query;
export const getDoc = (useMongoDB ? mongo.getDoc : firestore.getDoc) as typeof firestore.getDoc;
export const getDocFromServer = (useMongoDB ? mongo.getDocFromServer : firestore.getDocFromServer) as typeof firestore.getDocFromServer;
export const getDocs = (useMongoDB ? mongo.getDocs : firestore.getDocs) as typeof firestore.getDocs;
export const setDoc = (useMongoDB ? mongo.setDoc : firestore.setDoc) as typeof firestore.setDoc;
export const deleteDoc = (useMongoDB ? mongo.deleteDoc : firestore.deleteDoc) as typeof firestore.deleteDoc;
export const writeBatch = (useMongoDB ? mongo.writeBatch : firestore.writeBatch) as typeof firestore.writeBatch;
export const onSnapshot = (useMongoDB ? mongo.onSnapshot : firestore.onSnapshot) as typeof firestore.onSnapshot;
