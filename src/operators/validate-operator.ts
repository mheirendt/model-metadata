/**
 * Validates the input data & normalizes the output for operator evaluation
 * @param left -  The left hand value for the execute method
 * @param right - The right hand value for the execute method
 */
export const ValidateOperator = (left: any, right?: any): { // eslint-disable-line
    left: any, // eslint-disable-line
    isNumber: boolean,
    isDate: boolean,
    isString: boolean,
    isArray: boolean,
    isBoolean: boolean,
} => {

    if (isUndefinedOrNull(left)) throw 'Left value must be defined';
    if (isUndefinedOrNull(right)) throw 'Right value must be defined';

    const isArray = Array.isArray(right);
    const rightType = typeof right;
    const leftType = typeof left;
    let matchingLeft: Array<unknown> | string | undefined;
    if (isArray && leftType === 'number') {
        matchingLeft = [];
        for (let i = 0; i < left; i++) {
            matchingLeft.push({});
        }
    }
    else if (rightType === 'string' && leftType === 'number') {
        matchingLeft = '';
        for (let i = 0; i < left; i++) {
            matchingLeft += '.';
        }
    }
    else if (right && rightType !== leftType) {
        throw 'Left and right types must match';
    }

    return {
        left: matchingLeft || left,
        isString: rightType === 'string',
        isNumber: rightType === 'number',
        isBoolean: rightType === 'boolean',
        isDate: right instanceof Date,
        isArray
    };
};

function isUndefinedOrNull(target: unknown) {
    return target === null || target === undefined;
}