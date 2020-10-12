# firebase-orm

A typeorm inspired ORM for Firestore.

# Usage

## Define An Entity and CRUD for it.

### Entity (without relation)

リレーションのないシンプルなエンティティの宣言と、そのエンティティ（レコード）のためのCRUDの方法を記載します。

```typescript
import { FirebaseEntity, PrimaryColumn, Column } from 'firebase-orm';

@FirebaseEntity('articles')
export class Article {
    @PrimaryColumn()
    id: string;

    @Column()
    title: string;

    @Column({name: "content_text"})
    contentText: string;
}
```

### CRUD


#### Create

```typescript
import { getRepository } from 'firebase-orm';

const repo = getRepository(Article);

const article = new Article();
article.id = '1';
article.title = 'hello';
article.contentText = 'world!';

await repo.save(article);
```

#### Fetch

```typescript
const article = await repo.fetchOneById('1');
if(article) {
    console.log(article);
}
```

#### Update

```typescript
const article = await repo.fetchOneById('1');
if(!article) {
    return;
}

article.contentText = 'space!';
await repo.save(article);
```

#### Delete

```typescript
const article = await repo.fetchOneById('1');
if(!article) {
    return;
}

await repo.delete(article);
```

## Conditional Fetch

`wehre`や`limit`などを使った検索をするには、`prepareFetcher`を呼び出します。

```typescript
const articles = await repo.prepareFetcher(col => {
    return col.where('id', '>=', 5).limit(10);
}).fetchAll();
```

`prepareFetcher`のコールバックの第一引数にはfirestoreの`Collection`オブジェクトが渡されるので、

https://firebase.google.com/docs/firestore/query-data/queries

を参考に、クエリを構築してください。


## Define Entities with relations and CRUD for them.

先程の`Article`が`User`に属し、`Category`と`Stat`を持つような関連を構築してみます。

```typescript
import { Column, PrimaryColumn, FirebaseEntity, ManyToOne, OneToOne} from "firebase-orm";

@FirebaseEntity('articles')
export class Article {
    @PrimaryColumn()
    id: string;

    @Column()
    title: string;

    @ManyToOne(() => User, {joinColumnName: 'user_id'})
    user: User;

    @OneToOne(() => ArticleStat, {relationColumn: 'article_id'})
    stat: ArticleStat;
    
    @ManyToOne(() => Category, {joinColumnName: 'category_id'})
    category: Category;

    @Column({name: "content_text"})
    contentText: string;
}

@FirebaseEntity('article_stats')
export class ArticleStat {
    @PrimaryColumn()
    id: string;

    @OneToOne(() => Article, {joinColumnName: 'article_id'})
    article: Article;

    @Column({name: 'num_of_views'})
    numOfViews: number;
}

@FirebaseEntity('categories')
export class Category {
    @PrimaryColumn()
    id: string;
    
    @Column()
    name: string;
}

@FirebaseEntity('users')
export class User {
    @PrimaryColumn()
    id: string;
    
    @Column()
    name: string;

    @OneToMany(() => Article, {relationColumn: 'user_id'})
    articles: Article[];
}
```

`Article`は`ManyToOne`で`User`に属しています。このとき、オプションで渡される`joinColumnName`は関連のための外部キーの名前になっています。つまり、Firestoreには`articles.user_id`として、`User`への参照が保存されます。`Article`と`ArticleStat`は`OneToOne`の関連がありますが、オプションが双方で異なっています。このとき、`ArticleStat`が`article_stats.article_id`としてfirestoreに`Article`への参照を持ちます。一方で、`Article`は検索時にジョインするための外部キーとして、`relationColumn`に`article_stats.article_id`を指定しています。このように、`OneToOne`では、値を保持する側と保持される側でそれぞれ、`joinColumnName`、`joinColumnName`を設定する必要があります。最後に、`OneToMany`ですが、この例では`User`から`Article`に対して設定されています。今、`articles.user_id`として`Article`が`User`の参照を保持していますから、`User`では`articles`の`relationColumn`にジョインの際の外部キーである`user_id`を指定しています。

まずは、これらのテーブルに予めデータが保存されている想定で、`User`を起点に関連全てを取る例と、`Article`を起点に関連全てを取る例を見てみましょう。

## Fetch with relations

### User

```typescript
const user = await getRepository(User).fetchOneById(id, {
    relations: ['articles.category', 'articles.stat']
});

user // User
user.articles // Article[]
user.articles[0].category // Category
user.articles[0].stat // ArticleStat
```

### Article

```typescript
const article = await getRepository(Article).prepareFetcher(col => {
    return col.where('id', '==', '1')
}).fetchOne({
    relations: ['user', 'category', 'stat']
});

article // Article
article.user // User
article.category // Category
article.stat // ArticleStat
```

では、次にトランザクションを使って、これら4つのコレクションにまたがる保存を行います。

## Transactions

トランザクションは`runTransaction`を呼び出します。

```typescript
import { runTransaction } from "firebase-orm";

await runTransaction(async manager => {
    const user = new User();
    user.id = getRandomIntString();
    user.name = 'test-user';
    await manager.getRepository(User).save(user);

    const category = new Category();
    category.id = getRandomIntString();
    category.name = 'math';
    await manager.getRepository(Category).save(category);

    const article = new Article();
    article.id = getRandomIntString();
    article.title = 'title';
    article.contentText = 'bodybody';
    article.user = user;
    article.category = category;

    await manager.getRepository(Article).save(article);

    const articleStat = new ArticleStat();
    articleStat.id = getRandomIntString();
    articleStat.article = article;
    articleStat.numOfViews = 100;

    await manager.getRepository(ArticleStat).save(articleStat);
});
```

保存の際は、関連の順番に注意して保存する必要があります。たとえばこの例では、`Article`が`User`と`Category`に依存しているので、先に`User`と`Category`を保存します。保存されたエンティティを`Article`オブジェクトにセットし、`save`することで、firestoreに参照が保存されます。最後に、`ArticleStat`オブジェクトに保存済みの`Article`エンティティをセットし`save`を呼び出せば、`Article`の参照が`ArticleStat`に保存されます。

なお、次のように`runTransaction`のブロック内でエラーがthrowされた場合、トランザクションがロールバックされます。

```typescript
await runTransaction(async manager => {
    const user = new User();
    user.id = getRandomIntString();
    user.name = 'test-user';
    await manager.getRepository(User).save(user);

    const category = new Category();
    category.id = getRandomIntString();
    category.name = 'math';
    await manager.getRepository(Category).save(category);

    ...

    throw new Error('rollback!!');
});
```

## ArrayReference

firestoreでは、配列の形式で参照を持つことが出来ます。例として、`Artile`が複数の`Category`を持つことが出来るようにしてみます。

```typescript
import {ArrayReference} from 'firebase-orm';

@FirebaseEntity('articles')
export class Article {

    ....
    
    @ArrayReference(() => Category, {joinColumnName: 'categories'})
    categories: Category;

    ....
}
```

これまでの`Article`は`category_id`を`ManyToOne`として持っていましたが、その代わりに名称を`categories`に変更し、`ArrayReference`として再定義しています。配列形式で`Category`の参照を保存するときは次のようにします。

### Save

```typescript
const cat1 = new Category();
cat1.name = "category1";
await getRepository(Category).save(cat1);

const cat2 = new Category();
cat2.name = "category2";
await getRepository(Category).save(cat2);

const article = new Article();
article.title = 'foo';
article.contentText = 'bar';
article.categories = [cat1, cat2];

await getRepository(Article).save(article);
```

### Fetch

配列形式の参照からレコードを検査する場合は次のようにします。

```typescript
import {PureReference} from 'firebase-orm';

await getRepository(Article).prepareFetcher(db => {
    return db.where('categories', 'array-contains', PureReference(cat1))
}).fetchAll();
```

## onSnapShot

リアルタイム同期などに用いられる`onSnapShot`もRepositoryから扱うことができます。これまでの`fetch`オペレーションと同様に、`prepareFetcher`でクエリのコンディションを指定することも可能です。`onSnapShot`はレコードの`購読を`やめるための関数を返します。

```typescript
const unsubscribe = getRepository(User).prepareFetcher(db => {
    return db.limit(5);
}).onSnapShot(async result => {
    const type = result.type;
    if(type === "added") {
        console.log(result.item) // User
    } 
    else if(type === "modified") {
        console.log(result.item) // User
    } 
    else if(type === "removed") {
        console.log(result.item) // undefined
    }
    
    unsubscribe();
}, {
    relations: ['articles.category', 'articles.stat']
});
```

## Nested Collection

例えば、`db.collection('foo').doc('1').collection('bar')`のようにネストしたコレクションへのアクセスを行う場合は、エンティティの宣言時に`@FirebaseEntity`の代わりに`@NestedFirebaseEntity`を利用します。次の`ArticleComment`は`Article`コレクションの子コレクションとして宣言されます。

### Define Nested Entity

```typescript
@NestedFirebaseEntity(() => Article, 'article_comments')
export class ArticleComment {
    @PrimaryColumn()
    id: string;

    @Column()
    text: string;
}
```

### CURD for Nested Entity

子コレクションにアクセスする場合、`getRepository(ArticleComment, {withParentId: parentId})`のように、`getRepository`の第2引数に`withParentId`を含むオブジェクトを渡します。

```typescript
const repo = getRepository(ArticleComment, {withParentId: article.id});

const articleComment = new ArticleComment();
articleComment.id = getRandomIntString();
articleComment.text = 'hello';  

// Create
await repo.save(articleComment);

// Fetch
const comments = await repo.fetchOneById(articleComment.id);

// Update
articleComment.text = 'updated';
await repo.save(articleComment);

// Delete

await repo.delete(articleComment);
```

## Hooks

firebase-ormでは

* `beforeSave`: save前に呼ばれる
* `afterSave`: save後に呼ばれる
* `afterLoad`: fetch後に呼ばれる

のタイミングでフックメソッドを記述することが出来ます。

### Define hooks

```typescript
@FirebaseEntity('articles')
export class Article {
    @PrimaryColumn()
    id: string;

    @BeforeSave()
    beforeSave() {
        console.log('before save');
    }

    @AfterSave()
    afterSave() {
        console.log('after save');
    }

    @AfterLoad()
    afterLoad() {
        console.log('after load');
    }

    ....
}
```

## Entity Serializer & Deserializer

`@FirebaseEntity`は自身のプロパティとして`firestore.DocumentReference`を持つため、`JSON.stringify`が出来ません。そのため、エンティティを永続化したり、サーバーレスポンス時のシリアライズが困難となってしまいますが、この問題の回避策として`FirebaseEntitySerializer`と`FirebaseEntityDeserializer`があります。

### FirebaseEntitySerializer

`FirebaseEntitySerializer`は

* serializeToJSON(object: any, parentId?: string)
* serializeToJSONString(object: any, parentId?: string)

を持ちます。`serializeToJSON`はエンティティをpureなjsオブジェクトにシリアライズします。一方で、`serializeToJSONString`は`serializeToJSON`の結果を文字列として返します。利用方法は次です。


```typescript
const article = await runTransaction(async manager => {
    const user = new User();
    user.id = getRandomIntString();
    user.name = 'test-user';
    await manager.getRepository(User).save(user);

    const category = new Category();
    category.id = getRandomIntString();
    category.name = 'math';
    await manager.getRepository(Category).save(category);

    const article = new Article();
    article.id = getRandomIntString();
    article.title = 'title';
    article.contentText = 'bodybody';
    article.user = user;
    article.categories = [category];

    await manager.getRepository(Article).save(article);

    return article;
});

const json = FirebaseEntitySerializer.serializeToJSON(article);
const jsonString = FirebaseEntitySerializer.serializeToJSONString(article);
```

なお、ネストされたコレクションをシリアライズする場合は、第2引数に`parentId`を指定します。

```typescript
const comment = getRepository(ArticleComment, {withParentId: article.id}).fetchOneById('1');
if(!comment) {
    return;
}
const json = FirebaseEntitySerializer.serializeToJSON(comment, article.id);
```

### FirebaseEntityDeserializer

`FirebaseEntityDeserializer`は`FirebaseEntitySerializer`でシリアライズされたオブジェクトかJSON文字列をデシリアライズし、エンティティのインスタンスに復元します。

* deserializeFromJSON<T>(Entity: ClassType<T>, str: string, parentId?: string)
* deserializeFromJSONString<T>(Entity: ClassType<T>, str: string, parentId?: string)

を持ちます。利用方法は次です。

```typescript
const json = FirebaseEntitySerializer.serializeToJSON(article);
const jsonString = FirebaseEntitySerializer.serializeToJSONString(article);

const deserializedFromJSON = FirebaseEntityDeserializer.deserializeFromJSON(Article, json);
const deserializedFromJSONString = FirebaseEntityDeserializer.deserializeFromJSONString(Article, jsonString);
```

ネストされたエンティティの復元には`FirebaseEntitySerializer`同様に、第3引数に`parentId`を指定します。

## Client-Side

クライアントサイドで`firebase-orm`を利用する際は、`firebase-orm-client`を`npm`や`yarn`でインストールします。`firebase-orm-client`のほとんどのコードベースは`firebase-orm`を共有しています。このとき、オリジナルは`firebase-orm`側にしてください。サーバーとクライアントにおける相違点は`src/type-mapper.ts`と`example`です。特に`src/type-mapper.ts`はクライアントサイド用の `firebase SDK`とサーバーサイド用の`firebase-admin SDK`の違いを吸収するための重要なファイルとなっています。内容は次です。

**server-side**
```
import * as admin from 'firebase-admin';

export type Firestore = FirebaseFirestore.Firestore;
export type DocumentReference = FirebaseFirestore.DocumentReference;
export type DocumentData = FirebaseFirestore.DocumentData;
....

export const firestore = admin.firestore;
```

**client-side**
```
import * as firebase from 'firebase';

export type Firestore = firebase.firestore.Firestore;
export type DocumentReference = firebase.firestore.DocumentReference;
export type DocumentData = firebase.firestore.DocumentData;
....

export const firestore = firebase.firestore;
```

これらのようにサーバーとクライアントで`firebase-admin`と`firebase`の型と`firestore`オブジェクトのエイリアスを構成し、`firebase-orm`がこれらの型を識別できるように設定を行います。その後、次のコマンドを入力し、必要なファイルをクライアント側にコピーします。

```sh
cd ~/YourProjectDir
git clone git@github.com:Polyrhythm-Inc/firebase-orm-client.git
git clone git@github.com:Polyrhythm-Inc/firebase-orm.git
cd firebase-orm
node copyfile.js 
```

コピー完了後、クライアント側のソースファイルのヘッダーに

```
// ---------- WARN! DO NOT EDIT BY HAND. THIS FILE IS AUTOMATICALLY GENERATED BY firebase-orm. ---------- 
```

と追記されます。
