export function leastCommonMultiple(numbers: bigint[]) {
    function gcd(a: bigint, b: bigint): bigint {
        return !b ? a : gcd(b, a % b);
    }

    function lcm(a: bigint, b: bigint): bigint {
        return (a * b) / gcd(a, b);   
    }

    let multiple = numbers.reduce((acc, val) => val < acc ? val : acc);
    numbers.forEach(function(n) {
        multiple = lcm(multiple, n);
    });

    return multiple;
}