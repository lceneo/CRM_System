export function getIsCustomizing(): boolean {
    return (window as any)['super-puper-widget-is-customizing'];
}

export const DefaultCustomization: Customization = {
    comeMsg: {
        bgc: 'orange',
        padding: '5px 5px 5px 5px',
        side: 'center',
        content: {
            align: 'center',
            size: 14,
            type: 'px',
            color: 'black',
            lineHeight: 1
        },
    },
    mngMsg: {
        bgc: 'lightblue',
        padding: '5px 5px 5px 5px',
        side: 'left',
        time: {
            align: 'right',
            size: 7,
            type: 'px',
            color: 'black',
            lineHeight: 1
        },
        content: {
            align: 'left',
            size: 14,
            type: 'px',
            color: 'black',
            lineHeight: 1
        },
    },
    userMsg: {
        bgc: 'lightgreen',
        padding: '5px 5px 5px 5px',
        side: 'right',
        time: {
            align: 'right',
            size: 7,
            type: 'px',
            color: 'black',
            lineHeight: 1
        },
        content: {
            align: 'left',
            size: 14,
            type: 'px',
            color: 'black',
            lineHeight: 1
        },
    },
    content: {
        bgc: 'lightgrey',
        padding: '5px 5px 5px 5px',
    },
    footer: {
        bgc: 'black',
        padding: '5px 5px 5px 5px',
    },
    header: {
        bgc:'black',
        padding: '5px 5px 5px 5px',
    },
    online: {color: {offline: "", online: ""}, show: false, size: 0},
    position: {X: {side: 'left', move: 0, moveType: 'px'}, Y: {side: 'bottom', move: 0, moveType: 'px'}},
}

export interface Customization {
    position: {
        X: CustomizationPosition<'left' | 'right'>,
        Y: CustomizationPosition<'top' | 'bottom'>,
    }
    header: DefaultSection,
    footer: DefaultSection,
    content: DefaultSection,
    userMsg: DefaultMessage,
    mngMsg: DefaultMessage,
    comeMsg: Omit<DefaultMessage, 'time'>,
    online: {
        color: {
            online: string,
            offline: string,
        },
        size: number,
        show: boolean
    }
}

export interface DefaultMessage extends DefaultSection {
    content: Font & {
        align: 'left' | 'center' | 'right'
    },
    time: Font & {
        align: 'left' | 'center' | 'right'
    },
    side: 'left' | 'center' | 'right'
}

export interface DefaultSection {
    bgc: string
    padding: string
}

interface Font {
    size: number,
    type: 'em' | 'px' | 'rem'
    color: string
    lineHeight: number
}

interface CustomizationPosition<TSide extends 'left' | 'right' | 'top' | 'bottom'> {
    side: TSide
    move: number
    moveType: 'px' | '%'
}

/**
 * align-self: ''
 */
export const messageSideToAlignSelf = {
    'left': 'flex-start',
    'right': 'flex-end',
    'center': 'center',
}
