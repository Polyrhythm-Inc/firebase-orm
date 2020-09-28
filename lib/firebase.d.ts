/// <reference path="../src/firebase.d.ts" />
export interface FireBaseWrap {
    firestore: typeof FirebaseFirestore;
}
declare let firebase: FireBaseWrap;
export default firebase;
