import * as admin from 'firebase-admin';
export declare type Firestore = FirebaseFirestore.Firestore;
export declare type DocumentReference = FirebaseFirestore.DocumentReference;
export declare type DocumentData = FirebaseFirestore.DocumentData;
export declare type DocumentSnapshot = FirebaseFirestore.DocumentSnapshot;
export declare type Query = FirebaseFirestore.Query;
export declare type QuerySnapshot = FirebaseFirestore.QuerySnapshot;
export declare type CollectionReference = FirebaseFirestore.CollectionReference;
export declare type Transaction = FirebaseFirestore.Transaction;
export declare type DocumentChangeType = FirebaseFirestore.DocumentChangeType;
export declare const firestore: typeof admin.firestore;