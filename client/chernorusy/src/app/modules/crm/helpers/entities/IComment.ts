export interface IComment {
    id: string;
    author: {
        id: string,
        surname: string,
        name: string
    };
    text: string;
    createdAt: string;
    lastEditedAt: string;
}
