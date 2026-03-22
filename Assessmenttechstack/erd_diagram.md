# Entity Relationship Diagram (ERD) - SkillSphere

This diagram models the MongoDB document structure and relationships within the SkillSphere platform.

```mermaid
erDiagram
    users {
        ObjectId _id PK
        String firstName
        String lastName
        String email UK
        String password
        String[] interests
        String skillLevel
        Object profile
        DateTime createdAt
        DateTime updatedAt
    }

    resources {
        ObjectId _id PK
        String title
        String category
        String description
        String link
        Integer likes
        DateTime createdAt
        DateTime updatedAt
    }

    conversations {
        ObjectId _id PK
        String id
        String[] participants
        Object[] messages
        Object last_read_by
        DateTime createdAt
        DateTime updatedAt
    }

    contacts {
        ObjectId _id PK
        String ownerEmail
        String contactEmail
        String name
        DateTime createdAt
    }

    reviews {
        ObjectId _id PK
        String userEmail
        String author
        String content
        Integer rating
        DateTime createdAt
    }

    users ||--o{ resources : "creates"
    users ||--o{ conversations : "participates in"
    users ||--o{ contacts : "owns"
    users ||--o{ reviews : "writes"
    users ||--o{ reviews : "receives"
```

### Collection Summaries:

1.  users: Stores core account details and hashed passwords. The `profile` object contains nested bio and image path data.
2.  resources: Community-shared links and tutorials, categorized for easy discovery.
3.  conversations: Manages real-time message history between users with embedded message arrays for high read performance.
4.  contacts: User-specific address book for messaging.
5.  reviews: Dynamic feedback and ratings provided by users for one another.
