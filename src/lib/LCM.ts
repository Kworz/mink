// Function to calculate the LCM (Least Common Multiple) of two numbers
export function LCM(a: number, b: number) {
    // Calculate the GCD (Greatest Common Divisor)
    function GCD(x: number, y: number) {
        while(y) {
            let temp = y;
            y = x % y;
            x = temp;
        }
        return x;
    }
    // Calculate the LCM using the GCD
    return (a * b) / GCD(a, b);
}

// Function to calculate the LCM (Least Common Multiple) of multiple numbers
export function LCMArray(args: number[]) {
    let result = args[0];
    for (let i = 1; i < args.length; i++) {
        result = LCM(result, args[i]);
    }
    return result;
}