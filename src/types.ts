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