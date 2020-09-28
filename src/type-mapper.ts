import * as admin from 'firebase-admin';

export type Firestore = FirebaseFirestore.Firestore;
export type DocumentReference = FirebaseFirestore.DocumentReference;
export type DocumentData = FirebaseFirestore.DocumentData;
export type DocumentSnapshot = FirebaseFirestore.DocumentSnapshot;
export type Query = FirebaseFirestore.Query;
export type QuerySnapshot = FirebaseFirestore.QuerySnapshot;
export type CollectionReference = FirebaseFirestore.CollectionReference;
export type Transaction = FirebaseFirestore.Transaction;
export type DocumentChangeType = FirebaseFirestore.DocumentChangeType;

export const firestore = admin.firestore;