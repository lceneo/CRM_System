import {prefix} from "../const";

export const messageViewStyles = `
    .${prefix}-message-view {
        border: 1px solid black;
        border-radius: 10px;
        padding: 5px;
        display: flex;
        flex-flow: column;
        gap: 5px;
        background-color: blue;
    }
    
    .${prefix}-message-view-client {
        align-self: flex-end;
    }
    
    .${prefix}-message-view-server {
        align-self: flex-start;
    }
    
    .${prefix}-message-view-join .${prefix}-message-view-content {
        line-height: 1em;
    }
    
    .${prefix}-message-view-author {
        font-size: 0.5em;
        align-self: flex-start;
        margin: 0;
        padding: 0;
    }
    
    .${prefix}-message-view-content {
        margin: 0;
        padding: 0;
    }
    
    .${prefix}-message-view-time {
        font-size: 0.5em;
        align-self: flex-end;
        margin: 0;
        padding: 0;
    }
`
