/**
 * Flex direction
 */
export type FlexDirection = keyof typeof directions;

export const directions = {
    row: 'flex-row',
    col: 'flex-col',
};

/**
 * Flex wrap
 */
export type FlexWrap = keyof typeof wraps;

export const wraps = {
    wrap: 'flex-wrap',
    reverse: 'flex-reverse',
    nowrap: 'flew-nowrap',
};

/**
 * Gap between items
 */
export type GapSizes = keyof typeof gaps;

export const gaps = {
    0: 'gap-0',
    0.5: 'gap-0.5',
    1: 'gap-1',
    1.5: 'gap-1.5',
    2: 'gap-2',
    2.5: 'gap-2.5',
    3: 'gap-3',
    3.5: 'gap-3.5',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    7: 'gap-7',
    8: 'gap-8',
    9: 'gap-9',
    10: 'gap-10',
    11: 'gap-11',
    12: 'gap-12',
    14: 'gap-14',
    16: 'gap-16',
    20: 'gap-20',
    24: 'gap-24',
    28: 'gap-28',
    32: 'gap-32',
    36: 'gap-36',
    40: 'gap-40',
    44: 'gap-44',
    48: 'gap-48',
    60: 'gap-60',
    64: 'gap-64',
    72: 'gap-72',
    80: 'gap-80',
    96: 'gap-96',
};

/**
 * Items positionment
 */
export type FlexItemPosition = keyof typeof itemsPosition;

export const itemsPosition = {
    center: 'items-center',
    start: 'items-start',
    end: 'items-end',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
};

/**
 * Content justify
 */
export type FlexJustify = keyof typeof justifies;

export const justifies = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
    'items-start': 'justify-items-start',
    'items-end': 'justify-items-end',
    'items-center': 'justify-items-center',
    'items-stretch': 'justify-items-stretch',
    'self-auto': 'justify-self-auto',
    'self-start': 'justify-self-start',
    'self-end': 'justify-self-end',
    'self-center': 'justify-self-center',
    'self-stretch': 'justify-self-stretch',
};

/**
 * Content alignment
 */
export type FlexAlign = keyof typeof aligns;

export const aligns = {
    baseline: 'align-baseline',
    top: 'align-top',
    middle: 'align-middle',
    bottom: 'align-bottom',
    'text-top': 'align-text-top',
    'text-bottom': 'align-text-bottom',
    sub: 'align-sub',
    super: 'align-super',
};