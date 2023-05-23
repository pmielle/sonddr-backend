export interface DbIdea {
    _id: string,
    title: string,
    authorId: string,
}

export interface DbGoal {
    _id: string,
    name: string,
}

export interface DbNotification {
    _id: string,
    content: string,
}

export interface DbDiscussion {
    _id: string,
    userIds: string[],
}

export interface DbUser {
    _id: string,
    name: string,
}

export interface KcUser {
    id: string,
}