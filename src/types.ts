export interface DbMessage {
    _id: string,
    discussionId: string,
    fromUser: string,
    content: string,
    timestamp: Date,
}

export interface DbComment {
    _id: string,
    content: string,
    authorId: string,
    votes: number,
}

export interface DbIdeaVote {
    _id: string,
    ideaId: string,
    fromId: string,
}

export interface DbCommentVote {
    _id: string,
    commentId: string,
    fromId: string,
    value: -1|1,
}

export interface DbIdea {
    _id: string,
    title: string,
    authorId: string,
    votes: number,
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
    latestMessageId?: string,
}

export interface DbUser {
    _id: string,
    name: string,
}

export interface KcUser {
    id: string,
}